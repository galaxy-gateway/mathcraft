import type { DemoEntry } from "../types";
import { useRunDemo } from "../hooks/useRunDemo";
import VizDisplay from "./VizDisplay";
import ErrorDisplay from "./ErrorDisplay";

interface Props {
  demo: DemoEntry;
}

export default function DemoPanel({ demo }: Props) {
  const { result, running, run } = useRunDemo();

  const displayName = demo.slug.replace(/-/g, " ");
  const breadcrumb = `${demo.section} / ${demo.category.replace(/\//g, " / ").replace(/-/g, " ")}`;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-start justify-between gap-4 shrink-0">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-1">
            {breadcrumb}
          </p>
          <h2 className="text-xl font-bold capitalize">{displayName}</h2>
          {result?.document?.description && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {result.document.description}
            </p>
          )}
        </div>
        <button
          onClick={() => run(demo.path)}
          disabled={running}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            running
              ? "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-wait"
              : "bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-hover)]"
          }`}
        >
          {running ? (
            <span className="flex items-center gap-2">
              <Spinner /> Running...
            </span>
          ) : (
            "Run demo"
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto min-h-0 flex flex-col">
        {!result && !running && (
          <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">
            <p>Click "Run demo" to visualize this concept</p>
          </div>
        )}

        {result?.error && <ErrorDisplay error={result.error} />}

        {result?.document && <VizDisplay document={result.document} />}

        {result?.stderr && !result.error && (
          <details className="mt-3">
            <summary className="text-xs text-[var(--color-text-muted)] cursor-pointer">
              stderr output
            </summary>
            <pre className="text-xs text-[var(--color-text-muted)] mt-1 font-mono whitespace-pre-wrap">
              {result.stderr}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
    </svg>
  );
}
