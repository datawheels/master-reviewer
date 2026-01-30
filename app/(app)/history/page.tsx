"use client";

import { useEffect, useMemo, useState } from "react";
import { MOCK_QUESTIONS } from "@/lib/mock/questions";
import { Attempt } from "@/lib/practice/types";
import { loadHistory } from "@/lib/practice/storage";

function questionTitle(id: string) {
  const q = MOCK_QUESTIONS.find((x) => x.id === id);
  if (!q) return id;
  return `${q.topicPath.join(" · ")} — ${q.prompt.slice(0, 60)}…`;
}

export default function HistoryPage() {
  const [items, setItems] = useState<Attempt[]>([]);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  const rows = useMemo(() => items, [items]);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-sm text-neutral-400">Local attempt history (mock).</p>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-6 text-sm text-neutral-400">No attempts yet.</div>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {rows.map((a) => (
              <li key={a.attemptId} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm text-neutral-100">{questionTitle(a.questionId)}</div>
                  <div className="text-xs text-neutral-400 whitespace-nowrap">
                    {new Date(a.updatedAt).toLocaleString()}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-neutral-700 px-2 py-1 text-neutral-200">
                    {a.status}
                  </span>

                  {a.feedback && (
                    <>
                      <span className="rounded-full border border-neutral-700 px-2 py-1 text-neutral-200">
                        Score {a.feedback.overallScore}
                      </span>
                      <span className="rounded-full border border-neutral-700 px-2 py-1 text-neutral-200">
                        Band {a.feedback.overallBand}/5
                      </span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
