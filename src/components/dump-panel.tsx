"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ClipboardPaste, Inbox, Trash2, Upload } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DUMP_MAX_BYTES,
  classifyDump,
  defaultSchedule,
  loadSchedule,
  newDumpId,
  nextSlotToday,
  processDumpText,
  saveSchedule,
  sha256Bytes,
  type DumpItem,
  type DumpSchedule,
  type DumpSource,
} from "@/lib/decoder/dump";
import { scanDraft } from "@/lib/decoder/resurrect";
import { clearDump, listDump, putDump, removeDump } from "@/lib/decoder/dump-store";
import { pushDumpItem } from "@/lib/decoder/dump-rpc";

async function bytesOf(file: Blob): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

function decodeText(bytes: Uint8Array): string | null {
  try {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    if (text.includes("\u0000")) return null;
    const printable = text.replace(/[\t\n\r\u0020-\u007e\u00a0-\uFFFF]/g, "");
    if (printable.length > text.length * 0.05 && text.length > 32) return null;
    return text;
  } catch {
    return null;
  }
}

export function DumpPanel() {
  const [items, setItems] = useState<DumpItem[]>([]);
  const [schedule, setSchedule] = useState<DumpSchedule>(defaultSchedule);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [pasteBuf, setPasteBuf] = useState("");
  const [hint, setHint] = useState("Drop, paste, or photograph. Queue stays on this phone.");
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  const refresh = useCallback(async () => {
    setItems(await listDump());
  }, []);

  useEffect(() => {
    setSchedule(loadSchedule());
    void refresh();
  }, [refresh]);

  useEffect(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    for (const slot of schedule.slots) {
      const fire = nextSlotToday(slot);
      if (!fire) continue;
      const wait = fire.getTime() - Date.now();
      const id = window.setTimeout(() => {
        void runProcess("scheduled");
      }, wait);
      timers.current.push(id);
    }
    return () => timers.current.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule.slots[0], schedule.slots[1]]);

  async function ingestBlob(blob: Blob, name: string, source: DumpSource, mimeHint?: string) {
    const mime = blob.type || mimeHint || "application/octet-stream";
    const size = blob.size;
    const id = newDumpId();
    const created = new Date().toISOString();
    if (size > DUMP_MAX_BYTES) {
      const item: DumpItem = {
        id,
        created,
        source,
        name,
        mime,
        size,
        sha256: "oversized",
        status: "oversized",
        report: {
          kind: classifyDump(mime, name),
          integers: [],
          gate: scanDraft(""),
          notes: [`larger than ${DUMP_MAX_BYTES} bytes — hash skipped`],
        },
      };
      await putDump(item);
      await refresh();
      return;
    }
    const bytes = await bytesOf(blob);
    const sha256 = await sha256Bytes(bytes);
    const kind = classifyDump(mime, name);
    const text = kind === "image" ? undefined : decodeText(bytes) ?? undefined;
    let previewUrl: string | undefined;
    if (kind === "image" && size <= 2 * 1024 * 1024) {
      previewUrl = URL.createObjectURL(blob);
    }
    const report = processDumpText(text ?? `${name}\n${sha256}`, kind);
    const item: DumpItem = {
      id,
      created,
      source,
      name,
      mime,
      size,
      sha256,
      text: text?.slice(0, 200_000),
      previewUrl,
      status: report.gate.status === "GATE_BLOCKED" ? "blocked" : "processed",
      report,
    };
    await putDump(item);
    try {
      await pushDumpItem({
        data: {
          id: item.id,
          name: item.name,
          mime: item.mime,
          source: item.source,
          sha256: item.sha256,
          size: item.size,
          created: item.created,
          status: item.status,
          text: item.text,
          notes: report.notes,
          integers: report.integers,
          gate: report.gate.status,
        },
      });
    } catch {
      /* local queue still holds */
    }
    await refresh();
  }

  async function ingestFiles(files: FileList | File[], source: DumpSource) {
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        await ingestBlob(file, file.name, source, file.type);
      }
      setHint(`${files.length} item${files.length === 1 ? "" : "s"} queued.`);
    } finally {
      setBusy(false);
    }
  }

  async function ingestPasteText(raw: string) {
    const text = raw.trim();
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    await ingestBlob(blob, `clipboard-${new Date().toISOString().slice(11, 19)}.txt`, "paste", "text/plain");
    setPasteBuf("");
    setHint("Clipboard queued.");
  }

  const runProcess = useCallback(
    async (why: "manual" | "scheduled") => {
      setBusy(true);
      try {
        const all = await listDump();
        const queued = all.filter((i) => i.status === "queued");
        for (const item of queued) {
          const kind = classifyDump(item.mime, item.name);
          const report = processDumpText(item.text ?? `${item.name}\n${item.sha256}`, kind);
          const next: DumpItem = {
            ...item,
            status: report.gate.status === "GATE_BLOCKED" ? "blocked" : "processed",
            report,
          };
          await putDump(next);
          try {
            await pushDumpItem({
              data: {
                id: next.id,
                name: next.name,
                mime: next.mime,
                source: next.source,
                sha256: next.sha256,
                size: next.size,
                created: next.created,
                status: next.status,
                text: next.text,
                notes: report.notes,
                integers: report.integers,
                gate: report.gate.status,
              },
            });
          } catch {
            /* inbox write is a shadow — local queue still holds */
          }
        }
        const sched = loadSchedule();
        sched.lastRunIso = new Date().toISOString();
        saveSchedule(sched);
        setSchedule(sched);
        await refresh();
        setHint(
          why === "scheduled"
            ? `Scheduled pass finished · ${queued.length} item${queued.length === 1 ? "" : "s"}.`
            : `Processed ${queued.length} queued item${queued.length === 1 ? "" : "s"}.`,
        );
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  useEffect(() => {
    function onPaste(ev: ClipboardEvent) {
      const dt = ev.clipboardData;
      if (!dt) return;
      if (dt.files.length) {
        ev.preventDefault();
        void ingestFiles(dt.files, "paste");
        return;
      }
      const text = dt.getData("text/plain");
      if (text && text.length > 8) {
        ev.preventDefault();
        void ingestPasteText(text);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  function updateSlot(index: 0 | 1, value: string) {
    const next: DumpSchedule = {
      ...schedule,
      slots: index === 0 ? [value, schedule.slots[1]] : [schedule.slots[0], value],
    };
    saveSchedule(next);
    setSchedule(next);
  }

  const queued = items.filter((i) => i.status === "queued").length;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Resource dump</CardTitle>
          <CardDescription>
            Drop files, paste clipboard, or take a photo. The engine hashes, classifies, and
            gate-scans. Nothing here LOCKs. Grok also runs the inbox today at the two times below.
          </CardDescription>
        </CardHeader>
        <div
          className={cn(
            "flex min-h-44 flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center transition-colors duration-150",
            drag ? "border-accent bg-elevated" : "border-border bg-elevated/40",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files.length) void ingestFiles(e.dataTransfer.files, "file");
          }}
        >
          <Inbox className="size-8 text-muted" strokeWidth={1.5} />
          <p className="max-w-sm text-sm text-muted">{hint}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="size-4" />
              Files
            </Button>
            <Button type="button" variant="secondary" onClick={() => camRef.current?.click()} disabled={busy}>
              <Camera className="size-4" />
              Camera
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  await ingestPasteText(text);
                } catch {
                  setHint("Clipboard blocked — paste into the box below.");
                }
              }}
            >
              <ClipboardPaste className="size-4" />
              Paste
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            multiple
            onChange={(e) => {
              if (e.target.files?.length) void ingestFiles(e.target.files, "file");
              e.target.value = "";
            }}
          />
          <input
            ref={camRef}
            type="file"
            className="sr-only"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              if (e.target.files?.length) void ingestFiles(e.target.files, "camera");
              e.target.value = "";
            }}
          />
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block font-mono text-xs text-subtle">Or type / paste here</span>
          <textarea
            value={pasteBuf}
            onChange={(e) => setPasteBuf(e.target.value)}
            rows={4}
            className="w-full rounded-sm bg-elevated px-3 py-2 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            placeholder="Dump notes, numbers, a transcript…"
          />
        </label>
        <Button
          className="mt-2"
          variant="secondary"
          disabled={busy || !pasteBuf.trim()}
          onClick={() => void ingestPasteText(pasteBuf)}
        >
          Queue text
        </Button>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Twice today</CardTitle>
          <CardDescription>
            Local pass if this tab is open. Grok also fires the inbox at these Eastern times today —
            12:00 and 18:00 unless you change them here (local timers only; Grok stays on noon / 6pm).
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="mb-1 block font-mono text-xs text-subtle">First pass</span>
            <Input
              type="time"
              value={schedule.slots[0]}
              onChange={(e) => updateSlot(0, e.target.value)}
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block font-mono text-xs text-subtle">Second pass</span>
            <Input
              type="time"
              value={schedule.slots[1]}
              onChange={(e) => updateSlot(1, e.target.value)}
            />
          </label>
          <Button onClick={() => void runProcess("manual")} disabled={busy || queued === 0}>
            Process now
          </Button>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">
          {queued} queued · last run {schedule.lastRunIso ? schedule.lastRunIso.replace("T", " ").slice(0, 19) : "never"}
        </p>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>{items.length} held. Blocked items stay named and dark.</CardDescription>
            </div>
            {items.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await clearDump();
                  await refresh();
                }}
              >
                <Trash2 className="size-4" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        {items.length === 0 ? (
          <p className="text-sm text-muted">Empty. Dump something.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-md bg-elevated p-3 shadow-[var(--shadow-border)] sm:flex-row sm:items-start"
              >
                {item.previewUrl && (
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-sm object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm text-fg">{item.name}</p>
                    <Badge
                      variant={
                        item.status === "processed"
                          ? "pass"
                          : item.status === "blocked" || item.status === "oversized"
                            ? "fail"
                            : "warn"
                      }
                    >
                      {item.status}
                    </Badge>
                    <Badge>{item.source}</Badge>
                  </div>
                  <p className="mt-1 break-all font-mono text-xs text-subtle">
                    {item.size} B · {item.sha256.slice(0, 16)}
                  </p>
                  {item.report && (
                    <p className="mt-1 text-xs text-muted">
                      {item.report.kind} · gate {item.report.gate.status}
                      {item.report.integers.length ? ` · ints ${item.report.integers.slice(0, 8).join(", ")}` : ""}
                    </p>
                  )}
                </div>
                <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => void removeDump(item.id).then(refresh)}>
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
