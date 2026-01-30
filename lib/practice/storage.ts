import { Attempt, PracticeContext } from "./types";

const KEY_CTX = "mr.practice.context";
const KEY_UNFINISHED = "mr.practice.unfinishedAttempt";
const KEY_HISTORY = "mr.practice.history";
const KEY_BOOKMARKS = "mr.practice.bookmarks";

export function loadContext(): PracticeContext {
  const raw = localStorage.getItem(KEY_CTX);
  if (raw) return JSON.parse(raw);
  return { role: "DE", topicScope: ["SQL"], difficultyBias: "balanced" };
}

export function saveContext(ctx: PracticeContext) {
  localStorage.setItem(KEY_CTX, JSON.stringify(ctx));
}

export function loadUnfinishedAttempt(): Attempt | null {
  const raw = localStorage.getItem(KEY_UNFINISHED);
  return raw ? (JSON.parse(raw) as Attempt) : null;
}

export function saveUnfinishedAttempt(a: Attempt | null) {
  if (!a) localStorage.removeItem(KEY_UNFINISHED);
  else localStorage.setItem(KEY_UNFINISHED, JSON.stringify(a));
}

export function appendHistory(entry: Attempt) {
  const raw = localStorage.getItem(KEY_HISTORY);
  const arr = raw ? (JSON.parse(raw) as Attempt[]) : [];
  arr.unshift(entry);
  localStorage.setItem(KEY_HISTORY, JSON.stringify(arr.slice(0, 200)));
}

export function loadHistory(): Attempt[] {
  const raw = localStorage.getItem(KEY_HISTORY);
  return raw ? (JSON.parse(raw) as Attempt[]) : [];
}

export function clearHistory() {
  localStorage.removeItem(KEY_HISTORY);
}

export function loadBookmarks(): string[] {
  const raw = localStorage.getItem(KEY_BOOKMARKS);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export function saveBookmarks(ids: string[]) {
  localStorage.setItem(KEY_BOOKMARKS, JSON.stringify(ids));
}

export function clearAllLocal() {
  localStorage.removeItem(KEY_CTX);
  localStorage.removeItem(KEY_UNFINISHED);
  localStorage.removeItem(KEY_HISTORY);
  localStorage.removeItem(KEY_BOOKMARKS);
}


export function toggleBookmark(questionId: string): string[] {
  const curr = new Set(loadBookmarks());
  if (curr.has(questionId)) curr.delete(questionId);
  else curr.add(questionId);
  const next = Array.from(curr);
  saveBookmarks(next);
  return next;
}

export function clearUnfinished() {
  localStorage.removeItem("mr.practice.unfinishedAttempt");
}


