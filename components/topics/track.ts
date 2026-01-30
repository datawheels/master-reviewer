export function track(event: string, payload?: Record<string, any>) {
  // UI-only analytics stub
  console.log("[analytics]", event, payload ?? {});
}
