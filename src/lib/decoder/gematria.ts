import { CONSTRAINED_CORPUS, TONGUES, type TongueName } from "./corpus";

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
  tongues: { name: TongueName; base: number; sum: number }[];
} {
  const { fw, rv } = fourteenTracks(phrase);
  return {
    cleaned: cleanText(phrase),
    fw,
    rv,
    tongues: TONGUES.map(([name, base]) => ({
      name,
      base,
      sum: evaluateWordSum(phrase, base),
    })),
  };
}
