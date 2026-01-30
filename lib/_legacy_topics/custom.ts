import { TopicTree, TopicNode } from "../topics/types";
import { Role } from "@/lib/practice/types";

const KEY_CUSTOM_TREE = "mr.topics.customTree";

export function loadCustomTreePatch(): Partial<TopicTree> | null {
  const raw = localStorage.getItem(KEY_CUSTOM_TREE);
  return raw ? (JSON.parse(raw) as Partial<TopicTree>) : null;
}

export function saveCustomTreePatch(patch: Partial<TopicTree>) {
  localStorage.setItem(KEY_CUSTOM_TREE, JSON.stringify(patch));
}

// merge patch into base tree
export function mergeTree(base: TopicTree, patch: Partial<TopicTree> | null): TopicTree {
  if (!patch) return base;
  const nodes = { ...base.nodes, ...(patch.nodes ?? {}) };
  const rootsByRole = { ...base.rootsByRole, ...(patch.rootsByRole ?? {}) } as Record<Role, string[]>;
  return { nodes, rootsByRole };
}

export function addCustomTopic(
  tree: TopicTree,
  args: { role: Role; level: number; label: string; parentId?: string }
): TopicTree {
  const id = `custom_${args.role}_${Date.now()}`;
  const node: TopicNode = {
    id,
    label: args.label,
    role: args.role,
    level: args.level,
    parentId: args.parentId,
    childrenIds: [],
    metrics: { band: 3, trend: "flat", attempts: 0 },
  };

  const nodes = { ...tree.nodes, [id]: node };
  const rootsByRole = { ...tree.rootsByRole };

  if (!args.parentId) {
    rootsByRole[args.role] = [...(rootsByRole[args.role] ?? []), id];
  } else {
    const p = nodes[args.parentId];
    if (p) nodes[args.parentId] = { ...p, childrenIds: [...p.childrenIds, id] };
  }

  return { nodes, rootsByRole };
}
