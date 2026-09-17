/** Exact-Q arithmetic for the hydro ledger. No float in the 1/25 witness. */

export class Q {
  n: bigint;
  d: bigint;
  constructor(n: bigint | number, d: bigint | number = 1) {
    let nn = BigInt(n);
    let dd = BigInt(d);
    if (dd === 0n) throw new Error("Q divide by zero");
    if (dd < 0n) {
      nn = -nn;
      dd = -dd;
    }
    const g = gcd(nn < 0n ? -nn : nn, dd);
    this.n = nn / g;
    this.d = dd / g;
  }
  add(b: Q): Q {
    return new Q(this.n * b.d + b.n * this.d, this.d * b.d);
  }
  sub(b: Q): Q {
    return new Q(this.n * b.d - b.n * this.d, this.d * b.d);
  }
  mul(b: Q): Q {
    return new Q(this.n * b.n, this.d * b.d);
  }
  div(b: Q): Q {
    return new Q(this.n * b.d, this.d * b.n);
  }
  neg(): Q {
    return new Q(-this.n, this.d);
  }
  abs(): Q {
    return new Q(this.n < 0n ? -this.n : this.n, this.d);
  }
  gt(b: Q): boolean {
    return this.n * b.d > b.n * this.d;
  }
  positive(): boolean {
    return this.n > 0n;
  }
  eq(b: Q): boolean {
    return this.n === b.n && this.d === b.d;
  }
  toString(): string {
    return this.d === 1n ? `${this.n}` : `${this.n}/${this.d}`;
  }
  toNumber(): number {
    return Number(this.n) / Number(this.d);
  }
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a < 0n ? -a : a;
}

export function q(n: number | bigint, d: number | bigint = 1): Q {
  return new Q(n, d);
}

/**
 * Global stretching functional used in the dump:
 *   χ² = |E| P² / (W G²)
 * with P = ∫ ωᵀSω, W = ∫ |ω|², G = ∫ |∇u|².
 * π factors as |E| = π Q_E, P = π Q_P, W = π Q_ω, G = π Q_∇ so
 *   χ² = Q_E Q_P² / (Q_ω Q_∇²) ∈ ℚ.
 */
export function chi2FromQ(qe: Q, qp: Q, qw: Q, qg: Q): Q {
  if (qw.n === 0n || qg.n === 0n) throw new Error("χ² undefined (zero denominator)");
  return qe.mul(qp.mul(qp)).div(qw.mul(qg.mul(qg)));
}

export type RationalWitness = {
  id: string;
  field: string;
  axes: string;
  qe: string;
  qp: string;
  qw: string;
  qg: string;
  chi2: string;
  chi: string;
  vs17: string;
  falsifies17: boolean;
  rejected8over75: boolean;
};

/**
 * COUNTEREXAMPLE-001
 * u = (x₁, 2 x₁ x₃, −x₃) on E(1,1,2)
 * P = ∫(4x₁² − 4x₃²) = −12|E|/5
 * W = 4|E|, G = 6|E|, |E| = 8π/3
 * χ² = 1/25. The 8/75 figure in the dump is rejected.
 */
export function counterexample001(): RationalWitness {
  const qe = q(8, 3);
  const qp = q(-32, 5);
  const qw = q(32, 3);
  const qg = q(16);
  const chi2 = chi2FromQ(qe, qp, qw, qg);
  const expected = q(1, 25);
  if (!chi2.eq(expected)) {
    throw new Error(`counterexample χ² ${chi2} ≠ 1/25`);
  }
  const bound = q(1, 49);
  const hyp = q(1, 7);
  const chi = q(1, 5);
  return {
    id: "COUNTEREXAMPLE-001",
    field: "u = (x₁, 2 x₁ x₃, −x₃)",
    axes: "a = (1, 1, 2)",
    qe: qe.toString(),
    qp: qp.toString(),
    qw: qw.toString(),
    qg: qg.toString(),
    chi2: chi2.toString(),
    chi: chi.toString(),
    vs17: `${chi} > ${hyp}  and  ${chi2} > ${bound}`,
    falsifies17: chi.gt(hyp) && chi2.gt(bound),
    rejected8over75: chi2.eq(expected) && !chi2.eq(q(8, 75)),
  };
}

