"use client";

import { useMemo, useState } from "react";
import {
  ARTIFACTS,
  VESSEL,
  runPacket,
  type ArtifactId,
} from "@/lib/decoder";
import { LatticeRing } from "@/components/lattice-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const PACKET = runPacket();

export function ArtifactsPanel() {
  const [selected, setSelected] = useState<ArtifactId>("card");
  const artifact = useMemo(
    () => ARTIFACTS.find((a) => a.id === selected) ?? ARTIFACTS[0],
    [selected],
  );

  const allLock = PACKET.locked === PACKET.tests.length;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Vessel register</CardTitle>
              <CardDescription>
                Punches and drawing from the photo batch. Not a title.
              </CardDescription>
            </div>
            <Badge variant="pass">{VESSEL.punch}</Badge>
          </div>
        </CardHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md bg-elevated p-3 font-mono text-xs leading-relaxed text-muted shadow-[var(--shadow-border)]">
            <p className="text-fg">Punch {VESSEL.punch} · not Revere / PR</p>
            <p className="mt-1">Scale display {VESSEL.scaleDisplay} · unit not proven · 11.90 stays a different claim</p>
          </div>
          <div className="rounded-md bg-elevated p-3 font-mono text-xs leading-relaxed text-muted shadow-[var(--shadow-border)]">
            <p className="text-fg">
              Per pale · dexter a bend · sinister {VESSEL.blazon.sinister}
            </p>
            <p className="mt-1">
              Sinister ordinary is Avery-shaped if the roundels are bezants. Avery crest (lion's
              gambs) does not match the bird. Cazenove tower does not match. Dexter unnamed.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Field packet</CardTitle>
              <CardDescription>
                Six primary artifacts run through lattice, corpus, and operator gates.
              </CardDescription>
            </div>
            <Badge variant={allLock ? "pass" : "warn"}>
              {PACKET.locked}/{PACKET.tests.length} locked
            </Badge>
          </div>
        </CardHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {PACKET.tests.map((t) => (
            <div
              key={t.id}
              className="flex items-start justify-between gap-3 rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs text-subtle">{t.id}</p>
                <p className="text-sm text-fg">{t.label}</p>
                <p className="mt-1 text-xs leading-snug text-muted">{t.detail}</p>
              </div>
              <Badge variant={t.pass ? "pass" : "fail"}>{t.pass ? "PASS" : "FAIL"}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ARTIFACTS.map((a) => {
          const active = a.id === selected;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelected(a.id)}
              className={cn(
                "overflow-hidden rounded-lg bg-surface text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150",
                active && "shadow-[var(--shadow-border-hover)]",
              )}
              aria-pressed={active}
            >
              <img
                src={a.image}
                alt={a.title}
                className="h-28 w-full object-cover object-center outline outline-1 -outline-offset-1 outline-fg/10"
              />
              <div className="px-2 py-2">
                <p className="font-mono text-xs text-subtle">{a.code}</p>
                <p className="truncate text-sm text-fg">{a.title}</p>
              </div>
            </button>
          );
        })}
      </div>

      {artifact && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Card className="overflow-hidden p-2">
            <img
              src={artifact.image}
              alt={artifact.title}
              className="max-h-[32rem] w-full rounded-lg object-contain outline outline-1 -outline-offset-1 outline-fg/10"
            />
          </Card>
          <Card>
            <CardHeader>
              <p className="font-mono text-xs text-subtle">
                {artifact.code} · {artifact.date}
              </p>
              <CardTitle>{artifact.title}</CardTitle>
            </CardHeader>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">
              {artifact.transcription}
            </pre>
            <ul className="mt-3 flex flex-col gap-1">
              {artifact.notes.map((n) => (
                <li key={n} className="text-sm leading-snug text-fg">
                  {n}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calling-card lattice</CardTitle>
            <CardDescription>
              Standard O.P.K.D.S.L.A. versus Think/Later dynamic walk.
            </CardDescription>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 font-mono text-xs text-muted">Standard</p>
              <LatticeRing extract={PACKET.cardStd} />
            </div>
            <div>
              <p className="mb-1 font-mono text-xs text-muted">Think / Later</p>
              <LatticeRing extract={PACKET.cardDyn} />
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alphabet-disk lattice</CardTitle>
            <CardDescription>
              Same 101-over-3 walk on A–Z. Token {PACKET.diskStd.token}
            </CardDescription>
          </CardHeader>
          <LatticeRing extract={PACKET.diskStd} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Corpus toponym lock</CardTitle>
          <CardDescription>
            {PACKET.placeHits}/{PACKET.placeTotal} queries from the letter and map hit the 213-item set.
          </CardDescription>
        </CardHeader>
        <ul className="flex flex-col gap-1">
          {PACKET.places.map((p) => (
            <li
              key={p.query}
              className="flex flex-col gap-1 rounded-sm px-2 py-2 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span className="font-mono text-xs text-muted">{p.query}</span>
              {p.matches.length ? (
                <span className="text-sm text-fg">{p.matches.join(" · ")}</span>
              ) : (
                <span className="text-sm text-subtle">no hit</span>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phrase Latin sums</CardTitle>
          <CardDescription>Fourteen-track engine, Latin base 26.</CardDescription>
        </CardHeader>
        <ul className="flex flex-col">
          {PACKET.phrases.map((p) => (
            <li key={p.phrase} className="flex items-baseline justify-between gap-3 py-1.5">
              <span className="min-w-0 truncate text-sm text-fg">{p.phrase}</span>
              <span className="shrink-0 font-mono text-sm tabular-nums text-muted">{p.latin}</span>
            </li>
          ))}
        </ul>
        <Separator className="my-3" />
        <p className="font-mono text-xs text-subtle">
          Bloodline nodes on the standard token: Obadiah · Packard · Key · Dawn · Silver · Lee/Liz · Avery
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelected("card")}
          >
            Open calling card
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSelected("liz")}>
            Open Liz 101
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSelected("map")}>
            Open map
          </Button>
        </div>
      </Card>
    </div>
  );
}
