import { useMemo, useState } from "react";
import { decodePhrase, TONGUES } from "@/lib/decoder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRESETS = ["BASHAM", "JASON DEWAYNE", "LIBERTY LANTERN", "SOVEREIGN", "AUTHORITY", "PACKARD"];

export function GematriaPanel() {
  const [phrase, setPhrase] = useState("LIBERTY LANTERN");
  const [submitted, setSubmitted] = useState("LIBERTY LANTERN");

  const result = useMemo(() => decodePhrase(submitted), [submitted]);
  const maxTrack = Math.max(...result.fw, ...result.rv, 1);

  function run(next?: string) {
    const value = (next ?? phrase).trim();
    if (!value) return;
    setPhrase(value);
    setSubmitted(value);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>14-Track Gematria</CardTitle>
          <CardDescription>
            Forward Caesar and reverse Atbash tracks, then seven-tongue base conversion.
          </CardDescription>
        </CardHeader>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <Input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Enter word or phrase"
            aria-label="Phrase to decode"
            className="font-mono uppercase"
          />
          <Button type="submit" className="sm:w-36">
            Process
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button key={p} type="button" size="sm" variant="secondary" onClick={() => run(p)}>
              {p}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Forward Caesar</CardTitle>
            <CardDescription>Offsets 0 through 6 · cleaned {result.cleaned || "—"}</CardDescription>
          </CardHeader>
          <TrackList values={result.fw} max={maxTrack} prefix="F" />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reverse Atbash</CardTitle>
            <CardDescription>Inverted alphabet with the same seven offsets.</CardDescription>
          </CardHeader>
          <TrackList values={result.rv} max={maxTrack} prefix="R" />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seven Sacred Tongues</CardTitle>
          <CardDescription>
            Each of the fourteen tracks is expanded in the tongue base, then digit-summed.
          </CardDescription>
        </CardHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {result.tongues.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-1 rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]"
            >
              <span className="text-xs text-muted">{t.name}</span>
              <span className="font-mono text-xl tabular-nums text-fg">{t.sum}</span>
              <Badge>base {t.base}</Badge>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-xs text-subtle">
          {TONGUES.length} tongues · 14 tracks · bitwise-deterministic
        </p>
      </Card>
    </div>
  );
}

function TrackList({ values, max, prefix }: { values: number[]; max: number; prefix: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {values.map((v, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className="w-8 font-mono text-xs text-muted">
            {prefix}
            {i}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-accent/80"
              style={{ width: `${Math.max(4, (v / max) * 100)}%` }}
            />
          </div>
          <span className="w-12 text-right font-mono text-sm tabular-nums">{v}</span>
        </li>
      ))}
    </ul>
  );
}
