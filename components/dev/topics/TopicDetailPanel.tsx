"use client";

import { useEffect, useMemo } from "react";
import { TopicNode } from "@/lib/topics/types";

export type TopicFeedback = {
  strengths: string[];
  improve: string[];
  aiNotes?: string;
};

export default function TopicDetailPanel({
  open,
  node,
  expertise,
  onChangeExpertise,
  userNotes,
  onChangeUserNotes,
  feedback,
  onClose,
  onAction,
}: {
  open: boolean;
  node: TopicNode | null;

  expertise: number; // 1..5
  onChangeExpertise: (v: number) => void;

  userNotes: string;
  onChangeUserNotes: (v: string) => void;

  feedback: TopicFeedback;

  onClose: () => void;
  onAction?: (action: string, topicId: string) => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const band = node?.metrics?.band ?? 3;
  const attempts = node?.metrics?.attempts ?? 0;
  const trend = node?.metrics?.trend ?? "flat";

  const lastPracticed = useMemo(() => {
    if (!node?.metrics?.lastPracticedAt) return "—";
    try {
      return new Date(node.metrics.lastPracticedAt).toLocaleString();
    } catch {
      return "—";
    }
  }, [node?.metrics?.lastPracticedAt]);

  const contextPreview = useMemo(() => {
    const label = node?.label ?? "—";
    const role = node?.role ?? "—";
    const lvl = node?.level ?? "—";

    const strengths = feedback.strengths?.length ? feedback.strengths.join("; ") : "—";
    const improve = feedback.improve?.length ? feedback.improve.join("; ") : "—";

    const notes = (userNotes || "").trim();
    const trimmedNotes = notes.length > 240 ? `${notes.slice(0, 240)}…` : notes || "—";

    return [
      `Topic: ${label} (role ${role}, level ${lvl})`,
      `Metrics: band ${band}/5, attempts ${attempts}, trend ${trend}, last ${lastPracticed}`,
      `Expertise: ${expertise}/5`,
      `Strong points: ${strengths}`,
      `To work on: ${improve}`,
      `User notes: ${trimmedNotes}`,
    ].join("\n");
  }, [
    attempts,
    band,
    expertise,
    feedback.improve,
    feedback.strengths,
    lastPracticed,
    node?.label,
    node?.level,
    node?.role,
    trend,
    userNotes,
  ]);

  if (!open) return null;

  return (
    <>
      <button onClick={onClose} className="fixed inset-0 bg-black/50" aria-label="Close topic details" />

      <aside className="fixed right-0 top-0 h-full w-[440px] max-w-[92vw] border-l border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl">
        <div className="h-full p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs text-neutral-400">Topic</div>
              <div className="text-lg font-semibold">{node?.label ?? "—"}</div>
              <div className="text-xs text-neutral-500">
                Role: <span className="text-neutral-200">{node?.role ?? "—"}</span> · Level{" "}
                <span className="text-neutral-200">{node?.level ?? "—"}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-neutral-800 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
            >
              Close
            </button>
          </div>

          <div className="mt-5 space-y-4 overflow-auto pr-1">
            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-2">
              <div className="text-sm font-medium">Metrics</div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-3">
                  <div className="text-xs text-neutral-500">Score / Band</div>
                  <div className="mt-1 text-base font-semibold">{band}/5</div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-3">
                  <div className="text-xs text-neutral-500">Questions attempted</div>
                  <div className="mt-1 text-base font-semibold">{attempts}</div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-3">
                  <div className="text-xs text-neutral-500">Trend</div>
                  <div className="mt-1 text-base font-semibold">{trend}</div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-3">
                  <div className="text-xs text-neutral-500">Last practiced</div>
                  <div className="mt-1 text-xs text-neutral-200">{lastPracticed}</div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Expertise</div>
                <div className="text-xs text-neutral-300">{expertise}/5</div>
              </div>

              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={expertise}
                onChange={(e) => onChangeExpertise(Number(e.target.value))}
                className="w-full"
              />

              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              </div>

              <div className="text-xs text-neutral-500">
                Self-rated signal to guide review focus and recommendations.
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <div className="text-sm font-medium">User feedback</div>

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/20 p-3">
                  <div className="text-xs text-neutral-400 mb-2">Strong points</div>
                  <div className="max-h-[92px] overflow-auto pr-1">
                    {feedback.strengths.length === 0 ? (
                      <div className="text-xs text-neutral-500">—</div>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-200">
                        {feedback.strengths.map((s, i) => (
                          <li key={`${s}-${i}`}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/20 p-3">
                  <div className="text-xs text-neutral-400 mb-2">Points to work on</div>
                  <div className="max-h-[92px] overflow-auto pr-1">
                    {feedback.improve.length === 0 ? (
                      <div className="text-xs text-neutral-500">—</div>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-200">
                        {feedback.improve.map((s, i) => (
                          <li key={`${s}-${i}`}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-500">
                Feedback + notes become part of the context window for generated questions.
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <div className="text-sm font-medium">Your notes</div>
              <textarea
                value={userNotes}
                onChange={(e) => onChangeUserNotes(e.target.value)}
                placeholder="Add what you struggle with, patterns you notice, or examples you want included..."
                className="min-h-[110px] w-full rounded-2xl border border-neutral-800 bg-neutral-950/30 p-3 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-neutral-600"
              />
              <div className="text-xs text-neutral-500">
                Notes personalize questions, explanations, and follow-ups.
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Context preview</div>
                <button
                  onClick={() => node && onAction?.("log_context_preview", node.id)}
                  className="rounded-xl border border-neutral-800 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
                >
                  Log
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-xs text-neutral-200 rounded-2xl border border-neutral-800 bg-neutral-950/30 p-3">
                {contextPreview}
              </pre>
              <div className="text-xs text-neutral-500">
                (Dev) This is what we’ll feed into question generation context.
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <div className="text-sm font-medium">Actions</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => node && onAction?.("mark_for_review", node.id)}
                  className="rounded-xl border border-neutral-800 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
                >
                  Mark for review
                </button>
                <button
                  onClick={() => node && onAction?.("reset_attempts", node.id)}
                  className="rounded-xl border border-neutral-800 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
                >
                  Reset attempts
                </button>
                <button
                  onClick={() => node && onAction?.("add_note_action", node.id)}
                  className="rounded-xl border border-neutral-800 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
                >
                  Add note (action)
                </button>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}
