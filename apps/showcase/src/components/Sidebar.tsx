import { useState } from "react";
import type { DemoGroup } from "../hooks/useDemos";
import type { DemoEntry } from "../types";

const SECTION_LABELS: Record<string, string> = {
  domains: "Domains",
  frontiers: "Frontiers",
  applications: "Applications",
};

const SECTION_ORDER = ["domains", "frontiers", "applications"];

interface SidebarProps {
  groups: DemoGroup[];
  loading: boolean;
  error: string | null;
  selected: string | null;
  onSelect: (demo: DemoEntry) => void;
}

export default function Sidebar({
  groups,
  loading,
  error,
  selected,
  onSelect,
}: SidebarProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(SECTION_ORDER),
  );

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const sorted = [...groups].sort(
    (a, b) =>
      SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section),
  );

  return (
    <aside className="w-72 h-full flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h1 className="text-lg font-bold text-[var(--color-accent)]">
          mathcraft
        </h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          interactive showcase
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {loading && (
          <p className="px-4 py-2 text-sm text-[var(--color-text-muted)]">
            Scanning demos...
          </p>
        )}
        {error && (
          <p className="px-4 py-2 text-sm text-[var(--color-error)]">
            {error}
          </p>
        )}

        {sorted.map((group) => (
          <div key={group.section}>
            <button
              onClick={() => toggle(group.section)}
              className="w-full px-4 py-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <span className="text-[10px]">
                {expanded.has(group.section) ? "▼" : "▶"}
              </span>
              {SECTION_LABELS[group.section] ?? group.section}
            </button>

            {expanded.has(group.section) && (
              <CategoryList
                categories={group.categories}
                sectionKey={group.section}
                expanded={expanded}
                toggle={toggle}
                selected={selected}
                onSelect={onSelect}
              />
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function CategoryList({
  categories,
  sectionKey,
  expanded,
  toggle,
  selected,
  onSelect,
}: {
  categories: Map<string, DemoEntry[]>;
  sectionKey: string;
  expanded: Set<string>;
  toggle: (key: string) => void;
  selected: string | null;
  onSelect: (demo: DemoEntry) => void;
}) {
  const sortedCats = [...categories.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="ml-2">
      {sortedCats.map(([cat, demos]) => {
        const catKey = `${sectionKey}/${cat}`;
        const displayName = cat
          .replace(/^\d+-/, "")
          .replace(/\//g, " / ")
          .replace(/-/g, " ");
        return (
          <div key={catKey}>
            {cat && (
              <button
                onClick={() => toggle(catKey)}
                className="w-full px-3 py-1 flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <span className="text-[9px]">
                  {expanded.has(catKey) ? "▼" : "▶"}
                </span>
                {displayName}
              </button>
            )}

            {(cat === "" || expanded.has(catKey)) &&
              demos.map((demo) => (
                <button
                  key={demo.path}
                  onClick={() => onSelect(demo)}
                  className={`w-full px-6 py-1 text-left text-sm truncate transition-colors ${
                    selected === demo.path
                      ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  {demo.slug.replace(/-/g, " ")}
                </button>
              ))}
          </div>
        );
      })}
    </div>
  );
}
