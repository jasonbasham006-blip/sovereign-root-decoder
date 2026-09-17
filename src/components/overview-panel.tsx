import {
  CALLING_CARD,
  COMMAND_SEQUENCE,
  CONSTRAINED_CORPUS,
  ENGINE_VERSION,
  LEDGER,
  circularLatticeExtract,
  ledgerCounts,
  ledgerText,
  runPacket,
  runProofs,
} from "@/lib/decoder";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LatticeRing } from "@/components/lattice-ring";
import { Button } from "@/components/ui/button";
import type { VectorId } from "@/lib/vectors";
import type { LedgerStatus } from "@/lib/decoder/ledger";

const PROOFS = runProofs();
const LATTICE = circularLatticeExtract(CALLING_CARD, "O", 3, false);
const PACKET = runPacket();
const COUNTS = ledgerCounts();

type Props = {
  onOpen: (id: VectorId) => void;
};

function statusVariant(status: LedgerStatus): "pass" | "accent" | "default" | "warn" {
  if (status === "LOCKED") return "pass";
  if (status === "COMPUTED") return "accent";
  if (status === "INGESTED") return "default";
  return "warn";
}

export function OverviewPanel({ onOpen }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Operational core · T1 locked · mapping thread open
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight tracking-tight text-fg sm:text-4xl">
              Bitwise-deterministic decoder for the seven tongues and the 3-1-2-1 partition.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-normal text-muted">
              Fourteen gematria tracks, the 8-plane ledger under bit-shift protocol,
              L6 gates, and the locked survey. Arithmetic certified. Title and Taproot stay dark.
            </p>
            <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-subtle">
              {COMMAND_SEQUENCE}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>v{ENGINE_VERSION}</Badge>
              <Badge>{CONSTRAINED_CORPUS.length} corpus</Badge>
              <Badge>7 tongues</Badge>
              <Badge>14 tracks</Badge>
              <Badge variant={PROOFS.allPass ? "pass" : "fail"}>
                {PROOFS.allPass ? "gates hold" : "gate fail"}
              </Badge>
              <Badge variant={PACKET.locked === PACKET.tests.length ? "pass" : "warn"}>
                field {PACKET.locked}/{PACKET.tests.length}
              </Badge>
              <Badge variant="pass">{COUNTS.LOCKED} locked</Badge>
              <Badge variant="warn">{COUNTS.FAIL_CLOSED} fail-closed</Badge>
            </div>
          </div>
          <div className="w-full max-w-xs shrink-0 self-center">
            <LatticeRing extract={LATTICE} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Ingest ledger</CardTitle>
              <CardDescription>
                Six protocols plus the named dump. Fail-closed items stay dark. No excavation, no
                invented patents, no legal filing.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(ledgerText());
              }}
            >
              Copy ledger
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="font-mono text-xs text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">ID</th>
                <th className="py-2 pr-3 font-medium">Item</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {LEDGER.map((item) => (
                <tr key={item.id} className="border-b border-border/60 align-top">
                  <td className="py-2 pr-3 font-mono text-xs text-muted">{item.protocol}</td>
                  <td className="py-2 pr-3 text-fg">{item.title}</td>
                  <td className="py-2 pr-3">
                    <Badge variant={statusVariant(item.status)}>{item.status.replaceAll("_", " ")}</Badge>
                  </td>
                  <td className="py-2 text-xs leading-relaxed text-muted">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
            Named gates evaluated at load. Open proofs for the full loop.
          </CardDescription>
        </CardHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PROOFS.gates.map((g) => (
            <div key={g.id} className="rounded-md bg-elevated p-3 shadow-[var(--shadow-border)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted">{g.label}</span>
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
        <p className="mt-3 font-mono text-xs text-muted">
          ESAEESA {PROOFS.esaeesa.word} · residue sum {PROOFS.esaeesa.residueSum} ≡{" "}
          {PROOFS.esaeesa.mod49} (mod 49)
        </p>
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
    id: "survey",
    code: "GS",
    title: "Estate survey",
    body: "WGS84 plot from the Kurtz Avenue octagon. Line 7, 179° mag south, Σ spokes, Vincenty CSV.",
    badge: { label: "locked", variant: "pass" },
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
    body: `Walk ${CALLING_CARD} at step 3 to the O.P.K.D.S.L.A. token, then TAN / CRIES / SEC.`,
    badge: { label: LATTICE.token, variant: "accent" },
  },
  {
    id: "proofs",
    code: "L6",
    title: "Sacred zero",
    body: "Named L6 gates, ESAEESA, electrochemical ratio, R19 proton-electron drift.",
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
