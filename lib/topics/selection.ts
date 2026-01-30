import { SelectionMap, TopicNode } from "./types";

export function getDescendants(all: Map<string, TopicNode>, rootId: string): string[] {
  const out: string[] = [];
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    const n = all.get(id);
    if (!n) continue;
    for (const c of n.childrenIds) {
      out.push(c);
      stack.push(c);
    }
  }
  return out;
}

export function computeImplicitInclusions(
  all: Map<string, TopicNode>,
  selection: SelectionMap,
  includeChildren: Record<string, boolean>
): SelectionMap {
  // Start with explicit only
  const next: SelectionMap = {};
  for (const [id, sel] of Object.entries(selection)) {
    if (sel.state === "explicit") next[id] = sel;
  }

  // For each explicit with includeChildren=true, add implicit descendants unless explicitly selected
  for (const [id, sel] of Object.entries(next)) {
    if (sel.state !== "explicit") continue;
    const include = includeChildren[id] ?? true;
    if (!include) continue;

    const descendants = getDescendants(all, id);
    for (const d of descendants) {
      if (next[d]?.state === "explicit") continue;
      next[d] = { topicId: d, state: "implicit" };
    }
  }

  return next;
}

export function removeTopicAndDescendants(
  all: Map<string, TopicNode>,
  selection: SelectionMap,
  includeChildren: Record<string, boolean>,
  topicId: string,
  visibleSet?: Set<string>
): { selection: SelectionMap; includeChildren: Record<string, boolean>; removedDescendantCount: number } {
  const nextSel: SelectionMap = { ...selection };
  const nextInc: Record<string, boolean> = { ...includeChildren };

  const descendants = getDescendants(all, topicId);
  let removedDesc = 0;

  // Remove the topic itself
  if (nextSel[topicId]) delete nextSel[topicId];
  if (nextInc[topicId] !== undefined) delete nextInc[topicId];

  // Remove descendants: spec says “all visible descendants”
  // If visibleSet provided, remove only those in it; otherwise remove all descendants.
  for (const d of descendants) {
    if (visibleSet && !visibleSet.has(d)) continue;
    if (nextSel[d]) {
      delete nextSel[d];
      removedDesc += 1;
    }
    if (nextInc[d] !== undefined) delete nextInc[d];
  }

  return { selection: nextSel, includeChildren: nextInc, removedDescendantCount: removedDesc };
}
