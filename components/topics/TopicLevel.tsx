"use client";

import { useMemo, useState } from "react";
import { TopicNode } from "@/lib/topics/types";
import TopicPill from "./TopicPill";
import AddTopicModal from "./AddTopicModal";
import { track } from "./track";

export default function TopicLevel({
  level,
  topics,
  selectionStateById, // topicId -> "explicit"|"implicit"|"unselected"
  selectedCount,
  onOpenDetails,
  onSelectExplicit,
  onRemoveExplicit,
  onAddTopic,
  maxVisible = 60,
}: {
  level: number;
  topics: TopicNode[];
  selectionStateById: Record<string, "explicit" | "implicit" | "unselected">;
  selectedCount: number;

  onOpenDetails: (topicId: string) => void;
  onSelectExplicit: (topicId: string) => void;
  onRemoveExplicit: (topicId: string) => void;

  onAddTopic: (label: string) => void;
  maxVisible?: number;
}) {
  const [seeMore, setSeeMore] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const tooMany = topics.length > maxVisible;
  const shown = useMemo(() => {
    if (!tooMany || seeMore) return topics;
    return topics.slice(0, maxVisible);
  }, [topics, tooMany, seeMore, maxVisible]);

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">
            Level {level}{" "}
            <span className="text-xs text-neutral-500">({selectedCount} selected)</span>
          </div>
          {tooMany && (
            <div className="text-xs text-neutral-500">
              Large list. Internal scroll / See more applied.
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {tooMany && (
            <button
              onClick={() => {
                setSeeMore(v => !v);
                track("topics_see_more_clicked", { level, seeMore: !seeMore });
              }}
              className="rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
            >
              {seeMore ? "See less" : "See more"}
            </button>
          )}

          <button
            onClick={() => setAddOpen(true)}
            className="rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
          >
            + Add topic
          </button>
        </div>
      </div>

      <div className={`${tooMany && !seeMore ? "max-h-[220px] overflow-auto pr-1" : ""}`}>
        <div className="flex flex-wrap gap-2">
          {shown.map((t) => {
            const state = selectionStateById[t.id] ?? "unselected";
            return (
              <TopicPill
                key={t.id}
                node={t}
                state={state}
                onClick={() => onOpenDetails(t.id)}
                onRemove={
                  state === "explicit" ? () => onRemoveExplicit(t.id) : undefined
                }
              />
            );
          })}
        </div>
      </div>

      <AddTopicModal
        open={addOpen}
        level={level}
        existing={topics}
        onClose={() => setAddOpen(false)}
        onAdd={(label) => {
          onAddTopic(label);
          setAddOpen(false);
        }}
      />
    </section>
  );
}
