"use client";

import { TopicNode, Role } from "@/lib/topics/types";
import { track } from "./track";

export default function TopicDetailsDrawer({
  open,
  node,
  role,
  onClose,
  onPracticeThisTopic,
}: {
  open: boolean;
  node: TopicNode | null;
  role: Role;
  onClose: () => void;
  onPracticeThisTopic: (topicId: string) => void;
}) {
  if (!open || !node) return null;

  const m = node.metrics;
  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      {/* drawer */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-neutral-950 border-l border-neutral-800 p-5 overflow-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-neutral-400">{role}</div>
            <div className="text-xl font-semibold mt-1">{node.label}</div>
            <div className="text-xs text-neutral-500 mt-1">Level {node.level}</div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="text-sm font-medium">Progress</div>
            <div className="mt-2 text-sm text-neutral-200">
              Band: <span className="font-semibold">{m?.band ?? 3}/5</span>
            </div>
            <div className="text-sm text-neutral-200">
              Trend: <span className="font-semibold">{m?.trend ?? "flat"}</span>
            </div>
            <div className="text-sm text-neutral-200">
              Attempts: <span className="font-semibold">{m?.attempts ?? 0}</span>
            </div>
          </div>

          <button
            onClick={() => {
              track("start_practice_clicked", { topicId: node.id, role });
              onPracticeThisTopic(node.id);
            }}
            className="w-full rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200"
          >
            Practice this topic
          </button>
        </div>
      </div>
    </div>
  );
}
