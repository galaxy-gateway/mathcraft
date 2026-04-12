import type { ScalarData } from "../types";

interface Props {
  data: ScalarData;
}

export default function ScalarRenderer({ data }: Props) {
  const { value } = data;

  if (typeof value === "number" || typeof value === "string") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="text-5xl font-mono font-bold text-[var(--color-accent)]">
            {typeof value === "number" ? formatNumber(value) : value}
          </span>
        </div>
      </div>
    );
  }

  // Object value — render as formatted JSON
  return (
    <div className="p-4 overflow-auto h-full">
      <pre className="text-sm font-mono text-[var(--color-text)]">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function formatNumber(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) {
    return n.toLocaleString();
  }
  return n.toPrecision(6);
}
