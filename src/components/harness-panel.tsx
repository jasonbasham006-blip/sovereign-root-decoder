import { useState } from "react";
import { runFailureTestHarness, type HarnessResult } from "@/lib/decoder";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function HarnessPanel() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<HarnessResult[] | null>(null);

  async function run() {
    setRunning(true);
    try {
      const next = await runFailureTestHarness();
      setResults(next);
    } finally {
      setRunning(false);
    }
  }

  const passed = results?.filter((r) => r.passed).length ?? 0;
  const total = results?.length ?? 8;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Self-auditing harness</CardTitle>
              <CardDescription>
                Eight deliberate schema mutations. The engine must refuse every invalid model.
              </CardDescription>
            </div>
            {results && (
              <Badge variant={passed === total ? "pass" : "fail"}>
                {passed}/{total} quarantined
              </Badge>
            )}
          </div>
        </CardHeader>
        <Button onClick={run} disabled={running}>
          {running ? "Injecting…" : results ? "Re-run injections" : "Run injections 1–8"}
        </Button>
      </Card>

      <div className="grid gap-2">
        {(results ?? PLACEHOLDER).map((r, i) => (
          <Card key={r.test} className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-xs text-subtle">Inject {i + 1}</p>
                <p className="text-sm text-fg">{r.test}</p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-muted">{r.detail}</p>
              </div>
              <Badge variant={results ? (r.passed ? "pass" : "fail") : "default"}>
                {results ? (r.passed ? "PASSED" : "FAILED") : "queued"}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

const PLACEHOLDER: HarnessResult[] = [
  { test: "Inject 1: Empty content_hash rejection", passed: false, detail: "Awaiting run" },
  { test: "Inject 2: Non-existent evidence_id relationship rejection", passed: false, detail: "Awaiting run" },
  { test: "Inject 3: Circular dependency detection", passed: false, detail: "Awaiting run" },
  { test: "Inject 4: Factor status/strength mismatch rejection", passed: false, detail: "Awaiting run" },
  { test: "Inject 5: Derived type missing dependencies rejection", passed: false, detail: "Awaiting run" },
  { test: "Inject 6: Empty provenance chain rejection", passed: false, detail: "Awaiting run" },
  { test: "Inject 7: Naive datetime rejection", passed: false, detail: "Awaiting run" },
  { test: "Inject 8: Empty proposition statement rejection", passed: false, detail: "Awaiting run" },
];
