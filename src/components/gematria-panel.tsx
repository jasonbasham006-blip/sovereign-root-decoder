import { useMemo, useState } from "react";
import { decodePhrase, ESAEESA, IDENTIFIER, KY_TOWNS, TONGUES, esaeesaSums } from "@/lib/decoder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRESETS = [
  "Basham@sovereign-root",
  "BASHAM",
  "JASON DEWAYNE",
  "LIBERTY LANTERN",
  "SOVEREIGN",
  "AUTHORITY",
  "PACKARD",
  "PAINTSVILLE",
  "STAFFORDSVILLE",
];

const ESAE_SUMS = esaeesaSums();

export function GematriaPanel() {
  const [phrase, setPhrase] = useState("LIBERTY LANTERN");
  const [submitted, setSubmitted] = useState("LIBERTY LANTERN");

  const result = useMemo(() => decodePhrase(submitted), [submitted]);
  const maxTrack = Math.max(...result.fw, ...result.rv, 1);
  const ky = KY_TOWNS.find((t) => t.name === result.cleaned);

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

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Identifier word</CardTitle>
              <CardDescription>
                {IDENTIFIER.word} · {IDENTIFIER.letters} letters. Fetch key is not a title.
              </CardDescription>
            </div>
            <Badge variant={IDENTIFIER.zero.pass && IDENTIFIER.mixed.pass ? "pass" : "fail"}>
              475 / 494 named
            </Badge>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">A=0 F+R</div>
            <p className="mt-1 font-mono text-2xl tabular-nums text-fg">{IDENTIFIER.zero.sum}</p>
            <p className="mt-1 font-mono text-xs text-subtle">
              {IDENTIFIER.zero.f}+{IDENTIFIER.zero.r} = {IDENTIFIER.zero.factor}
            </p>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">Mixed A=1 F + A=0 R</div>
            <p className="mt-1 font-mono text-2xl tabular-nums text-fg">{IDENTIFIER.mixed.sum}</p>
            <p className="mt-1 font-mono text-xs text-subtle">
              {IDENTIFIER.mixed.f}+{IDENTIFIER.mixed.r} = {IDENTIFIER.mixed.factor}
            </p>
          </div>
          <div className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
            <div className="font-mono text-xs text-muted">Dual A=1 F+R</div>
            <p className="mt-1 font-mono text-2xl tabular-nums text-fg">{IDENTIFIER.dualOrdinal.sum}</p>
            <p className="mt-1 font-mono text-xs text-subtle">
              {IDENTIFIER.dualOrdinal.f}+{IDENTIFIER.dualOrdinal.r} = {IDENTIFIER.dualOrdinal.factor}
            </p>
          </div>
        </div>
        <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
          1118 ≡ {IDENTIFIER.prefix1118.mod49} (mod 49) ≡ 0 (mod 13). 9231118 ≡{" "}
          {IDENTIFIER.prefix9231118.mod49} (mod 49). Concatenated 111118923 ≡{" "}
          {IDENTIFIER.concat111118923.concatenatedMod49} (mod 49). Split 1111+18+923 ≡{" "}
          {IDENTIFIER.concat111118923.splitMod49} God Seal. Different objects.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Ordinal</CardTitle>
            <CardDescription>A=1 … Z=26</CardDescription>
          </CardHeader>
          <p className="font-mono text-3xl tabular-nums">{result.ordinal}</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>English ×6</CardTitle>
            <CardDescription>A=6 … Z=156</CardDescription>
          </CardHeader>
          <p className="font-mono text-3xl tabular-nums">{result.sixScale}</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Katan / 49 / 13 on ordinal</CardDescription>
          </CardHeader>
          <p className="font-mono text-sm text-fg">
            {result.filters.katan} · {result.filters.mod49} · {result.filters.mod13}
          </p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cleaned</CardTitle>
            <CardDescription>Spaces stripped</CardDescription>
          </CardHeader>
          <p className="font-mono text-lg text-fg">{result.cleaned || "—"}</p>
        </Card>
      </div>

      {ky ? (
        <Card>
          <CardHeader>
            <CardTitle>{ky.name}</CardTitle>
            <CardDescription>
              Ordinal and ×6 verified in-engine. Jewish and Hebrew columns are operator-supplied
              transliterations — not recomputed.
            </CardDescription>
          </CardHeader>
          <dl className="grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-subtle">Ordinal lock</dt>
              <dd className="mt-0.5 text-fg">
                {result.ordinal} {result.ordinal === ky.ordinalExpect ? "= lock" : "MISMATCH"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">×6 lock</dt>
              <dd className="mt-0.5 text-fg">
                {result.sixScale} {result.sixScale === ky.sixExpect ? "= lock" : "MISMATCH"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Jewish (operator)</dt>
              <dd className="mt-0.5 text-fg">{ky.jewishOperator}</dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Hebrew (operator)</dt>
              <dd className="mt-0.5 text-fg">{ky.hebrewOperator}</dd>
            </div>
          </dl>
        </Card>
      ) : null}

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

      <Card>
        <CardHeader>
          <CardTitle>1170 → ESAEESA</CardTitle>
          <CardDescription>
            Partition 3-1-2-1 residues of 1170. Residue-sum and letter-ordinal are different objects.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left font-mono text-xs">
            <thead className="text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Tongue</th>
                <th className="py-2 pr-3 font-medium">Base</th>
                <th className="py-2 pr-3 font-medium">Residue</th>
                <th className="py-2 font-medium">Letter</th>
              </tr>
            </thead>
            <tbody>
              {ESAEESA.map((r) => (
                <tr key={r.name} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-fg">{r.name}</td>
                  <td className="py-2 pr-3 text-muted">{r.base}</td>
                  <td className="py-2 pr-3 text-muted">{r.residue}</td>
                  <td className="py-2 text-fg">{r.letter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-sm tracking-[0.3em] text-fg">
          {ESAEESA.map((r) => r.letter).join("")}
        </p>
        <p className="mt-2 font-mono text-xs text-muted">
          Residue-sum {ESAE_SUMS.residueSum} · letter-ordinal A=1 {ESAE_SUMS.letterOrdinalA1} = residue-sum + 7
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
