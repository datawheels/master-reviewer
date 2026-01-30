import { TopicsState } from "./types";

const KEY = "mr.topics.state.v1";

export function loadTopicsState(): TopicsState | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as TopicsState) : null;
}

export function saveTopicsState(state: TopicsState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
