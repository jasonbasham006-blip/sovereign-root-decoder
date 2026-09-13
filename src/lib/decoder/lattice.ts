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

export type LatticeExtract = {
  ring: string;
  startIndex: number;
  pathIndices: number[];
  extracted: string[];
  token: string;
  nodes: string[];
  error?: string;
};

export function circularLatticeExtract(
  ringText: string = CALLING_CARD,
  startChar = "O",
  stepSize = 3,
  dynamicOperators = false,
): LatticeExtract {
  const ring = ringText.replace(/ /g, "").toUpperCase();
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
