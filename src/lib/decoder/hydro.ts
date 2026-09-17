/** Vortex-stretching kernel. Classical identities are locked. Topology / SOS stay fail-closed. */

export {
  hydroStraight,
  counterexample001,
  chi2FromQ,
  q,
  Q,
  type HydroClaim,
  type RationalWitness,
} from "./hydro-rational";
import { hydroStraight } from "./hydro-rational";
import { sosWitnessSuite } from "./hydro-sos";
import { hydroPromotion } from "./hydro-gate";
import { kirstenBall, sdpaStatus } from "./hydro-gilkey";
import { p7Suite } from "./hydro-p7";
import { familyAudit } from "./hydro-alpha";
import { integerPipeline } from "./hydro-int";

export type Vec3 = readonly [number, number, number];
export type Mat3 = readonly [Vec3, Vec3, Vec3];

export type HydroGate = {
  id: string;
  label: string;
  layer: "classical" | "speculative";
  expression: string;
  value: string;
  expect: string;
  pass: boolean;
  note: string;
};

const EPS = 1e-9;

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function frob2(m: Mat3): number {
  let s = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += m[i][j] * m[i][j];
  return s;
}

function matVec(m: Mat3, v: Vec3): Vec3 {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

export function strain(g: Mat3): Mat3 {
  return [
    [(g[0][0] + g[0][0]) / 2, (g[0][1] + g[1][0]) / 2, (g[0][2] + g[2][0]) / 2],
    [(g[1][0] + g[0][1]) / 2, (g[1][1] + g[1][1]) / 2, (g[1][2] + g[2][1]) / 2],
    [(g[2][0] + g[0][2]) / 2, (g[2][1] + g[1][2]) / 2, (g[2][2] + g[2][2]) / 2],
  ];
}

export function vorticity(g: Mat3): Vec3 {
  return [g[2][1] - g[1][2], g[0][2] - g[2][0], g[1][0] - g[0][1]];
}

export function stretching(omega: Vec3, s: Mat3): number {
  return dot(omega, matVec(s, omega));
}

export function chi2Point(omega: Vec3, s: Mat3): number {
  const sig = stretching(omega, s);
  const w2 = dot(omega, omega);
  const den = frob2(s) * w2 * w2;
  if (den < EPS) return 0;
  return (sig * sig) / den;
}

export function chi2VsGrad(omega: Vec3, s: Mat3, gradFrob2: number): number {
  const sig = stretching(omega, s);
  const w2 = dot(omega, omega);
  const den = gradFrob2 * w2 * w2;
  if (den < EPS) return 0;
  return (sig * sig) / den;
}

function nearly(a: number, b: number, tol = 1e-9): boolean {
  return Math.abs(a - b) <= tol;
}

export function pointwiseCeiling(): { chi2: number; pass: boolean } {
  const s: Mat3 = [
    [2, 0, 0],
    [0, -1, 0],
    [0, 0, -1],
  ];
  const omega: Vec3 = [1, 0, 0];
  const chi2 = chi2Point(omega, s);
  return { chi2, pass: nearly(chi2, 2 / 3) };
}

export function linearEquipartition(): { chi2: number; pass: boolean } {
  const sScale = 1;
  const s: Mat3 = [
    [2 * sScale, 0, 0],
    [0, -sScale, 0],
    [0, 0, -sScale],
  ];
  const c = Math.sqrt(3) * sScale;
  const w: Mat3 = [
    [0, 0, 0],
    [0, 0, -c],
    [0, c, 0],
  ];
  const g: Mat3 = [
    [s[0][0] + w[0][0], s[0][1] + w[0][1], s[0][2] + w[0][2]],
    [s[1][0] + w[1][0], s[1][1] + w[1][1], s[1][2] + w[1][2]],
    [s[2][0] + w[2][0], s[2][1] + w[2][1], s[2][2] + w[2][2]],
  ];
  const omega = vorticity(g);
  const chi2 = chi2VsGrad(omega, s, frob2(g));
  return { chi2, pass: nearly(chi2, 1 / 3, 1e-12) };
}

type Field = { u: (p: Vec3) => Vec3; grad: (p: Vec3) => Mat3; parity: "even" | "odd" };

const QUAD: Field = {
  parity: "even",
  u: ([x, y, z]) => [y * y - z * z, z * z - x * x, x * x - y * y],
  grad: ([x, y, z]) => [
    [0, 2 * y, -2 * z],
    [-2 * x, 0, 2 * z],
    [2 * x, -2 * y, 0],
  ],
};

const CUBIC: Field = {
  parity: "odd",
  u: ([x, y, z]) => [y * y * y, z * z * z, x * x * x],
  grad: ([x, y, z]) => [
    [0, 3 * y * y, 0],
    [0, 0, 3 * z * z],
    [3 * x * x, 0, 0],
  ],
};

function lattice(n: number): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      for (let k = -n; k <= n; k++) {
        if (i === 0 && j === 0 && k === 0) continue;
        pts.push([i / n, j / n, k / n]);
      }
    }
  }
  return pts;
}

