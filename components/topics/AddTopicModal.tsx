"use client";

import { useMemo, useState } from "react";
import { TopicNode } from "@/lib/topics/types";

export default function AddTopicModal({
  open,
  level,
  existing,
  onClose,
  onAdd,
}: {
  open: boolean;
  level: number;
  existing: TopicNode[]; // topics already visible at this level
  onClose: () => void;
  onAdd: (label: string) => void;
}) {
  const [value, setValue] = useState("");

  const existingLabels = useMemo(
    () => new Set(existing.map(t => t.label.toLowerCase())),
    [existing]
  );

  if (!open) return null;

  const disabled =
    value.trim().length < 2 || existingLabels.has(value.trim().toLowerCase());

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Add topic</div>
            <div className="text-xs text-neutral-400">Level {level}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="text-xs text-neutral-400">Topic name</div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
            placeholder="e.g., Query Optimization"
          />
          {existingLabels.has(value.trim().toLowerCase()) && (
            <div className="text-xs text-amber-200">That topic already exists at this level.</div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => onAdd(value.trim())}
            disabled={disabled}
            className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-40 hover:bg-neutral-200"
          >
            Add
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          UI-only: added topics persist locally for this browser.
        </div>
      </div>
    </div>
  );
}
