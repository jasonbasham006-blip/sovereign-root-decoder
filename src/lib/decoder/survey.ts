import {
  angularDelta,
  dmsToDeg,
  meridianCrossing,
  vincentyDirect,
  vincentyInverse,
  type LatLon,
} from "./geodesy";

export const LUTHERVILLE: LatLon = {
  lat: dmsToDeg(39, 25, 25.3),
  lon: dmsToDeg(76, 37, 18.8, true),
};

export const OCTAGON_RAYS = [
  { line: 1, az: 298 },
  { line: 2, az: 343 },
  { line: 3, az: 28 },
  { line: 4, az: 73 },
  { line: 5, az: 118 },
  { line: 6, az: 163 },
  { line: 7, az: 208 },
  { line: 8, az: 253 },
] as const;

export const TRUE_SOUTH = 180;
export const SCALER_KM = { gold: 79, silver: 118 } as const;
export const MERIDIAN_BAND = { lo: 178, hi: 187.6 } as const;

export type Family = "origin" | "lee" | "winborne" | "packard";

export type SiteSeed = {
  id: string;
  name: string;
  short: string;
  family: Family;
  line: string;
  asset: string;
  lat: number;
  lon: number;
  statedKm?: number;
  statedAz?: number;
  source: string;
};

export type SitePlot = SiteSeed & {
  km: number;
  az: number;
  ray: number;
  rayLine: number;
  dRay: number;
  dSouth: number;
  along7: number;
  xt7: number;
  x79: number;
  x118: number;
  lock: "line7" | "south" | "meridian" | "open";
};

const SEEDS: SiteSeed[] = [
  {
    id: "origin",
    name: "Lutherville Octagon House",
    short: "C-2",
    family: "origin",
    line: "Heilig / Elisabeth Packard — Node 4",
    asset: "C-2 · BA-66 · 1708 Kurtz Avenue",
    lat: LUTHERVILLE.lat,
    lon: LUTHERVILLE.lon,
    source: "Operator datum · Field map EV-MAP-001 · Avery-Packard inventory C-2",
  },
  {
    id: "walters",
    name: "Walters Art Museum",
    short: "Walters",
    family: "packard",
    line: "Elisabeth Cazenove Packard, Conservation 1934–1977",
    asset: "D-1",
    lat: 39.2967,
    lon: -76.6163,
    source: "Avery-Packard inventory D-1 · Charles Street corridor from Exit 25",
  },
  {
    id: "vts",
    name: "Virginia Theological Seminary",
    short: "VTS",
    family: "packard",
    line: "Joseph Packard, Dean · Recollections of a Long Life",
    asset: "VTS / Meade Prize 1873",
    lat: 38.8206,
    lon: -77.0928,
    source: "Sovereign Trust Decode Research · Joseph Packard / Unbroken Signal",
  },
  {
    id: "arlington",
    name: "Arlington House",
    short: "Arlington",
    family: "lee",
    line: "Custis / Robert E. Lee",
    asset: "Line 7 left-flank",
    lat: dmsToDeg(38, 52, 52),
    lon: dmsToDeg(77, 4, 14, true),
    statedKm: 72.3,
    statedAz: 212.9,
    source: "Operator geodesic estate table",
  },
  {
    id: "leesylvania",
    name: "Leesylvania",
    short: "Leesylvania",
    family: "lee",
    line: "Henry Lee II · Prince William Co.",
    asset: "Line 7 left-flank",
    lat: dmsToDeg(38, 35, 55),
    lon: dmsToDeg(77, 15, 18, true),
    statedKm: 106.5,
    statedAz: 210.8,
    source: "Operator geodesic estate table",
  },
  {
    id: "sully",
    name: "Sully Historic Site",
    short: "Sully",
    family: "lee",
    line: "Richard Bland Lee · Fairfax Co.",
    asset: "E-5 Cazenove Lee Collection corridor",
    lat: dmsToDeg(38, 53, 35),
    lon: dmsToDeg(77, 26, 18, true),
    statedKm: 92.4,
    statedAz: 228.6,
    source: "Operator geodesic estate table · inventory E-5 Fairfax",
  },
  {
    id: "stratford",
    name: "Stratford Hall",
    short: "Stratford",
    family: "lee",
    line: "Richard Henry Lee birthplace · Westmoreland Co.",
    asset: "Meridional corridor",
    lat: dmsToDeg(38, 9, 4),
    lon: dmsToDeg(76, 50, 32, true),
    statedKm: 142.8,
    statedAz: 187.6,
    source: "Operator geodesic estate table",
  },
  {
    id: "chantilly",
    name: "Chantilly Estate",
    short: "Chantilly",
    family: "lee",
    line: "Richard Henry Lee seat · Potomac",
    asset: "Meridional corridor",
    lat: dmsToDeg(38, 8, 42),
    lon: dmsToDeg(76, 47, 55, true),
    statedKm: 143.1,
    statedAz: 186.2,
    source: "Operator geodesic estate table",
  },
  {
    id: "menokin",
    name: "Menokin",
    short: "Menokin",
    family: "lee",
    line: "Francis Lightfoot Lee · Richmond Co.",
    asset: "Meridional corridor · 2 × 79 km",
    lat: dmsToDeg(37, 59, 36),
    lon: dmsToDeg(76, 49, 40, true),
    statedKm: 160.0,
    statedAz: 186.2,
    source: "Operator geodesic estate table",
  },
  {
    id: "nansemond",
    name: "Nansemond Patent",
    short: "Nansemond",
    family: "winborne",
    line: "Early Winborne patent · Chuckatuck / Suffolk",
    asset: "True south",
    lat: dmsToDeg(36, 51, 45),
    lon: dmsToDeg(76, 34, 45, true),
    statedKm: 284.9,
    statedAz: 178.7,
    source: "Operator geodesic estate table",
  },
  {
    id: "como",
    name: "Como / Buckhorn",
    short: "Como",
    family: "winborne",
    line: "Winborne core · Hertford Co. · Node 6",
    asset: "C-4 / E-1 · Node 6",
    lat: dmsToDeg(36, 30, 55),
    lon: dmsToDeg(77, 0, 14, true),
    statedKm: 324.6,
    statedAz: 185.8,
    source: "Operator geodesic estate table · Decode Research Node 6",
  },
];

