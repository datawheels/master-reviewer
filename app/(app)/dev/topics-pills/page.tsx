"use client";

import { useMemo, useState } from "react";
import RoleSelector from "@/components/topics/RoleSelector";
import TopicPill from "@/components/topics/TopicPill";
import { Role, TopicNode } from "@/lib/topics/types";

function makeNode(
  role: Role,
  id: string,
  label: string,
  level: number,
  band: 1 | 2 | 3 | 4 | 5,
): TopicNode {
  return {
    id,
    role,
    label,
    level,
    parentId: undefined,
    childrenIds: [],
    metrics: { band, trend: "flat", attempts: Math.floor(Math.random() * 20) },
  };
}

export default function TopicsPillsDevPage() {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(["DE"]);
  const [activeRole, setActiveRole] = useState<Role>("DE");

  // NEW: visible event log (so you don't need console)
  const [events, setEvents] = useState<string[]>([]);

  function log(msg: string) {
    setEvents((prev) => [msg, ...prev].slice(0, 10));
  }

  const nodes = useMemo(() => {
    const base: Record<Role, TopicNode[]> = {
      DE: [
        makeNode("DE", "de_sql", "SQL", 1, 3),
        makeNode("DE", "de_py", "Python", 1, 4),
        makeNode("DE", "de_stream", "Streaming", 2, 2),
        makeNode("DE", "de_dq", "Data Quality", 2, 3),
        makeNode("DE", "de_model", "Modeling", 2, 3),
      ],
      DS: [
        makeNode("DS", "ds_ml", "ML", 1, 3),
        makeNode("DS", "ds_eval", "Evaluation", 2, 3),
        makeNode("DS", "ds_feat", "Features", 2, 2),
        makeNode("DS", "ds_stats", "Stats", 1, 4),
      ],
      DA: [
        makeNode("DA", "da_metrics", "Metrics", 1, 3),
        makeNode("DA", "da_funnel", "Funnels", 2, 3),
        makeNode("DA", "da_ret", "Retention", 2, 2),
        makeNode("DA", "da_exp", "Experimentation", 1, 3),
      ],
    };

    return base[activeRole];
  }, [activeRole]);

  function toggleRole(r: Role) {
    setSelectedRoles((prev) => {
      const set = new Set(prev);
      const wasSelected = set.has(r);

      if (wasSelected) set.delete(r);
      else set.add(r);

      const next = Array.from(set) as Role[];

      // Don't allow empty in dev demo
      if (next.length === 0) return prev;

      // If active role was removed, pick the first remaining
      if (!next.includes(activeRole)) {
        setActiveRole(next[0]);
        log(`active_role_changed: ${activeRole} → ${next[0]}`);
      }

      log(`role_toggled: ${r} (${wasSelected ? "off" : "on"})`);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Dev · Topics Pills</h1>
        <p className="text-sm text-neutral-400">
          Visual + interaction sandbox for Topics components. No storage, no engine.
        </p>
      </header>

      <RoleSelector
        selectedRoles={selectedRoles}
        activeRole={activeRole}
        onToggleRole={toggleRole}
        onSetActiveRole={(r) => {
          setActiveRole(r);
          log(`active_role_set: ${r}`);
        }}
      />

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
        <div className="text-sm font-medium">Pill states</div>
        <div className="text-xs text-neutral-500">
          - Click pill: adds an entry to Event log below<br />
          - Hover ✕ appears only on explicit pills
        </div>

        <div className="mt-3 space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-neutral-400">Unselected</div>
            <div className="flex flex-wrap gap-2">
              {nodes.map((n) => (
                <TopicPill
                  key={`unselected-${n.id}`}
                  node={n}
                  state="unselected"
                  onClick={() => log(`open_details(unselected): ${n.id}`)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-neutral-400">Explicit</div>
            <div className="flex flex-wrap gap-2">
              {nodes.map((n) => (
                <TopicPill
                  key={`explicit-${n.id}`}
                  node={n}
                  state="explicit"
                  onClick={() => log(`open_details(explicit): ${n.id}`)}
                  onRemove={() => log(`remove_topic(explicit): ${n.id}`)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-neutral-400">Implicit</div>
            <div className="flex flex-wrap gap-2">
              {nodes.map((n) => (
                <TopicPill
                  key={`implicit-${n.id}`}
                  node={n}
                  state="implicit"
                  onClick={() => log(`open_details(implicit): ${n.id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Event log panel */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Event log</div>
          <button
            onClick={() => setEvents([])}
            className="rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
          >
            Clear
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-sm text-neutral-400">
            Click a pill (or hover ✕ on an explicit pill) to see events here.
          </div>
        ) : (
          <ul className="text-sm text-neutral-200 space-y-1">
            {events.map((e, i) => (
              <li key={`${e}-${i}`} className="font-mono text-xs text-neutral-200">
                {e}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-2">
        <div className="text-sm font-medium">What to visually verify</div>
        <ul className="list-disc pl-5 text-sm text-neutral-200 space-y-1">
          <li>Explicit pills look “selected/solid”.</li>
          <li>Implicit pills look “included but not selected” (ghost).</li>
          <li>Hover ✕ appears only on explicit pills.</li>
          <li>Switching active role changes the topic set displayed.</li>
          <li>Clicking pills creates Event log entries.</li>
        </ul>
      </section>
    </div>
  );
}
