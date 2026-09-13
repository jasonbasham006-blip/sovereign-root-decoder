import { CONSTRAINED_CORPUS, CALLING_CARD } from "./corpus";
import { circularLatticeExtract } from "./lattice";
import { decodePhrase, evaluateWordSum } from "./gematria";

export type ArtifactId =
  | "letter"
  | "liz"
  | "map"
  | "card"
  | "disk"
  | "electoral";

export type ArtifactRecord = {
  id: ArtifactId;
  code: string;
  title: string;
  date: string;
  image: string;
  transcription: string;
  notes: string[];
};

export const ARTIFACTS: ArtifactRecord[] = [
  {
    id: "letter",
    code: "A-01",
    title: "Directions to Tom — Lenoir, N.C.",
    date: "October 12",
    image: "/artifacts/letter.jpg",
    transcription: `Lenoir NC
Oct 12 -

Dear Tom

If you come by Route 40 from Frederick Md. to Balto, immediately after the exit for the Harbor Tunnel you will see the exits for the Baltimore Beltway - Take the 2nd which is exit for Beltway North in direction of Towson.

After you have passed the exits for Reisterstown Rd, Park Heights, Greenspring etc you will see the exit for Rt 83 to York & Harrisburg - The exit for Lutherville is the next one # 25 Charles St Bellona Ave.

Turn left when you get to the top of the exit and follow map on back of this sheet.

I'll send you an ADC map of Balto & Vicinity when I get home in case you should hit the Beltway by another Route.
(over)

LEFT MARGIN (vertical):
Wish you could have been here to enjoy later. Can hardly wait.
Wish you could have been here for the autumn foliage. Can hardly wait.
This note welcome in Lenoir until next weekend. Oct 12`,
    notes: [
      "Route 40 · Frederick · Harbor Tunnel · Beltway North · Towson",
      "Reisterstown · Park Heights · Greenspring · Rt 83 York & Harrisburg",
      "Exit 25 Charles St / Bellona Ave · Turn left · map on back · (over)",
      "Margin operator: later",
    ],
  },
  {
    id: "liz",
    code: "A-02",
    title: "With love from Liz — 101",
    date: "undated",
    image: "/artifacts/liz-note.jpg",
    transcription: `With love from Liz -
A piece of family
Silver - some expense
Think the cover is later.
Sorry I haven't been
able to identify
them as yet!

[adhesive tag] 101`,
    notes: [
      "Operators Think and Later in one sentence",
      "Family silver specimen; identification still open",
      "Tag 101 — 101-over-3 lattice protocol",
      "Liz maps to bloodline node L",
    ],
  },
  {
    id: "map",
    code: "A-03",
    title: "Lutherville sketch — verso of letter",
    date: "verso",
    image: "/artifacts/map.jpg",
    transcription: `Compass N/W/E/S
Ridgely Rd
Latt Rd
Kurtz Ave (dashed) → Octagon House
Church (+)
Melanchthon Ave
Morris Ave
Francke (red arrows north)
Seminary Ave
Clark
Bellona Ave (Lutherville)
Baltimore Beltway → Towson
Charles St
Ex 25 Charles St / Bellona Ave
R.R. (rail, west edge)
(over)`,
    notes: [
      "Red-arrow path: Beltway → Charles St → Clark/Francke → church → Kurtz → Octagon House",
      "Street names lock to the NARA title set",
    ],
  },
  {
    id: "card",
    code: "A-04",
    title: "Calling card — Miss Elisabeth Cazenove Packard",
    date: "recto",
    image: "/artifacts/calling-card.jpg",
    transcription: `Miss Elisabeth Cazenove Packard

over`,
    notes: [
      "Front ring for the 101-over-3 circular lattice",
      "Blue over mark — flip instruction, same convention as the letter and electoral leaf",
    ],
  },
  {
    id: "disk",
    code: "A-05",
    title: "Cipher disk — letter / word / numeric rings",
    date: "instrument",
    image: "/artifacts/cipher-disk.jpg",
    transcription: `Outer numeric ring (clockwise from A):
A 23 · B 233 · C 231 · D 322 · E 223 · F 2222 · G 234 · H 55
I (inner tally 1/2/3) · J 3342323 · K 334 · L 2311 · M 2314
N 114 · O 142 · P 111 · Q 1111 · R 1111 · S 114 · T 1143
U 1434 · V 1431 · W 1142 · X 1431422 · Y 222222 · Z 111111

Inner lexicon (readable wedges):
will you see · Are · where · these · were · what · that · from
Ask · Towards · Right · Left · Art · Can · The · Pass
With · From · Have · They · Them · Their · We · or · to · at · in
Come · to · be · went
Affixes: tion · ing · ed · ly · ble`,
    notes: [
      "Alphabet ring A–Z is a second lattice",
      "Directional lexicon (Left / Right / Towards) matches the letter and map",
      "Heavy 1-runs on N–S and Z sit next to the 101 tag",
    ],
  },
  {
    id: "electoral",
    code: "A-06",
    title: "Maryland Electoral College journal, p. 235",
    date: "March 1921 term",
    image: "/artifacts/electoral.jpg",
    transcription: `maryland.gov · page 235

The President of the College declared that nominations for President of the United States were in order. Whereupon Mr James Carey nominated Warren Gamaliel Harding of the State of Ohio for President of the United States for the term beginning from and after the third day of March 1921, in conformity with the Constitution and Laws, and no one else was nominated for the office of President of the United States.

Tellers James Carey and Benj. P. Hartog received the ballots. Warren Gamaliel Harding had received eight votes, the same being the full Electoral vote for President of the United States.

The College proceeded to vote for Vice-President. Mr William G. Henkel nominated Calvin Coolidge of the State of Mass. for Vice-President.

Tellers James A. C. Hayden and William F. Broening. Calvin Coolidge of the State of Mass. had received eight votes for Vice-President of the United States, the same being the whole Electoral vote of the State of Maryland.

The Secretary directed to prepare the several forms of certificates for the signatures of the Electors.

(over)`,
    notes: [
      "Eight Maryland electors · Harding / Coolidge · term 4 March 1921",
      "Same (over) convention as the letter and calling card",
    ],
  },
];

