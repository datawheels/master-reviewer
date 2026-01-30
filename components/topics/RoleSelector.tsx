"use client";

import { Role } from "@/lib/topics/types";
import { track } from "./track";

const ROLES: Role[] = ["DE", "DS", "DA"];

export default function RoleSelector({
  selectedRoles,
  activeRole,
  onToggleRole,
  onSetActiveRole,
}: {
  selectedRoles: Role[];
  activeRole: Role;
  onToggleRole: (r: Role) => void;
  onSetActiveRole: (r: Role) => void;
}) {
  const selectedSet = new Set(selectedRoles);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Roles</div>
        <div className="text-xs text-neutral-500">Multi-select allowed</div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ROLES.map((r) => {
          const selected = selectedSet.has(r);
          const focused = r === activeRole;

          return (
            <div key={r} className="flex items-center gap-2">
              <button
                onClick={() => {
                  onToggleRole(r);
                  track("role_selected", { role: r, selected: !selected });
                }}
                className={`rounded-xl px-3 py-2 text-sm border ${
                  selected
                    ? "border-neutral-200 bg-neutral-50 text-neutral-900"
                    : "border-neutral-800 bg-neutral-950/40 text-neutral-200 hover:border-neutral-600"
                }`}
              >
                {r}
              </button>

              {selected && !focused && (
                <button
                  onClick={() => onSetActiveRole(r)}
                  className="text-xs text-neutral-400 hover:text-neutral-100"
                >
                  Focus
                </button>
              )}

              {selected && focused && (
                <span className="text-xs text-neutral-400">Active</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-neutral-500">
        Topics are shown in the context of the <span className="text-neutral-200">active</span> role.
      </div>
    </div>
  );
}
