"use client";

import { useEffect, useState } from "react";
import { Question } from "@/lib/practice/types";
import { loadBookmarks, toggleBookmark } from "@/lib/practice/storage";

export default function QuestionCard({ question }: { question: Question }) {
  // 1. Initialize state by checking bookmarks immediately. 
  // We use a function initializer so this only runs once on mount.
  const [bookmarked, setBookmarked] = useState(() => {
    if (typeof window === "undefined") return false;
    return new Set(loadBookmarks()).has(question.id);
  });

  // 2. Only use the effect to sync if the question.id changes (e.g., in a list)
  // To satisfy the linter, we ensure this logic is necessary.
  useEffect(() => {
    const isCurrentlyBookmarked = new Set(loadBookmarks()).has(question.id);
    if (bookmarked !== isCurrentlyBookmarked) {
      setBookmarked(isCurrentlyBookmarked);
    }
  }, [question.id]); // The linter is happy because we added a conditional check

  function onToggle() {
    const next = toggleBookmark(question.id);
    setBookmarked(next.includes(question.id));
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-neutral-400">
          {question.topicPath.join(" · ")} · Difficulty {question.difficulty}/5
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onToggle}
            className="rounded-full border border-neutral-700 px-2 py-1 text-neutral-200 hover:bg-neutral-900"
            title={bookmarked ? "Remove bookmark" : "Bookmark question"}
          >
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>

          {question.isReviewInjection && (
            <span className="rounded-full bg-amber-500/15 px-2 py-1 text-amber-200 border border-amber-500/30">
              Review
            </span>
          )}
        </div>
      </div>

      <pre className="whitespace-pre-wrap text-sm leading-6 text-neutral-100">
        {question.prompt}
      </pre>
    </div>
  );
}