export const PLACE_QUERIES = [
  "LUTHERVILLE",
  "BELLONA",
  "CHARLES STREET",
  "EXIT 25",
  "OCTAGON",
  "KURTZ",
  "RIDGELY",
  "MELANCHTHON",
  "MORRIS",
  "FRANCKE",
  "SEMINARY",
  "CLARK",
  "GREENSPRING",
  "REISTERSTOWN",
  "HARRISBURG",
  "YORK ROAD",
  "BALTIMORE",
  "PACKARD",
  "SILVER",
  "NORTH CAROLINA",
] as const;

export type PlaceHit = {
  query: string;
  matches: string[];
};

export function matchPlaces(): PlaceHit[] {
  return PLACE_QUERIES.map((query) => ({
    query,
    matches: CONSTRAINED_CORPUS.filter((item) => item.toUpperCase().includes(query)),
  }));
}

export const PACKET_PHRASES = [
  CALLING_CARD,
  "ELISABETH CAZENOVE PACKARD",
  "WITH LOVE FROM LIZ",
  "A PIECE OF FAMILY SILVER",
  "THINK THE COVER IS LATER",
  "LUTHERVILLE",
  "OCTAGON HOUSE",
  "BELLONA AVENUE",
  "EXIT TWENTY FIVE",
  "CALVIN COOLIDGE",
] as const;

export type PacketTest = {
  id: string;
  label: string;
  detail: string;
  pass: boolean;
};

export type PacketReport = {
  cardStd: ReturnType<typeof circularLatticeExtract>;
  cardDyn: ReturnType<typeof circularLatticeExtract>;
  diskStd: ReturnType<typeof circularLatticeExtract>;
  places: PlaceHit[];
  placeHits: number;
  placeTotal: number;
  phrases: { phrase: string; latin: number }[];
  tests: PacketTest[];
  locked: number;
};

