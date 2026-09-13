"use client";

import { useState } from "react";
import {
  Binary,
  CircleDot,
  Compass,
  FileSearch,
  FlaskConical,
  Hash,
  Library,
  MapPinned,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ENGINE_VERSION } from "@/lib/decoder";
import type { VectorId } from "@/lib/vectors";
import { OverviewPanel } from "@/components/overview-panel";
import { GematriaPanel } from "@/components/gematria-panel";
import { CorpusPanel } from "@/components/corpus-panel";
import { LatticePanel } from "@/components/lattice-panel";
import { ProofsPanel } from "@/components/proofs-panel";
import { HarnessPanel } from "@/components/harness-panel";
import { EvidencePanel } from "@/components/evidence-panel";
import { ArtifactsPanel } from "@/components/artifacts-panel";
import { SurveyPanel } from "@/components/survey-panel";

const NAV: { id: VectorId; label: string; icon: typeof Hash }[] = [
  { id: "overview", label: "Overview", icon: ScanLine },
  { id: "artifacts", label: "Field", icon: MapPinned },
  { id: "survey", label: "Survey", icon: Compass },
  { id: "gematria", label: "Gematria", icon: Hash },
  { id: "corpus", label: "Corpus", icon: Library },
  { id: "lattice", label: "Lattice", icon: CircleDot },
  { id: "proofs", label: "Proofs", icon: ShieldCheck },
  { id: "harness", label: "Harness", icon: FlaskConical },
  { id: "evidence", label: "Evidence", icon: FileSearch },
];

export function DecoderApp() {
  const [vector, setVector] = useState<VectorId>("survey");

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-sm bg-elevated text-accent shadow-[var(--shadow-border)]">
              <Binary className="size-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-base leading-tight tracking-tight">
                Sovereign Root
              </p>
              <p className="font-mono text-xs text-muted">Decoder Engine v{ENGINE_VERSION}</p>
            </div>
          </div>
          <p className="hidden font-mono text-xs text-subtle sm:block">3-1-2-1 partition</p>
        </div>
        <nav
          aria-label="Execution vectors"
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2 sm:px-5"
        >
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = vector === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setVector(item.id)}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2 rounded-sm px-3 text-sm transition-[color,background-color] duration-150",
                  active ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div key={vector} className="stagger-in">
          {vector === "overview" && <OverviewPanel onOpen={setVector} />}
          {vector === "artifacts" && <ArtifactsPanel />}
          {vector === "survey" && <SurveyPanel />}
          {vector === "gematria" && <GematriaPanel />}
          {vector === "corpus" && <CorpusPanel />}
          {vector === "lattice" && <LatticePanel />}
          {vector === "proofs" && <ProofsPanel />}
          {vector === "harness" && <HarnessPanel />}
          {vector === "evidence" && <EvidencePanel />}
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-2 sm:px-6">
        <p className="font-mono text-xs text-subtle">
          Successor Trustee operational core · bitwise-deterministic · T1_LOCKED
        </p>
      </footer>
    </div>
  );
}
