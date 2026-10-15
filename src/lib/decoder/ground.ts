/** Integer identities from the "corrected ground" paste. Axiom G is not a ring. */

/** Standard mispar hechrechi. Only letters that appear in Deut 6:4. */
export const MISPAR: Record<string, number> = {
  א: 1,
  ד: 4,
  ה: 5,
  ו: 6,
  ח: 8,
  י: 10,
  ל: 30,
  מ: 40,
  נ: 50,
  ע: 70,
  ר: 200,
  ש: 300,
};

export function misparWord(word: string): number {
  let s = 0;
  for (const ch of word) {
    const v = MISPAR[ch];
    if (v === undefined) throw new Error(`unmapped Hebrew letter ${ch}`);
    s += v;
  }
  return s;
}

export const SHEMA_WORDS = {
  שמע: misparWord("שמע"),
  ישראל: misparWord("ישראל"),
  יהוה: misparWord("יהוה"),
  אלהינו: misparWord("אלהינו"),
  אחד: misparWord("אחד"),
} as const;

export const SHEMA_SUM =
  SHEMA_WORDS.שמע + SHEMA_WORDS.ישראל + SHEMA_WORDS.יהוה + SHEMA_WORDS.אלהינו + SHEMA_WORDS.יהוה + SHEMA_WORDS.אחד;

export const K_SIGMA = 3_398_738 * 828 + 8 * 219 + 2;
export const K_SIGMA_PATCH = K_SIGMA + 5; // replace the +2 terminal with +7 — operator, not derived

export function auditGround() {
  const r18num = 20;
  const r18den = 13;
  const algebraic1420 = (923 * r18num) / r18den;
  const bashamOrdinal = 2 + 1 + 19 + 8 + 1 + 13;
  const shemaFactor = 2 * 13 * 43;
  const halfShema = SHEMA_SUM >> 1;
  const lettersPass =
    SHEMA_WORDS.שמע === 410 &&
    SHEMA_WORDS.ישראל === 541 &&
    SHEMA_WORDS.יהוה === 26 &&
    SHEMA_WORDS.אלהינו === 102 &&
    SHEMA_WORDS.אחד === 13;
  return {
    axiomG: {
      status: "FORBIDDEN" as const,
      note: "0=1 and 2=0 together force 1=0. That is the zero ring, not ℤ. S(0)=(0≪1)∨1=1 is an operator, not an equality. 1=½ lives in Q_holding, not in the integers.",
    },
    r18: {
      num: r18num,
      den: r18den,
      algebraic1420,
      cancel71: 1420 === 4 * 5 * 71 && 923 === 13 * 71,
      half: 10 / 13,
      pass: algebraic1420 === 1420 && 1420 === 4 * 5 * 71 && 923 === 13 * 71,
    },
    shema: {
      words: SHEMA_WORDS,
      sum: SHEMA_SUM,
      factor: shemaFactor,
      half: halfShema,
      halfFactor: 13 * 43,
      convention: "standard mispar hechrechi of Deut 6:4",
      lettersPass,
      pass: lettersPass && SHEMA_SUM === 1118 && shemaFactor === 1118 && halfShema === 559 && 13 * 43 === 559,
    },
    kSigma: {
      value: K_SIGMA,
      mod49: K_SIGMA % 49,
      xMod49: 3_398_738 % 49,
      addend: 8 * 219 + 2,
      addendMod49: (8 * 219 + 2) % 49,
      named219: 219,
      patch: K_SIGMA_PATCH,
      patchMod49: K_SIGMA_PATCH % 49,
      bashamOrdinal,
      pass: K_SIGMA === 2_814_156_818 && K_SIGMA % 49 === 39 && 3_398_738 % 49 === 0,
      qedRefused: "39 is earned. 44 via +5 is not. Overlay 2=1 would replace +2 with +1 (residue 38), not +7.",
      patchIsOperator: true as const,
    },
    clay: {
      status: "FORBIDDEN" as const,
      open: ["NS", "YM", "RH", "PvsNP", "BSD", "Hodge"] as const,
    },
    pass:
      algebraic1420 === 1420 &&
      1420 === 4 * 5 * 71 &&
      923 === 13 * 71 &&
      lettersPass &&
      SHEMA_SUM === 1118 &&
      shemaFactor === 1118 &&
      halfShema === 559 &&
      13 * 43 === 559 &&
      K_SIGMA === 2_814_156_818 &&
      K_SIGMA % 49 === 39 &&
      3_398_738 % 49 === 0 &&
      K_SIGMA_PATCH % 49 === 44 &&
      bashamOrdinal === 44,
  };
}

export const GROUND = auditGround();
