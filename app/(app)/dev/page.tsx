export default function DevPage() {
  return (
    <div className="mx-auto max-w-4xl p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Dev Workbench</h1>
      <p className="text-sm text-neutral-400">
        Use this route to test components in isolation before wiring into screens.
      </p>

      <ul className="list-disc pl-5 text-sm text-neutral-200 space-y-1">
        <li>/dev/topics-pills (next slice)</li>
        <li>/dev/topics-drawer (next slice)</li>
      </ul>
    </div>
  );
}
