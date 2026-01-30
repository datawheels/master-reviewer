import { NextUpOption } from "@/lib/practice/types";

export default function NextUpCard({
  options,
  onPick,
}: {
  options: NextUpOption[];
  onPick: (o: NextUpOption) => void;
}) {
  // Guard: must always be exactly 5
  if (options.length !== 5) {
    console.warn("NextUpCard expected exactly 5 options, got:", options.length);
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
      <div className="text-sm font-medium">Next-Up</div>
      <div className="text-xs text-neutral-400">
        Choose one option to continue. (Always exactly 5.)
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.action}
            onClick={() => onPick(o)}
            className="text-left rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 hover:border-neutral-600 hover:bg-neutral-950"
          >
            <div className="text-sm font-semibold">{o.title}</div>
            <div className="mt-1 text-xs text-neutral-400">{o.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
