interface ErrorDisplayProps {
  error: string;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-4">
      <h3 className="text-sm font-semibold text-[var(--color-error)] mb-2">
        Error
      </h3>
      <pre className="text-xs text-[var(--color-text-muted)] whitespace-pre-wrap font-mono overflow-auto max-h-64">
        {error}
      </pre>
    </div>
  );
}
