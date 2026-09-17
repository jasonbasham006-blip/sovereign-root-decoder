"use client";

import { useMemo, useState } from "react";
import {
  FAIC_COLLECTION,
  FAIC_HITS,
  FAIC_INTERVIEWEES,
  faicSearch,
  ingestGoldenCorpus,
  type PropositionReceipt,
} from "@/lib/decoder";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const FACTORS = [
  ["P", "Provenance", "Housed at MHS"],
  ["D", "Directness", "Contemporaneous account"],
  ["I", "Integrity", "No ledger modification"],
  ["R", "Reproducibility", "Independent historians"],
  ["X", "Independence", "Direct primary source"],
  ["C", "Corroboration", "Boston custom house"],
  ["T", "Temporal proximity", "27 August 1762"],
  ["A", "Authenticity", "Revere handwriting"],
  ["S", "Specificity", "Weight and name metadata"],
  ["M", "Motive / opportunity", "Business ledger entry"],
] as const;

export function EvidencePanel() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PropositionReceipt | null>(null);
  const [audit, setAudit] = useState<string | null>(null);
  const [events, setEvents] = useState<number>(0);
  const [query, setQuery] = useState("Packard");

  const names = useMemo(() => faicSearch(query), [query]);

  async function ingest() {
    setRunning(true);
    setError(null);
    try {
      const { engine, receipt: next } = await ingestGoldenCorpus();
      setReceipt(next);
      setAudit(engine.auditHashChain.at(-1) ?? null);
      setEvents(engine.auditLog.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>FAIC / Winterthur oral history</CardTitle>
              <CardDescription>
                Field-wide conservation archive. Not a Packard-only box. Transcript bodies stay
                fail-closed until the Winterthur PDF is pasted.
              </CardDescription>
            </div>
            <Badge variant="accent">{FAIC_INTERVIEWEES.length} names</Badge>
          </div>
        </CardHeader>
        <p className="text-sm leading-normal text-muted">
          {FAIC_COLLECTION.name}, launched {FAIC_COLLECTION.launched} under {FAIC_COLLECTION.director}.{" "}
          {FAIC_COLLECTION.aicNote} Finding aid {FAIC_COLLECTION.findingAid}.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="font-mono text-xs text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Record</th>
                <th className="py-2 pr-3 font-medium">Kind</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {FAIC_HITS.map((h) => (
                <tr key={h.id} className="border-b border-border/60 align-top">
                  <td className="py-2 pr-3">
                    <p className="text-fg">{h.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{h.note}</p>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-muted">
                    {h.kind}
                    {h.year ? ` · ${h.year}` : ""}
                  </td>
                  <td className="py-2">
                    <Badge
                      variant={
                        h.status === "CATALOGED"
                          ? "pass"
                          : h.status === "NOT_IN_INDEX" || h.status === "FAIL_CLOSED"
                            ? "warn"
                            : "default"
                      }
                    >
                      {h.status.replaceAll("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Separator className="my-4" />
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-muted">
            Filter {FAIC_INTERVIEWEES.length} indexed interviewees
          </span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Packard, Werner, Stout…"
            className="font-mono"
          />
        </label>
        <p className="mt-2 font-mono text-xs text-subtle">{names.length} match</p>
        <ul className="mt-2 columns-1 gap-x-6 text-sm sm:columns-2 lg:columns-3">
          {names.map((n) => (
            <li
              key={n}
              className={
                n.includes("Packard") || n.includes("Werner")
                  ? "font-medium text-fg"
                  : "text-muted"
              }
            >
              {n}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Golden corpus</CardTitle>
          <CardDescription>
            Ingest Revere wastebook evidence, compile the DAG, evaluate P-VESSEL-01.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-normal text-muted">
            Source S-REVERE-01 · Artifact AR-BOWL-01 · “Benjamin Green provided silver to make a
            Sugar Dish.”
          </p>
          <Button onClick={ingest} disabled={running} className="w-full sm:w-56">
            {running ? "Ingesting…" : receipt ? "Re-ingest and evaluate" : "Ingest and evaluate"}
          </Button>
          {error && <p className="text-sm text-fail">{error}</p>}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ten-factor vector</CardTitle>
          <CardDescription>P-D-I-R-X-C-T-A-S-M assessment for E-REVERE-01.</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {FACTORS.map(([code, name, basis]) => (
            <div key={code} className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-accent">{code}</span>
              </div>
              <p className="mt-1 text-sm text-fg">{name}</p>
              <p className="mt-1 text-xs leading-snug text-subtle">{basis}</p>
            </div>
          ))}
        </div>
      </Card>

      {receipt && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Execution receipt</CardTitle>
                <CardDescription>{receipt.statement}</CardDescription>
              </div>
              <Badge variant="pass">{receipt.state.replaceAll("_", " ")}</Badge>
            </div>
          </CardHeader>
          <dl className="flex flex-col gap-2 font-mono text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">proposition</dt>
              <dd>{receipt.propositionId}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">supporting</dt>
              <dd>{receipt.supportingEvidence.join(", ") || "none"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">contradicting</dt>
              <dd>{receipt.contradictingEvidence.join(", ") || "none"}</dd>
            </div>
          </dl>
          <Separator className="my-4" />
          <p className="font-mono text-xs leading-relaxed break-all text-subtle">
            audit {audit}
          </p>
          <p className="mt-1 font-mono text-xs text-subtle">{events} chained events</p>
        </Card>
      )}
    </div>
  );
}
