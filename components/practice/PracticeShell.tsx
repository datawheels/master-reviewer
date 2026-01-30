import { PracticeContext } from "@/lib/practice/types";

export default function PracticeShell({
  ctx,
  children,
}: {
  ctx: PracticeContext;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="space-y-1">
        <div className="text-xs text-neutral-400">
          Role: <span className="text-neutral-200">{ctx.role}</span> · Scope:{" "}
          <span className="text-neutral-200">{ctx.topicScope.join(" / ")}</span>
        </div>
        <h1 className="text-2xl font-semibold">Practice</h1>
      </header>

      {children}
    </div>
  );
}
