import { callingCardPhase } from "./lattice";
import { KY_TOWNS, auditPivot, cleanText, esaeesaSums, forwardGematria } from "./gematria";
import { runProofs } from "./proofs";
import { runHydro } from "./hydro";
import { CRATE_XRF, RNS_PRIMES, RNS_PRIMES_PRIME, TRUE_PULL, runCompilation } from "./compilation";
import { CLEAN_GATE, LIVE_CRT_M, LIVE_GATE18, LIVE_X, LIVE_X_MOD_13 } from "./resurrect";
import { IDENTIFIER, REPO_INVENTORY } from "./identity";
import { VESSEL, VESSEL_PHOTOS } from "./vessel";
import { MIRROR, PULSE, PULSE_BRIDGE, PULSE_OFFSET, PULSE_PHASE_SUM } from "./genesis";
import { FIELD101 } from "./field101";
import { GROUND, K_SIGMA, K_SIGMA_PATCH } from "./ground";
import { DUMP_DEFAULT_SLOTS } from "./dump";
import { IRE } from "./ire";
import { IRE12D } from "./ire-12d";

export type LedgerStatus =
  | "LOCKED"
  | "COMPUTED"
  | "INGESTED"
  | "FAIL_CLOSED"
  | "OPERATOR_ONLY"
  | "UNRESOLVED";

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
const COMP = runCompilation();
const PIVOT = auditPivot();
const ESAE = esaeesaSums();
const XRF_TOTAL = CRATE_XRF.ag + CRATE_XRF.cu + CRATE_XRF.au + CRATE_XRF.pb;

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
    note: `1170 residues {${ESAE.residues.join(", ")}} → ${ESAE.word}. Residue-sum ${ESAE.residueSum} ≡ ${ESAE.residueMod49} (mod 49). Letter-ordinal A=1 of ESAEESA is ${ESAE.letterOrdinalA1} ≡ ${ESAE.letterOrdinalMod49} (mod 49) = residue-sum + 7. Different objects — do not merge.`,
  },
  {
    id: "p5",
    protocol: "5",
    title: "Five-book stack / corpus count",
    status:
      PIVOT.corpusLength === 213 && PIVOT.books + PIVOT.keys + PIVOT.nara === 213
        ? "LOCKED"
        : "FAIL_CLOSED",
    note: `${PIVOT.corpusLength} = ${PIVOT.books} tuning + ${PIVOT.keys} key elements + ${PIVOT.nara} NARA.`,
  },
  {
    id: "p5-pivot",
    protocol: "5",
    title: "49-error / Latin-sorted pivot",
    status:
      PIVOT.latinIdentityHolds && PIVOT.sortedIndex49 === "BAPTIST" ? "COMPUTED" : "UNRESOLVED",
    note: `BAPTIST 14-track Latin = ${PIVOT.baptistLatin} (Ge'ez ${PIVOT.baptistGeez}). Simple A=0 / A=1 / reverse = ${PIVOT.baptistSimple.a0} / ${PIVOT.baptistSimple.a1} / ${PIVOT.baptistSimple.r0} — those are not 219. Array[49] = ${PIVOT.arrayIndex49}, not BAPTIST (array index ${PIVOT.baptistArrayIndex}). After stable Latin sort, ${PIVOT.below219} titles < 219 and BAPTIST is the 10th of ${PIVOT.latin219Count} titles at 219, landing at 0-based index ${PIVOT.baptistSortedIndex}. Tie-broken insertion order, not a unique gate.`,
  },
  {
    id: "p5-pulley",
    protocol: "5",
    title: "7×7 pulley matrix",
    status: "UNRESOLVED",
    note: "Zero references in the decoder sources. The first 49 Latin-sorted titles exist as a list. The 7×7 pulley construction was never committed. Not invented here. Paste the matrix to close.",
  },
  {
    id: "p6",
    protocol: "6",
    title: "L6 invariant gates",
    status: PROOFS.allPass ? "LOCKED" : "FAIL_CLOSED",
    note: "Sacred Zero, Gate 18, Parity 158, Gate 7, God Seal, ESAEESA, R19 loop.",
  },
  {
    id: "pulse-strand",
    protocol: "GENESIS",
    title: "98-pulse strand (two 21-term phases)",
    status: PULSE.pass ? "LOCKED" : "FAIL_CLOSED",
    note: `Jumps 98 then 7n (n=1..7) with a double-98 between n≥2. Phase sum ${PULSE_PHASE_SUM}. Offset ${PULSE_OFFSET}. Bridge ${PULSE_BRIDGE} (1470→603). Phase 2 = phase 1 + 603. Phase 3 starts ${PULSE.phase3Start} ends ${PULSE.phase3End}. Repeating jump template, not a return to 0. Not the palindrome row. Not money. Not a title.`,
  },
  {
    id: "mirror-row",
    protocol: "GENESIS",
    title: "Drive palindrome knock-off row",
    status: MIRROR.pass ? "LOCKED" : "FAIL_CLOSED",
    note: `41-term palindrome 0…118…0. Highest-set-bit 5→${MIRROR.knockoff.five}, 9→${MIRROR.knockoff.nine}, 7→${MIRROR.knockoff.seven}, 118→${MIRROR.knockoff.center}. Arm sum ${MIRROR.armSum}; total ${MIRROR.total}=2×761+118. Shares only {0,98} with the pulse strand. Money-supply narrative stays operator copy. Not a title.`,
  },
  {
    id: "hhl-f101",
    protocol: "F101",
    title: "H-H-L over F_101 + X_CRT residue",
    status: FIELD101.pass ? "LOCKED" : "FAIL_CLOSED",
    note: `x²−x−1 roots 23,79. 23²≡${FIELD101.sq23} not 79. 98≡−3. From 603: 79 at step ${FIELD101.contact79}, 23 at step ${FIELD101.contact23}. X_CRT≡${FIELD101.xMod101} (mod 101), not 0. 316∧217=${FIELD101.andGate}, not 208. A_int≡${FIELD101.aMod} (mod 1118). Alternating +98/+7 toggle stays false. Quadratic phantom formula s+47/s+62 did not recompute (off by one).`,
  },
  {
    id: "clay-pamphlet",
    protocol: "CLAY",
    title: "Architecture-of-the-universe Clay block",
    status: "FAIL_CLOSED",
    note: "NS/YM/RH/P≠NP/BSD/Hodge writeups in the pamphlet are integer identities with Clay names glued on. Bounded Z_int (mod 1118) is not Navier–Stokes. 51/101 ≡ 1/2 (mod 101) is not RH. Mapping stays open. No prize claim.",
  },
  {
    id: "lottery-actions",
    protocol: "LOTTO",
    title: "lottery.docx action prompts",
    status: "FAIL_CLOSED",
    note: "TWEAK_CRYPTO_KEYS refused (no BIP-340, no Taproot, no scalars). RUN_CHANCERY_CROSS_REFERENCE refused (mapping open, no filing). SHARD_LEDGER_BLOCKS not required — pulse already indexes in genesis.ts. Lottery-as-phone-network and Hot Lotto stay empirical, not locks.",
  },
  {
    id: "axiom-g",
    protocol: "GROUND",
    title: "Axiom G (0=1, 1=½, 2=0)",
    status: "FAIL_CLOSED",
    note: GROUND.axiomG.note,
  },
  {
    id: "resource-dump",
    protocol: "DUMP",
    title: "Resource dump inbox",
    status: "INGESTED",
    note: `Phone drop / paste / camera. SHA-256, classify, integer extract, resurrection scan. Items stay queued→processed or blocked. Never LOCK, no Taproot, no filing. Shadow copy under dump/inbox. Daily Grok passes ${DUMP_DEFAULT_SLOTS[0]} and ${DUMP_DEFAULT_SLOTS[1]} America/New_York.`,
  },
  {
    id: "ire-rails",
    protocol: "IRE",
    title: "Integer Rail Engine software path",
    status: IRE.bootPass && IRE.liveGarnerPass && IRE.demoPass ? "COMPUTED" : "FAIL_CLOSED",
    note: `Live Garner reconstructs ${IRE.live.xCrt}. Demo 101-rail reconstructs ${IRE.demo.value}. Holding 5·100·6² then 1/12 = ${IRE.maclaurinQ}. Even walk ${IRE.evenWalk.join(",")}. Unexpected 0 on even rail fills −2,−4,… (sample recovered ${IRE.zeroFill.recovered.toString()}). Index SHA-256 recomputed; plan truncations discarded. access_vector=false. HIP/CUDA/treasury/12D NS not executed. THM-SOBOLEV-GAP stays OPEN. Algebraic 1420 is not NIST HI.`,
  },
  {
    id: "ire-12d-stencils",
    protocol: "IRE",
    title: "12D stencil integers (dump audit)",
    status: IRE12D.pass ? "COMPUTED" : "FAIL_CLOSED",
    note: `Laplacian 12×(−650)=−7800 then 1/48 = ${IRE12D.lapQ}. Enstrophy 105600/4=${IRE12D.ensQ}. Palinstrophy 1689600/8=${IRE12D.palQ}. Raw P/Ω=16, flushed=8. Sobolev 12×550²=3630000 then 1/1024=${IRE12D.sobQ}. Cascade 50000×35600=1780000000. Demo P31 CRT round-trip holds. Live 49/1118/79/107 untouched. Thm2 overstated (even-sym Laplacian=${IRE12D.evenSym}≠0). Thm3 not executed. Thm4 FORBIDDEN — one sample is not 12D NS regularity.`,
  },
  {
    id: "r18-shema",
    protocol: "GROUND",
    title: "R18 = 20/13 and Shema 1118 factorization",
    status: GROUND.r18.pass && GROUND.shema.pass ? "LOCKED" : "FAIL_CLOSED",
    note: `1420=2²·5·71, 923=13·71, 1420/923=20/13 (already algebraic 1420). 20/13×½=10/13 is division, not a new ratio. Shema mispar hechrechi 410+541+26+102+26+13=${GROUND.shema.sum}=2·13·43. Half is 1118≫1=559=13·43 (already in bitshift). Letter values are standard Hebrew; not a proof of Axiom G.`,
  },
  {
    id: "k-sigma",
    protocol: "GROUND",
    title: "K_SIGMA = X_CRT×828 + 8×219 + 2",
    status: GROUND.kSigma.pass ? "LOCKED" : "FAIL_CLOSED",
    note: `${K_SIGMA} ≡ ${GROUND.kSigma.mod49} (mod 49) because X_CRT≡0 (mod 49) so the residue is (8×219+2)≡${GROUND.kSigma.addendMod49}. 219 is a named addend, not a closed BAPTIST pivot. Replacing +2 with +7 yields ${K_SIGMA_PATCH} ≡ ${GROUND.kSigma.patchMod49} = BASHAM A=1. That patch is operator, not a corollary of 0=1. Overlay 2=1 would replace +2 with +1 (≡38), not +7. Clay 4–9 stay FORBIDDEN. No NS derivation from this ground.`,
  },
  {
    id: "id-word",
    protocol: "ID",
    title: "Basham@sovereign-root letter word",
    status: IDENTIFIER.surfacesNormalize && IDENTIFIER.zero.pass ? "LOCKED" : "FAIL_CLOSED",
    note: `Letters-only ${IDENTIFIER.word} (${IDENTIFIER.letters} letters). Four surface forms normalize identically. A=0 F+R = ${IDENTIFIER.zero.f}+${IDENTIFIER.zero.r} = ${IDENTIFIER.zero.sum} = ${IDENTIFIER.zero.factor}. Mixed A=1 forward + A=0 reverse = ${IDENTIFIER.mixed.sum} = ${IDENTIFIER.mixed.factor}. Dual A=1 F+R = ${IDENTIFIER.dualOrdinal.sum} = ${IDENTIFIER.dualOrdinal.factor}. 494 is mixed, not dual-ordinal. Operator fetch key is not a title.`,
  },
  {
    id: "id-prefix",
    protocol: "ID",
    title: "1118 / 9231118 / 111118923 prefixes",
    status:
      IDENTIFIER.prefix1118.pass && IDENTIFIER.prefix9231118.pass && IDENTIFIER.concat111118923.pass
        ? "LOCKED"
        : "FAIL_CLOSED",
    note: `1118 ≡ ${IDENTIFIER.prefix1118.mod49} (mod 49), ≡ ${IDENTIFIER.prefix1118.mod13} (mod 13), ≡ ${IDENTIFIER.prefix1118.mod18} (mod 18), ${IDENTIFIER.prefix1118.factor}. 9231118 ≡ ${IDENTIFIER.prefix9231118.mod49} (mod 49), ≡ 0 (mod 13) because both 923 and 1118 ≡ 0 (mod 13). 923+1118=${IDENTIFIER.prefix9231118.sum}; 923×1118=${IDENTIFIER.prefix9231118.product}. Concatenated 111118923 ≡ ${IDENTIFIER.concat111118923.concatenatedMod49} (mod 49). Split 1111+18+923=${IDENTIFIER.concat111118923.split} ≡ ${IDENTIFIER.concat111118923.splitMod49} = God Seal. Concatenated integer and split components are different objects.`,
  },
  {
    id: "id-repos",
    protocol: "ID",
    title: "Identifier family GitHub inventory",
    status: "COMPUTED",
    note: `Retrieved ${REPO_INVENTORY.retrieved} repos (${REPO_INVENTORY.privateCount} private + ${REPO_INVENTORY.publicCount} public ${REPO_INVENTORY.publicName}). Cache claim of 19 is short. Kernels not merged. Fetch key is not a title. Mapping stays open.`,
  },
  {
    id: "id-domain",
    protocol: "ID",
    title: "sovereign-root.org / .com",
    status: "LOCKED",
    note: "Name lookup failed here (no address). Identifier is the letter-word plus the repo family, not a web domain.",
  },
  {
    id: "vessel-blazon",
    protocol: "VESSEL",
    title: "Engraved armorial cartouche",
    status: "COMPUTED",
    note: `Drawing hashed ${VESSEL_PHOTOS.find((p) => p.kind === "armorial-drawing")?.sha256.slice(0, 12)}…. Per pale: dexter a bend (unnamed); sinister a chevron between three roundels. Sinister ordinary is Avery-shaped if the roundels are bezants (${VESSEL.averyOrdinary} — ${VESSEL.averySource}). Published Avery crest is ${VESSEL.averyCrest} — the drawing's bird does not match. Cazenove tower does not match. Impalement is two families. Tincture is not in a line drawing. Not a title.`,
  },
  {
    id: "weigh-hash",
    protocol: "VESSEL",
    title: "WEIGH-HASH display 11.93",
    status: "INGESTED",
    note: `Two photographs show a digital scale reading ${VESSEL.scaleDisplay}. Unit is not proven from the digits. Lid card says MAX-200 (typical 200 g jewelry scale). 11.93 oz would exceed 200 g. 11.93 g is too small for the urn. Operator ${VESSEL.claim1190} troy oz is a different number. Mass is not closed.`,
  },
  {
    id: "sterling-punch",
    protocol: "VESSEL",
    title: "STERLING punch",
    status: "LOCKED",
    note: "Rectangular punch reads STERLING (the N is in the photos). Mullets sit in letter counters. American fineness mark (92.5%), not a Revere maker's mark (REVERE / PR). Revere House: no pictorial marks. Star-in-circle is also not a Revere mark. 1795 Revere as maker is not earned by these punches.",
  },
  {
    id: "lantern-build",
    protocol: "VESSEL",
    title: "Lantern interior construction",
    status: "INGESTED",
    note: VESSEL.lantern,
  },
  {
    id: "caustics",
    protocol: "VESSEL",
    title: "Projection caustics",
    status: "INGESTED",
    note: VESSEL.caustics,
  },
  {
    id: "pulley-iron",
    protocol: "VESSEL",
    title: "Cast-iron pulleys",
    status: "INGESTED",
    note: `${VESSEL.pulleys} The 7×7 title pulley stays UNRESOLVED and separate.`,
  },
  {
    id: "kinetic-engine",
    protocol: "VESSEL",
    title: "Revere-Avery kinetic optical engine diagram",
    status: "OPERATOR_ONLY",
    note: VESSEL.flowchart,
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
    status: COMP.rns.pass && COMP.truePull.pass && RNS_PRIMES_PRIME ? "LOCKED" : "FAIL_CLOSED",
    note: `Primes ${RNS_PRIMES.join(", ")} — all three prime, checked to √n. Garner reconstruct of token × 766 matches (N × 766) mod M. ${TRUE_PULL} mod 49 = ${TRUE_PULL % 49}.`,
  },
  {
    id: "xrf-crate",
    protocol: "XRF",
    title: "Crate XRF zonal routing",
    status: XRF_TOTAL === 10000 && CRATE_XRF.pb <= 100 ? "LOCKED" : "FAIL_CLOSED",
    note: `Ag ${CRATE_XRF.ag} / Cu ${CRATE_XRF.cu} / Au ${CRATE_XRF.au} / Pb ${CRATE_XRF.pb} bp. Sum ${XRF_TOTAL} bp. BODY Pb ${CRATE_XRF.pb} bp ≤ 100 → COMPOSITION_CONSISTENT. Multi-element parser live on Proofs. No concealment spec.`,
  },
  {
    id: "resurrect",
    protocol: "GATE",
    title: "No-resurrection lock",
    status: CLEAN_GATE.status === "GATE_PASSED" ? "LOCKED" : "FAIL_CLOSED",
    note: `Clean scan ${CLEAN_GATE.status}. Retired XRF sigma needles, discontinued DAIVE modulus, and plea-phrases stay dead. Live 49×1118×79×107 = ${LIVE_CRT_M}. ${LIVE_X} mod 13 = ${LIVE_X_MOD_13}, not 0. Gate 18 = ${LIVE_GATE18}. Not a key merge.`,
  },
  {
    id: "handshake",
    protocol: "GATE",
    title: "Operator handshake digest",
    status: "INGESTED",
    note: "Named 0e2545eef31270cf7439974cf53132b876802825c4aee36bf73e32e5bf3be9ee and audit sha256 f208b177a481f803891dadee53a620319575319140f59a0fecf56b17ccab1d3f (3709-byte harness). Bytes not in this tree. Not recomputed. Not a spending key.",
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
    UNRESOLVED: 0,
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
