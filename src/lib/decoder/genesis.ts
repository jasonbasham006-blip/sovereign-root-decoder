/** Two named integer objects. Do not merge. Arithmetic ≠ money ≠ title. */

export const PHASE_JUMPS = [
  98, 7, 98, 98, 14, 98, 98, 21, 98, 98, 28, 98, 98, 35, 98, 98, 42, 98, 98, 49,
] as const;

export const PULSE_SEED = [
  0, 98, 105, 203, 301, 315, 413, 511, 532, 630, 728, 756, 854, 952, 987, 1085, 1183, 1225, 1323, 1421, 1470,
] as const;

export const PULSE_PHASE_SUM = 1470;
export const PULSE_OFFSET = 603;
export const PULSE_BRIDGE = PULSE_OFFSET - PULSE_PHASE_SUM; // -867

export function phaseJumps(): number[] {
  const jumps: number[] = [98, 7];
  for (let n = 2; n <= 7; n++) jumps.push(98, 98, 7 * n);
  return jumps;
}

export function pulsePhase(k: number): number[] {
  const origin = k * PULSE_OFFSET;
  const jumps = phaseJumps();
  const out = [origin];
  let x = origin;
  for (const j of jumps) {
    x += j;
    out.push(x);
  }
  return out;
}

export function pulseStrand(phases: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < phases; k++) {
    const phase = pulsePhase(k);
    if (k === 0) out.push(...phase);
    else out.push(...phase);
  }
  return out;
}

export function highestSetBit(n: number): number {
  if (n <= 0) return 0;
  let b = 1;
  while (b * 2 <= n) b *= 2;
  return b;
}

export const MIRROR_ROW = [
  0, 1, 4, 5, 7, 8, 9, 11, 16, 18, 25, 31, 43, 60, 63, 81, 88, 92, 98, 101, 118, 101, 98, 92, 88, 81, 63, 60,
  43, 31, 25, 18, 16, 11, 9, 8, 7, 5, 4, 1, 0,
] as const;

export type PulseAudit = {
  jumpsMatch: boolean;
  seedMatch: boolean;
  phase2Offset: boolean;
  bridge: number;
  phase3Start: number;
  phase3End: number;
  pass: boolean;
};

export function auditPulse(): PulseAudit {
  const jumps = phaseJumps();
  const jumpsMatch =
    jumps.length === PHASE_JUMPS.length && jumps.every((v, i) => v === PHASE_JUMPS[i]);
  const p0 = pulsePhase(0);
  const seedMatch = p0.length === PULSE_SEED.length && p0.every((v, i) => v === PULSE_SEED[i]);
  const p1 = pulsePhase(1);
  const phase2Offset = p1.every((v, i) => v === PULSE_SEED[i] + PULSE_OFFSET);
  const p2 = pulsePhase(2);
  const pass = jumpsMatch && seedMatch && phase2Offset && PULSE_BRIDGE === -867 && p0[p0.length - 1] === 1470;
  return {
    jumpsMatch,
    seedMatch,
    phase2Offset,
    bridge: PULSE_BRIDGE,
    phase3Start: p2[0],
    phase3End: p2[p2.length - 1],
    pass,
  };
}

export type MirrorAudit = {
  length: number;
  palindrome: boolean;
  settlePalindrome: boolean;
  anchorsOnly: boolean;
  knockoff: { five: number; nine: number; seven: number; center: number };
  armSum: number;
  total: number;
  pass: boolean;
};

export function auditMirror(): MirrorAudit {
  const row = [...MIRROR_ROW];
  const palindrome = row.every((v, i) => v === row[row.length - 1 - i]);
  const settle = row.map(highestSetBit);
  const settlePalindrome = settle.every((v, i) => v === settle[settle.length - 1 - i]);
  const allowed = new Set([0, 1, 4, 8, 16, 32, 64]);
  const anchorsOnly = settle.every((v) => allowed.has(v));
  const armSum = row.slice(0, 20).reduce((a, b) => a + b, 0 as number);
  const total = row.reduce((a, b) => a + b, 0 as number);
  const pass =
    row.length === 41 &&
    palindrome &&
    settlePalindrome &&
    anchorsOnly &&
    highestSetBit(5) === 4 &&
    highestSetBit(9) === 8 &&
    highestSetBit(7) === 4 &&
    highestSetBit(118) === 64 &&
    armSum === 761 &&
    total === 1640;
  return {
    length: row.length,
    palindrome,
    settlePalindrome,
    anchorsOnly,
    knockoff: {
      five: highestSetBit(5),
      nine: highestSetBit(9),
      seven: highestSetBit(7),
      center: highestSetBit(118),
    },
    armSum,
    total,
    pass,
  };
}

export const PULSE = auditPulse();
export const MIRROR = auditMirror();
export const PHASE3 = pulsePhase(2);