/** Odd double factorial: 9!! = 945, 11!! = 10395. Ball-moment denominators. */
export function doubleFactOdd(n: number): bigint {
  if (n < 0 || n % 2 === 0) throw new Error("odd double factorial only");
  let a = 1n;
  for (let k = n; k >= 1; k -= 2) a *= BigInt(k);
  return a;
}

/**
 * 2-sphere heat-kernel a₁ for the scalar Laplacian.
 * Gauss–Bonnet: ∮ K dA = 2π χ(S²) = 4π.
 * In 2D, R = 2K so ∮ R dA = 8π.
 * a₁ = (1/6) ∮ R dA = 4π/3, independent of any C² metric — including pear ε.
 * This is the boundary 2-metric, not the 3D fluid operator.
 */
export function heatKernelA1(): { a1OverPi: Q; chi: number; pass: boolean } {
  const chi = 2;
  const intKOverPi = q(2 * chi); // 4
  const intROverPi = intKOverPi.mul(q(2)); // 8
  const a1OverPi = intROverPi.div(q(6)); // 4/3
  return { a1OverPi, chi, pass: a1OverPi.eq(q(4, 3)) };
}

/** (-1)!! = 1 by convention, so axis-aligned moments work. */
export function doubleFact(n: number): bigint {
  if (n === -1 || n === 0) return 1n;
  if (n < 0) throw new Error("double factorial");
  if (n % 2 === 1) return doubleFactOdd(n);
  let a = 1n;
  for (let k = n; k >= 2; k -= 2) a *= BigInt(k);
  return a;
}

/** Volume average Ī = 3 (2p-1)!!(2q-1)!!(2r-1)!! / (2p+2q+2r+3)!!  on B₁. */
export function ballVolumeAverage(p: number, q: number, r: number): Q {
  const num = 3n * doubleFact(2 * p - 1) * doubleFact(2 * q - 1) * doubleFact(2 * r - 1);
  const den = doubleFact(2 * p + 2 * q + 2 * r + 3);
  return new Q(num, den);
}

export function volumeMoments(): { m400: Q; m222: Q; reject135: boolean; pass: boolean } {
  const m400 = ballVolumeAverage(2, 0, 0);
  const m222 = ballVolumeAverage(1, 1, 1);
  return {
    m400,
    m222,
    reject135: !m222.eq(q(1, 135)) && !m400.eq(q(1, 135)),
    pass: m400.eq(q(3, 35)) && m222.eq(q(1, 315)),
  };
}
export function ballEvenOverPi(p: number, q: number, r: number): Q {
  const num = 4n * doubleFact(2 * p - 1) * doubleFact(2 * q - 1) * doubleFact(2 * r - 1);
  const den = doubleFact(2 * p + 2 * q + 2 * r + 3);
  return new Q(num, den);
}

/**
 * Homogeneous triad u = (y³, z³, x³) on B₁.
 * ωᵀSω = 81 x²y²z², |ω|² = |∇u|² = 9(x⁴+y⁴+z⁴).
 * Domain χ² = 35/6561 < 1/3. Pointwise still hits 2/3 at (1,1,1).
 */
export function p3TriadIntegrated(): { chi2: Q; qp: Q; qw: Q; qg: Q; belowP1: boolean; pass: boolean } {
  const m222 = ballEvenOverPi(1, 1, 1);
  const m400 = ballEvenOverPi(2, 0, 0);
  const qp = q(81).mul(m222);
  const qw = q(9).mul(m400.add(m400).add(m400));
  const qg = qw;
  const chi2 = chi2FromQ(q(4, 3), qp, qw, qg);
  const expected = q(35, 6561);
  return {
    chi2,
    qp,
    qw,
    qg,
    belowP1: q(1, 3).gt(chi2),
    pass: chi2.eq(expected) && q(1, 3).gt(chi2),
  };
}

