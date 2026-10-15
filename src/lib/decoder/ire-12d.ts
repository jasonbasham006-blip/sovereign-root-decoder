/** 12D IRE dump — verified integers only. Not a Navier–Stokes proof. */

import { Q } from "./hydro-rational";
import { HoldingRegister } from "./ire";

export const DEMO_P31 = [2147483647, 2147483629, 2147483587] as const;

export const U_LAP = [500, 800, 1000, 1150, 1350] as const;
export const U_SOB = [200, 500, 800, 1150, 1350, 1500] as const;
export const U_EVEN_SYM = [600, 800, 1000, 800, 600] as const;
export const U_UNIFORM = [1000, 1000, 1000, 1000, 1000] as const;

export function laplacian5(u: readonly number[]): number {
  return -u[4] + 16 * u[3] - 30 * u[2] + 16 * u[1] - u[0];
}

export function deriv5(u: readonly number[]): number {
  return u[5] - 5 * u[4] + 10 * u[3] - 10 * u[2] + 5 * u[1] - u[0];
}

function even(u: readonly number[]): boolean {
  return u.every((x) => x % 2 === 0);
}

function garnerBig(moduli: readonly bigint[], residues: readonly bigint[]): bigint {
  const x: bigint[] = [];
  for (let i = 0; i < moduli.length; i++) {
    let t = residues[i];
    const m = moduli[i];
    for (let j = 0; j < i; j++) {
      const diff = ((t - x[j]) % m + m) % m;
      t = (diff * powMod(moduli[j], m - 2n, m)) % m;
    }
    x.push(t % m);
  }
  let value = x[0];
  let base = 1n;
  for (let i = 1; i < moduli.length; i++) {
    base *= moduli[i - 1];
    value += x[i] * base;
  }
  return value;
}

function powMod(a: bigint, e: bigint, m: bigint): bigint {
  let x = ((a % m) + m) % m;
  let n = e;
  let out = 1n;
  while (n > 0n) {
    if (n & 1n) out = (out * x) % m;
    x = (x * x) % m;
    n >>= 1n;
  }
  return out;
}

function centered(val: bigint, M: bigint): bigint {
  return val >= M / 2n ? val - M : val;
}

function crtRoundtrip(X: number): boolean {
  const P = DEMO_P31.map((p) => BigInt(p));
  const M = P.reduce((a, b) => a * b, 1n);
  const xb = BigInt(X);
  const r = P.map((p) => ((xb % p) + p) % p);
  const rec = centered(garnerBig(P, r), M);
  return rec === xb;
}

export function runIre12d() {
  const hold = new HoldingRegister();
  const lapPer = laplacian5(U_LAP);
  const lap12 = 12 * lapPer;
  hold.store(1, 48);
  const lapQ = hold.flush(lap12);

  const holdE = new HoldingRegister();
  const ensRaw = 66 * 40 * 40;
  holdE.store(1, 4);
  const ensQ = holdE.flush(ensRaw);

  const holdP = new HoldingRegister();
  const palRaw = 66 * 160 * 160;
  holdP.store(1, 8);
  const palQ = holdP.flush(palRaw);

  const holdI = new HoldingRegister();
  holdI.store(1, 5);
  const iQ = holdI.flush(1600);

  const holdW = new HoldingRegister();
  holdW.store(3, 5);
  const wQ = holdW.flush(2_560_000);

  const holdS = new HoldingRegister();
  const sobPer = deriv5(U_SOB);
  const sob12 = 12 * sobPer * sobPer;
  holdS.store(1, 1024);
  const sobQ = holdS.flush(sob12);

  const cascade = 50_000 * 35_600;
  const ratioRaw = palRaw / ensRaw;
  const ratioFlush = Number(palQ.n / ensQ.n);

  const evenOk = even(U_LAP) && even(U_SOB) && even(U_EVEN_SYM);
  const uniformZero = laplacian5(U_UNIFORM) === 0;
  const evenSym = laplacian5(U_EVEN_SYM);

  const crtPass =
    crtRoundtrip(lap12) &&
    crtRoundtrip(ensRaw) &&
    crtRoundtrip(palRaw) &&
    crtRoundtrip(sob12) &&
    crtRoundtrip(cascade);

  const integersPass =
    lapPer === -650 &&
    lap12 === -7800 &&
    lapQ.n === -325n &&
    lapQ.d === 2n &&
    ensRaw === 105_600 &&
    ensQ.n === 26400n &&
    palRaw === 1_689_600 &&
    palQ.n === 211200n &&
    iQ.n === 320n &&
    wQ.n === 1_536_000n &&
    sobPer === 550 &&
    sob12 === 3_630_000 &&
    sobQ.n === 226875n &&
    sobQ.d === 64n &&
    cascade === 1_780_000_000 &&
    ratioRaw === 16 &&
    palQ.n / ensQ.n === 8n &&
    uniformZero &&
    evenSym !== 0 &&
    evenOk &&
    crtPass;

  return {
    evenOk,
    lapPer,
    lap12,
    lapQ: lapQ.toString(),
    ensRaw,
    ensQ: ensQ.toString(),
    palRaw,
    palQ: palQ.toString(),
    ratioRaw,
    ratioFlush,
    iQ: iQ.toString(),
    wQ: wQ.toString(),
    sobPer,
    sob12,
    sobQ: sobQ.toString(),
    cascade,
    uniformZero,
    evenSym,
    thm2: {
      status: "OVERSTATED" as const,
      note: "Uniform field → Laplacian 0. Even-symmetric [600,800,1000,800,600] → −5600 ≠ 0. Even symmetry is not enough; constants cancel, x² does not. Dump claimed n=2 coefficient 112; recomputed 96.",
    },
    thm3: {
      status: "NOT_EXECUTED" as const,
      note: "Code uses fixed Δu=40, not h=h₀/k. Invariance 26400 is a constant input, not a continuum limit.",
    },
    thm4: {
      status: "FORBIDDEN" as const,
      note: "s_crit=D/2−1=5 is the scaling identity for D=12. One stencil on one even array (226875/64) is not a bound on all 12D NS solutions. That conclusion is not earned — the estimate is not written. THM-SOBOLEV-GAP stays OPEN.",
    },
    liveRailsUntouched: true as const,
    pass: integersPass,
  };
}

export type Ire12d = ReturnType<typeof runIre12d>;
export const IRE12D = runIre12d();
