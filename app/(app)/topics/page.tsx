"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import RoleSelector from "@/components/topics/RoleSelector";
import TopicLevel from "@/components/topics/TopicLevel";
import TopicDetailsDrawer from "@/components/topics/TopicDetailsDrawer";
import { track } from "@/components/topics/track";

import { TOPIC_NODES } from "@/lib/mock/topicTree";
import { TopicNode, Role, SelectionMap, TopicsState } from "@/lib/topics/types";
import { computeImplicitInclusions, removeTopicAndDescendants } from "@/lib/topics/selection";
import { loadTopicsState, saveTopicsState } from "@/lib/topics/storage";
import { saveContext } from "@/lib/practice/storage";

const DEFAULT_STATE: TopicsState = {
  selectedRoles: ["DE"],
  activeRole: "DE",
  selectionByRole: { DE: {}, DS: {}, DA: {} },
  includeChildrenByRole: { DE: {}, DS: {}, DA: {} },
  customTopicsByRole: { DE: [], DS: [], DA: [] },
};

function buildAllNodeMap(state: TopicsState): Map<string, TopicNode> {
  const all = [...TOPIC_NODES, ...state.customTopicsByRole.DE, ...state.customTopicsByRole.DS, ...state.customTopicsByRole.DA];
  return new Map(all.map(n => [n.id, n]));
}

function nodesForRole(state: TopicsState, role: Role): TopicNode[] {
  const custom = state.customTopicsByRole[role] ?? [];
  return [...TOPIC_NODES.filter(n => n.role === role), ...custom];
}

function levelNodes(roleNodes: TopicNode[], level: number): TopicNode[] {
  return roleNodes.filter(n => n.level === level);
}