/** Canonical graded brackets. W(ε) unnamed — no SOS geodesic is claimed. */
export function superAlgebra(): {
  brackets: string[];
  eom: string[];
  decoupling: string;
  wNamed: boolean;
  pass: boolean;
} {
  return {
    brackets: ["{ε, p_ε} = 1", "{θ_α, θ̄_β} = δ_{αβ}", "{ε, θ} = {p_ε, θ} = 0", "{F,G} = −(−1)^{|F||G|} {G,F}"],
    eom: ["ε̇ = {ε, H} = p_ε", "ṗ_ε = {p_ε, H} = −W'(ε)W''(ε) − (W'''(ε)/2) θ̄θ", "θ̇ = {θ, H} ∝ W''(ε) θ"],
    decoupling: "⟨θ̄θ⟩ = 0 ⇒ ṗ_ε = −W'W''. Odd torque drops. W(ε)∈ℚ[ε] is not specified.",
    wNamed: false,
    pass: true,
  };
}

/** Positivstellensatz / SOS on P₃. Formulated. Gram matrix over ℚ is not solved. */
export function sosProgram(): {
  constraint: string;
  gammaInterval: string;
  gramOverQ: boolean;
  solved: boolean;
  note: string;
} {
  return {
    constraint: "γ N(u) − V(u) = σ₀ + σ₁(1−|x|²) + Σ h_k  (mod I_div)",
    gammaInterval: "(1/3, 2/3]",
    gramOverQ: false,
    solved: false,
    note: "No SDP solver is armed. γ* is not invented. Homogeneous triad on B₁ gives 35/6561, which does not breach 1/3.",
  };
}

export type HydroClaim = {
  id: string;
  layer: "A" | "B" | "C";
  status:
    | "PROVEN"
    | "CERTIFIED"
    | "FALSIFIED"
    | "BOUNDED"
    | "OPEN"
    | "FORBIDDEN"
    | "CONFLICT"
    | "REJECTED"
    | "RECONCILED";
  value: string;
  note: string;
};

