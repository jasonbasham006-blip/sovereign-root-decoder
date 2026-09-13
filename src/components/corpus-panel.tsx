import { useMemo, useState } from "react";
import {
  CONSTRAINED_CORPUS,
  decodeCorpus,
  PIVOT_INDEX,
  PIVOT_LATIN_TARGET,
  TONGUES,
} from "@/lib/decoder";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DECODED = decodeCorpus(CONSTRAINED_CORPUS);

export function CorpusPanel() {
  const [query, setQuery] = useState("");
  const [showBaseline, setShowBaseline] = useState(false);

  const sorted = useMemo(
    () => [...DECODED].sort((a, b) => a.final.Latin - b.final.Latin),
    [],
  );

  const pivot = sorted[PIVOT_INDEX];
  const pivotOk = pivot?.final.Latin === PIVOT_LATIN_TARGET;
  const aggregates = useMemo(() => {
    const sums = Object.fromEntries(TONGUES.map(([n]) => [n, 0])) as Record<string, number>;
    for (const r of DECODED) {
      for (const [tongue, val] of Object.entries(r.final)) {
        sums[tongue] += val;
      }
    }
    return sums;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return sorted;
    return sorted.filter((r) => r.text.toUpperCase().includes(q));
  }, [query, sorted]);

  const visible = filtered.filter((item) => {
    if (query) return true;
    const idx = sorted.indexOf(item);
    if (idx < PIVOT_INDEX && !showBaseline) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Constrained Corpus</CardTitle>
              <CardDescription>
                {CONSTRAINED_CORPUS.length} items · tuning books, key elements, NARA titles.
              </CardDescription>
            </div>
            <Badge variant={pivotOk ? "pass" : "warn"}>
              Pivot {pivotOk ? "locked" : "drift"}
            </Badge>
          </div>
        </CardHeader>
        {pivot && (
          <div className="rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Position 50 pivot gate
            </p>
            <p className="mt-1 font-display text-xl text-fg">{pivot.text}</p>
            <p className="mt-1 font-mono text-sm tabular-nums text-muted">
              Latin {pivot.final.Latin} · target {PIVOT_LATIN_TARGET}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {Object.entries(pivot.final).map(([tongue, val]) => (
                <div key={tongue} className="rounded-sm bg-surface px-2 py-2">
                  <div className="text-xs text-subtle">{tongue}</div>
                  <div className="font-mono text-sm tabular-nums">{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grand Convergence</CardTitle>
          <CardDescription>Aggregate word sums across the full corpus partition.</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {Object.entries(aggregates).map(([tongue, val]) => (
            <div
              key={tongue}
              className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]"
            >
              <div className="text-xs text-muted">{tongue}</div>
              <div className="font-mono text-lg tabular-nums">{val.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sorted titles</CardTitle>
          <CardDescription>Ordered by Latin word sum. First 49 are the filtered baseline.</CardDescription>
        </CardHeader>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter titles"
            aria-label="Filter corpus titles"
          />
          <Button variant="secondary" onClick={() => setShowBaseline((v) => !v)}>
            {showBaseline ? "Hide baseline" : "Show first 49"}
          </Button>
        </div>
        <ul className="flex max-h-96 flex-col gap-px overflow-auto rounded-md bg-elevated p-1">
          {visible.map((item) => {
            const idx = sorted.indexOf(item);
            const isPivot = idx === PIVOT_INDEX;
            return (
              <li
                key={`${item.text}-${idx}`}
                className={`flex items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm ${
                  isPivot ? "bg-accent/10 text-fg" : "text-fg"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="w-8 shrink-0 font-mono text-xs tabular-nums text-subtle">
                    {idx + 1}
                  </span>
                  <span className="truncate">{item.text}</span>
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
                  {item.final.Latin}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-subtle">{visible.length} shown of {sorted.length}</p>
      </Card>
    </div>
  );
}
