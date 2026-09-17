import { CONSTRAINED_CORPUS, PIVOT_INDEX, PIVOT_LATIN_TARGET } from "./corpus";
import { callingCardPhase } from "./lattice";
import { ESAEESA, KY_TOWNS, forwardGematria, cleanText } from "./gematria";
import { runProofs } from "./proofs";
import { runHydro } from "./hydro";

export type LedgerStatus = "LOCKED" | "COMPUTED" | "INGESTED" | "FAIL_CLOSED" | "OPERATOR_ONLY";

export type LedgerItem = {
  id: string;
  protocol: string;
  title: string;
  status: LedgerStatus;
  note: string;
};

export const COMMAND_SEQUENCE = "Foundations Papers Rolling: Over Specie, Walk Hatter Trustee";

const PHASE = callingCardPhase();
const PROOFS = runProofs();
const HYDRO = runHydro();

function kyNote(): string {
  return KY_TOWNS.map((t) => {
    const ord = forwardGematria(cleanText(t.name), 1);
    const ok = ord === t.ordinalExpect && ord * 6 === t.sixExpect;
    return `${t.name} ordinal ${ord}${ok ? " = lock" : " MISMATCH"} · ×6 ${ord * 6} · Jewish ${t.jewishOperator} and Hebrew ${t.hebrewOperator} stay operator-supplied`;
  }).join(". ");
}

