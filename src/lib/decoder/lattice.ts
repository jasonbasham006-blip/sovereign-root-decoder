import { CALLING_CARD } from "./corpus";

const NODE_MAPPING: Record<string, string> = {
  O: "Obadiah / Original",
  P: "Packard",
  K: "Key / Kinetic",
  D: "Dawn / Dewayne",
  S: "Silver / Sovereign",
  L: "Lee / Love / Liz",
  A: "Avery / Ashley / Authority",
};

export const RING_STRIDE = 3;
export const RING_START = "O";
export const GATE7_SHIFT = 7;

export type LatticeExtract = {
  ring: string;
  startIndex: number;
  pathIndices: number[];
  extracted: string[];
  token: string;
  nodes: string[];
  error?: string;
};

export function compactRing(text: string): string {
  return text.replace(/ /g, "").toUpperCase();
}

export function circularLatticeExtract(
  ringText: string = CALLING_CARD,
  startChar = "O",
  stepSize = 3,
  dynamicOperators = false,
): LatticeExtract {
  const ring = compactRing(ringText);
  const n = ring.length;
  const startIndex = ring.indexOf(startChar.toUpperCase());

  if (startIndex === -1) {
    return {
      ring,
      startIndex: -1,
      pathIndices: [],
      extracted: [],
      token: "",
      nodes: [],
      error: `Start character '${startChar}' not found in the ring.`,
    };
  }

  const pathIndices: number[] = [];
  const extracted: string[] = [];
  let currIdx = startIndex;
  let step = stepSize;

  for (let i = 0; i < 7; i++) {
    pathIndices.push(currIdx);
    extracted.push(ring[currIdx] ?? "");
    if (dynamicOperators && (i === 3 || i === 5)) {
      step = 7;
    } else {
      step = stepSize;
    }
    currIdx = (currIdx + step) % n;
  }

  const token = `${extracted.join(".")}.`;
  const nodes = extracted.map((ch) => `${ch} -> ${NODE_MAPPING[ch] ?? "Unknown"}`);

  return { ring, startIndex, pathIndices, extracted, token, nodes };
}

export type StrideLetter = { index: number; char: string };

export function strideWalk(
  ringText: string = CALLING_CARD,
  startChar = "O",
  stepSize = 3,
  count?: number,
): StrideLetter[] {
  const ring = compactRing(ringText);
  const n = ring.length;
  const startIndex = ring.indexOf(startChar.toUpperCase());
  if (startIndex === -1 || n === 0) return [];
  const len = count ?? n;
  const out: StrideLetter[] = [];
  let idx = startIndex;
  for (let i = 0; i < len; i++) {
    out.push({ index: idx, char: ring[idx] ?? "" });
    idx = (idx + stepSize) % n;
  }
  return out;
}

export type PhaseWord = { word: string; indices: number[] };

export type PhaseReport = {
  ring: string;
  token: string;
  tokenDotted: string;
  pathIndices: number[];
  tan: PhaseWord;
  cries: PhaseWord;
  sec: PhaseWord;
  sPhase: boolean;
  zFail: { cries: string; sec: string };
  deltaZS: number;
};

/** 101-over-3 continuation: OPKDSLA, then TAN, CRIES (S at index 7), SEC. */
export function callingCardPhase(ringText: string = CALLING_CARD): PhaseReport {
  const ring = compactRing(ringText);
  const walk = strideWalk(ringText, RING_START, RING_STRIDE, 28);
  const tokenLetters = walk.slice(0, 7);
  const tanLetters = walk.slice(7, 10);
  const criesIdx = [23, 26, 1, 4, 7];
  const secIdx = [7, 10, 13];
  const at = (src: string, i: number) => src[i] ?? "";
  const cries = criesIdx.map((i) => at(ring, i)).join("");
  const sec = secIdx.map((i) => at(ring, i)).join("");
  const zRing = ring.length > 7 ? `${ring.slice(0, 7)}Z${ring.slice(8)}` : ring;
  const token = tokenLetters.map((l) => l.char).join("");
  return {
    ring,
    token,
    tokenDotted: `${token.split("").join(".")}.`,
    pathIndices: tokenLetters.map((l) => l.index),
    tan: { word: tanLetters.map((l) => l.char).join(""), indices: tanLetters.map((l) => l.index) },
    cries: { word: cries, indices: criesIdx },
    sec: { word: sec, indices: secIdx },
    sPhase: ring[7] === "S" && cries === "CRIES" && sec === "SEC" && token === "OPKDSLA",
    zFail: {
      cries: criesIdx.map((i) => at(zRing, i)).join(""),
      sec: secIdx.map((i) => at(zRing, i)).join(""),
    },
    deltaZS: GATE7_SHIFT,
  };
}
