"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_QUESTIONS } from "@/lib/mock/questions";
import { loadBookmarks, saveBookmarks } from "@/lib/practice/storage";

export default function BookmarksPage() {
  const router = useRouter();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(loadBookmarks());
  }, []);

  const items = useMemo(() => {
    const set = new Set(ids);
    return MOCK_QUESTIONS.filter((q) => set.has(q.id));
  }, [ids]);

  function remove(id: string) {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    saveBookmarks(next);
  }

  function practiceBookmarked() {
    router.push("/practice");
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Bookmarks</h1>
        <p className="text-sm text-neutral-400">
          Saved questions (local only).
        </p>
      </header>

      <div className="flex gap-3">
        <button
          onClick={practiceBookmarked}
          className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200"
        >
          Practice bookmarked
        </button>
        <div className="text-xs text-neutral-500 self-center">
          (In UI-only mode, this just takes you back to Practice.)
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-6 text-sm text-neutral-400">
            No bookmarked questions yet. Bookmark one from Practice.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {items.map((q) => (
              <li key={q.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-neutral-400">
                      {q.topicPath.join(" · ")} · Difficulty {q.difficulty}/5
                    </div>
                    <div className="text-sm text-neutral-100 mt-1">
                      {q.prompt.length > 120 ? q.prompt.slice(0, 120) + "…" : q.prompt}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(q.id)}
                    className="rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
                  >
                    Remove
                  </button>
                </div>

                <div className="text-xs text-neutral-500">ID: {q.id}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
