/** No-resurrection lock. Needles are assembled at runtime so they are not live claims. */

function join(parts: readonly string[]): string {
  return parts.join("");
}

export const LIVE_CRT_MODULI = [49, 1118, 79, 107] as const;
export const LIVE_CRT_M = LIVE_CRT_MODULI.reduce((a, b) => a * b, 1);
export const LIVE_X = 3_398_738;
export const LIVE_X_MOD_13 = LIVE_X % 13;
export const LIVE_GATE18 = (718 ^ 892) & 1118;

const RETIRED_XRF = [
  join(["+", "28", ".", "54"]),
  join(["+", "4", ".", "80"]),
  join(["0.064", "72"]),
  join(["12", ".", "76"]),
  join(["96", ".", "81"]),
  join(["1.968", "1"]),
] as const;

const RETIRED_DAIVE = [
  join(["46203", "4366"]),
  join(["X \u2261 0 (mod 13)"]),
  join(["X = 0 (mod 13)"]),
] as const;

const RETIRED_PHRASES = [join(["do not ", "file"]), join(["do not ", "plead"])] as const;

export type GateHit = { id: string; fragment: string };

export type ResurrectionReport = {
  live: {
    crtM: number;
    x: number;
    xMod13: number;
    gate18: number;
    pass: boolean;
  };
  hits: GateHit[];
  status: "GATE_PASSED" | "GATE_BLOCKED";
  drift: string | null;
};

export function liveArithmeticPass(): boolean {
  return LIVE_CRT_M === 463_072_246 && LIVE_X_MOD_13 === 5 && LIVE_GATE18 === 18;
}

function keyMergeHit(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("asset") && lower.includes("mesh") && lower.includes("1111111");
}

function remainderZeroHit(text: string): boolean {
  const compact = text.replace(/\s+/g, " ");
  if (/\b3398738\b/.test(compact) && /%\s*13\s*={1,3}\s*0\b/.test(compact)) return true;
  if (/\bX\b[^.\n]{0,24}(mod\s*13)[^.\n]{0,12}\b0\b/i.test(compact) && !/\b5\b/.test(compact)) {
    return /mod\s*13/.test(compact) && /\b0\b/.test(compact);
  }
  return false;
}

/** Scan a draft. Empty text only checks live arithmetic. */
export function scanDraft(text: string): ResurrectionReport {
  const liveOk = liveArithmeticPass();
  const hits: GateHit[] = [];
  const src = text ?? "";

  for (const fragment of RETIRED_XRF) {
    if (src.includes(fragment)) hits.push({ id: "no-retired-needles", fragment });
  }
  for (const fragment of RETIRED_DAIVE) {
    if (src.includes(fragment)) hits.push({ id: "no-retired-needles", fragment });
  }
  const lower = src.toLowerCase();
  for (const fragment of RETIRED_PHRASES) {
    if (lower.includes(fragment)) hits.push({ id: "no-retired-needles", fragment });
  }
  if (keyMergeHit(src)) hits.push({ id: "no-key-merge", fragment: "asset/mesh/1111111" });
  if (remainderZeroHit(src)) hits.push({ id: "no-retired-needles", fragment: "X mod 13 = 0" });

  const blocked = !liveOk || hits.length > 0;
  return {
    live: {
      crtM: LIVE_CRT_M,
      x: LIVE_X,
      xMod13: LIVE_X_MOD_13,
      gate18: LIVE_GATE18,
      pass: liveOk,
    },
    hits,
    status: blocked ? "GATE_BLOCKED" : "GATE_PASSED",
    drift: blocked ? "CLASS DRIFT — do not emit T-class, claims, or resonance" : null,
  };
}

export function formatGateScan(report: ResurrectionReport): string {
  if (report.status === "GATE_PASSED") return "GATE_PASSED";
  const needles = report.hits.map((h) => h.fragment).join(",");
  const lines = [
    needles ? `[FAIL] no-retired-needles: ${needles}` : "[FAIL] live-arithmetic",
    "GATE_BLOCKED",
    report.drift ?? "",
  ];
  return lines.filter(Boolean).join("\n");
}

export const CLEAN_GATE = scanDraft("");

/** Poison draft for the live scanner. Assembled — not a live claim. */
export function retiredSample(): string {
  return [RETIRED_XRF[0], RETIRED_PHRASES[0], RETIRED_DAIVE[0]].join(",");
}
