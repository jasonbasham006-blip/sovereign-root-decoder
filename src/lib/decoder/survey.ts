import {
  angularDelta,
  barycenter,
  dmsToDeg,
  feetToKm,
  formatDms,
  meridianCrossing,
  parallelCrossing,
  sampleGeodesic,
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
export const MAG_SOUTH_1800 = 179;
export const SCALER_KM = { gold: 79, silver: 118 } as const;
export const MERIDIAN_BAND = { lo: 178, hi: 187.6 } as const;
export const LINE7_BISECTOR = 230.5;
export const RAY_KM = 340;
export const PERCH_M = 16.5 * 0.3048;
export const ACRE_M2 = 4046.8564224;
export const HISTORIC_ABS_D = 11;
export const OBLIQUITY = 23.44;
export const ROTATED_LINE1 = 298 + OBLIQUITY;
export const ROTATED_LINE6 = 163 + OBLIQUITY;
export const ROTATED_LINE7 = 208 + OBLIQUITY;
export const MASON_DIXON_LAT = dmsToDeg(39, 43, 19.92);
export const SILVER_RATIO = 1 + Math.SQRT2;

export const STRATFORD_GH: LatLon = {
  lat: dmsToDeg(38, 9, 7),
  lon: dmsToDeg(76, 50, 22.2, true),
};

export const MP101_PIN: LatLon = {
  lat: dmsToDeg(38, 1, 54.4),
  lon: dmsToDeg(78, 51, 30.6, true),
};

export const ROTATED_RAYS = OCTAGON_RAYS.map((r) => ({ line: r.line as number, az: r.az + OBLIQUITY }));

export type Family = "origin" | "lee" | "winborne" | "packard" | "probe";

export type SiteSeed = {
  id: string;
  node?: number;
  name: string;
  short: string;
  family: Family;
  line: string;
  role: string;
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
  lock: "origin" | "line7" | "south" | "meridian" | "bisector" | "open";
};

export type PatentStatus = "DOCUMENTED" | "POINT_ONLY" | "COURSES_ABSENT";

export type PatentRecord = {
  id: string;
  name: string;
  holder: string;
  place: string;
  acres?: number;
  node?: number;
  status: PatentStatus;
  source: string;
  note: string;
};

export type PatentCall = {
  magAz: number;
  perches: number;
};

export function reverseCourse(known: LatLon, calls: PatentCall[], D: number): LatLon {
  let p: LatLon = { lat: known.lat, lon: known.lon };
  for (let i = calls.length - 1; i >= 0; i--) {
    const c = calls[i]!;
    const trueFwd = (c.magAz + D + 360) % 360;
    const backAz = (trueFwd + 180) % 360;
    p = vincentyDirect(p, backAz, (c.perches * PERCH_M) / 1000);
  }
  return p;
}

export function squareSideKm(acres: number): number {
  return Math.sqrt(acres * ACRE_M2) / 1000;
}

export const PATENT_CHAIN: PatentRecord[] = [
  {
    id: "nansemond",
    name: "Nansemond / Chuckatuck patent",
    holder: "Early Winborne (Winhorne in the papers)",
    place: "Nansemond County, VA · Chuckatuck / Suffolk",
    node: 8,
    status: "POINT_ONLY",
    source: "Operator geodesic estate table",
    note: "Anchor point only. Metes-and-bounds are not in Drive, the private repos, or the operator table. Paste courses to arm reverse-course. No polygon until then.",
  },
  {
    id: "lane-quarter-swamp",
    name: "Joseph Lane patent — 100 acres on Quarter Swamp",
    holder: "Thomas Winborne",
    place: "Quarter Swamp, NC, reached from the Nansemond origin",
    acres: 100,
    node: 9,
    status: "COURSES_ABSENT",
    source: "Final Legal Defense Dossier · Winborne Family Papers",
    note: "Acreage and chain of title are locked. North Carolina tract on the Como corridor — not the Chuckatuck VA point. Courses absent.",
  },
  {
    id: "william-northampton",
    name: "Pre-Revolutionary Northampton conveyances",
    holder: "William Winborne",
    place: "Northampton County, NC",
    status: "DOCUMENTED",
    source: "Final Legal Defense Dossier · Northampton County Register",
    note: "Conveyance recorded. No courses in the ingested dossier.",
  },
  {
    id: "jenkins-papers",
    name: "Winborne Jenkins Papers, 1751–1816",
    holder: "Winborne line",
    place: "Hertford / Northampton Counties, NC",
    status: "DOCUMENTED",
    source: "Final Legal Defense Dossier · preserved by Benjamin B. Winborne",
    note: "Primary papers cited. Not yet transcribed into courses here.",
  },
  {
    id: "bb-winborne",
    name: "Camp Manufacturing timberlands (counsel)",
    holder: "Benjamin B. Winborne",
    place: "Hertford and Northampton Counties, NC; Franklin, VA",
    status: "DOCUMENTED",
    source: "ECU Collection #691-005",
    note: "Legal representation of timberlands, not a patent polygon.",
  },
];

const SEEDS: SiteSeed[] = [
  {
    id: "origin",
    node: 1,
    name: "Lutherville Octagon House",
    short: "C-2",
    family: "origin",
    line: "Heilig / Elisabeth Packard — Node 4",
    role: "Central anchor (0,0) — radial center for all octagonal rays",
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
    role: "Charles Street / true-south Packard lock (not in 8-site matrix)",
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
    role: "Line 7 × 79 km Packard lock (not in 8-site matrix)",
    asset: "VTS / Meade Prize 1873",
    lat: 38.8206,
    lon: -77.0928,
    source: "Sovereign Trust Decode Research · Joseph Packard / Unbroken Signal",
  },
  {
    id: "arlington",
    node: 2,
    name: "Arlington House",
    short: "Arlington",
    family: "lee",
    line: "Custis / Robert E. Lee",
    role: "Line 7 step 1 — left-flank channel",
    asset: "Line 7 left-flank",
    lat: dmsToDeg(38, 52, 52),
    lon: dmsToDeg(77, 4, 14, true),
    statedKm: 72.3,
    statedAz: 212.9,
    source: "Operator geodesic estate table",
  },
  {
    id: "leesylvania",
    node: 3,
    name: "Leesylvania",
    short: "Leesylvania",
    family: "lee",
    line: "Henry Lee II · Prince William Co.",
    role: "Line 7 step 2 — same 208° vector",
    asset: "Line 7 left-flank",
    lat: dmsToDeg(38, 35, 55),
    lon: dmsToDeg(77, 15, 18, true),
    statedKm: 106.5,
    statedAz: 210.8,
    source: "Operator geodesic estate table",
  },
  {
    id: "sully",
    node: 4,
    name: "Sully Historic Site",
    short: "Sully",
    family: "lee",
    line: "Richard Bland Lee · Fairfax Co.",
    role: "Western flank bisector — Line 7 / Line 8 midpoint 230.5°",
    asset: "E-5 Cazenove Lee Collection corridor",
    lat: dmsToDeg(38, 53, 35),
    lon: dmsToDeg(77, 26, 18, true),
    statedKm: 92.4,
    statedAz: 228.6,
    source: "Operator geodesic estate table · inventory E-5 Fairfax",
  },
  {
    id: "stratford",
    node: 5,
    name: "Stratford Hall",
    short: "Stratford",
    family: "lee",
    line: "Richard Henry Lee birthplace · Westmoreland Co.",
    role: "Meridian entry — upper Tidewater tier",
    asset: "Meridional corridor",
    lat: dmsToDeg(38, 9, 4),
    lon: dmsToDeg(76, 50, 32, true),
    statedKm: 142.8,
    statedAz: 187.6,
    source: "Operator geodesic estate table",
  },
  {
    id: "stratford-gh",
    name: "Stratford Hall Great House",
    short: "GH",
    family: "lee",
    line: "Great House foundation pin",
    role: "Refined house center — matrix node 5 stays the operator-table pin",
    asset: "Great House foundation",
    lat: STRATFORD_GH.lat,
    lon: STRATFORD_GH.lon,
    source: "Operator pin this session — Great House foundation",
  },
  {
    id: "chantilly",
    node: 6,
    name: "Chantilly Estate",
    short: "Chantilly",
    family: "lee",
    line: "Richard Henry Lee seat · Potomac",
    role: "Mirror node — same radial tier as Stratford",
    asset: "Meridional corridor",
    lat: dmsToDeg(38, 8, 42),
    lon: dmsToDeg(76, 47, 55, true),
    statedKm: 143.1,
    statedAz: 186.2,
    source: "Operator geodesic estate table",
  },
  {
    id: "menokin",
    node: 7,
    name: "Menokin",
    short: "Menokin",
    family: "lee",
    line: "Francis Lightfoot Lee · Richmond Co.",
    role: "Fractal midpoint — 17 km south of the Stratford/Chantilly tier",
    asset: "Meridional corridor · 2 × 79 km",
    lat: dmsToDeg(37, 59, 36),
    lon: dmsToDeg(76, 49, 40, true),
    statedKm: 160.0,
    statedAz: 186.2,
    source: "Operator geodesic estate table",
  },
  {
    id: "nansemond",
    node: 8,
    name: "Nansemond Patent",
    short: "Nansemond",
    family: "winborne",
    line: "Early Winborne patent · Chuckatuck / Suffolk",
    role: "True south anchor",
    asset: "True south",
    lat: dmsToDeg(36, 51, 45),
    lon: dmsToDeg(76, 34, 45, true),
    statedKm: 284.9,
    statedAz: 178.7,
    source: "Operator geodesic estate table",
  },
  {
    id: "como",
    node: 9,
    name: "Como / Buckhorn",
    short: "Como",
    family: "winborne",
    line: "Winborne core · Hertford Co. · Node 6",
    role: "Southern boundary extension into North Carolina",
    asset: "C-4 / E-1 · Node 6",
    lat: dmsToDeg(36, 30, 54.6),
    lon: dmsToDeg(77, 0, 14.3, true),
    statedKm: 324.6,
    statedAz: 185.8,
    source: "Operator geodesic estate table · Node 6 refined pin this session",
  },
  {
    id: "mp101",
    name: "Milepost 101 / Rockfish Gap",
    short: "MP101",
    family: "probe",
    line: "Operator pin this session — not in Drive",
    role: "Western probe. NPS / Blue Ridge Parkway. Geodetic overlay only — no excavation.",
    asset: "Skyline Drive southern terminus",
    lat: MP101_PIN.lat,
    lon: MP101_PIN.lon,
    source: "Operator pin this session",
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
  if (Math.abs(angularDelta(az, LINE7_BISECTOR)) <= 1.2) return "bisector";
  if (rayLine === 7 && Math.abs(dRay) <= 5.5) return "line7";
  const dSouth = angularDelta(az, TRUE_SOUTH);
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
      lock: "origin",
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

function plotLatLon(
  id: string,
  name: string,
  short: string,
  point: LatLon,
  role: string,
  source: string,
): SitePlot {
  return plotSite({
    id,
    name,
    short,
    family: "probe",
    line: "Computed geodesic offset",
    role,
    asset: "geodetic",
    lat: point.lat,
    lon: point.lon,
    source,
  });
}

function fit(label: string, predicted: number, observed: number): ScalerFit {
  return {
    label,
    predicted,
    residualKm: observed - predicted,
    residualPct: ((observed - predicted) / predicted) * 100,
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

export type NetworkEdge = {
  from: string;
  to: string;
  label: string;
  km: number;
  az: number;
};

export type DeclinationEpoch = {
  year: number;
  D: number;
  source: string;
  magSouthTrue: number;
  vsNansemond: number;
  line6Magnetic: number;
};

export type BaryLink = {
  id: string;
  name: string;
  node: number;
  km: number;
  az: number;
};

export type ScalerFit = {
  label: string;
  predicted: number;
  residualKm: number;
  residualPct: number;
};

export type Line6Gap = {
  id: string;
  name: string;
  trueAz: number;
  requiredD: number;
  vsCeiling: number;
};

export type ProbePlot = SitePlot & { nps?: boolean };

export type SurveyReport = {
  origin: SitePlot;
  sites: SitePlot[];
  matrix: SitePlot[];
  extension: SitePlot;
  extras: SitePlot[];
  probes: ProbePlot[];
  crossing: { km: number; point: LatLon; comoLon: number };
  line7Stations: Station[];
  barycenter: {
    point: LatLon;
    km: number;
    az: number;
    ray: number;
    rayLine: number;
    dRay: number;
    dSouth: number;
    closest: BaryLink;
    links: BaryLink[];
    scalers: ScalerFit[];
    magSouth1800: number;
    magAz1800: number;
    vsMagSouth1800: number;
    vsMeridianHi: number;
    magSouthStation: LatLon;
    magSouthOffsetKm: number;
    magSouthOffsetAz: number;
  };
  bary9: { point: LatLon; km: number; az: number; shiftKm: number; shiftAz: number };
  edges: NetworkEdge[];
  declination: DeclinationEpoch[];
  line6: { gaps: Line6Gap[]; historicAbsMax: number; closes: boolean };
  patents: PatentRecord[];
  locks: { line7: number; south: number; meridian: number; bisector: number };
  obliquity: {
    epsilon: number;
    status: "T4_HYPOTHESIS";
    rotated: { line: number; az: number }[];
    sullyRotated: number;
    sullyVsLine8: number;
    line6Rotated: number;
    ghVsRotated6: number;
    mp101VsRotated7: number;
  };
  masonDixon: { km: number; point: LatLon; vs30sqrt2: number };
  line1Stations: Station[];
  silver: { predicted: number; nansemond: number; residualKm: number; residualPct: number };
  comoVs3x118: { predicted: number; como: number; residualKm: number };
  mp101: { fromC2: SitePlot; fromSullyKm: number; fromSullyAz: number; milesFromSully: number; vs2x118: number };
  transverse: { km: number; az: number; from: string; to: string };
};

function edge(from: SitePlot, to: SitePlot, label: string): NetworkEdge {
  const g = vincentyInverse({ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon });
  return { from: from.id, to: to.id, label, km: g.km, az: g.az };
}

export function buildSurvey(): SurveyReport {
  const origin = PLOTTED.find((s) => s.id === "origin")!;
  const sites = PLOTTED.filter((s) => s.id !== "origin");
  const matrix = PLOTTED.filter((s) => s.node != null && s.node >= 1 && s.node <= 8).sort(
    (a, b) => (a.node ?? 0) - (b.node ?? 0),
  );
  const extension = PLOTTED.find((s) => s.id === "como")!;
  const extras = PLOTTED.filter((s) => s.node == null && s.family !== "probe");
  const nansemond = PLOTTED.find((s) => s.id === "nansemond")!;
  const arlington = PLOTTED.find((s) => s.id === "arlington")!;
  const leesylvania = PLOTTED.find((s) => s.id === "leesylvania")!;
  const stratford = PLOTTED.find((s) => s.id === "stratford")!;
  const chantilly = PLOTTED.find((s) => s.id === "chantilly")!;
  const menokin = PLOTTED.find((s) => s.id === "menokin")!;
  const sully = PLOTTED.find((s) => s.id === "sully")!;
  const gh = PLOTTED.find((s) => s.id === "stratford-gh")!;
  const mp101 = PLOTTED.find((s) => s.id === "mp101")!;

  const dropPt = vincentyDirect(STRATFORD_GH, TRUE_SOUTH, feetToKm(1118));
  const drop = plotLatLon(
    "stratford-drop",
    "Stratford 1,118 ft due south",
    "1118′",
    dropPt,
    "Geodesic offset from Great House. Not a vault spec.",
    "Computed Vincenty direct 180° × 1,118 ft from GH pin",
  );
  const mp118 = plotLatLon(
    "mp101-118",
    "MP101 118 ft due south",
    "118′",
    vincentyDirect(MP101_PIN, TRUE_SOUTH, feetToKm(118)),
    "Geodesic offset. NPS land. Overlay only.",
    "Computed Vincenty direct 180° × 118 ft from MP101",
  );
  const mp1118 = plotLatLon(
    "mp101-1118",
    "MP101 1,118 ft due south",
    "MP↓",
    vincentyDirect(MP101_PIN, TRUE_SOUTH, feetToKm(1118)),
    "Geodetic overlay on NPS / Blue Ridge Parkway. No excavation.",
    "Computed Vincenty direct 180° × 1,118 ft from MP101",
  );

  const md = parallelCrossing(LUTHERVILLE, ROTATED_LINE1, MASON_DIXON_LAT);
  const mdPlot = plotLatLon(
    "mason-dixon",
    "Rotated Line 1 × Mason-Dixon parallel",
    "MD",
    md.point,
    "Vincenty intersection of 321.44° with 39°43′19.92″N",
    "Computed parallel crossing",
  );
  const l1_79 = plotLatLon(
    "line1-79",
    "Rotated Line 1 at 79 km",
    "79",
    vincentyDirect(LUTHERVILLE, ROTATED_LINE1, 79),
    "Scaler station on rotated Line 1",
    "Computed Vincenty direct 321.44° × 79 km",
  );
  const l1_118 = plotLatLon(
    "line1-118",
    "Rotated Line 1 at 118 km",
    "118",
    vincentyDirect(LUTHERVILLE, ROTATED_LINE1, 118),
    "Scaler station on rotated Line 1",
    "Computed Vincenty direct 321.44° × 118 km",
  );

  const probes: ProbePlot[] = [
    { ...gh },
    { ...drop },
    { ...mp101, nps: true },
    { ...mp118, nps: true },
    { ...mp1118, nps: true },
    { ...mdPlot },
    { ...l1_79 },
    { ...l1_118 },
  ];

  const southern = matrix.filter((s) => s.node != null && s.node >= 2);
  const bary = barycenter(southern.map((s) => ({ lat: s.lat, lon: s.lon })));
  const baryG = vincentyInverse(LUTHERVILLE, bary);
  const bary9 = barycenter([...southern, extension].map((s) => ({ lat: s.lat, lon: s.lon })));
  const bary9g = vincentyInverse(LUTHERVILLE, bary9);
  const shift = vincentyInverse(bary, bary9);
  const magSouthStation = vincentyDirect(LUTHERVILLE, MAG_SOUTH_1800, baryG.km);
  const magSouthOffset = vincentyInverse(magSouthStation, bary);
  const magSouthPlot = plotLatLon(
    "mag-south-1800",
    "1800 magnetic-south station (Σ radius)",
    "MS",
    magSouthStation,
    "Same radius as Σ on 179° true. Survey-era magnetic south, not an estate.",
    "Computed Vincenty direct 179° × bary radius from C-2",
  );

  const epochs: { year: number; D: number; source: string }[] = [
    { year: 1750, D: -5.0, source: "NOAA Washington historic series (Lutherville proxy)" },
    { year: 1795, D: -1.8, source: "NOAA Washington historic series — Revere / Avery year" },
    { year: 1800, D: -1.0, source: "NOAA Washington historic series — magnetic-south minimum" },
    { year: 1855, D: -4.4, source: "NOAA Washington historic series — octagon construction" },
    { year: 1900, D: -5.568, source: "IGRF-13 at C-2" },
    { year: 2025, D: -10.993, source: "IGRF-13 at C-2" },
  ];

  const baryRay = closestRay(baryG.az);
  const baryLinks: BaryLink[] = southern
    .map((s) => {
      const g = vincentyInverse(bary, { lat: s.lat, lon: s.lon });
      return { id: s.id, name: s.short, node: s.node ?? 0, km: g.km, az: g.az };
    })
    .sort((a, b) => a.km - b.km);

  const line6Targets = [nansemond, stratford, chantilly, menokin, extension];
  const gaps: Line6Gap[] = line6Targets.map((s) => ({
    id: s.id,
    name: s.short,
    trueAz: s.az,
    requiredD: s.az - 163,
    vsCeiling: Math.abs(s.az - 163) - HISTORIC_ABS_D,
  }));

  const silverPred = SCALER_KM.silver * SILVER_RATIO;
  const sullyMp = vincentyInverse(
    { lat: sully.lat, lon: sully.lon },
    { lat: mp101.lat, lon: mp101.lon },
  );
  const transverse = vincentyInverse(
    { lat: l1_118.lat, lon: l1_118.lon },
    { lat: menokin.lat, lon: menokin.lon },
  );

  return {
    origin,
    sites,
    matrix,
    extension,
    extras,
    probes: [...probes, magSouthPlot],
    crossing: { km: CROSSING.km, point: CROSSING.point, comoLon: COMO.lon },
    line7Stations: LINE7_STATIONS,
    barycenter: {
      point: bary,
      km: baryG.km,
      az: baryG.az,
      ray: baryRay.az,
      rayLine: baryRay.line,
      dRay: baryRay.delta,
      dSouth: angularDelta(baryG.az, TRUE_SOUTH),
      closest: baryLinks[0]!,
      links: baryLinks,
      scalers: [
        fit("√3 × 79 km", SCALER_KM.gold * Math.sqrt(3), baryG.km),
        fit("7/6 × 118 km", (SCALER_KM.silver * 7) / 6, baryG.km),
        fit("7/4 × 79 km", (SCALER_KM.gold * 7) / 4, baryG.km),
        fit("1 × 118 km", SCALER_KM.silver, baryG.km),
      ],
      magSouth1800: MAG_SOUTH_1800,
      magAz1800: baryG.az - MAG_SOUTH_1800 + 180,
      vsMagSouth1800: angularDelta(baryG.az, MAG_SOUTH_1800),
      vsMeridianHi: baryG.az - MERIDIAN_BAND.hi,
      magSouthStation,
      magSouthOffsetKm: magSouthOffset.km,
      magSouthOffsetAz: magSouthOffset.az,
    },
    bary9: {
      point: bary9,
      km: bary9g.km,
      az: bary9g.az,
      shiftKm: shift.km,
      shiftAz: shift.az,
    },
    edges: [
      edge(arlington, leesylvania, "Line 7 internal step (2→3)"),
      edge(stratford, chantilly, "Mirror pair, same radial tier (5→6)"),
      edge(chantilly, menokin, "Fractal south step (6→7)"),
      edge(stratford, menokin, "Stratford → Menokin (5→7)"),
      edge(nansemond, extension, "Nansemond → Como (8→9)"),
      edge(gh, drop, "Great House → 1,118 ft south"),
    ],
    declination: epochs.map((e) => ({
      ...e,
      magSouthTrue: 180 + e.D,
      vsNansemond: nansemond.az - (180 + e.D),
      line6Magnetic: 163 - e.D,
    })),
    line6: { gaps, historicAbsMax: HISTORIC_ABS_D, closes: gaps.every((g) => g.vsCeiling <= 0) },
    patents: PATENT_CHAIN,
    locks: {
      line7: sites.filter((s) => s.lock === "line7").length,
      south: sites.filter((s) => s.lock === "south").length,
      meridian: sites.filter((s) => s.lock === "meridian").length,
      bisector: sites.filter((s) => s.lock === "bisector").length,
    },
    obliquity: {
      epsilon: OBLIQUITY,
      status: "T4_HYPOTHESIS",
      rotated: ROTATED_RAYS,
      sullyRotated: sully.az + OBLIQUITY,
      sullyVsLine8: angularDelta(sully.az + OBLIQUITY, 253),
      line6Rotated: ROTATED_LINE6,
      ghVsRotated6: angularDelta(gh.az, ROTATED_LINE6),
      mp101VsRotated7: angularDelta(mp101.az, ROTATED_LINE7),
    },
    masonDixon: { km: md.km, point: md.point, vs30sqrt2: md.km - 30 * Math.SQRT2 },
    line1Stations: [
      { label: "Mason-Dixon parallel", km: md.km, point: md.point, kind: "crossing" },
      { label: "79 km", km: 79, point: { lat: l1_79.lat, lon: l1_79.lon }, kind: "scaler" },
      { label: "118 km", km: 118, point: { lat: l1_118.lat, lon: l1_118.lon }, kind: "scaler" },
    ],
    silver: {
      predicted: silverPred,
      nansemond: nansemond.km,
      residualKm: nansemond.km - silverPred,
      residualPct: ((nansemond.km - silverPred) / silverPred) * 100,
    },
    comoVs3x118: {
      predicted: 3 * SCALER_KM.silver,
      como: extension.km,
      residualKm: extension.km - 3 * SCALER_KM.silver,
    },
    mp101: {
      fromC2: mp101,
      fromSullyKm: sullyMp.km,
      fromSullyAz: sullyMp.az,
      milesFromSully: sullyMp.km / 1.609344,
      vs2x118: mp101.km - 2 * SCALER_KM.silver,
    },
    transverse: {
      km: transverse.km,
      az: transverse.az,
      from: "Rotated Line 1 @ 118 km",
      to: "Menokin",
    },
  };
}

export const SURVEY = buildSurvey();

export function raySamples(az: number): LatLon[] {
  return sampleGeodesic(LUTHERVILLE, az, RAY_KM, 12);
}

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export type AnchorRow = {
  id: string;
  node: string;
  name: string;
  family: string;
  lat: number;
  lon: number;
  km: string;
  az: string;
  lock: string;
  source: string;
};

export function surveyAnchorRows(): AnchorRow[] {
  const rows: AnchorRow[] = [];
  const push = (
    id: string,
    node: string,
    name: string,
    family: string,
    lat: number,
    lon: number,
    km: number | null,
    az: number | null,
    lock: string,
    source: string,
  ) => {
    rows.push({
      id,
      node,
      name,
      family,
      lat,
      lon,
      km: km == null ? "" : km.toFixed(6),
      az: az == null ? "" : az.toFixed(6),
      lock,
      source,
    });
  };

  for (const s of SURVEY.matrix) {
    push(s.id, String(s.node ?? ""), s.name, s.family, s.lat, s.lon, s.node === 1 ? 0 : s.km, s.node === 1 ? null : s.az, s.lock, s.source);
  }
  const ext = SURVEY.extension;
  push(ext.id, "9", ext.name, ext.family, ext.lat, ext.lon, ext.km, ext.az, ext.lock, ext.source);
  const b = SURVEY.barycenter;
  push("barycenter", "Σ", "ECEF barycenter nodes 2–8", "bary", b.point.lat, b.point.lon, b.km, b.az, "bary", "Computed ECEF mean of nodes 2–8");
  push(
    "bary9",
    "Σ9",
    "ECEF barycenter nodes 2–9",
    "bary",
    SURVEY.bary9.point.lat,
    SURVEY.bary9.point.lon,
    SURVEY.bary9.km,
    SURVEY.bary9.az,
    "bary",
    "Computed ECEF mean of nodes 2–8 plus Como",
  );
  for (const p of SURVEY.probes) {
    push(p.id, "", p.name, p.family, p.lat, p.lon, p.km, p.az, p.nps ? "nps" : "probe", p.source);
  }
  return rows;
}

export function surveyAnchorCsv(): string {
  const header = [
    "id",
    "node",
    "name",
    "family",
    "lat",
    "lon",
    "lat_dms",
    "lon_dms",
    "km_from_c2",
    "az_from_c2",
    "lock",
    "source",
  ];
  const lines = [header.join(",")];
  for (const r of surveyAnchorRows()) {
    lines.push(
      [
        csvCell(r.id),
        csvCell(r.node),
        csvCell(r.name),
        csvCell(r.family),
        csvCell(r.lat.toFixed(8)),
        csvCell(r.lon.toFixed(8)),
        csvCell(formatDms(r.lat, "lat")),
        csvCell(formatDms(r.lon, "lon")),
        csvCell(r.km),
        csvCell(r.az),
        csvCell(r.lock),
        csvCell(r.source),
      ].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

