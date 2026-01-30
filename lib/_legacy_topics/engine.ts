import { TopicNode, TopicSelectionMap } from "../topics/types";

export function track(event: string, payload?: Record<string, any>) {
  console.log("[analytics]", event, payload ?? {});
}

export function isExplicit(sel: TopicSelectionMap, id: string) {
  return sel[id]?.state === "explicit";
}
export function isImplicit(sel: TopicSelectionMap, id: string) {
  return sel[id]?.state === "implicit";
}

export function getDescendants(nodes: Record<string, TopicNode>, rootId: string): string[] {
  const out: string[] = [];
  const stack = [...(nodes[rootId]?.childrenIds ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    out.push(id);
    const kids = nodes[id]?.childrenIds ?? [];
    for (const k of kids) stack.push(k);
  }
  return out;
}

export function includeAllDescendantsImplicit(
  nodes: Record<string, TopicNode>,
  sel: TopicSelectionMap,
  rootId: string
): TopicSelectionMap {
  const next = { ...sel };
  for (const id of getDescendants(nodes, rootId)) {
    if (next[id]?.state === "explicit") continue;
    next[id] = { topicId: id, state: "implicit" };
  }
  return next;
}

export function removeImplicitDescendants(
  nodes: Record<string, TopicNode>,
  sel: TopicSelectionMap,
  rootId: string
): TopicSelectionMap {
  const next = { ...sel };
  for (const id of getDescendants(nodes, rootId)) {
    if (next[id]?.state === "implicit") delete next[id];
  }
  return next;
}

/**
 * Selecting any topic makes it explicit, includeChildren defaults ON,
 * and implicitly includes all descendants.
 */
export function selectTopic(
  nodes: Record<string, TopicNode>,
  sel: TopicSelectionMap,
  topicId: string
): TopicSelectionMap {
  let next: TopicSelectionMap = { ...sel };

  next[topicId] = { topicId, state: "explicit", includeChildren: true };
  next = includeAllDescendantsImplicit(nodes, next, topicId);

  track("topic_selected", { topicId, selected_vs_implicit: "selected" });
  return next;
}

export function toggleIncludeChildren(
  nodes: Record<string, TopicNode>,
  sel: TopicSelectionMap,
  topicId: string,
  on: boolean
): TopicSelectionMap {
  const curr = sel[topicId];
  if (!curr || curr.state !== "explicit") return sel;

  let next: TopicSelectionMap = { ...sel, [topicId]: { ...curr, includeChildren: on } };

  if (on) next = includeAllDescendantsImplicit(nodes, next, topicId);
  else next = removeImplicitDescendants(nodes, next, topicId);

  track("include_children_toggled", { topicId, on });
  return next;
}

/**
 * Remove topic (explicit or implicit) and ALL VISIBLE descendants.
 * "Visible descendants" = descendants that are currently rendered due to expanded parents.
 * We'll pass visibleIds set from UI.
 */
export function removeTopicAndVisibleDescendants(
  sel: TopicSelectionMap,
  topicId: string,
  visibleIds: Set<string>
): { next: TopicSelectionMap; removedDescendantCount: number } {
  const next = { ...sel };

  let removedDesc = 0;
  const toRemove = new Set<string>();
  toRemove.add(topicId);

  // remove visible descendants too
  for (const id of visibleIds) {
    // UI guarantees visibleIds is descendant-complete for displayed levels
    // We'll remove any that are visible and currently selected (explicit/implicit)
    // but only if UI told us it's a descendant by including it in visibleIds for that branch.
    // (Simpler: caller provides descendants; we remove what we get.)
  }

  // Strategy: caller provides a set that already includes the topic + its visible descendants
  // We interpret "visibleIds" as the full set to remove.
  for (const id of visibleIds) toRemove.add(id);

  for (const id of toRemove) {
    if (next[id]) {
      if (id !== topicId) removedDesc++;
      delete next[id];
    }
  }

  track("topic_removed", { topicId, removed_descendant_count: removedDesc });
  return { next, removedDescendantCount: removedDesc };
}

/**
 * Visible level computation (lazy):
 * returns map: level -> topicIds visible for the focused role,
 * based on explicit selections and includeChildren toggles.
 */
export function computeVisibleLevels(
  nodes: Record<string, TopicNode>,
  roots: string[],
  focusedRole: string,
  sel: TopicSelectionMap
): Record<number, string[]> {
  const levels: Record<number, string[]> = { 1: roots };

  // expand down only from explicit selected nodes (or implicit?)—spec says:
  // selecting a topic reveals deeper levels. We'll expand from explicit selected nodes.
  // and also allow deeper levels if parent explicit is selected even when includeChildren off.
  const explicitIds = Object.values(sel)
    .filter((x) => x.state === "explicit")
    .map((x) => x.topicId);

  // BFS from explicit selections, accumulating children by level
  for (const id of explicitIds) {
    const n = nodes[id];
    if (!n || n.role !== focusedRole) continue;

    for (const childId of n.childrenIds) {
      const child = nodes[childId];
      if (!child) continue;
      const lvl = child.level;
      levels[lvl] = levels[lvl] ?? [];
      if (!levels[lvl].includes(childId)) levels[lvl].push(childId);

      // If child is also explicitly selected, its children will be added on its own pass.
      // This matches “lazy-load deeper levels only when parents selected”.
    }
  }

  // sort each level by label for stable UI
  for (const lvl of Object.keys(levels)) {
    levels[Number(lvl)] = levels[Number(lvl)]
      .filter((id) => nodes[id]?.role === focusedRole)
      .sort((a, b) => nodes[a].label.localeCompare(nodes[b].label));
  }

  return levels;
}
