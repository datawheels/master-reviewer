"use client";

import { useEffect, useState } from "react";
import {
  clearAllLocal,
  clearHistory,
  clearUnfinished,
  loadBookmarks,
  saveBookmarks,
  loadContext,
} from "@/lib/practice/storage";
import { PracticeContext } from "@/lib/practice/types";

export default function ProfilePage() {
  const [ctx, setCtx] = useState<PracticeContext | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setCtx(loadContext());
    setBookmarkCount(loadBookmarks().length);
  }, []);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  }

  function onClearUnfinished() {
    clearUnfinished();
    notify("Unfinished attempt cleared.");
  }

  function onClearHistory() {
    clearHistory();
    notify("History cleared.");
  }

  function onClearBookmarks() {
    saveBookmarks([]);
    setBookmarkCount(0);
    notify("Bookmarks cleared.");
  }

  function onClearAll() {
    clearAllLocal();
    setCtx(loadContext()); // loads default if no ctx exists
    setBookmarkCount(loadBookmarks().length);
    notify("All local data cleared.");
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-neutral-400">
          Preferences and local-only data controls (no auth yet).
        </p>
      </header>

      {toast && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 text-sm text-neutral-200">
          {toast}
        </div>
      )}

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
        <div className="text-sm font-medium">Current practice settings</div>
        {ctx ? (
          <div className="text-sm text-neutral-200 space-y-1">
            <div>
              Role: <span className="text-neutral-50 font-semibold">{ctx.role}</span>
            </div>
            <div>
              Scope: <span className="text-neutral-50 font-semibold">{ctx.topicScope.join(" / ")}</span>
            </div>
            <div>
              Difficulty bias:{" "}
              <span className="text-neutral-50 font-semibold">{ctx.difficultyBias}</span>
            </div>
            <div>
              Bookmarks:{" "}
              <span className="text-neutral-50 font-semibold">{bookmarkCount}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-neutral-400">Loading…</div>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
        <div className="text-sm font-medium">Local data controls</div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onClearUnfinished}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
          >
            Clear unfinished attempt
          </button>

          <button
            onClick={onClearHistory}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
          >
            Clear history
          </button>

          <button
            onClick={onClearBookmarks}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
          >
            Clear bookmarks
          </button>

          <button
            onClick={onClearAll}
            className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200"
          >
            Clear all local data
          </button>
        </div>

        <div className="text-xs text-neutral-500">
          These actions only affect your browser storage.
        </div>
      </section>
    </div>
  );
}
