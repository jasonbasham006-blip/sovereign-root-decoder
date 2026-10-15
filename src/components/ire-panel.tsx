"use client";

import { IRE } from "@/lib/decoder/ire";
import { IRE12D } from "@/lib/decoder/ire-12d";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return <Badge variant={ok ? "pass" : "fail"}>{label}</Badge>;
}

export function IrePanel() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Integer rails</CardTitle>
          <CardDescription>
            SEME / IRE software path. Even wholes only. Odds parked as half-bits.
            Fractions flush last. Unexpected 0 fills −2, −4, −6. Locked integers
            unchanged. Sobolev gap stays open.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <Flag ok={IRE.bootPass} label={IRE.bootPass ? "boot hold" : "boot fail"} />
          <Flag ok={IRE.liveGarnerPass} label="live Garner" />
          <Flag ok={IRE.demoPass} label="demo Garner" />
          <Flag ok={IRE.maclaurinPass} label="H_norm flush" />
          <Flag ok={IRE.evenWalkPass} label="even walk" />
          <Flag ok={IRE.zeroFillPass} label="neg-fill" />
          <Flag ok={IRE.trueZeroPass} label="true-zero" />
          <Flag ok={IRE.gate === "GATE_PASSED"} label={IRE.gate} />
          <Badge variant="fail">Clay forbidden</Badge>
        </div>
        <p className="mt-4 font-mono text-xs leading-relaxed text-muted">{IRE.note}</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Live CRT rails</CardTitle>
            <CardDescription>49 · 1118 · 79 · 107. Unchanged.</CardDescription>
          </CardHeader>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm">
            <dt className="text-subtle">X_CRT</dt>
            <dd>{IRE.live.xCrt}</dd>
            <dt className="text-subtle">residues</dt>
            <dd>{IRE.boot.res.join(", ")}</dd>
            <dt className="text-subtle">Garner</dt>
            <dd>{IRE.liveGarner.coeffs.join(", ")}</dd>
            <dt className="text-subtle">M</dt>
            <dd>{IRE.live.crtModulus}</dd>
            <dt className="text-subtle">X mod 13</dt>
            <dd>{IRE.live.xMod13} (live 5, not 0)</dd>
            <dt className="text-subtle">1118 ≫ 1</dt>
            <dd>{IRE.live.shift1118} = 13 × 43</dd>
          </dl>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Demo Garner</CardTitle>
            <CardDescription>Textbook check 101, 103, 107, 109. Not the live rails.</CardDescription>
          </CardHeader>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm">
            <dt className="text-subtle">residues</dt>
            <dd>{[23, 45, 12, 89].join(", ")}</dd>
            <dt className="text-subtle">coeffs</dt>
            <dd>{IRE.demo.coeffs.join(", ")}</dd>
            <dt className="text-subtle">recon</dt>
            <dd>{IRE.demo.value}</dd>
            <dt className="text-subtle">even walk</dt>
            <dd>{IRE.evenWalk.join(", ")}</dd>
            <dt className="text-subtle">stencil</dt>
            <dd>{IRE.stencil} (zeros in the sample grid)</dd>
            <dt className="text-subtle">5·100·6² then ÷12</dt>
            <dd>
              {IRE.maclaurinCore} → {IRE.maclaurinQ}
            </dd>
            <dt className="text-subtle">unexpected 0</dt>
            <dd>
              {IRE.zeroFill.path} filled {IRE.zeroFill.filled.join(", ") || "—"} → {IRE.zeroFill.recovered.toString()}
            </dd>
          </dl>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>12D stencil audit</CardTitle>
              <CardDescription>
                Integers recomputed. Flush is exact Q, not IEEE. Demo P31 CRT only — live rails
                unchanged.
              </CardDescription>
            </div>
            <Badge variant={IRE12D.pass ? "pass" : "fail"}>{IRE12D.pass ? "integers hold" : "fail"}</Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="font-mono text-xs text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">metric</th>
                <th className="py-2 pr-3 font-medium">raw</th>
                <th className="py-2 pr-3 font-medium">H</th>
                <th className="py-2 font-medium">flush Q</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr className="border-b border-border/60">
                <td className="py-2 pr-3">Laplacian 12D</td>
                <td className="py-2 pr-3">{IRE12D.lap12}</td>
                <td className="py-2 pr-3">1/48</td>
                <td className="py-2">{IRE12D.lapQ}</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-3">Enstrophy</td>
                <td className="py-2 pr-3">{IRE12D.ensRaw}</td>
                <td className="py-2 pr-3">1/4</td>
                <td className="py-2">{IRE12D.ensQ}</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-3">Palinstrophy</td>
                <td className="py-2 pr-3">{IRE12D.palRaw}</td>
                <td className="py-2 pr-3">1/8</td>
                <td className="py-2">{IRE12D.palQ}</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-3">P/Ω</td>
                <td className="py-2 pr-3">{IRE12D.ratioRaw} raw</td>
                <td className="py-2 pr-3">after H</td>
                <td className="py-2">{IRE12D.ratioFlush}</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-3">Inertia / virial</td>
                <td className="py-2 pr-3">1600 / 2560000</td>
                <td className="py-2 pr-3">1/5 · 3/5</td>
                <td className="py-2">
                  {IRE12D.iQ} / {IRE12D.wQ}
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-3">Sobolev 5th 12D</td>
                <td className="py-2 pr-3">{IRE12D.sob12}</td>
                <td className="py-2 pr-3">1/1024</td>
                <td className="py-2">{IRE12D.sobQ}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">100-step cascade</td>
                <td className="py-2 pr-3">{IRE12D.cascade}</td>
                <td className="py-2 pr-3">1/1</td>
                <td className="py-2">{IRE12D.cascade}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-muted">
          <li>
            <Badge variant="warn">Thm 2</Badge> {IRE12D.thm2.note}
          </li>
          <li>
            <Badge variant="warn">Thm 3</Badge> {IRE12D.thm3.note}
          </li>
          <li>
            <Badge variant="fail">Thm 4</Badge> {IRE12D.thm4.note}
          </li>
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Index commitments</CardTitle>
          <CardDescription>
            Payload SHA-256 recomputed. Plan-doc truncated hashes did not match. access_vector
            stays false. Seed string is a label.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="font-mono text-xs text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">n</th>
                <th className="py-2 pr-3 font-medium">rail</th>
                <th className="py-2 pr-3 font-medium">factors</th>
                <th className="py-2 font-medium">sha256</th>
              </tr>
            </thead>
            <tbody>
              {IRE.nodes.map((n) => (
                <tr key={n.index} className="border-b border-border/60 align-top">
                  <td className="py-2 pr-3 font-mono">{n.index}</td>
                  <td className="py-2 pr-3">
                    <Badge variant={n.rail.startsWith("EVEN") ? "accent" : "warn"}>{n.rail}</Badge>
                  </td>
                  <td className="py-2 pr-3 text-muted">{n.factors}</td>
                  <td className="py-2 break-all font-mono text-xs text-subtle">{n.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Boot integers</CardTitle>
          <CardDescription>Same gates the daily sweep already uses. Drift here is a dirty session.</CardDescription>
        </CardHeader>
        <p className="font-mono text-xs leading-relaxed text-muted">
          XOR {IRE.boot.xor} · Gate18 {IRE.boot.gate18} · OR {IRE.boot.or} · K_SIGMA ≡ {IRE.boot.kSigmaMod49}{" "}
          (mod 49) · algebraic 1420 {IRE.boot.r18 ? "exact" : "FAIL"} · NIST HI is not 1420.
        </p>
      </Card>
    </div>
  );
}
