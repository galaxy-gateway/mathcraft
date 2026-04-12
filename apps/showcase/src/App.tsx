import { useState } from "react";
import { useDemos } from "./hooks/useDemos";
import Sidebar from "./components/Sidebar";
import DemoPanel from "./components/DemoPanel";
import type { DemoEntry } from "./types";

export default function App() {
  const { groups, loading, error } = useDemos();
  const [selected, setSelected] = useState<DemoEntry | null>(null);

  return (
    <div className="flex h-full">
      <Sidebar
        groups={groups}
        loading={loading}
        error={error}
        selected={selected?.path ?? null}
        onSelect={setSelected}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <DemoPanel key={selected.path} demo={selected} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-[var(--color-accent)] mb-3">
                mathcraft showcase
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Select a concept from the sidebar to explore interactive
                visualizations of mathematical algorithms and structures.
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-6">
                {groups.reduce(
                  (n, g) =>
                    n +
                    [...g.categories.values()].reduce(
                      (m, demos) => m + demos.length,
                      0,
                    ),
                  0,
                )}{" "}
                demos available
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