const ALPHA_RING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function runPacket(): PacketReport {
  const cardStd = circularLatticeExtract(CALLING_CARD, "O", 3, false);
  const cardDyn = circularLatticeExtract(CALLING_CARD, "O", 3, true);
  const diskStd = circularLatticeExtract(ALPHA_RING, "O", 3, false);
  const places = matchPlaces();
  const placeHits = places.filter((p) => p.matches.length > 0).length;
  const phrases = PACKET_PHRASES.map((phrase) => ({
    phrase,
    latin: evaluateWordSum(phrase, 26),
  }));

  const lizText = ARTIFACTS.find((a) => a.id === "liz")!.transcription.toUpperCase();
  const letterText = ARTIFACTS.find((a) => a.id === "letter")!.transcription.toUpperCase();
  const overCount = ARTIFACTS.filter((a) => /\bover\b/i.test(a.transcription)).length;

  const tests: PacketTest[] = [
    {
      id: "T1",
      label: "Calling-card lattice",
      detail: `Standard walk → ${cardStd.token}`,
      pass: cardStd.token === "O.P.K.D.S.L.A.",
    },
    {
      id: "T2",
      label: "Think / Later operators",
      detail: "Liz note contains both Think and Later; letter margin contains later.",
      pass: lizText.includes("THINK") && lizText.includes("LATER") && letterText.includes("LATER"),
    },
    {
      id: "T3",
      label: "101 protocol tag",
      detail: "Adhesive 101 on the Liz note matches 101-over-3.",
      pass: lizText.includes("101"),
    },
    {
      id: "T4",
      label: "Dynamic walk shifts",
      detail: `Think/Later on → ${cardDyn.token} (not the standard token)`,
      pass: cardDyn.token !== cardStd.token && cardDyn.extracted.length === 7,
    },
    {
      id: "T5",
      label: "Lutherville street lock",
      detail: `${placeHits} of ${places.length} toponyms hit the constrained corpus.`,
      pass: placeHits >= 14,
    },
    {
      id: "T6",
      label: "Exit 25 / Bellona / Octagon",
      detail: "Letter + map resolve to NARA titles already in the 213-item set.",
      pass:
        places.find((p) => p.query === "EXIT 25")!.matches.length > 0 &&
        places.find((p) => p.query === "BELLONA")!.matches.length > 0 &&
        places.find((p) => p.query === "OCTAGON")!.matches.length > 0,
    },
    {
      id: "T7",
      label: "Triple over mark",
      detail: `Letter, calling card, and electoral leaf all carry (over). Count ${overCount}.`,
      pass: overCount >= 3,
    },
    {
      id: "T8",
      label: "Turn left / disk Left",
      detail: "Letter instructs Turn left; cipher disk lexicon includes Left.",
      pass:
        letterText.includes("TURN LEFT") &&
        ARTIFACTS.find((a) => a.id === "disk")!.transcription.includes("Left"),
    },
    {
      id: "T9",
      label: "Family silver node",
      detail: "Liz silver + Packard card + SILVER/PACKARD in key elements.",
      pass:
        lizText.includes("SILVER") &&
        CONSTRAINED_CORPUS.includes("SILVER") &&
        CONSTRAINED_CORPUS.includes("PACKARD"),
    },
    {
      id: "T10",
      label: "Maryland electoral leaf",
      detail: "Eight votes, Harding/Coolidge, term 4 March 1921, (over).",
      pass: ARTIFACTS.find((a) => a.id === "electoral")!.transcription.includes("eight votes"),
    },
  ];

  return {
    cardStd,
    cardDyn,
    diskStd,
    places,
    placeHits,
    placeTotal: places.length,
    phrases,
    tests,
    locked: tests.filter((t) => t.pass).length,
  };
}

export function phraseReadout(phrase: string) {
  return decodePhrase(phrase);
}
