import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { DemoEntry } from "../types";

export interface DemoGroup {
  section: string;
  categories: Map<string, DemoEntry[]>;
}

export function useDemos() {
  const [demos, setDemos] = useState<DemoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke<DemoEntry[]>("scan_demos")
      .then((entries) => {
        setDemos(entries);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  // Group demos by section, then by category
  const groups: DemoGroup[] = [];
  const sectionMap = new Map<string, Map<string, DemoEntry[]>>();

  for (const demo of demos) {
    if (!sectionMap.has(demo.section)) {
      sectionMap.set(demo.section, new Map());
    }
    const catMap = sectionMap.get(demo.section)!;
    if (!catMap.has(demo.category)) {
      catMap.set(demo.category, []);
    }
    catMap.get(demo.category)!.push(demo);
  }

  for (const [section, categories] of sectionMap) {
    groups.push({ section, categories });
  }

  return { demos, groups, loading, error };
}
