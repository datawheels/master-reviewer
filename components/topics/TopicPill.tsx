"use client";

import { TopicNode } from "@/lib/topics/types";

export default function TopicPill({
  node,
  state, // "explicit" | "implicit" | "unselected"
  onClick,
  onRemove,
  onOpenDetails, // NEW
}: {
  node: TopicNode;
  state: "explicit" | "implicit" | "unselected";
  onClick: () => void;
  onRemove?: () => void; // only for explicit
  onOpenDetails?: () => void; // NEW: shows right-arrow
}) {
  const band = node.metrics?.band ?? 3;

  const base =
    "group relative rounded-full px-3 py-1 text-xs border transition flex items-center gap-2";
  const cls =
    state === "explicit"
      ? "border-neutral-200 bg-neutral-50 text-neutral-900"
      : state === "implicit"
      ? "border-neutral-700 bg-neutral-950/40 text-neutral-200"
      : "border-neutral-800 bg-neutral-950/20 text-neutral-200 hover:border-neutral-600";

  return (
    <button onClick={onClick} className={`${base} ${cls}`}>
      <span>{node.label}</span>

      <span
        className={`rounded-full px-2 py-[2px] text-[10px] border ${
          state === "explicit"
            ? "border-neutral-300 bg-neutral-100"
            : "border-neutral-700 bg-neutral-900/40"
        }`}
      >
        {band}/5
      </span>

      {/* Details arrow (opens side panel) */}
      {onOpenDetails && (
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenDetails();
          }}
          className={`ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
            state === "explicit"
              ? "border-neutral-300 bg-neutral-100 text-neutral-900"
              : "border-neutral-700 bg-neutral-900/40 text-neutral-200"
          } hover:opacity-90`}
          title="Open details"
          aria-label="Open topic details"
        >
          ›
        </span>
      )}

      {/* Slice 1 compatibility: hover X only if onRemove is provided */}
      {state === "explicit" && onRemove && (
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-1 -top-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full border border-neutral-700 bg-neutral-950 text-neutral-200 text-[10px]"
          title="Remove"
        >
          ✕
        </span>
      )}
    </button>
  );
}
