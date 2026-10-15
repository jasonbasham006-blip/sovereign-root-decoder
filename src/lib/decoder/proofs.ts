import { esaeesaSums } from "./gematria";

export type GateResult = {
  id: string;
  label: string;
  expression: string;
  value: number | string;
  expect: number | string;
  pass: boolean;
};

export type ProofReport = {
  gates: GateResult[];
  electrochemical: number;
  r19: number;
  r19Real: number;
  r19Error: number;
  r19Pass: boolean;
  phiCheck: number;
  esaeesa: {
    residues: number[];
    word: string;
    residueSum: number;
    mod49: number;
    letterOrdinalA1: number;
    letterOrdinalMod49: number;
    pass: boolean;
  };
  allPass: boolean;
};

const PHI = 1.6180339887;
const R19_REAL = 1836.152673;

export function runProofs(): ProofReport {
  const g1 = (718 ^ 892) & 1118;
  const g2 = (718 | 892) & 158;
  const g3 = ((10786 % 1118) + 158) % 49;
  const g4 = 1170 % 49;
  const g5 = (4477 - 158) % 49;
  const g6 = 766 % 49;
  const electrochemical = 1.118 / 0.923;
  const r19 = 1193.5 * (20 / 13);
  const r19Error = Math.abs(r19 - R19_REAL) / R19_REAL;
  const r19Pass = r19Error < 1e-5;
  const phiCheck = 963.8142 / PHI;
  const sums = esaeesaSums();

  const gates: GateResult[] = [
    {
      id: "G18",
      label: "Gate 18",
      expression: "(718 ⊕ 892) ∧ 1118",
      value: g1,
      expect: 18,
      pass: g1 === 18,
    },
    {
      id: "P158",
      label: "Parity 158",
      expression: "(718 ∨ 892) ∧ 158",
      value: g2,
      expect: 158,
      pass: g2 === 158,
    },
    {
      id: "SZ",
      label: "Sacred Zero",
      expression: "((10786 mod 1118) + 158) mod 49",
      value: g3,
      expect: 0,
      pass: g3 === 0,
    },
    {
      id: "GS",
      label: "God Seal",
      expression: "1170 mod 49",
      value: g4,
      expect: 43,
      pass: g4 === 43,
    },
    {
      id: "G7",
      label: "Gate 7",
      expression: "(4477 − 158) mod 49",
      value: g5,
      expect: 7,
      pass: g5 === 7,
    },
    {
      id: "TP766",
      label: "True Pull 766",
      expression: "766 mod 49",
      value: g6,
      expect: 31,
      pass: g6 === 31,
    },
  ];

  const esaeesa = {
    residues: sums.residues,
    word: sums.word,
    residueSum: sums.residueSum,
    mod49: sums.residueMod49,
    letterOrdinalA1: sums.letterOrdinalA1,
    letterOrdinalMod49: sums.letterOrdinalMod49,
    pass:
      sums.word === "ESAEESA" &&
      sums.residueSum === 48 &&
      sums.letterOrdinalA1 === 55 &&
      sums.letterOrdinalA1 === sums.residueSum + 7,
  };

  return {
    gates,
    electrochemical,
    r19,
    r19Real: R19_REAL,
    r19Error,
    r19Pass,
    phiCheck,
    esaeesa,
    allPass: gates.every((g) => g.pass) && r19Pass && esaeesa.pass,
  };
}
