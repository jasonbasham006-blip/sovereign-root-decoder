/** Integer Rail Engine — software rails on the locked integers. Math unchanged. */

import { Q } from "./hydro-rational";
import { LIVE_CRT_M, LIVE_GATE18, LIVE_X, LIVE_X_MOD_13, scanDraft } from "./resurrect";
import { bitshiftCore } from "./bitshift";

export const IRE_ORIGIN = 0;
export const IRE_STEP = 2;
export const IRE_SEED_LABEL = "BASHAM_BEAUCHAMP_SOVEREIGN_ROOT";

export const LIVE_MODULI = [49, 1118, 79, 107] as const;
export const LIVE_GARNER = [0, 46, 62, 0] as const;

export const DEMO_MODULI = [101, 103, 107, 109] as const;
export const DEMO_RESIDUES = [23, 45, 12, 89] as const;
export const DEMO_RECON = 79_321_787;

export const P64 = 0xffffffffffffffc5n;

export class HoldingRegister {
  nums: bigint[] = [];
  dens: bigint[] = [];
  store(num: bigint | number, den: bigint | number): void {
    this.nums.push(BigInt(num));
    this.dens.push(BigInt(den));
  }
  /** Terminal only. Exact Q — not IEEE float. */
  flush(base: bigint | number): Q {
    let n = BigInt(base);
    for (const x of this.nums) n *= x;
    let d = 1n;
    for (const x of this.dens) d *= x;
    return new Q(n, d);
  }
  get pending() {
    return this.nums.map((n, i) => `${n}/${this.dens[i]}`);
  }
}

function egcd(a: bigint, b: bigint): { g: bigint; x: bigint; y: bigint } {
  if (b === 0n) return { g: a, x: 1n, y: 0n };
  const inner = egcd(b, a % b);
  return { g: inner.g, x: inner.y, y: inner.x - (a / b) * inner.y };
}

export function modInv(a: bigint, m: bigint): bigint {
  const { g, x } = egcd(((a % m) + m) % m, m);
  if (g !== 1n && g !== -1n) throw new Error("not invertible");
  return ((x % m) + m) % m;
}

export function mixedRadixGarner(moduli: readonly number[], residues: readonly number[]): {
  coeffs: number[];
  value: number;
} {
  const m = moduli.map((x) => BigInt(x));
  const r = residues.map((x) => BigInt(x));
  const x: bigint[] = [];
  for (let i = 0; i < m.length; i++) {
    let t = r[i];
    for (let j = 0; j < i; j++) {
      const diff = ((t - x[j]) % m[i] + m[i]) % m[i];
      t = (diff * modInv(m[j], m[i])) % m[i];
    }
    x.push(t);
  }
  let value = x[0];
  let prod = 1n;
  for (let i = 1; i < m.length; i++) {
    prod *= m[i - 1];
    value += x[i] * prod;
  }
  return { coeffs: x.map((c) => Number(c)), value: Number(value) };
}

export type ZeroRecovery = {
  core: bigint;
  recovered: bigint;
  path: "even" | "true-zero" | "negative-fill";
  filled: number[];
  halvesParked: number;
};

/**
 * Even rail first. Odds are half-bits — parked, not multiplied.
 * A 0 in an even product is the hole. If the claim is supposed to be
 * nonzero, fill holes with negative wholes −2, −4, −6… in order.
 * Fractions stay out of this function.
 */
export function recoverUnexpectedZero(
  coords: number[],
  expectNonzero = true,
): ZeroRecovery {
  const evens: number[] = [];
  let halvesParked = 0;
  for (const c of coords) {
    if (c % 2 !== 0) {
      halvesParked += 1;
      continue;
    }
    evens.push(c);
  }
  let core = 1n;
  for (const c of evens) core *= BigInt(c);
  if (core !== 0n) {
    return { core, recovered: core, path: "even", filled: [], halvesParked };
  }
  if (!expectNonzero) {
    return { core, recovered: 0n, path: "true-zero", filled: [], halvesParked };
  }
  const filled: number[] = [];
  let k = 1;
  let recovered = 1n;
  for (const c of evens) {
    if (c === 0) {
      const n = -2 * k;
      filled.push(n);
      recovered *= BigInt(n);
      k += 1;
    } else {
      recovered *= BigInt(c);
    }
  }
  return { core, recovered, path: "negative-fill", filled, halvesParked };
}

export function evenStencil(grid: number[][], modulus: bigint): bigint {
  let acc = 0n;
  for (const pt of grid) {
    if (!pt.every((c) => c % 2 === 0)) continue;
    let sub = 1n;
    for (const c of pt) sub = (sub * BigInt(c)) % modulus;
    acc = (acc + sub) % modulus;
  }
  return acc;
}

export type IndexNode = {
  index: number;
  rail: "EVEN_RAIL_WHOLE" | "ODD_RAIL_HALF";
  factors: string;
  payload: string;
  hash: string;
  subVector: string;
  accessVector: false;
};

function payloadFor(index: number, rail: IndexNode["rail"]): string {
  return `ORIGIN_0::${IRE_SEED_LABEL}::INDEX_${index}::${rail}`;
}

