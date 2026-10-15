/** F_101 reductions of the H-H-L pulse. Arithmetic only. Not a Clay proof. */

export const F101 = 101;
export const GALOIS_ROOTS = [23, 79] as const;
export const HEAVY_RAIL = 98;

/** Infinite H-H-L: warmup H then L(n=1), then repeating H,H,L(n=2,3,...) */
export function hhlTerm(seed: number, step: number): number {
  let x = seed;
  if (step === 0) return x;
  x += 98;
  if (step === 1) return x;
  x += 7;
  if (step === 2) return x;
  let n = 2;
  let s = 2;
  while (s < step) {
    x += 98;
    s++;
    if (s === step) return x;
    x += 98;
    s++;
    if (s === step) return x;
    x += 7 * n;
    s++;
    n++;
    if (s === step) return x;
  }
  return x;
}

export function firstContact(seed: number, target: number, maxStep = 400): number | null {
  for (let i = 1; i <= maxStep; i++) {
    const r = ((hhlTerm(seed, i) % F101) + F101) % F101;
    if (r === target) return i;
  }
  return null;
}

export function isF101Root(r: number): boolean {
  return (((r * r - r - 1) % F101) + F101) % F101 === 0;
}

export function auditField101() {
  const sq23 = (23 * 23) % F101;
  const xCrt = 3_398_738;
  const xMod101 = xCrt % F101;
  const andGate = 316 & 217;
  const contact79 = firstContact(603, 79);
  const contact23 = firstContact(603, 23);
  const dims = [1, 51, 316, 217, 882, 1118, 2340, xCrt];
  const aInt = dims.reduce((s, d, k) => s + (d << k), 0);
  const aMod = aInt % 1118;
  const poly23 = isF101Root(23);
  const poly79 = isF101Root(79);
  return {
    poly23,
    poly79,
    rootsPass: poly23 && poly79,
    sum: (23 + 79) % F101,
    prod: (23 * 79) % F101,
    sq23,
    sq23IsNot79: sq23 === 24,
    railMod: HEAVY_RAIL % F101,
    railIsMinus3: (98 + 3) % F101 === 0,
    xMod101,
    xMod101IsNot0: xMod101 === 88,
    andGate,
    andGateIsNot208: andGate === 24,
    xorBoundary: 1 ^ 51,
    contact79,
    contact23,
    contactPass: contact79 === 53 && contact23 === 65,
    aInt,
    aMod,
    aModPass: aMod === 461,
    milleniumForbidden: true as const,
    pass:
      poly23 &&
      poly79 &&
      sq23 === 24 &&
      xMod101 === 88 &&
      andGate === 24 &&
      contact79 === 53 &&
      contact23 === 65 &&
      aMod === 461,
  };
}

export const FIELD101 = auditField101();
