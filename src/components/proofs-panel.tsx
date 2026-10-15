"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COMPILATION,
  CRATE_XRF,
  CLEAN_GATE,
  FIELD101,
  GROUND,
  PHASE3,
  PHASE_JUMPS,
  PULSE,
  PULSE_OFFSET,
  evaluateXrf,
  formatGateScan,
  retiredSample,
  runHydro,
  runProofs,
  scanDraft,
  syndromeCommitment,
  type XrfZone,
} from "@/lib/decoder";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const REPORT = runProofs();
const BASE = COMPILATION;
const HYDRO = runHydro();

export function ProofsPanel() {
  const [zone, setZone] = useState<XrfZone>("BODY");
  const [ag, setAg] = useState<number>(CRATE_XRF.ag);
  const [cu, setCu] = useState<number>(CRATE_XRF.cu);
  const [au, setAu] = useState<number>(CRATE_XRF.au);
  const [pb, setPb] = useState<number>(CRATE_XRF.pb);
  const [commit, setCommit] = useState<string>("…");
  const [commitPass, setCommitPass] = useState<boolean | null>(null);
  const [draft, setDraft] = useState("");
  const gate = useMemo(() => scanDraft(draft), [draft]);

  const xrf = useMemo(() => evaluateXrf({ zone, ag, cu, au, pb }), [zone, ag, cu, au, pb]);

  useEffect(() => {
    let cancelled = false;
    void syndromeCommitment([0, 0, 0]).then((r) => {
      if (cancelled) return;
      setCommit(r.commit);
      setCommitPass(r.pass);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>L6 Verification</CardTitle>
              <CardDescription>
                Named gates plus True Pull 766. Schnorr signing stays dark.
              </CardDescription>
            </div>
            <Badge variant={REPORT.allPass ? "pass" : "fail"}>
              {REPORT.allPass ? "all gates hold" : "gate failure"}
            </Badge>
          </div>
        </CardHeader>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT.gates.map((g) => (
            <div
              key={g.id}
              className="flex flex-col gap-2 rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted">{g.label}</span>
                <Badge variant={g.pass ? "pass" : "fail"}>{g.pass ? "PASS" : "FAIL"}</Badge>
              </div>
              <p className="font-mono text-xs leading-snug text-subtle">{g.expression}</p>
              <p className="font-mono text-2xl tabular-nums text-fg">{g.value}</p>
              <p className="font-mono text-xs text-muted">expect {g.expect}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>98-pulse strand</CardTitle>
              <CardDescription>
                Two 21-term phases. Jump template repeats. Phase 2 = phase 1 + {PULSE_OFFSET}. Not the palindrome.
              </CardDescription>
            </div>
            <Badge variant={PULSE.pass ? "pass" : "fail"}>{PULSE.pass ? "LOCKED" : "FAIL"}</Badge>
          </div>
        </CardHeader>
        <p className="font-mono text-xs leading-relaxed text-muted">
          jumps [{PHASE_JUMPS.join(", ")}]
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">Bridge</div>
            <p className="mt-1 font-mono text-2xl tabular-nums text-fg">{PULSE.bridge}</p>
            <p className="font-mono text-xs text-subtle">1470 → 603</p>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">Offset</div>
            <p className="mt-1 font-mono text-2xl tabular-nums text-fg">{PULSE_OFFSET}</p>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">Phase 3 start</div>
            <p className="mt-1 font-mono text-2xl tabular-nums text-fg">{PULSE.phase3Start}</p>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">Phase 3 end</div>
            <p className="mt-1 font-mono text-2xl tabular-nums text-fg">{PULSE.phase3End}</p>
          </div>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">
          Phase 3 [{PHASE3.join(", ")}]. F_101: 23²≡{FIELD101.sq23} not 79. X_CRT≡{FIELD101.xMod101} not 0.
          603→79 at {FIELD101.contact79}, →23 at {FIELD101.contact23}. Axiom G forbidden.
          K_SIGMA ≡ {GROUND.kSigma.mod49} (mod 49); +7 patch is operator. Clay open.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>No-resurrection lock</CardTitle>
              <CardDescription>
                Clean scan {CLEAN_GATE.status}. Retired needles stay dead. Live integers only.
              </CardDescription>
            </div>
            <Badge variant={gate.status === "GATE_PASSED" ? "pass" : "fail"}>{gate.status}</Badge>
          </div>
        </CardHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">49×1118×79×107</div>
            <p className="mt-1 font-mono text-lg tabular-nums text-fg">{gate.live.crtM}</p>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">3398738 mod 13</div>
            <p className="mt-1 font-mono text-lg tabular-nums text-fg">{gate.live.xMod13}</p>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">Gate 18</div>
            <p className="mt-1 font-mono text-lg tabular-nums text-fg">{gate.live.gate18}</p>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">Live arithmetic</div>
            <p className="mt-1 font-mono text-lg text-fg">{gate.live.pass ? "hold" : "fail"}</p>
          </div>
        </div>
        <label className="mt-4 block font-mono text-xs text-muted" htmlFor="gate-draft">
          Scan a draft
        </label>
        <textarea
          id="gate-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste a draft. Empty stays GATE_PASSED."
          rows={4}
          className="mt-1 w-full rounded-sm bg-elevated px-3 py-2 font-mono text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setDraft(retiredSample())}>
            Feed retired needles
          </Button>
          <Button variant="secondary" onClick={() => setDraft("")}>
            Clear
          </Button>
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md bg-elevated p-3 font-mono text-xs leading-relaxed text-muted shadow-[var(--shadow-border)]">
          {formatGateScan(gate)}
        </pre>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Hydro ledger</CardTitle>
              <CardDescription>
                Two ceilings. c₂ is gauge, not a fight. a₁ = 4π/3 by Gauss–Bonnet.
                Super-bracket stays dark.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="pass">{HYDRO.straight.proven} locked</Badge>
              <Badge variant="accent">{HYDRO.straight.reconciled} reconciled</Badge>
              <Badge variant="fail">{HYDRO.straight.falsified} down</Badge>
            </div>
          </div>
        </CardHeader>
        <div className="mb-4 rounded-md bg-elevated p-3 font-mono text-xs leading-relaxed text-muted shadow-[var(--shadow-border)]">
          <p className="text-fg">
            {HYDRO.straight.witness.field} · {HYDRO.straight.witness.axes}
          </p>
          <p className="mt-1">
            χ² = {HYDRO.straight.witness.chi2} · χ = {HYDRO.straight.witness.chi} ·{" "}
            {HYDRO.straight.witness.vs17}
          </p>
          <p className="mt-1">
            a₁ = {HYDRO.straight.a1.a1OverPi.toString()} π · 9!! = {HYDRO.straight.moments.nine} ·
            11!! = {HYDRO.straight.moments.eleven}
          </p>
          <p className="mt-1">8/75 rejected. Not a Navier–Stokes regularity claim.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="font-mono text-xs text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Id</th>
                <th className="py-2 pr-3 font-medium">L</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium">Value / note</th>
              </tr>
            </thead>
            <tbody>
              {HYDRO.straight.claims.map((c) => (
                <tr key={c.id} className="border-b border-border/60 align-top">
                  <td className="py-2 pr-3 font-mono text-xs text-fg">{c.id}</td>
                  <td className="py-2 pr-3 font-mono text-xs text-muted">{c.layer}</td>
                  <td className="py-2 pr-3">
                    <Badge
                      variant={
                        c.status === "PROVEN" || c.status === "CERTIFIED" || c.status === "RECONCILED"
                          ? "pass"
                          : c.status === "FALSIFIED" || c.status === "REJECTED" || c.status === "FORBIDDEN"
                            ? "fail"
                            : c.status === "CONFLICT" || c.status === "OPEN" || c.status === "BOUNDED"
                              ? "warn"
                              : "default"
                      }
                    >
                      {c.status === "FORBIDDEN" ? "NOT EARNED" : c.status}
                    </Badge>
                  </td>
                  <td className="py-2">
                    <p className="font-mono text-xs text-fg">{c.value}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{c.note}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Vortex stretching</CardTitle>
              <CardDescription>
                Classical hydro locks. SOS Gram matrix stays dark. Super-bracket algebra is on.
              </CardDescription>
            </div>
            <Badge variant={HYDRO.classicalPass ? "pass" : "fail"}>
              {HYDRO.classicalPass ? "classical locks" : "classical fail"}
            </Badge>
          </div>
        </CardHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {HYDRO.gates.map((g) => (
            <div
              key={g.id}
              className="flex flex-col gap-2 rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted">{g.label}</span>
                <Badge
                  variant={
                    g.layer === "speculative" ? "warn" : g.pass ? "pass" : "fail"
                  }
                >
                  {g.layer === "speculative" ? "DARK" : g.pass ? "PASS" : "FAIL"}
                </Badge>
              </div>
              <p className="font-mono text-xs leading-snug text-subtle">{g.expression}</p>
              <p className="font-mono text-sm tabular-nums text-fg">{g.value}</p>
              <p className="text-xs leading-relaxed text-muted">{g.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>P₃ SOS / super-bracket</CardTitle>
              <CardDescription>
                Gram PSD is independent. Stretching identity and P₇ stay dark. Casimir not recomputed.
              </CardDescription>
            </div>
            <Badge variant={HYDRO.grams.p3.psd ? "pass" : "fail"}>
              P₃ {HYDRO.grams.p3.psd ? "PSD" : "fail"}
            </Badge>
          </div>
        </CardHeader>
        <dl className="grid gap-3 font-mono text-xs sm:grid-cols-2">
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">H₃ triad on B₁</dt>
            <dd className="mt-1 text-fg">χ² = {HYDRO.straight.p3.chi2.toString()}</dd>
            <dd className="mt-1 text-muted">below P₁ · pointwise 2/3 at (1,1,1)</dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">P₃ Gram LDLᵀ</dt>
            <dd className="mt-1 text-fg">pivots {HYDRO.grams.p3.pivots.join(", ") || "—"}</dd>
            <dd className="mt-1 text-muted">
              claimed match {String(HYDRO.grams.p3.claimedMatch)} · identity not supplied
            </dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">P₅ / P₇</dt>
            <dd className="mt-1 text-fg">
              P₅ {HYDRO.grams.p5.psd ? "PSD" : "FAIL"} · P₇ incomplete · 7¹¹=
              {HYDRO.grams.seven11}
            </dd>
            <dd className="mt-1 text-muted">{HYDRO.grams.p7.note}</dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">Promotion gate</dt>
            <dd className="mt-1 text-fg">
              Gram {HYDRO.gate.p3Gram.ok ? "pass" : "reject"} · P₅{" "}
              {HYDRO.gate.p5Gram.ok ? "pass" : "reject"} · identity{" "}
              {HYDRO.gate.p3Identity.ok ? "pass" : "reject"} · P₇{" "}
              {HYDRO.gate.p7.ok ? "pass" : "reject"} · Casimir{" "}
              {HYDRO.gate.casimir.ok ? "pass" : "reject"}
            </dd>
            <dd className="mt-1 text-muted">All premises must be PROVEN. Empty witness fails closed.</dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)] sm:col-span-2">
            <dt className="text-subtle">Graded brackets</dt>
            <dd className="mt-1 text-fg">{HYDRO.straight.super.brackets.join(" · ")}</dd>
            <dd className="mt-1 text-muted">{HYDRO.straight.super.decoupling}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Gilkey–Vassilevich / SDPA</CardTitle>
              <CardDescription>
                3-ball Dirichlet from Kirsten. Surface a₁ is a different operator. No GMP solver here.
              </CardDescription>
            </div>
            <Badge variant="pass">a₁(ball)=−1/4</Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="font-mono text-xs text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">k</th>
                <th className="py-2 pr-3 font-medium">B_k / π</th>
                <th className="py-2 pr-3 font-medium">B_k / π^{3/2}</th>
                <th className="py-2 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {HYDRO.gilkey.table.map((row) => (
                <tr key={row.k} className="border-b border-border/60">
                  <td className="py-2 pr-3 font-mono text-xs text-fg">{row.k}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.overPi ?? "—"}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.overPi32 ?? "—"}</td>
                  <td className="py-2 text-xs text-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">{HYDRO.sdpa.role}</p>
        <p className="mt-1 font-mono text-xs text-subtle">{HYDRO.sdpa.pipWheel}</p>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>P₇ field / 55-monomial audit</CardTitle>
              <CardDescription>
                Transmitted u⁽⁷⁾ expanded. No 55×55 Gram. M₁₃ vanishes on the symmetric core.
              </CardDescription>
            </div>
            <Badge variant="fail">γ* pointwise fail</Badge>
          </div>
        </CardHeader>
        <dl className="grid gap-3 font-mono text-xs sm:grid-cols-2">
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">Monomials</dt>
            <dd className="mt-1 text-fg">
              deg-9 = {HYDRO.p7.counts.deg9} · deg-18 = {HYDRO.p7.counts.deg18} · odd
              constraints {HYDRO.p7.counts.oddConstraints}
            </dd>
            <dd className="mt-1 text-muted">O_h degree-9 invariants: none. 55 even ≠ 190 ambient.</dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">Field</dt>
            <dd className="mt-1 text-fg">
              div 0 · S_ii 0 · even stretch {HYDRO.p7.field.stretchEvenCoeff}{" "}
              {HYDRO.p7.field.stretchEvenMonomial}
            </dd>
            <dd className="mt-1 text-muted">Δ odd terms {HYDRO.p7.field.deltaOddTerms}. Not a 55-even SOS target.</dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">P₅ repaired 3×3</dt>
            <dd className="mt-1 text-fg">pivots {HYDRO.p7.p5.pivots.join(", ")}</dd>
            <dd className="mt-1 text-muted">eigs {HYDRO.p7.p5.eigs.join(", ")}. Identity still dark.</dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">M₁₃ / Re_c</dt>
            <dd className="mt-1 text-fg">M₁₃ = 0 on cubic-symmetric ω</dd>
            <dd className="mt-1 text-muted">Re_c = 72 refused. NS regularity remains open.</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Three functionals / A⁸(α)</CardTitle>
              <CardDescription>
                Independent ball-moment match. (B) is unbounded. 143/7¹¹ is not a bound.
              </CardDescription>
            </div>
            <Badge variant="fail">(B) sup = ∞</Badge>
          </div>
        </CardHeader>
        <dl className="grid gap-3 font-mono text-xs sm:grid-cols-2">
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">(A) pointwise</dt>
            <dd className="mt-1 text-fg">χ² ≤ {HYDRO.family.pointwise}</dd>
            <dd className="mt-1 text-muted">Lagrange on sl(3,ℝ). Only finite theorem.</dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <dt className="text-subtle">(B) on A⁸(α)</dt>
            <dd className="mt-1 text-fg">
              α=0 → {HYDRO.family.integratedB.a0}
              <br />
              α=1 → {HYDRO.family.integratedB.a1}
            </dd>
            <dd className="mt-1 text-muted">
              {HYDRO.family.a1ExceedsTwoThirds ? "α=1 exceeds 2/3 — not (A)." : "—"} {HYDRO.family.leading}
            </dd>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)] sm:col-span-2">
            <dt className="text-subtle">Decision</dt>
            <dd className="mt-1 text-fg">{HYDRO.family.decision}</dd>
            <dd className="mt-1 text-muted">
              min/γ* = {HYDRO.family.minOverGamma} · S₁₁(α=1) {HYDRO.family.s11AtAlpha1}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Integer pipeline</CardTitle>
              <CardDescription>
                Volume averages as (N, D) pairs. No float on the certificate path.
              </CardDescription>
            </div>
            <Badge variant={HYDRO.integers.pass && !HYDRO.integers.floatsUsed ? "pass" : "fail"}>
              {HYDRO.integers.floatsUsed ? "float leak" : "zero floats"}
            </Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="font-mono text-xs text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Id</th>
                <th className="py-2 pr-3 font-medium">N</th>
                <th className="py-2 pr-3 font-medium">D</th>
                <th className="py-2 font-medium">ℚ</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {(
                [
                  ["m₄₀₀", HYDRO.integers.m400],
                  ["m₂₂₂", HYDRO.integers.m222],
                  ["χ²_B(0)", HYDRO.integers.chi2B.a0],
                  ["χ²_B(1)", HYDRO.integers.chi2B.a1],
                  ["χ²_B(3/2)", HYDRO.integers.chi2B.a32],
                  ["½", HYDRO.integers.half],
                ] as const
              ).map(([id, p]) => (
                <tr key={id} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-fg">{id}</td>
                  <td className="py-2 pr-3">{p.n}</td>
                  <td className="py-2 pr-3">{p.d}</td>
                  <td className="py-2 text-muted">{p.frac}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">{HYDRO.integers.note}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ESAEESA — base 1170</CardTitle>
          <CardDescription>
            Tongue residues of 1170 in 3-1-2-1 partition order. 0-index A. Residue-sum ≠ letter-ordinal.
          </CardDescription>
        </CardHeader>
        <p className="font-mono text-3xl tracking-[0.35em] text-fg">{REPORT.esaeesa.word}</p>
        <p className="mt-2 font-mono text-xs text-muted">
          residues {REPORT.esaeesa.residues.join(", ")} · residue-sum {REPORT.esaeesa.residueSum} ≡{" "}
          {REPORT.esaeesa.mod49} (mod 49)
        </p>
        <p className="mt-1 font-mono text-xs text-muted">
          letter-ordinal A=1 {REPORT.esaeesa.letterOrdinalA1} ≡ {REPORT.esaeesa.letterOrdinalMod49}{" "}
          (mod 49) = residue-sum + 7
        </p>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Parallel RNS</CardTitle>
              <CardDescription>
                Carry-free multiply of the master token by True Pull 766. Garner reconstruct.
              </CardDescription>
            </div>
            <Badge variant={BASE.rns.pass ? "pass" : "fail"}>{BASE.rns.pass ? "lock" : "fail"}</Badge>
          </div>
        </CardHeader>
        <dl className="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-3">
          <div>
            <dt className="text-subtle">Primes</dt>
            <dd className="mt-0.5 text-fg">{BASE.rns.primes.join(" · ")}</dd>
          </div>
          <div>
            <dt className="text-subtle">Token residues</dt>
            <dd className="mt-0.5 text-fg">{BASE.rns.tokenResidues.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-subtle">Product</dt>
            <dd className="mt-0.5 text-fg">{BASE.rns.product.join(", ")}</dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-subtle">Garner</dt>
            <dd className="mt-0.5 text-fg">{BASE.rns.reconstructed}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>XRF crate parser</CardTitle>
          <CardDescription>
            Integer basis-point shares. Pb above 100 bp flags solder/repair by zone. Overlay only.
          </CardDescription>
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-5">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">Ag</span>
            <Input
              type="number"
              min={0}
              value={ag}
              onChange={(e) => setAg(Number(e.target.value) || 0)}
              className="font-mono"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">Cu</span>
            <Input
              type="number"
              min={0}
              value={cu}
              onChange={(e) => setCu(Number(e.target.value) || 0)}
              className="font-mono"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">Au</span>
            <Input
              type="number"
              min={0}
              value={au}
              onChange={(e) => setAu(Number(e.target.value) || 0)}
              className="font-mono"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">Pb</span>
            <Input
              type="number"
              min={0}
              value={pb}
              onChange={(e) => setPb(Number(e.target.value) || 0)}
              className="font-mono"
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">Zone</span>
            <div className="flex flex-wrap gap-1">
              {(["BODY", "JOIN", "HANDLE"] as const).map((z) => (
                <Button
                  key={z}
                  size="sm"
                  variant={zone === z ? "default" : "secondary"}
                  onClick={() => setZone(z)}
                >
                  {z}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-5">
          <div>
            <dt className="text-xs text-subtle">Ag bp</dt>
            <dd className="mt-0.5 text-fg">{xrf.agBp}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Cu bp</dt>
            <dd className="mt-0.5 text-fg">{xrf.cuBp}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Au bp</dt>
            <dd className="mt-0.5 text-fg">{xrf.auBp}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Pb bp</dt>
            <dd className="mt-0.5 text-fg">{xrf.pbBp}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Disposition</dt>
            <dd className="mt-0.5 text-fg">{xrf.disposition}</dd>
          </div>
        </dl>
        <Button
          size="sm"
          variant="ghost"
          className="mt-3"
          onClick={() => {
            setAg(CRATE_XRF.ag);
            setCu(CRATE_XRF.cu);
            setAu(CRATE_XRF.au);
            setPb(CRATE_XRF.pb);
            setZone("BODY");
          }}
        >
          Reset crate
        </Button>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Syndrome commitment</CardTitle>
              <CardDescription>
                BIP-340 tagged hash of the zero syndrome. Public digest only. Not a wallet, not a
                spending key, not an (R, s) pair.
              </CardDescription>
            </div>
            <Badge variant={commitPass ? "pass" : commitPass === false ? "fail" : "default"}>
              {commitPass ? "lock" : commitPass === false ? "mismatch" : "hashing"}
            </Badge>
          </div>
        </CardHeader>
        <p className="break-all font-mono text-xs text-fg">{commit}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Electrochemical loop</CardTitle>
            <CardDescription>1.118 / 0.923 mg/C · Potosi ratio</CardDescription>
          </CardHeader>
          <p className="font-mono text-3xl tabular-nums">{REPORT.electrochemical.toFixed(7)}</p>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>R19 drift counter</CardTitle>
                <CardDescription>1193.5 × 20/13 vs proton-electron mass</CardDescription>
              </div>
              <Badge variant={REPORT.r19Pass ? "pass" : "fail"}>
                {REPORT.r19Pass ? "PASS" : "FAIL"}
              </Badge>
            </div>
          </CardHeader>
          <dl className="flex flex-col gap-2 font-mono text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">computed</dt>
              <dd className="tabular-nums">{REPORT.r19.toFixed(6)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">CODATA</dt>
              <dd className="tabular-nums">{REPORT.r19Real.toFixed(6)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">rel. error</dt>
              <dd className="tabular-nums">{REPORT.r19Error.toExponential(3)}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Core float</CardTitle>
            <CardDescription>963.8142 / φ</CardDescription>
          </CardHeader>
          <p className="font-mono text-3xl tabular-nums">{REPORT.phiCheck.toFixed(6)}</p>
        </Card>
      </div>
    </div>
  );
}
