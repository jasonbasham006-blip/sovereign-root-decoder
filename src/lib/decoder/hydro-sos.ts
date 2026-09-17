import { Q, q } from "./hydro-rational";

export type GramReport = {
  id: string;
  bound: string;
  dim: number;
  pivots: string[];
  minPivot: string;
  psd: boolean;
  claimedPivots?: string[];
  claimedMatch: boolean | null;
  identitySupplied: boolean;
  status: "CERTIFIED" | "EMPIRICAL" | "INCOMPLETE" | "FALSIFIED";
  note: string;
};

function qq(n: number | bigint, d: number | bigint = 1): Q {
  return q(n, d);
}

function zero(n: number): Q[][] {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => qq(0)));
}

/** Exact LDLᵀ. Returns D on the diagonal. Fails closed if a pivot is not > 0. */
export function ldlt(A: Q[][]): { D: Q[]; psd: boolean } {
  const n = A.length;
  const L: Q[][] = zero(n);
  const D: Q[] = [];
  for (let i = 0; i < n; i++) L[i][i] = qq(1);

  for (let k = 0; k < n; k++) {
    let d = A[k][k];
    for (let j = 0; j < k; j++) {
      d = d.sub(L[k][j].mul(L[k][j]).mul(D[j]));
    }
    if (!d.positive()) return { D: [...D, d], psd: false };
    D.push(d);
    for (let i = k + 1; i < n; i++) {
      let l = A[i][k];
      for (let j = 0; j < k; j++) {
        l = l.sub(L[i][j].mul(D[j]).mul(L[k][j]));
      }
      L[i][k] = l.div(d);
    }
  }
  return { D, psd: true };
}

export function p3Matrix(): Q[][] {
  return [
    [qq(35, 6561), qq(0), qq(0), qq(0)],
    [qq(0), qq(35, 6561), qq(-4, 2187), qq(-4, 2187)],
    [qq(0), qq(-4, 2187), qq(35, 6561), qq(-4, 2187)],
    [qq(0), qq(-4, 2187), qq(-4, 2187), qq(35, 6561)],
  ];
}

export function p5Matrix(): Q[][] {
  const g = qq(77, 390625);
  const c = qq(-12, 15625);
  const A = zero(10);
  for (let i = 0; i < 10; i++) A[i][i] = g;
  A[4][7] = c;
  A[7][4] = c;
  A[4][9] = c;
  A[9][4] = c;
  A[7][9] = c;
  A[9][7] = c;
  return A;
}

/** Equicorrelation 3×3: λ₁₂ = a−b, λ₃ = a+2b. */
export function p3Spectrum(): { eigs: string[]; pass: boolean } {
  const a = qq(35, 6561);
  const b = qq(-12, 6561);
  const eigs = [a, a.sub(b), a.sub(b), a.add(b.mul(qq(2)))];
  const expect = [qq(35, 6561), qq(47, 6561), qq(47, 6561), qq(11, 6561)];
  const pass = eigs.every((e, i) => e.eq(expect[i]) && e.positive());
  return { eigs: eigs.map((e) => e.toString()), pass };
}

export function p5BlockEigs(): { lambda12: string; lambda3: string; indefinite: boolean } {
  const a = qq(77, 390625);
  const b = qq(-12, 15625);
  const lambda12 = a.sub(b);
  const lambda3 = a.add(b.mul(qq(2)));
  return {
    lambda12: lambda12.toString(),
    lambda3: lambda3.toString(),
    indefinite: !lambda3.positive(),
  };
}

export function casimirReduce(): {
  dumped: string;
  reduced: string;
  alt: string;
  matchAlt: boolean;
} {
  const dumped = qq(422741, 5765760);
  const alt = qq(38249, 524160);
  return {
    dumped: "422741/5765760",
    reduced: dumped.toString(),
    alt: alt.toString(),
    matchAlt: dumped.eq(alt),
  };
}

export function sevenPow11(): bigint {
  let a = 1n;
  for (let i = 0; i < 11; i++) a *= 7n;
  return a;
}

function report(
  id: string,
  bound: Q,
  A: Q[][] | null,
  claimed: string[] | undefined,
  extra: string,
): GramReport {
  if (!A) {
    return {
      id,
      bound: bound.toString(),
      dim: 0,
      pivots: [],
      minPivot: "",
      psd: false,
      claimedPivots: claimed,
      claimedMatch: null,
      identitySupplied: false,
      status: "INCOMPLETE",
      note: extra,
    };
  }
  const { D, psd } = ldlt(A);
  const pivots = D.map((d) => d.toString());
  const minPivot = D.reduce((a, b) => (a.gt(b) ? b : a)).toString();
  const claimedMatch =
    claimed && claimed.length === D.length ? claimed.every((c, i) => D[i].eq(parseQ(c))) : claimed ? false : null;
  return {
    id,
    bound: bound.toString(),
    dim: A.length,
    pivots,
    minPivot,
    psd,
    claimedPivots: claimed,
    claimedMatch,
    identitySupplied: false,
    status: !psd ? "FALSIFIED" : "CERTIFIED",
    note: extra,
  };
}

function parseQ(s: string): Q {
  const [n, d] = s.split("/");
  return qq(BigInt(n), d ? BigInt(d) : 1n);
}

export function sosWitnessSuite(): {
  p3: GramReport;
  p5: GramReport;
  p7: GramReport;
  seven11: string;
  factorP3: boolean;
  factorP5: boolean;
  factorP7: boolean;
} {
  const p3 = report(
    "P3",
    qq(35, 6561),
    p3Matrix(),
    ["35/6561", "35/6561", "1091/229635", "11520/238699"],
    "Gram PSD is independent. γW−V = vᵀQv identity is not supplied. Does not promote isolated H₃ to a stretching supremum above 1/3.",
  );
  const p5 = report(
    "P5",
    qq(77, 390625),
    p5Matrix(),
    ["77/390625", "77/390625", "77/390625", "77/390625", "77/390625", "77/390625", "77/390625", "5357/30046875", "77/390625", "19968/117854"],
    "10×10 Gram from the dump. PSD checked over ℚ. Polynomial identity not supplied.",
  );
  const p7 = report(
    "P7",
    qq(143, sevenPow11()),
    null,
    undefined,
    "Bound 143/7¹¹ factorizes. Full 20×20 Gram is not in the dump. Not promoted.",
  );
  return {
    p3,
    p5,
    p7,
    seven11: sevenPow11().toString(),
    factorP3: qq(35, 6561).eq(qq(5, 1).mul(qq(7, 1)).div(qq(3, 1).mul(qq(3, 1)).mul(qq(3, 1)).mul(qq(3, 1)).mul(qq(3, 1)).mul(qq(3, 1)).mul(qq(3, 1)).mul(qq(3, 1)))),
    factorP5: qq(390625).eq(qq(5 ** 8)),
    factorP7: sevenPow11() === 1977326743n,
  };
}
