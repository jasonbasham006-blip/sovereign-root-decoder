/** WGS84 Vincenty geodesic primitives. Fail-closed numeric core. */

const A = 6378137;
const F = 1 / 298.257223563;
const B = (1 - F) * A;

export type LatLon = { lat: number; lon: number };

export type Geodesic = {
  km: number;
  az: number;
};

export function dmsToDeg(d: number, m: number, s: number, westOrSouth = false): number {
  const v = d + m / 60 + s / 3600;
  return westOrSouth ? -v : v;
}

export function degToDms(deg: number): { d: number; m: number; s: number; hemi: 1 | -1 } {
  const hemi = deg < 0 ? -1 : 1;
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const mf = (abs - d) * 60;
  const m = Math.floor(mf);
  const s = (mf - m) * 60;
  return { d, m, s, hemi };
}

export function formatDms(deg: number, axis: "lat" | "lon"): string {
  const { d, m, s, hemi } = degToDms(deg);
  const h = axis === "lat" ? (hemi < 0 ? "S" : "N") : hemi < 0 ? "W" : "E";
  return `${d}° ${m}′ ${s.toFixed(1)}″ ${h}`;
}

/** Signed smallest angle a − b, in (−180, 180]. */
export function angularDelta(a: number, b: number): number {
  return ((((a - b) % 360) + 540) % 360) - 180;
}

export function vincentyInverse(p1: LatLon, p2: LatLon): Geodesic {
  const phi1 = (p1.lat * Math.PI) / 180;
  const phi2 = (p2.lat * Math.PI) / 180;
  const L = ((p2.lon - p1.lon) * Math.PI) / 180;
  const U1 = Math.atan((1 - F) * Math.tan(phi1));
  const U2 = Math.atan((1 - F) * Math.tan(phi2));
  const sinU1 = Math.sin(U1);
  const cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2);
  const cosU2 = Math.cos(U2);

  let lam = L;
  let sinLam = 0;
  let cosLam = 1;
  let sinSigma = 0;
  let cosSigma = 1;
  let sigma = 0;
  let cos2a = 0;
  let cos2SigM = 0;

  for (let i = 0; i < 200; i++) {
    sinLam = Math.sin(lam);
    cosLam = Math.cos(lam);
    const x = cosU2 * sinLam;
    const y = cosU1 * sinU2 - sinU1 * cosU2 * cosLam;
    sinSigma = Math.sqrt(x * x + y * y);
    if (sinSigma === 0) return { km: 0, az: 0 };
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLam;
    sigma = Math.atan2(sinSigma, cosSigma);
    const sinA = (cosU1 * cosU2 * sinLam) / sinSigma;
    cos2a = 1 - sinA * sinA;
    cos2SigM = cos2a !== 0 ? cosSigma - (2 * sinU1 * sinU2) / cos2a : 0;
    const C = (F / 16) * cos2a * (2 + F * (4 - 3 * cos2a));
    const next =
      L +
      (1 - C) *
        F *
        sinA *
        (sigma + C * sinSigma * (cos2SigM + C * cosSigma * (-1 + 2 * cos2SigM * cos2SigM)));
    if (Math.abs(next - lam) < 1e-12) {
      lam = next;
      break;
    }
    lam = next;
  }

  const u2 = (cos2a * (A * A - B * B)) / (B * B);
  const Acoef = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
  const Bcoef = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
  const dSigma =
    Bcoef *
    sinSigma *
    (cos2SigM +
      (Bcoef / 4) *
        (cosSigma * (-1 + 2 * cos2SigM * cos2SigM) -
          (Bcoef / 6) * cos2SigM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigM * cos2SigM)));
  const dist = B * Acoef * (sigma - dSigma);
  const az1 = Math.atan2(cosU2 * sinLam, cosU1 * sinU2 - sinU1 * cosU2 * cosLam);
  return { km: dist / 1000, az: ((az1 * 180) / Math.PI + 360) % 360 };
}

export function vincentyDirect(p1: LatLon, az: number, km: number): LatLon {
  const s = km * 1000;
  const phi1 = (p1.lat * Math.PI) / 180;
  const alpha1 = (az * Math.PI) / 180;
  const U1 = Math.atan((1 - F) * Math.tan(phi1));
  const sinU1 = Math.sin(U1);
  const cosU1 = Math.cos(U1);
  const sinA1 = Math.sin(alpha1);
  const cosA1 = Math.cos(alpha1);
  const sigma1 = Math.atan2(Math.tan(U1), cosA1);
  const sinA = cosU1 * sinA1;
  const cos2a = 1 - sinA * sinA;
  const u2 = (cos2a * (A * A - B * B)) / (B * B);
  const Acoef = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
  const Bcoef = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));

  let sigma = s / (B * Acoef);
  let cos2SigM = 0;
  let sinSigma = 0;
  let cosSigma = 1;

  for (let i = 0; i < 200; i++) {
    const twoSigM = 2 * sigma1 + sigma;
    cos2SigM = Math.cos(twoSigM);
    sinSigma = Math.sin(sigma);
    cosSigma = Math.cos(sigma);
    const dSigma =
      Bcoef *
      sinSigma *
      (cos2SigM +
        (Bcoef / 4) *
          (cosSigma * (-1 + 2 * cos2SigM * cos2SigM) -
            (Bcoef / 6) * cos2SigM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigM * cos2SigM)));
    const next = s / (B * Acoef) + dSigma;
    if (Math.abs(next - sigma) < 1e-12) {
      sigma = next;
      sinSigma = Math.sin(sigma);
      cosSigma = Math.cos(sigma);
      break;
    }
    sigma = next;
  }

  const tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosA1;
  const phi2 = Math.atan2(
    sinU1 * cosSigma + cosU1 * sinSigma * cosA1,
    (1 - F) * Math.sqrt(sinA * sinA + tmp * tmp),
  );
  const lam = Math.atan2(sinSigma * sinA1, cosU1 * cosSigma - sinU1 * sinSigma * cosA1);
  const C = (F / 16) * cos2a * (2 + F * (4 - 3 * cos2a));
  const L =
    lam -
    (1 - C) *
      F *
      sinA *
      (sigma +
        C * sinSigma * (Math.cos(2 * sigma1 + sigma) + C * cosSigma * (-1 + 2 * Math.cos(2 * sigma1 + sigma) ** 2)));
  const lon2 = ((((p1.lon + (L * 180) / Math.PI + 540) % 360) + 360) % 360) - 180;
  return { lat: (phi2 * 180) / Math.PI, lon: lon2 };
}

export function meridianCrossing(origin: LatLon, az: number, targetLon: number): { km: number; point: LatLon } {
  let lo = 1;
  let hi = 400;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const p = vincentyDirect(origin, az, mid);
    if (p.lon > targetLon) lo = mid;
    else hi = mid;
  }
  const km = (lo + hi) / 2;
  return { km, point: vincentyDirect(origin, az, km) };
}