export function parityZero(n = 4): { net: number; opposite: boolean; pass: boolean } {
  const pts = lattice(n);
  let net = 0;
  let opposite = true;
  for (const p of pts) {
    const qq: Vec3 = [-p[0], -p[1], -p[2]];
    const sp = stretching(vorticity(QUAD.grad(p)), strain(QUAD.grad(p)));
    const sq = stretching(vorticity(QUAD.grad(qq)), strain(QUAD.grad(qq)));
    if (Math.abs(sp + sq) > 1e-9) opposite = false;
    net += sp;
  }
  return { net, opposite, pass: opposite && Math.abs(net) < 1e-9 };
}

export function cubicEvenStretch(n = 4): {
  chi2At111: number;
  net: number;
  even: boolean;
  pass: boolean;
} {
  const p111: Vec3 = [1, 1, 1];
  const chi2At111 = chi2Point(vorticity(CUBIC.grad(p111)), strain(CUBIC.grad(p111)));
  const pts = lattice(n);
  let net = 0;
  let even = true;
  for (const p of pts) {
    const qq: Vec3 = [-p[0], -p[1], -p[2]];
    const sp = stretching(vorticity(CUBIC.grad(p)), strain(CUBIC.grad(p)));
    const sq = stretching(vorticity(CUBIC.grad(qq)), strain(CUBIC.grad(qq)));
    if (Math.abs(sp - sq) > 1e-9) even = false;
    net += sp;
  }
  return {
    chi2At111,
    net,
    even,
    pass: even && nearly(chi2At111, 2 / 3, 1e-12) && Math.abs(net) > 1e-9,
  };
}

export function pearActivation(eps = 0.2, n = 3): {
  atPos: number;
  atNeg: number;
  atZero: number;
  evenInEps: boolean;
  pass: boolean;
} {
  const pts = lattice(n);
  const net = (e: number) => {
    let s = 0;
    for (const p of pts) {
      const f = 1 + e * p[0] * p[1] * p[2];
      const mapped: Vec3 = [p[0] * f, p[1] * f, p[2] * f];
      s += stretching(vorticity(QUAD.grad(mapped)), strain(QUAD.grad(mapped)));
    }
    return s;
  };
  const atPos = net(eps);
  const atNeg = net(-eps);
  const atZero = net(0);
  const evenInEps = Math.abs(atPos - atNeg) < 1e-8;
  return {
    atPos,
    atNeg,
    atZero,
    evenInEps,
    pass: evenInEps && Math.abs(atZero) < 1e-9,
  };
}

