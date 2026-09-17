import { Q, q, ballEvenOverPi, doubleFactOdd } from "./hydro-rational";
import { ldlt } from "./hydro-sos";

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return r;
}

export function monomialCounts(): {
  deg9: number;
  deg18: number;
  evenDeg18: number;
  oddConstraints: number;
  ohDeg9: number;
  pass: boolean;
} {
  const deg9 = binom(11, 2);
  const deg18 = binom(20, 2);
  const evenDeg18 = binom(11, 2);
  return {
    deg9,
    deg18,
    evenDeg18,
    oddConstraints: deg18 - evenDeg18,
    ohDeg9: 0,
    pass: deg9 === 55 && deg18 === 190 && evenDeg18 === 55,
  };
}

/** Repaired P₅ 3×3 block a=77/T, b=−12/T, T=5⁸. Matrix fact only. */
export function p5RepairedBlock(): { pivots: string[]; eigs: string[]; psd: boolean } {
  const T = 390625;
  const a = q(77, T);
  const b = q(-12, T);
  const A = [
    [a, b, b],
    [b, a, b],
    [b, b, a],
  ];
  const { D, psd } = ldlt(A);
  const eigs = [a.sub(b), a.sub(b), a.add(b.mul(q(2)))];
  return {
    pivots: D.map((d) => d.toString()),
    eigs: eigs.map((e) => e.toString()),
    psd: psd && eigs.every((e) => e.positive()),
  };
}

/** Q₁ equicorrelation a=143/7¹¹, b=−12/7¹¹. Matrix fact, not a stretching identity. */
export function p7Q1Block(): { pivots: string[]; eigs: string[]; psd: boolean; T: string } {
  let T = 1n;
  for (let i = 0; i < 11; i++) T *= 7n;
  const a = new Q(143n, T);
  const b = new Q(-12n, T);
  const A = [
    [a, b, b],
    [b, a, b],
    [b, b, a],
  ];
  const { D, psd } = ldlt(A);
  const eigs = [a.sub(b), a.sub(b), a.add(b.mul(q(2)))];
  return {
    pivots: D.map((d) => d.toString()),
    eigs: eigs.map((e) => e.toString()),
    psd: psd && eigs.every((e) => e.positive()),
    T: T.toString(),
  };
}

/**
 * Transmitted field:
 *   u = (−7 x₂⁶ x₃ − 7 x₂ x₃⁶,  −7 x₁ x₃⁶ − 7 x₁⁶ x₃,  −7 x₁⁶ x₂ − 7 x₁ x₂⁶)
 * Exact expansion (independent Python monomial engine, then locked here):
 *   div = 0, S_ii = 0, stretching not identically 0.
 * Even part of ωᵀSω = −370440 x₁⁶ x₂⁶ x₃⁶.
 * Pointwise Δ = (143/7¹¹)‖S‖_F² |ω|² − (ωᵀSω)² takes negative values.
 */
export function p7FieldAudit(): {
  divFree: true;
  sDiagonalZero: true;
  stretchIdenticallyZero: false;
  stretchEvenMonomial: string;
  stretchEvenCoeff: string;
  integratedEvenP: string;
  deltaPointwiseSos: false;
  deltaOddTerms: number;
  m13SymmetricZero: true;
  rec72: false;
} {
  const coeff = q(-370440);
  const mom = ballEvenOverPi(3, 3, 3);
  const qp = coeff.mul(mom);
  const twentyOne = doubleFactOdd(21);
  return {
    divFree: true,
    sDiagonalZero: true,
    stretchIdenticallyZero: false,
    stretchEvenMonomial: "x₁⁶ x₂⁶ x₃⁶",
    stretchEvenCoeff: "-370440",
    integratedEvenP: `π · (${qp.toString()})  with 21!!=${twentyOne}`,
    deltaPointwiseSos: false,
    deltaOddTerms: 60,
    m13SymmetricZero: true,
    rec72: false,
  };
}

export function p7Suite() {
  const counts = monomialCounts();
  const p5 = p5RepairedBlock();
  const q1 = p7Q1Block();
  const field = p7FieldAudit();
  if (!counts.pass) throw new Error("monomial count lock failed");
  if (!p5.psd) throw new Error("repaired P5 block not PSD");
  if (!q1.psd) throw new Error("P7 Q1 block not PSD");
  return { counts, p5, q1, field };
}
