import { useMemo, useState } from "react";
import { CALLING_CARD, callingCardPhase, circularLatticeExtract } from "@/lib/decoder";
import { LatticeRing } from "@/components/lattice-ring";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LatticePanel() {
  const [ringText, setRingText] = useState(CALLING_CARD);
  const [startChar, setStartChar] = useState("O");
  const [stepSize, setStepSize] = useState(3);
  const [dynamic, setDynamic] = useState(false);

  const extract = useMemo(
    () => circularLatticeExtract(ringText, startChar || "O", stepSize, dynamic),
    [ringText, startChar, stepSize, dynamic],
  );

  const standard = useMemo(() => circularLatticeExtract(CALLING_CARD, "O", 3, false), []);
  const phase = useMemo(() => callingCardPhase(CALLING_CARD), []);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Circular Lattice</CardTitle>
          <CardDescription>
            The 101-over-3 protocol. Seven letters walked from a start character around the ring.
          </CardDescription>
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 sm:col-span-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">Ring text</span>
            <Input
              value={ringText}
              onChange={(e) => setRingText(e.target.value)}
              className="font-mono uppercase"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">Start</span>
            <Input
              value={startChar}
              maxLength={1}
              onChange={(e) => setStartChar(e.target.value.slice(-1).toUpperCase())}
              className="font-mono uppercase"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">Step</span>
            <Input
              type="number"
              min={1}
              max={26}
              value={stepSize}
              onChange={(e) => setStepSize(Math.max(1, Number(e.target.value) || 1))}
              className="font-mono"
            />
          </label>
          <div className="flex items-end">
            <Button
              type="button"
              variant={dynamic ? "default" : "secondary"}
              className="w-full"
              onClick={() => setDynamic((v) => !v)}
            >
              {dynamic ? "Think / Later on" : "Think / Later off"}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setRingText(CALLING_CARD);
              setStartChar("O");
              setStepSize(3);
              setDynamic(false);
            }}
          >
            Reset calling card
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Card>
          {extract.error ? (
            <p className="py-16 text-center text-sm text-fail">{extract.error}</p>
          ) : (
            <LatticeRing extract={extract} />
          )}
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Root token</CardTitle>
              <CardDescription>{dynamic ? "Dynamic operators" : "Standard walk"}</CardDescription>
            </CardHeader>
            <p className="font-mono text-2xl tracking-wide text-fg">{extract.token || "—"}</p>
            <p className="mt-2 font-mono text-xs text-subtle">
              start {extract.startIndex} · path {extract.pathIndices.join(" → ") || "—"}
            </p>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Bloodline nodes</CardTitle>
            </CardHeader>
            <ul className="flex flex-col gap-2">
              {extract.nodes.map((node) => (
                <li key={node} className="font-mono text-sm text-fg">
                  {node}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted">Canonical O.P.K.D.S.L.A.</span>
              <Badge variant={extract.token === standard.token ? "pass" : "default"}>
                {extract.token === standard.token ? "match" : "variant"}
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Phase lock — TAN / CRIES / SEC</CardTitle>
              <CardDescription>
                Same +3 stride after the seven-letter token. Historical S at index 7 is required.
              </CardDescription>
            </div>
            <Badge variant={phase.sPhase ? "pass" : "fail"}>
              {phase.sPhase ? "S-phase lock" : "phase fail"}
            </Badge>
          </div>
        </CardHeader>
        <dl className="grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-subtle">Token</dt>
            <dd className="mt-0.5 text-fg">{phase.tokenDotted}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">TAN</dt>
            <dd className="mt-0.5 text-fg">{phase.tan.word}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">CRIES</dt>
            <dd className="mt-0.5 text-fg">{phase.cries.word}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">SEC</dt>
            <dd className="mt-0.5 text-fg">{phase.sec.word}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm leading-normal text-muted">
          Z at index 7 yields {phase.zFail.cries} / {phase.zFail.sec} — semantic failure. Δ(Z, S) ={" "}
          {phase.deltaZS}, the Gate 7 shift. Operator total-parity 6076 is recorded, not recomputed here.
        </p>
      </Card>
    </div>
  );
}
