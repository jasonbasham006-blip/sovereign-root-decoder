import { bytesToHex, taggedHash } from "./hash";

/** Public test fixture: SHA-256("SOVEREIGN_ROOT_TEST_FIXTURE_NOT_A_KEY"). Not a spending key. */
export const MASTER_TOKEN_HEX =
  "92475411fb63b7d575f4511ce3f47488814204ec1b7ca866b60542cb58fc5af6";

export const RNS_PRIMES = [65521, 65519, 65551] as const;
export const TRUE_PULL = 766;
export const TRUE_PULL_RESIDUE = 31;
export const PB_THRESHOLD_BP = 100;

/** Trial division through √n. Used to earn the RNS LOCKED label. */
export function isOddPrime(n: number): boolean {
  if (n < 3 || n % 2 === 0) return false;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

export const RNS_PRIMES_PRIME = RNS_PRIMES.every(isOddPrime);

export const CRATE_XRF = { ag: 9300, cu: 650, au: 25, pb: 25 } as const;

export type XrfZone = "BODY" | "JOIN" | "HANDLE";
export type XrfDisposition = "COMPOSITION_CONSISTENT" | "BODY_SOLDER_OR_REPAIR" | "JOIN_DOCUMENTED";

export type XrfReading = {
  zone: XrfZone;
  ag: number;
  cu: number;
  au: number;
  pb: number;
};

function modInv(a: number, m: number): number {
  let [oldR, r] = [a, m];
  let [oldS, s] = [1, 0];
  while (r !== 0) {
    const q = Math.trunc(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return ((oldS % m) + m) % m;
}

export const RNS_M = RNS_PRIMES[0] * RNS_PRIMES[1] * RNS_PRIMES[2];
export const RNS_C12 = modInv(RNS_PRIMES[0], RNS_PRIMES[1]);
export const RNS_C13 = modInv(RNS_PRIMES[0] * RNS_PRIMES[1], RNS_PRIMES[2]);

export function toRns(value: bigint): [number, number, number] {
  return [
    Number(value % BigInt(RNS_PRIMES[0])),
    Number(value % BigInt(RNS_PRIMES[1])),
    Number(value % BigInt(RNS_PRIMES[2])),
  ];
}

export function rnsMultiply(a: number[], b: number[]): [number, number, number] {
  return [
    (a[0]! * b[0]!) % RNS_PRIMES[0],
    (a[1]! * b[1]!) % RNS_PRIMES[1],
    (a[2]! * b[2]!) % RNS_PRIMES[2],
  ];
}

export function garnerReconstruct(residues: number[]): bigint {
  const [r1, r2, r3] = residues.map((n) => BigInt(n));
  const p1 = BigInt(RNS_PRIMES[0]);
  const p2 = BigInt(RNS_PRIMES[1]);
  const p3 = BigInt(RNS_PRIMES[2]);
  const c12 = BigInt(RNS_C12);
  const c13 = BigInt(RNS_C13);
  const u1 = r1!;
  const u2 = (((((r2! - u1) % p2) + p2) * c12) % p2);
  const u3 = (((((r3! - u1 - u2 * p1) % p3) + p3) * c13) % p3);
  return u1 + u2 * p1 + u3 * p1 * p2;
}

export function shareBp(part: number, ag: number, cu: number, au: number, pb: number): number {
  const den = ag + cu + au + pb;
  if (den === 0) return 0;
  return Math.trunc((part * 10000 + Math.trunc(den / 2)) / den);
}

export function zonalPb(zone: XrfZone, pbShareBp: number): XrfDisposition {
  if (pbShareBp > PB_THRESHOLD_BP) {
    if (zone === "BODY") return "BODY_SOLDER_OR_REPAIR";
    if (zone === "JOIN" || zone === "HANDLE") return "JOIN_DOCUMENTED";
  }
  return "COMPOSITION_CONSISTENT";
}

export function evaluateXrf(reading: XrfReading) {
  const agBp = shareBp(reading.ag, reading.ag, reading.cu, reading.au, reading.pb);
  const cuBp = shareBp(reading.cu, reading.ag, reading.cu, reading.au, reading.pb);
  const auBp = shareBp(reading.au, reading.ag, reading.cu, reading.au, reading.pb);
  const pbBp = shareBp(reading.pb, reading.ag, reading.cu, reading.au, reading.pb);
  return {
    agBp,
    cuBp,
    auBp,
    pbBp,
    disposition: zonalPb(reading.zone, pbBp),
  };
}

export type CompilationReport = {
  truePull: { value: number; residue: number; expect: number; pass: boolean };
  rns: {
    primes: readonly number[];
    primesPrime: boolean;
    M: number;
    c12: number;
    c13: number;
    tokenResidues: [number, number, number];
    pullResidues: [number, number, number];
    product: [number, number, number];
    reconstructed: string;
    expected: string;
    pass: boolean;
  };
  xrf: ReturnType<typeof evaluateXrf> & { reading: XrfReading };
};

export function runCompilation(reading: XrfReading = { zone: "BODY", ...CRATE_XRF }): CompilationReport {
  const N = BigInt(`0x${MASTER_TOKEN_HEX}`);
  const tokenResidues = toRns(N);
  const pullResidues = toRns(BigInt(TRUE_PULL));
  const product = rnsMultiply(tokenResidues, pullResidues);
  const reconstructed = garnerReconstruct(product);
  const expected = (N * BigInt(TRUE_PULL)) % BigInt(RNS_M);
  const residue = TRUE_PULL % 49;
  return {
    truePull: {
      value: TRUE_PULL,
      residue,
      expect: TRUE_PULL_RESIDUE,
      pass: residue === TRUE_PULL_RESIDUE,
    },
    rns: {
      primes: RNS_PRIMES,
      primesPrime: RNS_PRIMES_PRIME,
      M: RNS_M,
      c12: RNS_C12,
      c13: RNS_C13,
      tokenResidues,
      pullResidues,
      product,
      reconstructed: reconstructed.toString(),
      expected: expected.toString(),
      pass: reconstructed === expected && RNS_PRIMES_PRIME,
    },
    xrf: { ...evaluateXrf(reading), reading },
  };
}

/**
 * BIP-340 tagged-hash commitment of the zero syndrome.
 * Returns a public digest only. Does not emit a private scalar, tweaked
 * spending key, or Schnorr (R, s) pair.
 */
export async function syndromeCommitment(syndrome: number[] = [0, 0, 0]): Promise<{
  commit: string;
  pass: boolean;
}> {
  const N = BigInt(`0x${MASTER_TOKEN_HEX}`);
  const secpN = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
  const internal = N % secpN;
  const internalBytes = new Uint8Array(32);
  let x = internal;
  for (let i = 31; i >= 0; i--) {
    internalBytes[i] = Number(x & 0xffn);
    x >>= 8n;
  }
  const mockX = await taggedHash("BIP340/Internal", internalBytes);
  const syndromeBytes = Uint8Array.from(syndrome);
  const cat = new Uint8Array(mockX.length + syndromeBytes.length);
  cat.set(mockX, 0);
  cat.set(syndromeBytes, mockX.length);
  const tweak = await taggedHash("TapTweak", cat);
  const commit = bytesToHex(tweak);
  return {
    commit,
    pass: commit === "26eba1a7168f23183feba51e6324e1cde36f38c83316263bfd1ed614a8db648d",
  };
}

export const COMPILATION = runCompilation();
