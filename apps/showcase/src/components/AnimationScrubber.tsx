import { useState, useEffect, useCallback, useRef } from "react";
import type { Frame } from "../types";

interface AnimationScrubberProps {
  frames: Frame[];
  onFrameChange: (index: number) => void;
}

export default function AnimationScrubber({
  frames,
  onFrameChange,
}: AnimationScrubberProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const maxIndex = frames.length - 1;

  const advance = useCallback(() => {
    setIndex((prev) => {
      const next = prev >= maxIndex ? 0 : prev + 1;
      onFrameChange(next);
      return next;
    });
  }, [maxIndex, onFrameChange]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = window.setInterval(advance, 500);
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [playing, advance]);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setIndex(val);
    onFrameChange(val);
  };

  const frame = frames[index];

  return (
    <div className="flex items-center gap-3 mt-3 px-1">
      <button
        onClick={() => setPlaying(!playing)}
        className="text-sm px-2 py-1 rounded bg-[var(--color-surface-hover)] text-[var(--color-text)] hover:bg-[var(--color-border)]"
      >
        {playing ? "⏸" : "▶"}
      </button>
      <input
        type="range"
        min={0}
        max={maxIndex}
        value={index}
        onChange={handleSlider}
        className="flex-1"
      />
      <span className="text-xs text-[var(--color-text-muted)] min-w-[80px] text-right">
        {frame?.label ?? `Step ${frame?.step ?? index}`}
      </span>
    </div>
  );
}
