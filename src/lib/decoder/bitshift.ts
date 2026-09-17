/** Bit-shift protocol: even ring 2ℤ plus a quarantined half-bit. No float in the path. */

export type BitSplit = { x: number; k: number; s: number; rebuilt: number; pass: boolean };

export function splitEven(x: number): BitSplit {
  const n = x | 0;
  const k = n >> 1;
  const s = n & 1;
  const rebuilt = (k << 1) | s;
  return { x: n, k, s, rebuilt, pass: rebuilt === n };
}

export function gridSlot(x: number): {
  x: number;
  k7: number;
  sector: number;
  g: number;
  gDouble: number;
  is480Space: false;
} {
  const n = x | 0;
  const k7 = n & 127;
  const sector = Math.floor(n / 128) % 4;
  const g = sector * 128 + k7 + 1;
  return { x: n, k7, sector, g, gDouble: 2 * g - 1, is480Space: false };
}

export function bitshiftCore() {
  const xCrt = 3_398_738;
  const moduli = [49, 1118, 79, 107] as const;
  const residues = moduli.map((m) => xCrt % m);
  const garner = [0, 46, 62, 0] as const;
  const reconstructed =
    garner[0] + garner[1] * 49 + garner[2] * 49 * 1118 + garner[3] * 49 * 1118 * 79;
  const shift1118 = 1118 >> 1;
  const f101sq = (23 * 23) % 101;
  const algebraic1420 = (923 * 20) / 13;
  const g480 = gridSlot(480);
  const split = splitEven(1118);
  const fermat = [3, 5, 17, 257];
  return {
    xCrt,
    moduli,
    residues,
    residuesExpect: [0, 18, 0, 97] as const,
    crtPass: residues[0] === 0 && residues[1] === 18 && residues[2] === 0 && residues[3] === 97,
    garner,
    reconstructed,
    garnerPass: reconstructed === xCrt,
    factor: "2 · 7² · 79 · 439",
    shift1118,
    shiftPass: shift1118 === 559 && 13 * 43 === 559,
    f101: { r: [23, 79] as const, sum: (23 + 79) % 101, prod: (23 * 79) % 101, sq23: f101sq },
    f101SqIsNot79: f101sq === 24,
    algebraic1420,
    algebraic1420Int: 1420,
    nistNote: "NIST HI line is 1420.4057517667 MHz. 18460/13 = 1420 exactly. Not equal.",
    g480,
    g480Pass: g480.k7 === 96 && g480.sector === 3 && g480.g === 481 && g480.gDouble === 961,
    split,
    fermat,
    f3: 2 ** 8 + 1,
    f3Index: "F₃, fourth Fermat number counting from F₀",
    gate1420: 702 + 718,
    gate1420Pass: 702 + 718 === 1420,
  };
}

export type BitshiftCore = ReturnType<typeof bitshiftCore>;
