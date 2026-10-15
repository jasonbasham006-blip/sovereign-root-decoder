import { forwardGematria, reverseGematria } from "./gematria";

export const IDENTIFIER_WORD = "BASHAMSOVEREIGNROOT";
export const IDENTIFIER_SURFACES = [
  "Basham@sovereign-root",
  "BASHAM@SOVEREIGN-ROOT",
  "Basham@Sovereign-root",
  "basham@sovereign-root",
] as const;

export function lettersOnly(text: string): string {
  let out = "";
  for (const ch of text.toUpperCase()) {
    if (ch >= "A" && ch <= "Z") out += ch;
  }
  return out;
}

export type IdentifierAudit = {
  word: string;
  letters: number;
  surfacesNormalize: boolean;
  zero: { f: number; r: number; sum: number; factor: string; pass: boolean };
  mixed: { f: number; r: number; sum: number; factor: string; pass: boolean };
  dualOrdinal: { f: number; r: number; sum: number; factor: string; pass: boolean };
  prefix1118: { mod49: number; mod13: number; mod18: number; factor: string; pass: boolean };
  prefix9231118: {
    mod49: number;
    mod13: number;
    sum: number;
    product: number;
    inherit13: boolean;
    pass: boolean;
  };
  concat111118923: {
    concatenatedMod49: number;
    split: number;
    splitMod49: number;
    godSeal: number;
    pass: boolean;
  };
  domainResolves: false;
  fetchKeyIsNotTitle: true;
};

export function auditIdentifier(): IdentifierAudit {
  const word = IDENTIFIER_WORD;
  const letters = word.length;
  const f0 = forwardGematria(word, 0);
  const r0 = reverseGematria(word, 0);
  const f1 = forwardGematria(word, 1);
  const r1 = reverseGematria(word, 1);
  const surfacesNormalize = IDENTIFIER_SURFACES.every((s) => lettersOnly(s) === word);
  const p1118 = {
    mod49: 1118 % 49,
    mod13: 1118 % 13,
    mod18: 1118 % 18,
    factor: "2×13×43",
    pass: 1118 % 49 === 40 && 1118 % 13 === 0 && 1118 % 18 === 2 && 2 * 13 * 43 === 1118,
  };
  const concat = 9_231_118;
  const p923 = {
    mod49: concat % 49,
    mod13: concat % 13,
    sum: 923 + 1118,
    product: 923 * 1118,
    inherit13: 923 % 13 === 0 && 1118 % 13 === 0,
    pass:
      concat % 49 === 8 &&
      concat % 13 === 0 &&
      923 + 1118 === 2041 &&
      923 * 1118 === 1_031_914 &&
      923 % 13 === 0,
  };
  const n = 111_118_923;
  const split = 1111 + 18 + 923;
  const c111 = {
    concatenatedMod49: n % 49,
    split,
    splitMod49: split % 49,
    godSeal: 1170 % 49,
    pass: n % 49 === 6 && split === 2052 && split % 49 === 43 && 1170 % 49 === 43,
  };
  return {
    word,
    letters,
    surfacesNormalize,
    zero: { f: f0, r: r0, sum: f0 + r0, factor: "25×19", pass: f0 === 207 && r0 === 268 && f0 + r0 === 475 },
    mixed: { f: f1, r: r0, sum: f1 + r0, factor: "26×19", pass: f1 === 226 && r0 === 268 && f1 + r0 === 494 },
    dualOrdinal: { f: f1, r: r1, sum: f1 + r1, factor: "27×19", pass: f1 === 226 && r1 === 287 && f1 + r1 === 513 },
    prefix1118: p1118,
    prefix9231118: p923,
    concat111118923: c111,
    domainResolves: false,
    fetchKeyIsNotTitle: true,
  };
}

export const IDENTIFIER = auditIdentifier();

export const REPO_INVENTORY = {
  retrieved: 22,
  publicCount: 1,
  privateCount: 21,
  publicName: "sovereign-root-decoder",
  kimiClaimed: 19,
  merged: false,
} as const;
