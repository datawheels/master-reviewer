"use client";

import { useState } from "react";
import { Feedback } from "@/lib/practice/types";

export default function FeedbackPanel({ feedback }: { feedback: Feedback }) {
  const [exemplarOpen, setExemplarOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium">Feedback</div>
        <span className="text-xs rounded-full border border-neutral-700 px-2 py-1 text-neutral-200">
          Score {feedback.overallScore}/100
        </span>
        <span className="text-xs rounded-full border border-neutral-700 px-2 py-1 text-neutral-200">
          Band {feedback.overallBand}/5
        </span>
        <span className="text-xs rounded-full border border-neutral-700 px-2 py-1 text-neutral-200">
          Confidence {feedback.confidence}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {feedback.rubric.map((r) => (
          <div
            key={r.category}
            className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-300">{r.category}</div>
              <div className="text-xs text-neutral-200">Band {r.band}/5</div>
            </div>
            <div className="mt-2 text-xs text-neutral-400">{r.rationale}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
          <div className="text-xs font-medium text-neutral-200">What went well</div>
          <ul className="mt-2 list-disc pl-5 text-xs text-neutral-400 space-y-1">
            {feedback.wentWell.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
          <div className="text-xs font-medium text-neutral-200">What’s missing</div>
          <ul className="mt-2 list-disc pl-5 text-xs text-neutral-400 space-y-1">
            {feedback.missing.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
        <button
          onClick={() => setExemplarOpen((v) => !v)}
          className="text-xs font-medium text-neutral-200 hover:text-neutral-50"
        >
          {exemplarOpen ? "Hide" : "Show"} exemplar answer
        </button>
        {exemplarOpen && (
          <pre className="mt-3 whitespace-pre-wrap text-xs text-neutral-300">
            {feedback.exemplarAnswer}
          </pre>
        )}
      </div>
    </div>
  );
}
