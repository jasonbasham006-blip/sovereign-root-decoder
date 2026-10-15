import {
  CONSTRAINED_CORPUS,
  KEY_ELEMENTS,
  NARA_TITLES,
  PIVOT_INDEX,
  PIVOT_LATIN_TARGET,
  TUNING_BOOKS,
  TONGUES,
  type TongueName,
} from "./corpus";

export function cleanText(text: string): string {
  return text.replace(/[ \-']/g, "");
}

/** Standard forward gematria with Caesar shift: A=offset, B=offset+1… */
export function forwardGematria(text: string, offset = 0): number {
  let total = 0;
  for (const ch of text.toUpperCase()) {
    if (ch >= "A" && ch <= "Z") {
      total += ch.charCodeAt(0) - 65 + offset;
    }
  }
  return total;
}

/** Atbash inverted gematria with Caesar shift: Z=offset, Y=offset+1… */
export function reverseGematria(text: string, offset = 0): number {
  let total = 0;
  for (const ch of text.toUpperCase()) {
    if (ch >= "A" && ch <= "Z") {
      total += 25 - (ch.charCodeAt(0) - 65) + offset;
    }
  }
  return total;
}

export function numberToTongueWord(n: number, base: number): number[] {
  if (n <= 0) return [0];
  const digits: number[] = [];
  let temp = n;
  while (temp > 0) {
    digits.push(temp % base);
    temp = Math.floor(temp / base);
  }
  return digits;
}

export function tongueWordValue(digits: number[]): number {
  return digits.reduce((a, b) => a + b, 0);
}

export function fourteenTracks(text: string): { fw: number[]; rv: number[] } {
  const cleaned = cleanText(text);
  const fw = Array.from({ length: 7 }, (_, o) => forwardGematria(cleaned, o));
  const rv = Array.from({ length: 7 }, (_, o) => reverseGematria(cleaned, o));
  return { fw, rv };
}

export function evaluateWordSum(item: string, base: number): number {
  const { fw, rv } = fourteenTracks(item);
  const allVals = [...fw, ...rv];
  let total = 0;
  for (const val of allVals) {
    total += tongueWordValue(numberToTongueWord(val, base));
  }
  return total;
}

export type TongueSums = Record<TongueName, number>;

export type CorpusDecode = {
  text: string;
  fw: number[];
  rv: number[];
  final: TongueSums;
};

export function tongueSumsFor(text: string): TongueSums {
  const { fw, rv } = fourteenTracks(text);
  const allVals = [...fw, ...rv];
  const final = {} as TongueSums;
  for (const [name, base] of TONGUES) {
    let total = 0;
    for (const val of allVals) {
      total += tongueWordValue(numberToTongueWord(val, base));
    }
    final[name] = total;
  }
  return final;
}

export function decodeItem(item: string): CorpusDecode {
  const { fw, rv } = fourteenTracks(item);
  return { text: item, fw, rv, final: tongueSumsFor(item) };
}

export function decodeCorpus(items: readonly string[] = CONSTRAINED_CORPUS): CorpusDecode[] {
  return items.map(decodeItem);
}

export function decodePhrase(phrase: string): {
  cleaned: string;
  fw: number[];
  rv: number[];
  ordinal: number;
  sixScale: number;
  filters: { katan: number; mod49: number; mod13: number };
  tongues: { name: TongueName; base: number; sum: number }[];
} {
  const { fw, rv } = fourteenTracks(phrase);
  const ordinal = forwardGematria(cleanText(phrase), 1);
  return {
    cleaned: cleanText(phrase),
    fw,
    rv,
    ordinal,
    sixScale: ordinal * 6,
    filters: {
      katan: ordinal % 9,
      mod49: ordinal % 49,
      mod13: ordinal % 13,
    },
    tongues: TONGUES.map(([name, base]) => ({
      name,
      base,
      sum: evaluateWordSum(phrase, base),
    })),
  };
}

export type TongueResidue = {
  name: TongueName;
  base: number;
  residue: number;
  letter: string;
};

export function tongueResidues(n: number): TongueResidue[] {
  return TONGUES.map(([name, base]) => {
    const residue = n % base;
    return { name, base, residue, letter: String.fromCharCode(65 + residue) };
  });
}

export const ESAEESA = tongueResidues(1170);

export function esaeesaSums(): {
  residues: number[];
  word: string;
  residueSum: number;
  residueMod49: number;
  letterOrdinalA1: number;
  letterOrdinalMod49: number;
} {
  const residues = ESAEESA.map((r) => r.residue);
  const word = ESAEESA.map((r) => r.letter).join("");
  const residueSum = residues.reduce((a, b) => a + b, 0);
  const letterOrdinalA1 = ESAEESA.reduce((a, r) => a + (r.letter.charCodeAt(0) - 64), 0);
  return {
    residues,
    word,
    residueSum,
    residueMod49: residueSum % 49,
    letterOrdinalA1,
    letterOrdinalMod49: letterOrdinalA1 % 49,
  };
}

export type PivotAudit = {
  corpusLength: number;
  books: number;
  keys: number;
  nara: number;
  arrayIndex49: string;
  baptistArrayIndex: number;
  baptistSimple: { a0: number; a1: number; r0: number };
  baptistLatin: number;
  baptistGeez: number;
  latin219Count: number;
  latin219Titles: string[];
  sortedIndex49: string;
  baptistSortedIndex: number;
  below219: number;
  pulleyPresent: false;
  latinIdentityHolds: boolean;
};

/** Independent of simple A=1 gematria. 219 is the 14-track Latin word sum. */
export function auditPivot(): PivotAudit {
  const decoded = decodeCorpus();
  const sorted = [...decoded].sort((a, b) => a.final.Latin - b.final.Latin);
  const baptist = decoded.find((d) => d.text === "BAPTIST");
  const latin219Titles = decoded.filter((d) => d.final.Latin === 219).map((d) => d.text);
  const baptistLatin = baptist?.final.Latin ?? -1;
  return {
    corpusLength: CONSTRAINED_CORPUS.length,
    books: TUNING_BOOKS.length,
    keys: KEY_ELEMENTS.length,
    nara: NARA_TITLES.length,
    arrayIndex49: CONSTRAINED_CORPUS[49] ?? "",
    baptistArrayIndex: CONSTRAINED_CORPUS.indexOf("BAPTIST"),
    baptistSimple: {
      a0: forwardGematria("BAPTIST", 0),
      a1: forwardGematria("BAPTIST", 1),
      r0: reverseGematria("BAPTIST", 0),
    },
    baptistLatin,
    baptistGeez: baptist?.final["Ge'ez"] ?? -1,
    latin219Count: latin219Titles.length,
    latin219Titles,
    sortedIndex49: sorted[PIVOT_INDEX]?.text ?? "",
    baptistSortedIndex: sorted.findIndex((d) => d.text === "BAPTIST"),
    below219: decoded.filter((d) => d.final.Latin < 219).length,
    pulleyPresent: false,
    latinIdentityHolds: baptistLatin === PIVOT_LATIN_TARGET,
  };
}

export const KY_TOWNS = [
  {
    name: "PAINTSVILLE",
    ordinalExpect: 139,
    sixExpect: 834,
    jewishOperator: 1054,
    hebrewOperator: 271,
  },
  {
    name: "STAFFORDSVILLE",
    ordinalExpect: 168,
    sixExpect: 1008,
    jewishOperator: 1181,
    hebrewOperator: 471,
  },
] as const;