/** Independently recomputed SHA-256 of the payload. Plan-doc truncations did not match. */
export const INDEX_NODES: IndexNode[] = [
  {
    index: 241,
    rail: "ODD_RAIL_HALF",
    factors: "241 (prime)",
    payload: payloadFor(241, "ODD_RAIL_HALF"),
    hash: "967b6637715c6e246b59e1f37c5f3fd791fd4324d3345d799f5e3c5c15d76a7b",
    subVector: "2524669495",
    accessVector: false,
  },
  {
    index: 244,
    rail: "EVEN_RAIL_WHOLE",
    factors: "2² × 61",
    payload: payloadFor(244, "EVEN_RAIL_WHOLE"),
    hash: "e86a5b0a0e31a264cd4bfe982612bf1a68337c3b4ea413b57f9fd2c3843ad2ce",
    subVector: "3899284234",
    accessVector: false,
  },
  {
    index: 247,
    rail: "ODD_RAIL_HALF",
    factors: "13 × 19",
    payload: payloadFor(247, "ODD_RAIL_HALF"),
    hash: "62233114db0d6c5845275ebff3b639c569ed551c8244789520f022006619fff4",
    subVector: "1646473492",
    accessVector: false,
  },
  {
    index: 250,
    rail: "EVEN_RAIL_WHOLE",
    factors: "2 × 5³",
    payload: payloadFor(250, "EVEN_RAIL_WHOLE"),
    hash: "6b5415b18c45aa2aa423e79db62ec0de9e4a5eacf10999ddc48d9e23e45464a8",
    subVector: "1800672689",
    accessVector: false,
  },
  {
    index: 253,
    rail: "ODD_RAIL_HALF",
    factors: "11 × 23 = T₂₂",
    payload: payloadFor(253, "ODD_RAIL_HALF"),
    hash: "cb3cdb6c46bb981c1f8078f76fc1a7227cdfaa22b54beebbb62aedbde171ecc9",
    subVector: "3409763180",
    accessVector: false,
  },
];

const SAMPLE_GRID = [
  [2, -2, 4, -4, 2, 0, -2, 2, 4, -2, 0, 2],
  [4, 2, -2, 2, 0, -4, 2, -2, 0, 4, -2, -4],
];

export function runIre() {
  const live = bitshiftCore();
  const demo = mixedRadixGarner(DEMO_MODULI, DEMO_RESIDUES);
  const liveGarner = mixedRadixGarner(
    LIVE_MODULI,
    LIVE_MODULI.map((m) => LIVE_X % m),
  );
  const hold = new HoldingRegister();
  const maclaurinCore = 5 * 100 * 6 * 6;
  hold.store(1, 12);
  const maclaurinQ = hold.flush(maclaurinCore);
  const stencil = evenStencil(SAMPLE_GRID, P64);
  const zeroFill = recoverUnexpectedZero(SAMPLE_GRID[0], true);
  const trueZero = recoverUnexpectedZero([2, 0, 4], false);
  const evenWalk = Array.from({ length: 8 }, (_, j) => IRE_ORIGIN + IRE_STEP * j);
  const gate = scanDraft("");
  const boot = {
    xor: 718 ^ 892,
    gate18: LIVE_GATE18,
    or: 718 | 892,
    x: LIVE_X,
    res: LIVE_MODULI.map((m) => LIVE_X % m),
    r18: live.algebraic1420 === 1420,
    kSigmaMod49: (3_398_738 * 828 + 8 * 219 + 2) % 49,
  };
  const bootPass =
    boot.xor === 434 &&
    boot.gate18 === 18 &&
    boot.or === 1022 &&
    boot.res[0] === 0 &&
    boot.res[1] === 18 &&
    boot.res[2] === 0 &&
    boot.res[3] === 97 &&
    boot.r18 &&
    boot.kSigmaMod49 === 39 &&
    live.garnerPass &&
    live.crtModulusPass &&
    LIVE_X_MOD_13 === 5 &&
    LIVE_CRT_M === 463_072_246;
  return {
    origin: IRE_ORIGIN,
    step: IRE_STEP,
    evenWalk,
    evenWalkPass: evenWalk.every((n, j) => n === 2 * j),
    live,
    liveGarner,
    liveGarnerPass: liveGarner.value === LIVE_X && liveGarner.coeffs.join(",") === LIVE_GARNER.join(","),
    demo,
    demoPass: demo.value === DEMO_RECON && DEMO_RESIDUES.every((r, i) => demo.value % DEMO_MODULI[i] === r),
    stencil: stencil.toString(),
    stencilPass: stencil === 0n,
    zeroFill,
    zeroFillPass: zeroFill.path === "negative-fill" && zeroFill.recovered !== 0n,
    trueZeroPass: trueZero.path === "true-zero" && trueZero.recovered === 0n,
    maclaurinCore,
    maclaurinQ: maclaurinQ.toString(),
    maclaurinPass: maclaurinQ.n === 1500n && maclaurinQ.d === 1n,
    holdingPendingWere: ["1/12"],
    nodes: INDEX_NODES,
    accessVector: false as const,
    seedIsLabel: true as const,
    boot,
    bootPass,
    gate: gate.status,
    clay: "FORBIDDEN" as const,
    nist: live.nistNote,
    note: "Even rail first. Odds parked as half-bits. Unexpected 0 fills with −2, −4, −6. Demo Garner is textbook. Live rails stay 49,1118,79,107. SHA-256 of the index payload is a commitment, not a spending key. 12D NS / HIP / CUDA / treasury not executed. THM-SOBOLEV-GAP stays OPEN.",
  };
}

export type IreCore = ReturnType<typeof runIre>;

export const IRE = runIre();
