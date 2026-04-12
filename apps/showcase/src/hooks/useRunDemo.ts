import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { VizDocument, RunResult } from "../types";

export interface DemoResult {
  document: VizDocument | null;
  error: string | null;
  stderr: string;
}

export function useRunDemo() {
  const [result, setResult] = useState<DemoResult | null>(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(async (demoPath: string) => {
    setRunning(true);
    setResult(null);
    try {
      const res = await invoke<RunResult>("run_demo", { demoPath });
      if (res.exit_code !== 0) {
        setResult({
          document: null,
          error: `Demo exited with code ${res.exit_code}:\n${res.stderr}`,
          stderr: res.stderr,
        });
      } else {
        try {
          const doc = JSON.parse(res.stdout) as VizDocument;
          if (doc.schema !== 1) {
            setResult({
              document: null,
              error: `Unsupported schema version: ${doc.schema}`,
              stderr: res.stderr,
            });
          } else {
            setResult({ document: doc, error: null, stderr: res.stderr });
          }
        } catch {
          setResult({
            document: null,
            error: `Failed to parse demo output as JSON:\n${res.stdout.slice(0, 500)}`,
            stderr: res.stderr,
          });
        }
      }
    } catch (err) {
      setResult({
        document: null,
        error: `Invoke error: ${String(err)}`,
        stderr: "",
      });
    } finally {
      setRunning(false);
    }
  }, []);

  return { result, running, run };
}
