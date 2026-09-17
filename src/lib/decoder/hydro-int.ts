import { volumeMoments, q, type Q } from "./hydro-rational";
import { CHI2_B_ALPHA0, CHI2_B_ALPHA1, CHI2_B_ALPHA32 } from "./hydro-alpha";

export type IntPair = { n: string; d: string; frac: string };

function pair(x: Q): IntPair {
  return { n: x.n.toString(), d: x.d.toString(), frac: x.toString() };
}

/**
 * Whole-integer certificate path. No float in N, D, gcd, or reduction.
 * Volume average Ī = 3(2p−1)!!(2q−1)!!(2r−1)!! / (2p+2q+2r+3)!!
 * Distinct from ballEvenOverPi which keeps the 4π raw integral / π.
 */
export function integerPipeline() {
  const vol = volumeMoments();
  const half = q(1, 2);
  if (half.n !== 1n || half.d !== 2n) throw new Error("1/2 is not a float");
  const pass =
    vol.pass &&
    vol.m400.n === 3n &&
    vol.m400.d === 35n &&
    vol.m222.n === 1n &&
    vol.m222.d === 315n &&
    CHI2_B_ALPHA0.n === 730080n &&
    CHI2_B_ALPHA0.d === 60615149n &&
    CHI2_B_ALPHA1.n === 61440000n &&
    CHI2_B_ALPHA1.d === 19926839n;
  if (!pass) throw new Error("integer pipeline drift");
  return {
    floatsUsed: false as const,
    pass,
    m400: pair(vol.m400),
    m222: pair(vol.m222),
    reject135: vol.reject135,
    chi2B: {
      a0: pair(CHI2_B_ALPHA0),
      a1: pair(CHI2_B_ALPHA1),
      a32: pair(CHI2_B_ALPHA32),
    },
    half: pair(half),
    note: "Volume average (3/ factor), not raw ∫/π (4/ factor). 1/135 remains rejected.",
  };
}
