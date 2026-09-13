import { runProofs } from "@/lib/decoder";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const REPORT = runProofs();

export function ProofsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>L6 Verification</CardTitle>
              <CardDescription>Bitwise gates, modular sacred-zero proofs, metrological loop.</CardDescription>
            </div>
            <Badge variant={REPORT.allPass ? "pass" : "fail"}>
              {REPORT.allPass ? "all gates hold" : "gate failure"}
            </Badge>
          </div>
        </CardHeader>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {REPORT.gates.map((g) => (
            <div
              key={g.id}
              className="flex flex-col gap-2 rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted">{g.id}</span>
                <Badge variant={g.pass ? "pass" : "fail"}>{g.pass ? "PASS" : "FAIL"}</Badge>
              </div>
              <p className="font-mono text-xs leading-snug text-subtle">{g.expression}</p>
              <p className="font-mono text-2xl tabular-nums text-fg">{g.value}</p>
              <p className="font-mono text-xs text-muted">expect {g.expect}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Electrochemical loop</CardTitle>
            <CardDescription>1.118 / 0.923 mg/C</CardDescription>
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