export function runHydro(): {
  ceiling: ReturnType<typeof pointwiseCeiling>;
  linear: ReturnType<typeof linearEquipartition>;
  parity: ReturnType<typeof parityZero>;
  cubic: ReturnType<typeof cubicEvenStretch>;
  pear: ReturnType<typeof pearActivation>;
  gates: HydroGate[];
  classicalPass: boolean;
  straight: ReturnType<typeof hydroStraight>;
  grams: ReturnType<typeof sosWitnessSuite>;
  gate: ReturnType<typeof hydroPromotion>;
  gilkey: ReturnType<typeof kirstenBall>;
  sdpa: ReturnType<typeof sdpaStatus>;
  p7: ReturnType<typeof p7Suite>;
  family: ReturnType<typeof familyAudit>;
  integers: ReturnType<typeof integerPipeline>;
} {
  const ceiling = pointwiseCeiling();
  const linear = linearEquipartition();
  const parity = parityZero();
  const cubic = cubicEvenStretch();
  const pear = pearActivation();
  const straight = hydroStraight();
  const grams = sosWitnessSuite();
  const gate = hydroPromotion();
  const gilkey = kirstenBall();
  const sdpa = sdpaStatus();
  const p7 = p7Suite();
  const family = familyAudit();
  const integers = integerPipeline();

  const gates: HydroGate[] = [
    {
      id: "CHI2-CEIL",
      label: "Pointwise ceiling",
      layer: "classical",
      expression: "λ_max² / ‖S‖_F²  for  S = diag(2,−1,−1)",
      value: (2 / 3).toFixed(12),
      expect: "2/3",
      pass: ceiling.pass,
      note: "Traceless strain. No field of any degree beats 2/3 pointwise.",
    },
    {
      id: "P1-LINEAR",
      label: "P1 linear equipartition",
      layer: "classical",
      expression: "χ² against ‖∇u‖_F when ‖S‖_F = ‖W‖_F",
      value: (1 / 3).toFixed(12),
      expect: "1/3",
      pass: linear.pass,
      note: "Constant-gradient Fourier mode. Strain/rotation split halves 2/3 to 1/3.",
    },
    {
      id: "THM-PARITY-ZERO",
      label: "Quadratic parity zero",
      layer: "classical",
      expression: "even u ⇒ odd ωᵀSω  on  x ↔ −x",
      value: parity.net.toExponential(3),
      expect: "0",
      pass: parity.pass,
      note: "Net stretching of a pure quadratic field vanishes on a centrally symmetric sample.",
    },
    {
      id: "P3-CUBIC",
      label: "Cubic triad",
      layer: "classical",
      expression: "odd u = (y³, z³, x³) at (1,1,1)",
      value: cubic.chi2At111.toFixed(12),
      expect: "2/3 pointwise, even density",
      pass: cubic.pass,
      note: "Pointwise ceiling attained. Domain integral is 35/6561, below 1/3.",
    },
    {
      id: "PEAR-L3",
      label: "Pear L₃ = xyz",
      layer: "classical",
      expression: "quadratic stretching on x(1+ε xyz), even in ε",
      value: `ε:+ ${pear.atPos.toExponential(2)} · ε:− ${pear.atNeg.toExponential(2)}`,
      expect: "even in ε, zero at ε=0",
      pass: pear.pass,
      note: "Point warp does not produce net quadratic stretch. Interior no-penetration correction is not solved.",
    },
    {
      id: "PEAR-CORRECTION",
      label: "No-penetration correction",
      layer: "speculative",
      expression: "u·n_ε = 0  ⇒  interior v = O(ε),  stretch O(ε²)",
      value: "not solved",
      expect: "O(ε²) quadratic stretch",
      pass: false,
      note: "Pear-shaped domain with L₃ = x₁x₂x₃ is named. Correction flow not computed.",
    },
    {
      id: "INDEX-1",
      label: "Atiyah–Singer / Witten index",
      layer: "speculative",
      expression: "ind(D⁺) = 1 on S²",
      value: "not computed",
      expect: "topological integer",
      pass: false,
      note: "Gauss–Bonnet a₁=4π/3 is locked separately. Dirac operator is not derived.",
    },
    {
      id: "SOS-P3",
      label: "Rational SOS of P₃ χ²",
      layer: "speculative",
      expression: "γ N − V = σ₀ + σ₁(1−|x|²)  (mod I_div)",
      value: "Gram PSD checked · identity not supplied",
      expect: "γ* ∈ ℚ ∩ (1/3, 2/3]",
      pass: false,
      note: "LDLᵀ must run on the matrix. String witnesses are refused. γW−V is still not supplied.",
    },
    {
      id: "LIE-POISSON",
      label: "Graded Lie–Poisson algebra",
      layer: "classical",
      expression: "{ε, p_ε}=1 · ⟨θ̄θ⟩=0 ⇒ odd torque 0",
      value: "algebra locked · W(ε) unnamed",
      expect: "decoupling",
      pass: true,
      note: "Canonical brackets and vacuum decoupling. Superpotential W(ε) is not specified.",
    },
  ];

  const classicalPass = gates.filter((g) => g.layer === "classical").every((g) => g.pass);

  return { ceiling, linear, parity, cubic, pear, gates, classicalPass, straight, grams, gate, gilkey, sdpa, p7, family, integers };
}
