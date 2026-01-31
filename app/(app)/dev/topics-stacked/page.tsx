"use client";

import { useCallback, useMemo, useState } from "react";
import RoleSelector from "@/components/topics/RoleSelector";
import LevelContainerV21 from "@/components/dev/topics/LevelContainer";
import TopicDetailPanel, { TopicFeedback } from "@/components/dev/topics/TopicDetailPanel";
import { Role, TopicNode, SelectionMap, TopicSelection } from "@/lib/topics/types";

function makeNode(
  role: Role,
  id: string,
  label: string,
  level: number,
  band: 1 | 2 | 3 | 4 | 5,
  parentId?: string,
): TopicNode {
  return {
    id,
    role,
    label,
    level,
    parentId,
    childrenIds: [],
    metrics: {
      band,
      trend: "flat",
      attempts: Math.floor(Math.random() * 20),
      lastPracticedAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 14),
    },
  };
}

type RoleSelections = Record<Role, SelectionMap>;

function addExplicit(map: SelectionMap, topicId: string): SelectionMap {
  const next: SelectionMap = { ...map };
  const sel: TopicSelection = { topicId, state: "explicit" };
  next[topicId] = sel;
  return next;
}

function removeSelection(map: SelectionMap, topicId: string): SelectionMap {
  const next: SelectionMap = { ...map };
  delete next[topicId];
  return next;
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function defaultFeedbackFor(node: TopicNode | null): TopicFeedback {
  if (!node) return { strengths: [], improve: [] };

  const band = node.metrics?.band ?? 3;
  const attempts = node.metrics?.attempts ?? 0;

  const strengths: string[] = [];
  const improve: string[] = [];

  if (band >= 4) strengths.push("Solid fundamentals");
  else improve.push("Tighten fundamentals");

  if (attempts >= 12) strengths.push("Good practice volume");
  else improve.push("Increase reps");

  const label = node.label.toLowerCase();
  if (label.includes("sql")) improve.push("More joins + windows");
  if (label.includes("python")) improve.push("Edge cases + complexity");
  if (label.includes("model")) improve.push("Grain + SCD patterns");

  return { strengths: strengths.slice(0, 2), improve: improve.slice(0, 2) };
}

export default function TopicsStackedDevPage() {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(["DE"]);
  const [activeRole, setActiveRole] = useState<Role>("DE");

  const [selectionByRole, setSelectionByRole] = useState<RoleSelections>({
    DE: {},
    DS: {},
    DA: {},
  });

  const [expertiseByTopic, setExpertiseByTopic] = useState<Record<string, number>>({});
  const [userNotesByTopic, setUserNotesByTopic] = useState<Record<string, string>>({});
  const [feedbackByTopic, setFeedbackByTopic] = useState<Record<string, TopicFeedback>>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTopicId, setDetailTopicId] = useState<string | null>(null);

  const [events, setEvents] = useState<string[]>([]);
  function log(msg: string) {
    setEvents((prev) => [msg, ...prev].slice(0, 16));
  }

  const allNodesForRole = useMemo(() => {
    // DE parents
    const de_sql = makeNode("DE", "de_sql", "SQL", 1, 3);
    const de_py = makeNode("DE", "de_py", "Python", 1, 4);
    const de_model = makeNode("DE", "de_model", "Modeling", 1, 3);

    // DE children
    const de_sql_q = makeNode("DE", "de_sql_q", "Queries", 2, 3, "de_sql");
    const de_sql_idx = makeNode("DE", "de_sql_idx", "Indexes", 2, 2, "de_sql");
    const de_sql_win = makeNode("DE", "de_sql_win", "Window fns", 2, 4, "de_sql");

    const de_py_ds = makeNode("DE", "de_py_ds", "Data structures", 2, 4, "de_py");
    const de_py_etl = makeNode("DE", "de_py_etl", "ETL patterns", 2, 3, "de_py");
    const de_py_tests = makeNode("DE", "de_py_tests", "Testing", 2, 2, "de_py");

    const de_model_dim = makeNode("DE", "de_model_dim", "Dim modeling", 2, 3, "de_model");
    const de_model_med = makeNode("DE", "de_model_med", "Medallion", 2, 3, "de_model");
    const de_model_scd = makeNode("DE", "de_model_scd", "SCD", 2, 2, "de_model");

    de_sql.childrenIds = [de_sql_q.id, de_sql_idx.id, de_sql_win.id];
    de_py.childrenIds = [de_py_ds.id, de_py_etl.id, de_py_tests.id];
    de_model.childrenIds = [de_model_dim.id, de_model_med.id, de_model_scd.id];

    // DS parents
    const ds_stats = makeNode("DS", "ds_stats", "Stats", 1, 4);
    const ds_ml = makeNode("DS", "ds_ml", "ML", 1, 3);

    // DS children
    const ds_stats_ci = makeNode("DS", "ds_stats_ci", "Confidence", 2, 3, "ds_stats");
    const ds_stats_ht = makeNode("DS", "ds_stats_ht", "Hypothesis", 2, 4, "ds_stats");
    const ds_stats_reg = makeNode("DS", "ds_stats_reg", "Regression", 2, 3, "ds_stats");

    const ds_ml_feat = makeNode("DS", "ds_ml_feat", "Features", 2, 2, "ds_ml");
    const ds_ml_eval = makeNode("DS", "ds_ml_eval", "Evaluation", 2, 3, "ds_ml");
    const ds_ml_serv = makeNode("DS", "ds_ml_serv", "Serving", 2, 2, "ds_ml");

    ds_stats.childrenIds = [ds_stats_ci.id, ds_stats_ht.id, ds_stats_reg.id];
    ds_ml.childrenIds = [ds_ml_feat.id, ds_ml_eval.id, ds_ml_serv.id];

    // DA parents
    const da_metrics = makeNode("DA", "da_metrics", "Metrics", 1, 3);
    const da_exp = makeNode("DA", "da_exp", "Experimentation", 1, 3);

    // DA children
    const da_metrics_north = makeNode("DA", "da_metrics_north", "North star", 2, 3, "da_metrics");
    const da_metrics_guard = makeNode("DA", "da_metrics_guard", "Guardrails", 2, 3, "da_metrics");
    const da_metrics_seg = makeNode("DA", "da_metrics_seg", "Segmentation", 2, 2, "da_metrics");

    const da_exp_design = makeNode("DA", "da_exp_design", "Design", 2, 3, "da_exp");
    const da_exp_stats = makeNode("DA", "da_exp_stats", "Stats", 2, 3, "da_exp");
    const da_exp_read = makeNode("DA", "da_exp_read", "Readouts", 2, 2, "da_exp");

    da_metrics.childrenIds = [da_metrics_north.id, da_metrics_guard.id, da_metrics_seg.id];
    da_exp.childrenIds = [da_exp_design.id, da_exp_stats.id, da_exp_read.id];

    const byRole: Record<Role, TopicNode[]> = {
      DE: [
        de_sql, de_py, de_model,
        de_sql_q, de_sql_idx, de_sql_win,
        de_py_ds, de_py_etl, de_py_tests,
        de_model_dim, de_model_med, de_model_scd,
      ],
      DS: [
        ds_stats, ds_ml,
        ds_stats_ci, ds_stats_ht, ds_stats_reg,
        ds_ml_feat, ds_ml_eval, ds_ml_serv,
      ],
      DA: [
        da_metrics, da_exp,
        da_metrics_north, da_metrics_guard, da_metrics_seg,
        da_exp_design, da_exp_stats, da_exp_read,
      ],
    };

    return byRole;
  }, []);

  const nodes = useMemo(() => allNodesForRole[activeRole], [allNodesForRole, activeRole]);

  const nodeById = useMemo(() => {
    const m = new Map<string, TopicNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const level1 = useMemo(() => nodes.filter((n) => n.level === 1), [nodes]);

  const explicitMap = selectionByRole[activeRole];

  const isExplicit = useCallback(
    (id: string) => explicitMap[id]?.state === "explicit",
    [explicitMap],
  );

  const explicitL1Ids = useMemo(() => {
    const ids: string[] = [];
    for (const id of Object.keys(explicitMap)) {
      const n = nodeById.get(id);
      if (n?.level === 1 && explicitMap[id]?.state === "explicit") ids.push(id);
    }
    return ids;
  }, [explicitMap, nodeById]);

  const allowedL2Ids = useMemo(() => {
    const ids: string[] = [];
    for (const l1id of explicitL1Ids) {
      const parent = nodeById.get(l1id);
      if (!parent) continue;
      ids.push(...(parent.childrenIds ?? []));
    }
    return uniq(ids);
  }, [explicitL1Ids, nodeById]);

  const level2 = useMemo(() => {
    const arr: TopicNode[] = [];
    for (const id of allowedL2Ids) {
      const n = nodeById.get(id);
      if (n) arr.push(n);
    }
    arr.sort((a, b) => a.label.localeCompare(b.label));
    return arr;
  }, [allowedL2Ids, nodeById]);

  const getL1State = useCallback(
    (id: string) => (isExplicit(id) ? "explicit" : "unselected"),
    [isExplicit],
  );

  const getL2State = useCallback(
    (id: string) => {
      if (isExplicit(id)) return "explicit";
      if (allowedL2Ids.includes(id)) return "implicit";
      return "unselected";
    },
    [allowedL2Ids, isExplicit],
  );

  function toggleRole(r: Role) {
    setSelectedRoles((prev) => {
      const set = new Set(prev);
      const wasSelected = set.has(r);

      if (wasSelected) set.delete(r);
      else set.add(r);

      const next = Array.from(set) as Role[];
      if (next.length === 0) return prev;

      if (!next.includes(activeRole)) {
        setActiveRole(next[0]);
        log(`active_role_changed: ${activeRole} → ${next[0]}`);
      }

      log(`role_toggled: ${r} (${wasSelected ? "off" : "on"})`);
      return next;
    });
  }

  function updateActiveRoleMap(nextMap: SelectionMap) {
    setSelectionByRole((prev) => ({ ...prev, [activeRole]: nextMap }));
  }

  function toggleL1(id: string) {
    const was = isExplicit(id);
    let next = explicitMap;

    if (was) {
      const parent = nodeById.get(id);
      const children = parent?.childrenIds ?? [];
      for (const cid of children) {
        if (next[cid]) next = removeSelection(next, cid);
      }
      next = removeSelection(next, id);

      updateActiveRoleMap(next);
      log(`l1_toggled: ${id} (off)`);
      log(`children_removed: ${id} (-${children.length})`);
      return;
    }

    next = addExplicit(next, id);

    // default: auto-select children explicit
    const parent = nodeById.get(id);
    const children = parent?.childrenIds ?? [];
    for (const cid of children) next = addExplicit(next, cid);

    updateActiveRoleMap(next);
    log(`l1_toggled: ${id} (on)`);
    log(`children_auto_selected: ${id} (+${children.length})`);
  }

  function toggleL2(id: string) {
    const visible = allowedL2Ids.includes(id) || isExplicit(id);
    if (!visible) {
      log(`l2_toggle_blocked(not_visible): ${id}`);
      return;
    }

    const was = isExplicit(id);
    const next = was ? removeSelection(explicitMap, id) : addExplicit(explicitMap, id);

    updateActiveRoleMap(next);
    log(`l2_toggled: ${id} (${was ? "explicit→implicit" : "implicit→explicit"})`);
  }

  const detailNode = useMemo(() => {
    if (!detailTopicId) return null;
    return nodeById.get(detailTopicId) ?? null;
  }, [detailTopicId, nodeById]);

  const expertise = useMemo(() => {
    if (!detailTopicId) return 3;
    return expertiseByTopic[detailTopicId] ?? 3;
  }, [detailTopicId, expertiseByTopic]);

  const userNotes = useMemo(() => {
    if (!detailTopicId) return "";
    return userNotesByTopic[detailTopicId] ?? "";
  }, [detailTopicId, userNotesByTopic]);

  const feedback = useMemo(() => {
    if (!detailTopicId) return { strengths: [], improve: [] };
    return feedbackByTopic[detailTopicId] ?? defaultFeedbackFor(detailNode);
  }, [detailTopicId, feedbackByTopic, detailNode]);

  const openDetails = useCallback(
    (id: string) => {
      setDetailTopicId(id);
      setDetailOpen(true);
      log(`open_details: ${id}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Dev · Topics Stacked + Details Panel</h1>
        <p className="text-sm text-neutral-400">
          Click pill toggles selection. Click arrow opens details side panel. No hover ✕.
        </p>
      </header>

      <RoleSelector
        selectedRoles={selectedRoles}
        activeRole={activeRole}
        onToggleRole={toggleRole}
        onSetActiveRole={(r) => {
          setActiveRole(r);
          log(`active_role_set: ${r}`);
        }}
      />

      <div className="space-y-4">
        <LevelContainerV21
          title="Level 1"
          subtitle="Selecting a Level 1 topic auto-selects its children as explicit."
          items={level1}
          getState={getL1State}
          onToggle={toggleL1}
          onOpenDetails={openDetails}
          threshold={8}
          maxHeightClass="max-h-[220px]"
        />

        <LevelContainerV21
          title="Level 2"
          subtitle="Children start explicit; click to demote to implicit (still included)."
          items={level2}
          getState={getL2State}
          onToggle={toggleL2}
          onOpenDetails={openDetails}
          threshold={10}
          maxHeightClass="max-h-[260px]"
          emptyHint="Select one or more Level 1 topics to see Level 2."
        />
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Event log</div>
          <button
            onClick={() => setEvents([])}
            className="rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
          >
            Clear
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-sm text-neutral-400">Toggle pills or open details to see events.</div>
        ) : (
          <ul className="text-sm text-neutral-200 space-y-1">
            {events.map((e, i) => (
              <li key={`${e}-${i}`} className="font-mono text-xs text-neutral-200">
                {e}
              </li>
            ))}
          </ul>
        )}
      </section>

      <TopicDetailPanel
        open={detailOpen}
        node={detailNode}
        expertise={expertise}
        onChangeExpertise={(v) => {
          if (!detailTopicId) return;
          setExpertiseByTopic((prev) => ({ ...prev, [detailTopicId]: v }));
          log(`expertise_set: ${detailTopicId} → ${v}`);
        }}
        userNotes={userNotes}
        onChangeUserNotes={(v) => {
          if (!detailTopicId) return;
          setUserNotesByTopic((prev) => ({ ...prev, [detailTopicId]: v }));
          log(`user_notes_set: ${detailTopicId} (${v.length} chars)`);
        }}
        feedback={feedback}
        onClose={() => {
          setDetailOpen(false);
          log("close_details");
        }}
        onAction={(action, topicId) => {
          // You can later wire copy-to-clipboard. For now log.
          log(`action:${action}:${topicId}`);
          // Example: allow setting real feedback via action later
          if (action === "seed_feedback") {
            setFeedbackByTopic((prev) => ({
              ...prev,
              [topicId]: defaultFeedbackFor(nodeById.get(topicId) ?? null),
            }));
          }
        }}
      />
    </div>
  );
}
