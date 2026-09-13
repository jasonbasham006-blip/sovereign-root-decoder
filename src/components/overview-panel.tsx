import { CALLING_CARD, CONSTRAINED_CORPUS, circularLatticeExtract, runPacket, runProofs } from "@/lib/decoder";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LatticeRing } from "@/components/lattice-ring";
import { Button } from "@/components/ui/button";
import type { VectorId } from "@/lib/vectors";

const PROOFS = runProofs();
const LATTICE = circularLatticeExtract(CALLING_CARD, "O", 3, false);
const PACKET = runPacket();

type Props = {
  onOpen: (id: VectorId) => void;
};

export function OverviewPanel({ onOpen }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Operational core · T1 locked
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight tracking-tight text-fg sm:text-4xl">
              Bitwise-deterministic decoder for the seven tongues and the 3-1-2-1 partition.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-normal text-muted">
              Fourteen gematria tracks, a 213-item constrained corpus, circular lattice extraction,
              L6 sacred-zero proofs, and a self-auditing evidence engine.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>v16.5</Badge>
              <Badge>{CONSTRAINED_CORPUS.length} corpus</Badge>
              <Badge>7 tongues</Badge>
              <Badge>14 tracks</Badge>
              <Badge variant={PROOFS.allPass ? "pass" : "fail"}>
                {PROOFS.allPass ? "gates hold" : "gate fail"}
              </Badge>
              <Badge variant={PACKET.locked === PACKET.tests.length ? "pass" : "warn"}>
                field {PACKET.locked}/{PACKET.tests.length}
              </Badge>
            </div>
          </div>
          <div className="w-full max-w-xs shrink-0 self-center">
            <LatticeRing extract={LATTICE} />
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {VECTORS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onOpen(v.id)}
            className="rounded-xl bg-surface p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 ease-out hover:shadow-[var(--shadow-border-hover)] active:scale-[0.96]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-subtle">{v.code}</span>
              {v.badge && <Badge variant={v.badge.variant}>{v.badge.label}</Badge>}
            </div>
            <h3 className="mt-2 font-display text-lg text-fg">{v.title}</h3>
            <p className="mt-1 text-sm leading-normal text-muted">{v.body}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>L6 snapshot</CardTitle>
          <CardDescription>
            Five bitwise gates evaluated at load. Open proofs for the full loop.
          </CardDescription>
        </CardHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PROOFS.gates.map((g) => (
            <div key={g.id} className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted">{g.id}</span>
                <span
                  className={g.pass ? "font-mono text-xs text-pass" : "font-mono text-xs text-fail"}
                >
                  {g.pass ? "PASS" : "FAIL"}
                </span>
              </div>
              <p className="mt-1 font-mono text-xl tabular-nums">{g.value}</p>
            </div>
          ))}
        </div>
        <Button variant="secondary" className="mt-4" onClick={() => onOpen("proofs")}>
          Open full proofs
        </Button>
      </Card>
    </div>
  );
}

const VECTORS: {
  id: VectorId;
  code: string;
  title: string;
  body: string;
  badge?: { label: string; variant: "pass" | "accent" | "default" | "warn" };
}[] = [
  {
    id: "artifacts",
    code: "A0",
    title: "Field packet",
    body: "Lenoir letter, Liz 101, Lutherville map, Packard card, cipher disk, Maryland electors.",
    badge: {
      label: `${PACKET.locked}/${PACKET.tests.length}`,
      variant: PACKET.locked === PACKET.tests.length ? "pass" : "warn",
    },
  },
  {
    id: "gematria",
    code: "L2",
    title: "Gematria engine",
    body: "Process any phrase through 14 Caesar/Atbash tracks and seven alphabet bases.",
  },
  {
    id: "corpus",
    code: "L2.C",
    title: "Corpus pivot",
    body: "Sort titles by Latin sum and lock the position-50 pivot gate.",
  },
  {
    id: "lattice",
    code: "L3",
    title: "Calling card",
    body: `Walk ${CALLING_CARD} at step 3 to the O.P.K.D.S.L.A. token.`,
    badge: { label: LATTICE.token, variant: "accent" },
  },
  {
    id: "proofs",
    code: "L6",
    title: "Sacred zero",
    body: "Modular invariants, electrochemical ratio, R19 proton-electron drift.",
    badge: {
      label: PROOFS.allPass ? "locked" : "open",
      variant: PROOFS.allPass ? "pass" : "default",
    },
  },
  {
    id: "harness",
    code: "L5",
    title: "Failure harness",
    body: "Inject eight schema violations and confirm secure default refusal.",
  },
  {
    id: "evidence",
    code: "L4",
    title: "Evidence engine",
    body: "Ingest the Revere wastebook golden corpus and evaluate P-VESSEL-01.",
  },
];