export const LEDGER: LedgerItem[] = [
  {
    id: "p1",
    protocol: "1",
    title: "101-over-3 ring traversal",
    status: PHASE.token === "OPKDSLA" ? "LOCKED" : "FAIL_CLOSED",
    note: `28-letter ring · start index 18 O · stride +3 mod 28 · ${PHASE.tokenDotted} path ${PHASE.pathIndices.join(" → ")}.`,
  },
  {
    id: "p1b",
    protocol: "1",
    title: "Emergent TAN / CRIES / SEC",
    status: PHASE.sPhase ? "LOCKED" : "FAIL_CLOSED",
    note: `TAN ${PHASE.tan.word} · CRIES ${PHASE.cries.word} · SEC ${PHASE.sec.word}. Same clockwise stride.`,
  },
  {
    id: "p2",
    protocol: "2",
    title: "Orthographic Z vs S phase",
    status: PHASE.sPhase && PHASE.zFail.cries === "CRIEZ" ? "LOCKED" : "FAIL_CLOSED",
    note: `Elisabeth S at index 7 completes CRIES/SEC. Z substitution yields ${PHASE.zFail.cries} / ${PHASE.zFail.sec}. Δ(Z,S) = ${PHASE.deltaZS} = Gate 7.`,
  },
  {
    id: "p3",
    protocol: "3",
    title: "14-track gematria pipeline",
    status: "LOCKED",
    note: "T-F0…T-F6 Caesar offsets. T-R0…T-R6 Atbash reverse. Live on Gematria.",
  },
  {
    id: "p3b",
    protocol: "3",
    title: "Deep transform filters",
    status: "COMPUTED",
    note: "Katan (mod 9), mod 49 bit-parity, and mod 13 magnetic filter run on the ordinal. Hebrew phonetic and directional-inversion optics stay operator-supplied — not invented here.",
  },
  {
    id: "p4",
    protocol: "4",
    title: "Seven tongues / ESAEESA",
    status: PROOFS.esaeesa.pass ? "LOCKED" : "FAIL_CLOSED",
    note: `1170 residues {${ESAEESA.map((r) => r.residue).join(", ")}} → ${PROOFS.esaeesa.word}. Sum ${PROOFS.esaeesa.residueSum} ≡ ${PROOFS.esaeesa.mod49} (mod 49).`,
  },
  {
    id: "p5",
    protocol: "5",
    title: "Five-book stack / 49-error pivot",
    status: CONSTRAINED_CORPUS.length === 213 ? "LOCKED" : "COMPUTED",
    note: `${CONSTRAINED_CORPUS.length}-item corpus. Pivot index ${PIVOT_INDEX} · BAPTIST Latin target ${PIVOT_LATIN_TARGET}. First 49 map to the 7×7 pulley matrix.`,
  },
  {
    id: "p6",
    protocol: "6",
    title: "L6 invariant gates",
    status: PROOFS.allPass ? "LOCKED" : "FAIL_CLOSED",
    note: "Sacred Zero, Gate 18, Parity 158, Gate 7, God Seal, ESAEESA, R19 loop.",
  },
  {
    id: "cmd",
    protocol: "CMD",
    title: "Sovereign command sequence",
    status: "INGESTED",
    note: COMMAND_SEQUENCE,
  },
  {
    id: "hd586",
    protocol: "HD",
    title: "Serial Set Vol. 3937 / H.Doc. 586",
    status: "FAIL_CLOSED",
    note: "56th Congress, 1st Session, House Document 586 is cited. Bond line items, names, and page numbers were not pasted. No invented schedule.",
  },
  {
    id: "ky",
    protocol: "KY",
    title: "Paintsville / Staffordsville",
    status: "COMPUTED",
    note: kyNote(),
  },
  {
    id: "wam",
    protocol: "WAM",
    title: "Walters 22.152 / 22.153 / 22.38",
    status: "INGESTED",
    note: "Ankhef-en-Sekhmet tomb blocks. Fig. 3 = 22.152–22.153 (musicians and game players). Fig. 4 = 22.38 (harpist). Not a 4:30 clock reading.",
  },
  {
    id: "faic",
    protocol: "FAIC",
    title: "FAIC Oral History — Winterthur",
    status: "INGESTED",
    note: "Elisabeth Cazenove Packard conservation career, 43 years, Walters Art Museum. Cataloged under the FAIC oral-history collection. No invented interview text.",
  },
  {
    id: "nara15",
    protocol: "NARA",
    title: "NARA RG 15 pension ledgers",
    status: "INGESTED",
    note: "Revolutionary War pension payment ledgers already sit in the constrained corpus. Line-by-line isolation stays fail-closed until a specific file is pasted.",
  },
  {
    id: "potosi",
    protocol: "XRF",
    title: "Potosi 0.923 electrochemical loop",
    status: "LOCKED",
    note: "1.118 / 0.923 already holds in L6. Metallurgy is a ratio lock, not a legal filing and not a concealment spec.",
  },
  {
    id: "elect",
    protocol: "NUM",
    title: "Named-10 ballot dump",
    status: "OPERATOR_ONLY",
    note: "Numerology only. 1,000,000 shortfall and residual 183,993 are operator figures. Residual is an undervote/overvote pool — not a fraud finding and not a geodetic lock.",
  },
  {
    id: "patents",
    protocol: "CAD",
    title: "Chuckatuck / Quarter Swamp courses",
    status: "FAIL_CLOSED",
    note: "Node 8 is a point. Node 9 is a 0.636 km square scale note. Reverse-course stays dark until actual metes-and-bounds are pasted.",
  },
  {
    id: "survey",
    protocol: "GS",
    title: "8-node WGS84 matrix + Σ",
    status: "LOCKED",
    note: "Vincenty from Lutherville C-2. Magnetic-south corridor 179°. CSV of anchors is armed. Mapping thread stays open.",
  },
  {
    id: "rns",
    protocol: "RNS",
    title: "Parallel RNS × True Pull 766",
    status: "LOCKED",
    note: "Primes 65521, 65519, 65551. Garner reconstruct of token × 766 matches (N × 766) mod M. 766 mod 49 = 31.",
  },
  {
    id: "xrf-crate",
    protocol: "XRF",
    title: "Crate XRF zonal routing",
    status: "LOCKED",
    note: "Ag 9300 / Cu 650 / Au 25 / Pb 25 bp. BODY Pb 25 bp ≤ 100 → COMPOSITION_CONSISTENT. Multi-element parser live on Proofs. No concealment spec.",
  },
  {
    id: "bip340",
    protocol: "BIP",
    title: "BIP-340 Schnorr (R, s) suite",
    status: "FAIL_CLOSED",
    note: "Tagged-hash syndrome commitment is computed. No private scalar, no tweaked spending key, and no (R, s) pair are emitted. This is not a wallet.",
  },
  {
    id: "chancery",
    protocol: "MSA",
    title: "Maryland Chancery Case 1118",
    status: "FAIL_CLOSED",
    note: "No Chancery Case 1118 docket in Drive, the private repos, or the operator table. 1118 remains the geodetic foot-offset, not a substituted case file. Paste the docket to arm extraction.",
  },
  {
    id: "farey",
    protocol: "T1",
    title: "Farey / Galois header claims",
    status: "FAIL_CLOSED",
    note: "Named in the compilation header. Not present in the executable script. Not invented here.",
  },
  {
    id: "walters-cons",
    protocol: "WAM",
    title: "Walters conservation dossiers",
    status: "INGESTED",
    note: "Citations locked: Walters Conservation and Technical Research portal; Journal vol. 78 conservation history; FAIC/Winterthur oral history. Smithsonian MCI node 1256704 was named, not retrieved.",
  },
  {
    id: "faic-680",
    protocol: "FAIC",
    title: "Winterthur FAIC oral history sweep",
    status: "INGESTED",
    note: "Collection is the field-wide conservation archive, not a 680-item Packard box. AIC: 400+ transcripts. Interviewee index ingested. Packard 1975 transcript (21886) and group recording with Rabin/Stout/Feller (21207) cataloged. Transcript body fail-closed. A.E. Warner is not in the index; A.E.A. Werner is.",
  },
  {
    id: "hydro-classical",
    protocol: "HYDRO",
    title: "Vortex stretching · P1/P2/P3",
    status: HYDRO.classicalPass ? "LOCKED" : "FAIL_CLOSED",
    note: "Pointwise χ² ≤ 2/3 on traceless strain. Linear Fourier equipartition = 1/3. Quadratic even fields integrate to zero stretching on a symmetric sample (THM-PARITY-ZERO). Cubic triad (y³,z³,x³) is even in stretching and hits 2/3 at (1,1,1). Pear point-warp stays parity-odd; the no-penetration correction PDE is not solved.",
  },
  {
    id: "hydro-cx001",
    protocol: "HYDRO",
    title: "Counterexample-001 · 1/25",
    status: "LOCKED",
    note: "u=(x₁, 2x₁x₃, −x₃) on E(1,1,2). Exact Q-arithmetic: χ²=1/25, χ=1/5. Falsifies K≤1/7. The dump's 8/75 is rejected. Not a Navier–Stokes regularity claim.",
  },
  {
    id: "hydro-c2",
    protocol: "HYDRO",
    title: "c₂ pear expansion",
    status: "LOCKED",
    note: "Two quadratic-mode gauges (3/11 and 5/22) sit inside χ²(ε)=1/3 + c₂ε² + O(ε⁴). Reconciled as gauge, not as two ceilings. a₁=4π/3 by Gauss–Bonnet on Σ≅S², independent of ε. Super-bracket unnamed in numbers — dark.",
  },
  {
    id: "hydro-spec",
    protocol: "HYDRO",
    title: "Index / SOS / Lie–Poisson",
    status: "FAIL_CLOSED",
    note: "P₃ Gram is PSD over ℚ with pivots 35/6561, 35/6561, 1081/229635, 517/150903. Dump LDLT numbers rejected. P₅ Gram has a negative pivot — not an SOS certificate. P₇ Gram absent. Casimir numerator not recomputed. c₂=3/11 under strain gauge.",
  },
];

export function ledgerCounts(): Record<LedgerStatus, number> {
  const counts: Record<LedgerStatus, number> = {
    LOCKED: 0,
    COMPUTED: 0,
    INGESTED: 0,
    FAIL_CLOSED: 0,
    OPERATOR_ONLY: 0,
  };
  for (const item of LEDGER) counts[item.status] += 1;
  return counts;
}

export function ledgerText(): string {
  const lines = [
    "SOVEREIGN ROOT — INGEST LEDGER",
    `Command: ${COMMAND_SEQUENCE}`,
    "",
    ...LEDGER.map(
      (item) => `[${item.status}] ${item.protocol} ${item.title}\n  ${item.note}`,
    ),
    "",
    "Thread remains open. No excavation. No invented patents. No legal filing drafted.",
  ];
  return lines.join("\n");
}
