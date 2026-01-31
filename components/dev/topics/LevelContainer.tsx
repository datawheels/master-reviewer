"use client";

import { useMemo, useState } from "react";
import TopicPill from "@/components/topics/TopicPill";
import { TopicNode } from "@/lib/topics/types";

export type PillState = "explicit" | "implicit" | "unselected";

export default function LevelContainerV21({
  title,
  subtitle,
  items,
  getState,
  onToggle,
  onOpenDetails, // NEW
  emptyHint,
  threshold = 12,
  maxHeightClass = "max-h-[240px]",
}: {
  title: string;
  subtitle?: string;
  items: TopicNode[];
  getState: (id: string) => PillState;
  onToggle: (id: string) => void;
  onOpenDetails?: (id: string) => void; // NEW
  emptyHint?: string;
  threshold?: number;
  maxHeightClass?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const counts = useMemo(() => {
    let explicit = 0;
    let implicit = 0;

    for (const n of items) {
      const s = getState(n.id);
      if (s === "explicit") explicit++;
      if (s === "implicit") implicit++;
    }
    return { explicit, implicit, total: explicit + implicit };
  }, [items, getState]);

  const hasOverflow = items.length > threshold;
  const visibleItems = expanded ? items : items.slice(0, threshold);

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">{title}</div>
          {subtitle ? <div className="text-xs text-neutral-500">{subtitle}</div> : null}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-xs text-neutral-200">
            {counts.explicit} exp
          </span>
          <span className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-xs text-neutral-200">
            {counts.implicit} imp
          </span>
          <span className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-xs text-neutral-200">
            {counts.total} total
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-neutral-400">{emptyHint ?? "No topics to show."}</div>
      ) : (
        <div
          className={[
            "rounded-2xl border border-neutral-800 bg-neutral-950/20 p-3",
            expanded ? `${maxHeightClass} overflow-auto` : "",
          ].join(" ")}
        >
          <div className="flex flex-wrap gap-2">
            {visibleItems.map((n) => {
              const state = getState(n.id);

              return (
                <TopicPill
                  key={n.id}
                  node={n}
                  state={state}
                  onClick={() => onToggle(n.id)}
                  // No hover X in Slice 2: we do NOT pass onRemove here.
                  onOpenDetails={onOpenDetails ? () => onOpenDetails(n.id) : undefined}
                />
              );
            })}
          </div>
        </div>
      )}

      {hasOverflow && (
        <div className="flex justify-end">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-xl border border-neutral-800 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
          >
            {expanded ? "See less" : `See more (${items.length - threshold}+ )`}
          </button>
        </div>
      )}
    </section>
  );
}
