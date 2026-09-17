"use client";

import { useMemo, useState } from "react";
import { MAPPINGS, PLANES, planesAudit, type PlaneStatus } from "@/lib/decoder/planes";
import { gridSlot, splitEven } from "@/lib/decoder/bitshift";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const AUDIT = planesAudit();

function statusVariant(s: PlaneStatus): "pass" | "accent" | "warn" | "fail" {
  if (s === "VERIFIED") return "pass";
  if (s === "CORRECTED") return "accent";
  if (s === "MODEL-BOUND") return "warn";
  return "fail";
}

export function PlanesPanel() {
  const [raw, setRaw] = useState("1118");
  const x = Number.parseInt(raw, 10);
  const live = useMemo(() => {
    if (!Number.isFinite(x)) return null;
    return { split: splitEven(x), grid: gridSlot(x) };
  }, [x]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Eight operational planes</CardTitle>
              <CardDescription>
                {AUDIT.release}. Typed mappings only. {AUDIT.authority}
              </CardDescription>
            </div>
            <Badge variant="warn">holonomy dark</Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="font-mono text-xs text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Plane</th>
                <th className="py-2 pr-3 font-medium">Kernel</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {PLANES.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-3 pr-3 align-top">
                    <p className="font-mono text-xs text-subtle">{p.id}</p>
                    <p className="text-fg">{p.name}</p>
                    <p className="mt-1 text-xs text-muted">{p.domain}</p>
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <p className="font-mono text-xs text-fg">{p.kernel}</p>
                    <p className="mt-1 text-xs text-muted">{p.observable}</p>
                  </td>
                  <td className="py-3 align-top">
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-xs text-subtle">{AUDIT.holonomyNote}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bit-shift protocol</CardTitle>
          <CardDescription>
            S(k, s) = 2k + s. Half-bit stays quarantined. 1118 ≫ 1 = 559 = 13 × 43.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="font-mono text-xs text-subtle">Integer X</span>
            <Input
              inputMode="numeric"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              aria-label="Integer to split"
            />
          </label>
          {live ? (
            <div className="grid flex-[2] grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-4">
              <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
                <p className="text-subtle">k = X ≫ 1</p>
                <p className="mt-1 text-lg text-fg">{live.split.k}</p>
              </div>
              <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
                <p className="text-subtle">s = X ∧ 1</p>
                <p className="mt-1 text-lg text-fg">{live.split.s}</p>
              </div>
              <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
                <p className="text-subtle">2k ∨ s</p>
                <p className="mt-1 text-lg text-fg">{live.split.rebuilt}</p>
              </div>
              <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
                <p className="text-subtle">grid g(X)</p>
                <p className="mt-1 text-lg text-fg">{live.grid.g}</p>
              </div>
            </div>
          ) : (
            <p className="font-mono text-xs text-fail">Need an integer.</p>
          )}
        </div>
        <dl className="mt-4 grid gap-3 font-mono text-xs sm:grid-cols-3">
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">CRT X</dt>
            <dd className="mt-1 text-fg">{AUDIT.bits.xCrt.toLocaleString("en-US")}</dd>
            <dd className="mt-1 text-muted">
              {AUDIT.bits.factor} · residues {AUDIT.bits.residues.join(", ")}
            </dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">F_101</dt>
            <dd className="mt-1 text-fg">
              23² ≡ {AUDIT.bits.f101.sq23} · roots {AUDIT.bits.f101.r.join(", ")}
            </dd>
            <dd className="mt-1 text-muted">79 is not 23². Order 50 / 25 still hold.</dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">480-grid / 1420</dt>
            <dd className="mt-1 text-fg">
              g(480) = {AUDIT.bits.g480.g} · 702+718 = {AUDIT.bits.gate1420}
            </dd>
            <dd className="mt-1 text-muted">{AUDIT.bits.nistNote}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>T_ij typed mappings</CardTitle>
          <CardDescription>Not morphisms. Loop identity not certified.</CardDescription>
        </CardHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {MAPPINGS.map((m) => (
            <div
              key={m.id}
              className="flex items-start justify-between gap-3 rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]"
            >
              <div>
                <p className="font-mono text-xs text-subtle">
                  {m.id} · {m.from} → {m.to}
                </p>
                <p className="mt-1 text-sm text-fg">{m.claim}</p>
              </div>
              <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