function closestRay(az: number): { line: number; az: number; delta: number } {
  let bestLine = OCTAGON_RAYS[0].line as number;
  let bestAz = OCTAGON_RAYS[0].az as number;
  let bestDelta = angularDelta(az, bestAz);
  for (const r of OCTAGON_RAYS) {
    const d = angularDelta(az, r.az);
    if (Math.abs(d) < Math.abs(bestDelta)) {
      bestLine = r.line;
      bestAz = r.az;
      bestDelta = d;
    }
  }
  return { line: bestLine, az: bestAz, delta: bestDelta };
}

function classify(az: number, dRay: number, rayLine: number): SitePlot["lock"] {
  const dSouth = angularDelta(az, TRUE_SOUTH);
  if (rayLine === 7 && Math.abs(dRay) <= 5.5) return "line7";
  if (Math.abs(dSouth) <= 2.5) return "south";
  if (az >= MERIDIAN_BAND.lo && az <= MERIDIAN_BAND.hi) return "meridian";
  return "open";
}

function plotSite(seed: SiteSeed): SitePlot {
  if (seed.id === "origin") {
    return {
      ...seed,
      km: 0,
      az: 0,
      ray: 208,
      rayLine: 7,
      dRay: 0,
      dSouth: 0,
      along7: 0,
      xt7: 0,
      x79: 0,
      x118: 0,
      lock: "south",
    };
  }
  const g = vincentyInverse(LUTHERVILLE, { lat: seed.lat, lon: seed.lon });
  const ray = closestRay(g.az);
  const d7 = (angularDelta(g.az, 208) * Math.PI) / 180;
  return {
    ...seed,
    km: g.km,
    az: g.az,
    ray: ray.az,
    rayLine: ray.line,
    dRay: ray.delta,
    dSouth: angularDelta(g.az, TRUE_SOUTH),
    along7: g.km * Math.cos(d7),
    xt7: g.km * Math.sin(d7),
    x79: g.km / SCALER_KM.gold,
    x118: g.km / SCALER_KM.silver,
    lock: classify(g.az, ray.delta, ray.line),
  };
}

export type Station = {
  label: string;
  km: number;
  point: LatLon;
  kind: "scaler" | "site" | "crossing" | "probe";
};

function station(label: string, km: number, kind: Station["kind"]): Station {
  return { label, km, point: vincentyDirect(LUTHERVILLE, 208, km), kind };
}

const PLOTTED = SEEDS.map(plotSite);
const COMO = PLOTTED.find((s) => s.id === "como")!;
const CROSSING = meridianCrossing(LUTHERVILLE, 208, COMO.lon);

export const LINE7_STATIONS: Station[] = (
  [
    { label: "Line 7 × Como meridian", km: CROSSING.km, point: CROSSING.point, kind: "crossing" },
    station("Scaler 79 km (Au / 𝔽₁₀₁ root)", 79, "scaler"),
    station("Arlington along-track", PLOTTED.find((s) => s.id === "arlington")!.along7, "site"),
    station("VTS along-track", PLOTTED.find((s) => s.id === "vts")!.along7, "site"),
    station("Leesylvania along-track", PLOTTED.find((s) => s.id === "leesylvania")!.along7, "site"),
    station("Scaler 118 km", 118, "scaler"),
    station("2 × 79 km", 158, "scaler"),
    station("Central VA probe", 200, "probe"),
    station("Amelia / Powhatan probe", 250, "probe"),
    station("Prince Edward probe", 300, "probe"),
  ] satisfies Station[]
).sort((a, b) => a.km - b.km);

export type SurveyReport = {
  origin: SitePlot;
  sites: SitePlot[];
  crossing: { km: number; point: LatLon; comoLon: number };
  line7Stations: Station[];
  locks: { line7: number; south: number; meridian: number };
};

export function buildSurvey(): SurveyReport {
  const sites = PLOTTED.filter((s) => s.id !== "origin");
  return {
    origin: PLOTTED[0],
    sites,
    crossing: { km: CROSSING.km, point: CROSSING.point, comoLon: COMO.lon },
    line7Stations: LINE7_STATIONS,
    locks: {
      line7: sites.filter((s) => s.lock === "line7").length,
      south: sites.filter((s) => s.lock === "south").length,
      meridian: sites.filter((s) => s.lock === "meridian").length,
    },
  };
}

export const SURVEY = buildSurvey();
