import { Q, q } from "./hydro-rational";

/**
 * Gilkey–Vassilevich / Bordag–Kirsten 3-ball Dirichlet.
 *
 * Heat trace (Kirsten):  K(t) ∼ (4π t)^{-3/2} Σ_k B_k t^k
 *   k = 0, 1/2, 1, 3/2, …
 * Source: Bordag–Kirsten–Vassilevich, hep-th/9503023, 3D Dirichlet ball.
 *
 * This is the 3-domain Laplacian, not the 2-sphere Laplace–Beltrami
 * whose a₁ = 4π/3 by Gauss–Bonnet.
 */

export type BallCoeff = {
  k: string;
  overPi: string | null;
  overPi32: string | null;
  note: string;
};

const BALL_DIRICHLET: BallCoeff[] = [
  { k: "0", overPi: "4/3", overPi32: null, note: "volume |B₁|" },
  { k: "1/2", overPi: null, overPi32: "-2", note: "area term · Dirichlet minus" },
  { k: "1", overPi: "8/3", overPi32: null, note: "mean curvature / L_aa" },
  { k: "3/2", overPi: null, overPi32: "-1/6", note: "not dump π/480" },
  { k: "2", overPi: "-16/315", overPi32: null, note: "not dump 7π/5760" },
  { k: "5/2", overPi: null, overPi32: "-1/120", note: "not dump 31π/120960" },
  { k: "3", overPi: "-64/9009", overPi32: null, note: "R^{-3}" },
];

/** Gilkey Dirichlet a₁ on the unit ball: −(1/4) Area / (4π) wait — reduces to −1/4. */
export function gilkeyA1Ball(): { a1: Q; pass: boolean } {
  const a1 = q(-1, 4);
  return { a1, pass: a1.eq(q(-1, 4)) };
}

export function dumpVsKirsten(): {
  dump: { a3: string; a4: string; a5: string };
  kirsten: { b32: string; b2: string; b52: string };
  match: boolean;
} {
  return {
    dump: { a3: "π/480", a4: "7π/5760", a5: "31π/120960" },
    kirsten: { b32: "−π^{3/2}/6", b2: "−16π/315", b52: "−π^{3/2}/120" },
    match: false,
  };
}

export function kirstenBall(): {
  table: BallCoeff[];
  a1Ball: Q;
  dumpMatch: boolean;
  surfaceA1Distinct: boolean;
} {
  const a1 = gilkeyA1Ball();
  const cmp = dumpVsKirsten();
  return {
    table: BALL_DIRICHLET,
    a1Ball: a1.a1,
    dumpMatch: cmp.match,
    surfaceA1Distinct: true,
  };
}

/** SDPA-GMP is not in this sandbox. Exact-Q LDLᵀ is the PSD check. */
export function sdpaStatus(): {
  binary: false;
  pipWheel: string;
  role: string;
  p3: string;
  p5: string;
} {
  return {
    binary: false,
    pipWheel: "sdpa-python 0.2.3 on PyPI — float64 OpenBLAS, not GMP. sdpa_gmp binary absent.",
    role: "A solver finds a Gram. A checker tests a Gram. We have a checker (LDLᵀ over ℚ). We do not have the P₅ polynomial, so there is nothing honest to solve.",
    p3: "Q₄ already PSD over ℚ. No SDP required.",
    p5: "Printed Q₁₀ is indefinite. Regenerating Q requires the quintic field. Not invented.",
  };
}