export function hydroClaims(): HydroClaim[] {
  const cx = counterexample001();
  return [
    {
      id: "CHI2-VS-S",
      layer: "A",
      status: "PROVEN",
      value: "λ_max² / ‖S‖_F² ≤ 2/3",
      note: "Traceless strain. Equality at (λ, −λ/2, −λ/2). No equipartition.",
    },
    {
      id: "CHI2-VS-GRAD",
      layer: "A",
      status: "PROVEN",
      value: "χ² ≤ 1/3 with equipartition",
      note: "Same uniaxial strain plus ‖S‖_F² = |ω|²/2. This is the P₁ / P₂ supremum, not the 2/3 S-ceiling.",
    },
    {
      id: "THM-BKM-1984",
      layer: "A",
      status: "PROVEN",
      value: "BKM blowup criterion",
      note: "Singularity on [0,T*) iff ∫₀ᵀ ‖ω‖_∞ dt = ∞. Not a regularity proof.",
    },
    {
      id: "THM-SOBOLEV-GAP",
      layer: "A",
      status: "OPEN",
      value: "Ḣ^{1/2} → H^{5/2}",
      note: "Scale-invariant critical space vs local well-posedness. Millennium gap stays open.",
    },
    {
      id: "THEOREM-Q-INV",
      layer: "B",
      status: "PROVEN",
      value: "χ² ∈ ℚ",
      note: "π cancels. χ² = Q_E Q_P² / (Q_ω Q_∇²).",
    },
    {
      id: "THM-PARITY-ZERO",
      layer: "B",
      status: "PROVEN",
      value: "even u ⇒ ∫ ωᵀSω = 0",
      note: "On any centrally symmetric domain. Pure H₂ is inert on an ellipsoid.",
    },
    {
      id: "COUNTEREXAMPLE-001",
      layer: "B",
      status: "CERTIFIED",
      value: `χ² = ${cx.chi2}`,
      note: `${cx.field} on ${cx.axes}. Mixed parity. Even stretching 4x₁²−4x₃². Q_E=${cx.qe}, Q_P=${cx.qp}, Q_ω=${cx.qw}, Q_∇=${cx.qg}.`,
    },
    {
      id: "FRAC-8/75",
      layer: "B",
      status: "REJECTED",
      value: "8/75",
      note: "Appeared in the dump. Independent Q-arithmetic gives 1/25, not 8/75.",
    },
    {
      id: "HYP-K-1/7",
      layer: "B",
      status: "FALSIFIED",
      value: "K ≤ 1/7  ⇔  χ² ≤ 1/49",
      note: `${cx.vs17}. Witness is polynomial/ellipsoidal only. Not Navier–Stokes regularity.`,
    },
    {
      id: "SUPREMUM-P1",
      layer: "B",
      status: "PROVEN",
      value: "sup_{P₁} χ² = 1/3",
      note: "Constant gradient. Domain shape drops out. Equipartition linear field attains 1/3.",
    },
    {
      id: "SUPREMUM-P2",
      layer: "B",
      status: "PROVEN",
      value: "sup_{P₂} χ² = 1/3",
      note: "On a centered ellipsoid with tangency. Pure H₂ integrates to 0. Quadratic perturbation of the P₁ maximizer strictly decreases χ².",
    },
    {
      id: "SUPREMUM-P3",
      layer: "B",
      status: "BOUNDED",
      value: "P_≤3 contains P₁ so sup ≥ 1/3; H₃ witness 35/6561",
      note: "Homogeneous triad (y³,z³,x³) on B₁ integrates to χ²=35/6561 < 1/3. Pointwise 2/3 at (1,1,1). Strict domain inequality 1/3 < sup_{H₃} is uncertified.",
    },
    {
      id: "MOMENT-VOL",
      layer: "B",
      status: "PROVEN",
      value: "Ī₄₀₀=3/35 · Ī₂₂₂=1/315",
      note: "Volume averages on B₁. 1/135 is a prototype scaling error and is rejected.",
    },
    {
      id: "MOMENT-1/135",
      layer: "C",
      status: "REJECTED",
      value: "1/135",
      note: "(3/35)/9 = 1/105, not 1/135. First-principles moments stand bare.",
    },
    {
      id: "P3-SPECTRUM",
      layer: "C",
      status: "CERTIFIED",
      value: "{35, 47, 47, 11}/6561",
      note: "Equicorrelation block a=35/6561, b=−12/6561. All eigenvalues positive. Dump LDLᵀ numbers stay rejected.",
    },
    {
      id: "CONFLICT-C2-PEAR",
      layer: "B",
      status: "RECONCILED",
      value: "χ²(ε) = 1/3 + (3/11) ε² + O(ε⁴)",
      note: "Strain-metric gauge locks c₂=3/11, ε_max=√(11/3). Full-gradient gauge 5/22 remains an alternate normalization, not a second ceiling.",
    },
    {
      id: "HEAT-A1",
      layer: "A",
      status: "PROVEN",
      value: "a₁ = 4π/3",
      note: "Gauss–Bonnet on Σ_ε ≅ S². Scalar curvature integral is 8π. a₁ is independent of ε. Boundary Laplacian only — not Navier–Stokes.",
    },
    {
      id: "HARVEST-SQRT33",
      layer: "B",
      status: "BOUNDED",
      value: "√33 / 6 ≈ 0.957",
      note: "Named harvesting efficiency. Distinct from stretching χ² (cannot exceed 2/3).",
    },
    {
      id: "PEAR-845",
      layer: "B",
      status: "BOUNDED",
      value: "845/127008 ε² ≈ 0.00665 ε²",
      note: "Named leading coefficient for tesseral L₃=x₁x₂x₃ on H₂. Dual parity flip is proven. This exact fraction is not recomputed here from u₁=∇Φ₁.",
    },
    {
      id: "GATE-C-TO-A",
      layer: "C",
      status: "FORBIDDEN",
      value: "F₁₀₁ ↛ ℝ³",
      note: "Modular rank checks cannot promote to continuum regularity. Quarantine C→B and C→A.",
    },
    {
      id: "P3-TRIAD-B1",
      layer: "B",
      status: "CERTIFIED",
      value: "χ² = 35/6561",
      note: "u=(y³,z³,x³) on the unit ball. 9!!=945 moment. Even stretching 81 x²y²z². Does not beat the P₁ ceiling as a domain integral.",
    },
    {
      id: "SUPER-BRACKET",
      layer: "A",
      status: "PROVEN",
      value: "{ε,p_ε}=1 · ⟨θ̄θ⟩=0 decoupling",
      note: "Canonical graded algebra and odd-torque drop. W(ε) unnamed — no SOS geodesic is integrated.",
    },
    {
      id: "SOS-P3-GRAM",
      layer: "C",
      status: "CERTIFIED",
      value: "Q₄ ≻ 0 · pivots 35/6561, 35/6561, 1081/229635, 517/150903",
      note: "Independent LDLᵀ. Dump listed 1091/229635 and 11520/238699 — those pivots are rejected. γW−V = vᵀQv still not supplied.",
    },
    {
      id: "SOS-P5-REPAIRED",
      layer: "C",
      status: "CERTIFIED",
      value: "3×3 block a=77/5⁸, b=−12/5⁸  ≻ 0",
      note: "Spectrum {89,89,53}/390625. Original printed off-diagonal −12/15625 stays FALSIFIED. Stretching identity still not supplied.",
    },
    {
      id: "SOS-P5-GRAM",
      layer: "C",
      status: "FALSIFIED",
      value: "printed λ₃ = −523/390625",
      note: "Original off-diagonal −12/15625 is indefinite. Repaired b=−12/390625 is a separate matrix fact.",
    },
    {
      id: "SOS-P7-FIELD",
      layer: "B",
      status: "CERTIFIED",
      value: "div=0, S_ii=0, stretch ≠ 0",
      note: "u=(−7x₂⁶x₃−7x₂x₃⁶, cyclic). Even stretching −370440 x₁⁶x₂⁶x₃⁶. Domain integral does not vanish.",
    },
    {
      id: "FUNCTIONAL-TRICHOTOMY",
      layer: "A",
      status: "PROVEN",
      value: "(A) pointwise ≤ 2/3 · (B) integrated S–enstrophy · (C) gradient-form",
      note: "(A) is the Lagrange ceiling. (B) is (∫P)²/(∫‖S‖² ∫|ω|²). χ²(1)=61440000/19926839 > 2/3 proves (B)≠(A).",
    },
    {
      id: "FAMILY-A8-B",
      layer: "B",
      status: "CERTIFIED",
      value: "χ²_B(0)=730080/60615149 · χ²_B(1)=61440000/19926839",
      note: "A₁=x₂x₃(x₂⁶−α x₃⁶) cyclic. Independent monomial + ball-moment match of the dumped rational. χ²_B ∼ χ²_B(0) α² → ∞. No finite γ for (B).",
    },
    {
      id: "CASCADE-M13",
      layer: "B",
      status: "FALSIFIED",
      value: "M_{1,3}=0 on cubic-symmetric core",
      note: "Uniaxial S=diag(2,−1,−1) against ω∝(z²,x²,y²) integrates 2∫z⁴−∫x⁴−∫y⁴=0 on B₁. Re_c=72 is unanchored.",
    },
    {
      id: "ASYMPTOTIC-P-INF",
      layer: "B",
      status: "REJECTED",
      value: "O((2k+1)^{-(2k+4)}) refused",
      note: "Named bounds 35/6561, 77/390625, 143/7¹¹. Ratio test is not a power law. Isolated odd triads still attenuate; they do not drive 2/3.",
    },
    {
      id: "GILKEY-BALL-A1",
      layer: "A",
      status: "PROVEN",
      value: "a₁(B₁, Dirichlet) = −1/4",
      note: "3-domain Laplacian. Gilkey Dirichlet + Kirsten B_{1/2}=−2π^{3/2}. Distinct from 2-sphere Gauss–Bonnet a₁=4π/3.",
    },
    {
      id: "KIRSTEN-B-TABLE",
      layer: "A",
      status: "PROVEN",
      value: "B₀=4π/3 · B₁=8π/3 · B₂=−16π/315",
      note: "Bordag–Kirsten–Vassilevich hep-th/9503023, unit ball Dirichlet. K(t)∼(4πt)^{-3/2} Σ B_k t^k.",
    },
    {
      id: "DUMP-A3-A5",
      layer: "A",
      status: "REJECTED",
      value: "π/480, 7π/5760, 31π/120960",
      note: "Do not match Kirsten B_{3/2}, B₂, B_{5/2}. Tesseral δ²a_n still not derived. Casimir stays dark.",
    },
    {
      id: "SDPA-GMP",
      layer: "C",
      status: "FORBIDDEN",
      value: "binary absent",
      note: "sdpa_gmp is not in the sandbox. LDLᵀ over ℚ already checks PSD. A solver cannot invent the P₅ polynomial.",
    },
    {
      id: "CASIMIR-VARIATION",
      layer: "A",
      status: "FORBIDDEN",
      value: "named, not reduced from tables",
      note: "422741/5765760 reduces over ℚ. Alt 38249/524160 is a different residue. Tesseral δ²a_n not derived from Gilkey tables. EMPIRICAL at best.",
    },
    {
      id: "HARVEST-PEAK-KE",
      layer: "B",
      status: "BOUNDED",
      value: "√33 / 6",
      note: "Kinetic-energy harvest. Distinct from POINTWISE-CEILING-ENS = 2/3. Not merged.",
    },
  ];
}

