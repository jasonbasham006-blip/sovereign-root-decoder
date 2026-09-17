import { Q, q } from "./hydro-rational";

/**
 * Functional trichotomy. The dump used one symbol for three objects.
 * Independent integration of A^(8)(α) = (x₂x₃(x₂⁶ − α x₃⁶), cyclic) on B₁.
 */

export const CHI2_POINTWISE = q(2, 3);
export const CHI2_P1 = q(1, 3);

/** (B) at α=0,1,3/2 — recomputed by monomial expansion + ball moments. */
export const CHI2_B_ALPHA0 = q(730080, 60615149);
export const CHI2_B_ALPHA1 = q(61440000, 19926839);
export const CHI2_B_ALPHA32 = q(225699615000, 54007054469);

export function claimedChi2B(alpha: Q): Q {
  const a = alpha;
  const a2 = a.mul(a);
  const a3 = a2.mul(a);
  const a4 = a2.mul(a2);
  const Qpoly = q(39).mul(a3).add(q(601).mul(a2)).add(q(601).mul(a)).add(q(39));
  const num = q(7200).mul(Qpoly).mul(Qpoly);
  const den = q(909227235)
    .mul(a4)
    .add(q(259361894).mul(a3))
    .add(q(1488774830).mul(a2))
    .add(q(259361894).mul(a))
    .add(q(909227235));
  return num.div(den);
}

export function familyAudit() {
  const f0 = claimedChi2B(q(0));
  const f1 = claimedChi2B(q(1));
  const f32 = claimedChi2B(q(3, 2));
  if (!f0.eq(CHI2_B_ALPHA0)) throw new Error("χ²(0) formula drift");
  if (!f1.eq(CHI2_B_ALPHA1)) throw new Error("χ²(1) formula drift");
  if (!f32.eq(CHI2_B_ALPHA32)) throw new Error("χ²(3/2) formula drift");
  const gammaStar = q(143, 1977326743);
  const ratio = CHI2_B_ALPHA0.div(gammaStar);
  return {
    pointwise: CHI2_POINTWISE.toString(),
    integratedB: {
      a0: CHI2_B_ALPHA0.toString(),
      a1: CHI2_B_ALPHA1.toString(),
      a32: CHI2_B_ALPHA32.toString(),
    },
    a1ExceedsTwoThirds: CHI2_B_ALPHA1.gt(CHI2_POINTWISE),
    gammaStar: gammaStar.toString(),
    minOverGamma: ratio.toString(),
    leading: "χ²(α) ∼ χ²(0) α² → ∞",
    s11AtAlpha1: "14x₁⁶ − 7x₂⁶ − 7x₃⁶  (not identically 0)",
    decision:
      "(A) γ=2/3 is the only finite theorem. (B) has no finite γ on this family. 143/7¹¹ is not a bound for either.",
  };
}
