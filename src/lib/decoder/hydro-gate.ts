import { Q } from "./hydro-rational";
import { ldlt, p3Matrix, p5Matrix } from "./hydro-sos";

export type GateStatus = "UNRESOLVED" | "EMPIRICAL" | "PROVEN" | "FORBIDDEN";

export type Theorem = {
  id: string;
  status: GateStatus;
  premises: string[];
  conclusion: string;
  preserved: string[];
};

const ALLOWED = new Set([
  "PARITY_EVEN",
  "GAUSS_BONNET_INVARIANT",
  "RATIONAL_SOS_PSD",
  "SL3R_TRACE_FREE",
]);

export type PromotionResult = {
  id: string;
  ok: boolean;
  reason: string;
  pivots?: string[];
};

export class PromotionGate {
  registry = new Map<string, Theorem>();

  register(thm: Theorem): void {
    this.registry.set(thm.id, { ...thm, premises: [...thm.premises], preserved: [...thm.preserved] });
  }

  /** String witnesses are refused. Only an exact-Q matrix that LDLᵀ-factors with D_i>0 promotes. */
  verify(id: string, matrix: Q[][] | null): PromotionResult {
    const thm = this.registry.get(id);
    if (!thm) return { id, ok: false, reason: "missing theorem" };
    if (thm.status === "FORBIDDEN") {
      return { id, ok: false, reason: "FORBIDDEN — will not promote" };
    }
    for (const tag of thm.preserved) {
      if (!ALLOWED.has(tag)) return { id, ok: false, reason: `unsafe tag ${tag}` };
    }
    for (const p of thm.premises) {
      const prem = this.registry.get(p);
      if (!prem || prem.status !== "PROVEN") {
        return { id, ok: false, reason: `unproven premise ${p}` };
      }
    }
    if (!matrix || matrix.length === 0) {
      return { id, ok: false, reason: "matrix required — string witnesses refused" };
    }
    const { D, psd } = ldlt(matrix);
    const pivots = D.map((d) => d.toString());
    if (!psd) return { id, ok: false, reason: `indefinite pivot ${pivots[pivots.length - 1]}`, pivots };
    thm.status = "PROVEN";
    return { id, ok: true, reason: "LDLᵀ D_i>0 over ℚ", pivots };
  }
}

export function hydroPromotion(): {
  p3Gram: PromotionResult;
  p5Gram: PromotionResult;
  p3Identity: PromotionResult;
  p7: PromotionResult;
  casimir: PromotionResult;
  axiomG: PromotionResult;
  clayNs: PromotionResult;
} {
  const gate = new PromotionGate();
  gate.register({
    id: "THM-PARITY-ZERO",
    status: "PROVEN",
    premises: [],
    conclusion: "even u ⇒ ∫ ωᵀSω = 0",
    preserved: ["PARITY_EVEN"],
  });
  gate.register({
    id: "SL3R-SPECTRUM",
    status: "PROVEN",
    premises: [],
    conclusion: "χ² ≤ 2/3",
    preserved: ["SL3R_TRACE_FREE"],
  });
  gate.register({
    id: "SOS-P3-GRAM",
    status: "EMPIRICAL",
    premises: ["THM-PARITY-ZERO"],
    conclusion: "Q_P3 ≻ 0",
    preserved: ["PARITY_EVEN", "RATIONAL_SOS_PSD"],
  });
  gate.register({
    id: "SOS-P5-GRAM",
    status: "EMPIRICAL",
    premises: ["THM-PARITY-ZERO"],
    conclusion: "Q_P5 ≻ 0",
    preserved: ["PARITY_EVEN", "RATIONAL_SOS_PSD"],
  });
  gate.register({
    id: "SUPREMUM-P3-IDENTITY",
    status: "EMPIRICAL",
    premises: ["SOS-P3-GRAM"],
    conclusion: "χ²(H₃)=35/6561 is the SOS optimum",
    preserved: ["RATIONAL_SOS_PSD"],
  });
  gate.register({
    id: "SUPREMUM-P7",
    status: "EMPIRICAL",
    premises: ["THM-PARITY-ZERO"],
    conclusion: "χ²(P₇)=143/7¹¹",
    preserved: ["RATIONAL_SOS_PSD"],
  });
  gate.register({
    id: "CASIMIR-VARIATION",
    status: "EMPIRICAL",
    premises: ["SL3R-SPECTRUM"],
    conclusion: "δ² ζ(-1/2) named",
    preserved: ["GAUSS_BONNET_INVARIANT"],
  });
  gate.register({
    id: "AXIOM-G",
    status: "FORBIDDEN",
    premises: [],
    conclusion: "0=1 in ℤ",
    preserved: [],
  });
  gate.register({
    id: "CLAY-NS",
    status: "FORBIDDEN",
    premises: [],
    conclusion: "smooth NSE global bound from 1118",
    preserved: [],
  });

  const p3Gram = gate.verify("SOS-P3-GRAM", p3Matrix());
  const p5Gram = gate.verify("SOS-P5-GRAM", p5Matrix());
  const p3Identity = gate.verify("SUPREMUM-P3-IDENTITY", null);
  const p7 = gate.verify("SUPREMUM-P7", null);
  const casimir = gate.verify("CASIMIR-VARIATION", null);
  const axiomG = gate.verify("AXIOM-G", p3Matrix());
  const clayNs = gate.verify("CLAY-NS", p3Matrix());
  return { p3Gram, p5Gram, p3Identity, p7, casimir, axiomG, clayNs };
}