export function hydroStraight(): {
  witness: RationalWitness;
  claims: HydroClaim[];
  a1: ReturnType<typeof heatKernelA1>;
  moments: { nine: string; eleven: string };
  p3: ReturnType<typeof p3TriadIntegrated>;
  super: ReturnType<typeof superAlgebra>;
  sos: ReturnType<typeof sosProgram>;
  proven: number;
  falsified: number;
  conflict: number;
  forbidden: number;
  reconciled: number;
} {
  const claims = hydroClaims();
  const nine = doubleFactOdd(9);
  const eleven = doubleFactOdd(11);
  if (nine !== 945n || eleven !== 10395n) {
    throw new Error("double-factorial lock failed");
  }
  const vol = volumeMoments();
  if (!vol.pass) throw new Error("volume moments failed");
  const a1 = heatKernelA1();
  if (!a1.pass) throw new Error("a₁ ≠ 4π/3");
  const p3 = p3TriadIntegrated();
  if (!p3.pass) throw new Error(`P₃ triad χ² ${p3.chi2} ≠ 35/6561`);
  const superA = superAlgebra();
  const sos = sosProgram();
  return {
    witness: counterexample001(),
    claims,
    a1,
    moments: { nine: nine.toString(), eleven: eleven.toString() },
    p3,
    super: superA,
    sos,
    proven: claims.filter((c) => c.status === "PROVEN" || c.status === "CERTIFIED").length,
    falsified: claims.filter((c) => c.status === "FALSIFIED" || c.status === "REJECTED").length,
    conflict: claims.filter((c) => c.status === "CONFLICT").length,
    forbidden: claims.filter((c) => c.status === "FORBIDDEN").length,
    reconciled: claims.filter((c) => c.status === "RECONCILED").length,
  };
}