export default function TopicsPage() {
  const router = useRouter();
  const [state, setState] = useState<TopicsState>(DEFAULT_STATE);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTopicId, setDrawerTopicId] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadTopicsState();
    if (saved) setState(saved);
  }, []);

  useEffect(() => {
    saveTopicsState(state);
  }, [state]);

  const activeRole = state.activeRole;
  const roleNodes = useMemo(() => nodesForRole(state, activeRole), [state, activeRole]);
  const allMap = useMemo(() => buildAllNodeMap(state), [state]);

  // Recompute implicit inclusions for active role
  const explicitSelection = state.selectionByRole[activeRole] ?? {};
  const includeChildren = state.includeChildrenByRole[activeRole] ?? {};
  const selection: SelectionMap = useMemo(() => {
    return computeImplicitInclusions(allMap, explicitSelection, includeChildren);
  }, [allMap, explicitSelection, includeChildren]);

  // Visible levels: Level 1 always, deeper levels only if any parent at prior level is explicitly selected
  const level1 = useMemo(() => levelNodes(roleNodes, 1), [roleNodes]);
  const level2 = useMemo(() => levelNodes(roleNodes, 2), [roleNodes]);
  const level3 = useMemo(() => levelNodes(roleNodes, 3), [roleNodes]);

  const hasAnyL1Explicit = useMemo(() => {
    return Object.values(explicitSelection).some(sel => sel.state === "explicit" && allMap.get(sel.topicId)?.level === 1);
  }, [explicitSelection, allMap]);

  const showLevel2 = hasAnyL1Explicit;
  const showLevel3 = useMemo(() => {
    // show L3 if any L2 explicit
    return Object.values(explicitSelection).some(sel => sel.state === "explicit" && allMap.get(sel.topicId)?.level === 2);
  }, [explicitSelection, allMap]);

  // Selection state per topic id for rendering
  const selectionStateById = useMemo(() => {
    const out: Record<string, "explicit"|"implicit"|"unselected"> = {};
    for (const n of roleNodes) out[n.id] = "unselected";
    for (const [id, s] of Object.entries(selection)) out[id] = s.state;
    return out;
  }, [roleNodes, selection]);

  function setRoles(nextSelected: Role[], nextActive: Role) {
    setState(s => ({ ...s, selectedRoles: nextSelected, activeRole: nextActive }));
  }

  function toggleRole(r: Role) {
    setState(s => {
      const set = new Set(s.selectedRoles);
      if (set.has(r)) set.delete(r);
      else set.add(r);
      const nextSelected = Array.from(set) as Role[];
      const nextActive = nextSelected.includes(s.activeRole) ? s.activeRole : (nextSelected[0] ?? "DE");
      return { ...s, selectedRoles: nextSelected.length ? nextSelected : ["DE"], activeRole: nextActive };
    });
  }

  function setActiveRole(r: Role) {
    setState(s => ({ ...s, activeRole: r }));
  }

  function openDetails(topicId: string) {
    setDrawerTopicId(topicId);
    setDrawerOpen(true);
    track("topic_details_opened", { topicId, role: activeRole });
  }

  function selectExplicit(topicId: string) {
    // selecting any topic makes it explicit and includeChildren defaults ON
    track("topic_selected", { topicId, role: activeRole, mode: "selected" });

    setState(s => {
      const sel = { ...(s.selectionByRole[activeRole] ?? {}) };
      sel[topicId] = { topicId, state: "explicit", includeChildren: true };

      const inc = { ...(s.includeChildrenByRole[activeRole] ?? {}) };
      if (inc[topicId] === undefined) inc[topicId] = true;

      return {
        ...s,
        selectionByRole: { ...s.selectionByRole, [activeRole]: sel },
        includeChildrenByRole: { ...s.includeChildrenByRole, [activeRole]: inc },
      };
    });
  }

  function removeExplicit(topicId: string) {
    // remove topic and all visible descendants immediately (no confirmation)
    const visibleSet = new Set<string>();
    // For phase 1: treat currently rendered levels as visible
    for (const n of level1) visibleSet.add(n.id);
    if (showLevel2) for (const n of level2) visibleSet.add(n.id);
    if (showLevel3) for (const n of level3) visibleSet.add(n.id);

    setState(s => {
      const all = buildAllNodeMap(s);
      const sel = { ...(s.selectionByRole[activeRole] ?? {}) };
      const inc = { ...(s.includeChildrenByRole[activeRole] ?? {}) };

      const res = removeTopicAndDescendants(all, sel, inc, topicId, visibleSet);

      track("topic_removed", {
        role: activeRole,
        topicId,
        removed_descendant_count: res.removedDescendantCount,
      });

      return {
        ...s,
        selectionByRole: { ...s.selectionByRole, [activeRole]: res.selection },
        includeChildrenByRole: { ...s.includeChildrenByRole, [activeRole]: res.includeChildren },
      };
    });
  }

  function addTopicAtLevel(level: number, label: string) {
    setState(s => {
      const id = `${activeRole.toLowerCase()}_custom_${level}_${crypto.randomUUID().slice(0, 8)}`;
      const node: TopicNode = {
        id,
        role: activeRole,
        label,
        parentId: undefined,
        childrenIds: [],
        level,
        metrics: { band: 3, trend: "flat", attempts: 0 },
      };

      track("topic_added", { role: activeRole, level, label, id });

      return {
        ...s,
        customTopicsByRole: {
          ...s.customTopicsByRole,
          [activeRole]: [...(s.customTopicsByRole[activeRole] ?? []), node],
        },
      };
    });
  }

  function practiceThisTopic(topicId: string) {
    // Wire into your existing practice context
    saveContext({
      role: activeRole as any, // your practice types use Role too; keep consistent
      topicScope: [topicId],
      difficultyBias: "balanced",
    } as any);

    router.push("/practice");
  }

  const drawerNode = drawerTopicId ? allMap.get(drawerTopicId) ?? null : null;

  const onboardingEmpty = state.selectedRoles.length === 0;

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Topics</h1>
        <p className="text-sm text-neutral-400">
          Select roles and Level 1 topics. Children can be implicitly included via “Include all children”.
        </p>
      </header>

      {onboardingEmpty && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 text-sm text-neutral-200">
          New here? Select a role, then choose at least one Level 1 topic to begin.
        </div>
      )}

      <RoleSelector
        selectedRoles={state.selectedRoles}
        activeRole={state.activeRole}
        onToggleRole={toggleRole}
        onSetActiveRole={setActiveRole}
      />

      {/* Level 1 */}
      <TopicLevel
        level={1}
        topics={level1}
        selectionStateById={selectionStateById}
        selectedCount={level1.filter(n => selectionStateById[n.id] === "explicit").length}
        onOpenDetails={(id) => {
          openDetails(id);
          // click opens drawer; select requires explicit action — we’ll select on second click later if you want.
          // For Phase 1, selecting is via “Practice this topic” or we can convert click to select.
          // Faster: make “click” open drawer, and inside drawer add a “Select topic” action later.
        }}
        onSelectExplicit={selectExplicit}
        onRemoveExplicit={removeExplicit}
        onAddTopic={(label) => addTopicAtLevel(1, label)}
      />

      {/* Level 2 (lazy load: show only when L1 explicit exists) */}
      {showLevel2 && (
        <TopicLevel
          level={2}
          topics={level2}
          selectionStateById={selectionStateById}
          selectedCount={level2.filter(n => selectionStateById[n.id] === "explicit").length}
          onOpenDetails={openDetails}
          onSelectExplicit={selectExplicit}
          onRemoveExplicit={removeExplicit}
          onAddTopic={(label) => addTopicAtLevel(2, label)}
        />
      )}

      {/* Level 3 (lazy load) */}
      {showLevel3 && (
        <TopicLevel
          level={3}
          topics={level3}
          selectionStateById={selectionStateById}
          selectedCount={level3.filter(n => selectionStateById[n.id] === "explicit").length}
          onOpenDetails={openDetails}
          onSelectExplicit={selectExplicit}
          onRemoveExplicit={removeExplicit}
          onAddTopic={(label) => addTopicAtLevel(3, label)}
        />
      )}

      <TopicDetailsDrawer
        open={drawerOpen}
        node={drawerNode}
        role={activeRole}
        onClose={() => setDrawerOpen(false)}
        onPracticeThisTopic={practiceThisTopic}
      />
    </div>
  );
}
