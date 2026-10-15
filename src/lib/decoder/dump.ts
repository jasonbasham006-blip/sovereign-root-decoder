/** Resource dump: classify, hash, gate-scan. Never LOCK. Never keys. Never filings. */

import { sha256Hex, sha256Raw } from "./hash";
import { scanDraft, type ResurrectionReport } from "./resurrect";

export const DUMP_MAX_BYTES = 8 * 1024 * 1024;
export const DUMP_MAX_TEXT = 200_000;
export const DUMP_SCHEDULE_KEY = "sovereign-dump-schedule";
export const DUMP_DEFAULT_SLOTS = ["12:00", "18:00"] as const;

export type DumpSource = "file" | "paste" | "camera";
export type DumpKind = "text" | "image" | "document" | "binary";
export type DumpStatus = "queued" | "processed" | "blocked" | "oversized";

export type DumpReport = {
  kind: DumpKind;
  integers: number[];
  gate: ResurrectionReport;
  notes: string[];
};

export type DumpItem = {
  id: string;
  created: string;
  source: DumpSource;
  name: string;
  mime: string;
  size: number;
  sha256: string;
  text?: string;
  previewUrl?: string;
  status: DumpStatus;
  report?: DumpReport;
};

export type DumpSchedule = {
  timezone: string;
  slots: [string, string];
  lastRunIso?: string;
};

function hexOf(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Bytes(data: Uint8Array): Promise<string> {
  return hexOf(await sha256Raw(data));
}

export function classifyDump(mime: string, name: string): DumpKind {
  const m = mime.toLowerCase();
  const n = name.toLowerCase();
  if (m.startsWith("text/") || m === "application/json" || m === "application/xml") return "text";
  if (m.startsWith("image/")) return "image";
  if (
    m.includes("pdf") ||
    m.includes("word") ||
    m.includes("officedocument") ||
    n.endsWith(".docx") ||
    n.endsWith(".pdf") ||
    n.endsWith(".rtf")
  ) {
    return "document";
  }
  if (n.endsWith(".txt") || n.endsWith(".md") || n.endsWith(".csv") || n.endsWith(".json")) return "text";
  return "binary";
}

export function extractIntegers(text: string): number[] {
  const found = text.match(/\b\d{2,12}\b/g) ?? [];
  const uniq = [...new Set(found.map((s) => Number(s)).filter((n) => Number.isFinite(n)))];
  uniq.sort((a, b) => a - b);
  return uniq.slice(0, 40);
}

function looksLikeSecret(text: string): boolean {
  if (/\bxprv|\bxpub|\bWIF\b/i.test(text)) return true;
  if (/\b[KL5][1-9A-HJ-NP-Za-km-z]{50,}\b/.test(text)) return true;
  return false;
}

export function processDumpText(text: string, kind: DumpKind): DumpReport {
  const notes: string[] = [];
  let body = text;
  if (body.length > DUMP_MAX_TEXT) {
    body = body.slice(0, DUMP_MAX_TEXT);
    notes.push("text truncated at 200k");
  }
  if (looksLikeSecret(body)) {
    notes.push("possible key material redacted — not stored");
    body = "[REDACTED]";
  }
  const gate = scanDraft(body);
  if (gate.status === "GATE_BLOCKED") notes.push("resurrection gate blocked — item stays dark");
  notes.push("status stays INGESTED/OPERATOR_ONLY — dump never LOCKs");
  notes.push("mapping open; no filing; no Taproot");
  return {
    kind,
    integers: extractIntegers(body),
    gate,
    notes,
  };
}

export async function digestDumpPayload(bytes: Uint8Array, asText: string | null): Promise<string> {
  if (asText !== null) return sha256Hex(asText);
  return sha256Bytes(bytes);
}

export function defaultSchedule(): DumpSchedule {
  return { timezone: "America/New_York", slots: ["12:00", "18:00"] };
}

export function loadSchedule(): DumpSchedule {
  if (typeof localStorage === "undefined") return defaultSchedule();
  try {
    const raw = localStorage.getItem(DUMP_SCHEDULE_KEY);
    if (!raw) return defaultSchedule();
    const parsed = JSON.parse(raw) as DumpSchedule;
    if (!parsed.slots?.[0] || !parsed.slots?.[1]) return defaultSchedule();
    return {
      timezone: parsed.timezone || "America/New_York",
      slots: [parsed.slots[0], parsed.slots[1]],
      lastRunIso: parsed.lastRunIso,
    };
  } catch {
    return defaultSchedule();
  }
}

export function saveSchedule(schedule: DumpSchedule): void {
  localStorage.setItem(DUMP_SCHEDULE_KEY, JSON.stringify(schedule));
}

/** Next fire Date for HH:MM today in local clock; null if already passed. */
export function nextSlotToday(hhmm: string, now = new Date()): Date | null {
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  const fire = new Date(now);
  fire.setHours(h, m, 0, 0);
  if (fire.getTime() <= now.getTime()) return null;
  return fire;
}

export function newDumpId(): string {
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
