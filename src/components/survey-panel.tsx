"use client";

import { useMemo, useState } from "react";
import { SurveyGeoMap } from "@/components/survey-geo-map";
import { SurveyMap } from "@/components/survey-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDms } from "@/lib/decoder/geodesy";
import { LUTHERVILLE, SURVEY, squareSideKm, surveyAnchorCsv, type SitePlot } from "@/lib/decoder/survey";
import { cn } from "@/lib/utils";

function lockVariant(
  lock: SitePlot["lock"] | "bary",
): "pass" | "warn" | "accent" | "default" {
  if (lock === "line7" || lock === "south" || lock === "bisector" || lock === "origin") return "pass";
  if (lock === "meridian" || lock === "bary") return "accent";
  return "default";
}

function lockLabel(lock: SitePlot["lock"] | "bary"): string {
  if (lock === "origin") return "origin";
  if (lock === "line7") return "Line 7";
  if (lock === "south") return "true south";
  if (lock === "meridian") return "meridian";
  if (lock === "bisector") return "bisector";
  if (lock === "bary") return "barycenter";
  return "open";
}

function km(n: number, digits = 2): string {
  return n.toFixed(digits);
}

function az(n: number): string {
  return `${n.toFixed(2)}°`;
}

export function SurveyPanel() {
  const [selectedId, setSelectedId] = useState("barycenter");
  const [view, setView] = useState<"geo" | "polar">("geo");
  const [frame, setFrame] = useState<"matrix" | "west" | "corridor">("matrix");
  const selected = useMemo(
    () =>
      SURVEY.matrix.find((s) => s.id === selectedId) ??
      SURVEY.sites.find((s) => s.id === selectedId) ??
      SURVEY.probes.find((s) => s.id === selectedId),
    [selectedId],
  );
  const baryOn = selectedId === "barycenter";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Locked 8-node estate network</CardTitle>
              <CardDescription>
                Line 6 is a house-wall ray. Tidewater is the 1800 magnetic-south corridor. Patents
                fail-closed. Σ spokes and the 137.22 km scaler are on the map.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="pass">framework locked</Badge>
              <Badge variant="accent">Σ spokes</Badge>
              <Badge variant="warn">179° mag south</Badge>
            </div>
          </div>
        </CardHeader>
        <p className="font-mono text-xs text-muted">
          Origin {formatDms(LUTHERVILLE.lat, "lat")} · {formatDms(LUTHERVILLE.lon, "lon")} · 1708
          Kurtz Avenue
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant={view === "geo" ? "default" : "secondary"} onClick={() => setView("geo")}>
            Satellite
          </Button>
          <Button size="sm" variant={view === "polar" ? "default" : "secondary"} onClick={() => setView("polar")}>
            Polar plot
          </Button>
          <Button size="sm" variant={frame === "matrix" ? "default" : "secondary"} onClick={() => setFrame("matrix")}>
            Frame 8-node
          </Button>
          <Button size="sm" variant={frame === "west" ? "default" : "secondary"} onClick={() => setFrame("west")}>
            Frame west
          </Button>
          <Button
            size="sm"
            variant={frame === "corridor" ? "default" : "secondary"}
            onClick={() => setFrame("corridor")}
          >
            Frame corridor
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const blob = new Blob([surveyAnchorCsv()], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "sovereign-root-vincenty-anchors.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download CSV
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden p-2 sm:p-3">
        {view === "geo" ? (
          <SurveyGeoMap selectedId={selectedId} onSelect={setSelectedId} frame={frame} />
        ) : (
          <SurveyMap selectedId={selectedId} onSelect={setSelectedId} />
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ground lock</CardTitle>
          <CardDescription>
            Geodetic overlay only. No shafts, canisters, concealment, or excavation.
          </CardDescription>
        </CardHeader>
        <p className="text-sm leading-normal text-muted">
          Milepost 101 is NPS / Blue Ridge Parkway. Stratford Hall is a historic house museum. Como
          is a coordinate pin. Reverse-course stays fail-closed until you paste actual Chuckatuck or
          Quarter Swamp courses.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Locked spatial framework</CardTitle>
          <CardDescription>
            Three locks. Option 1 stays closed. Options 2 and 3 are computed and drawn.
          </CardDescription>
        </CardHeader>
        <ol className="space-y-4 text-sm leading-normal">
          <li>
            <p className="font-medium text-fg">1. Magnetic calibration vs Line 6</p>
            <p className="mt-1 text-muted">
              Historic |D| never exceeded 11° W, so Line 6 (163°) cannot rotate onto the Tidewater
              axis. By 1800, D ≈ −1.0° puts magnetic south at 179.0° true. Nansemond at 179.23° holds
              0.23°. Line 6 stays a house-wall ray. The gold line on the map is the survey-era
              magnetic-south corridor.
            </p>
          </li>
          <li>
            <p className="font-medium text-fg">2. Cadastral — fail-closed</p>
            <p className="mt-1 text-muted">
              No courses, perches, or beginning trees were pasted. Node 8 (Nansemond / Chuckatuck) is
              a point only and anchors the true-south axis independent of any patent polygon. Node 9
              (Joseph Lane 100 acres on Quarter Swamp) is a {km(squareSideKm(100), 3)} km ×{" "}
              {km(squareSideKm(100), 3)} km square scale note — unplotted until calls are ingested.
              Reverse-course (True = Magnetic + D, 1 perch = 16.5 ft) is armed.
            </p>
          </li>
          <li>
            <p className="font-medium text-fg">3. Rigid 7-node ECEF centroid Σ</p>
            <p className="mt-1 text-muted">
              {formatDms(SURVEY.barycenter.point.lat, "lat")}{" "}
              {formatDms(SURVEY.barycenter.point.lon, "lon")}. {km(SURVEY.barycenter.km)} km from C-2
              at {az(SURVEY.barycenter.az)}. {km(SURVEY.barycenter.dSouth)}° east of true south,{" "}
              {km(Math.abs(SURVEY.barycenter.dRay))}° from Line 7, {km(SURVEY.barycenter.vsMeridianHi)}°
              outside the meridian band. Closest estate Stratford {km(SURVEY.barycenter.closest.km)} km.
              Nansemond {km(SURVEY.barycenter.links.find((l) => l.id === "nansemond")!.km)} km. Sully{" "}
              {km(SURVEY.barycenter.links.find((l) => l.id === "sully")!.km)} km.
            </p>
          </li>
        </ol>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete 8-site matrix</CardTitle>
          <CardDescription>
            Six primary estates plus Lutherville origin and Sully as the western bisector.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left font-mono text-xs">
            <thead className="text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Node</th>
                <th className="py-2 pr-3 font-medium">Site</th>
                <th className="py-2 pr-3 font-medium">Role</th>
                <th className="py-2 pr-3 font-medium">km</th>
                <th className="py-2 pr-3 font-medium">Az</th>
                <th className="py-2 font-medium">Lock</th>
              </tr>
            </thead>
            <tbody>
              {SURVEY.matrix.map((s) => (
                <tr
                  key={s.id}
                  className={cn(
                    "cursor-pointer border-b border-border/60",
                    selectedId === s.id ? "bg-elevated" : "hover:bg-elevated/50",
                  )}
                  onClick={() => setSelectedId(s.id)}
                >
                  <td className="py-2 pr-3 text-fg">{s.node}</td>
                  <td className="py-2 pr-3 text-fg">{s.name}</td>
                  <td className="py-2 pr-3 text-muted">{s.role}</td>
                  <td className="py-2 pr-3 text-muted">{s.node === 1 ? "0" : km(s.km)}</td>
                  <td className="py-2 pr-3 text-muted">{s.node === 1 ? "—" : az(s.az)}</td>
                  <td className="py-2">
                    <Badge variant={lockVariant(s.lock)}>{lockLabel(s.lock)}</Badge>
                  </td>
                </tr>
              ))}
              <tr
                className={cn(
                  "cursor-pointer",
                  selectedId === "como" ? "bg-elevated" : "hover:bg-elevated/50",
                )}
                onClick={() => setSelectedId("como")}
              >
                <td className="py-2 pr-3 text-fg">9</td>
                <td className="py-2 pr-3 text-fg">{SURVEY.extension.name}</td>
                <td className="py-2 pr-3 text-muted">{SURVEY.extension.role}</td>
                <td className="py-2 pr-3 text-muted">{km(SURVEY.extension.km)}</td>
                <td className="py-2 pr-3 text-muted">{az(SURVEY.extension.az)}</td>
                <td className="py-2">
                  <Badge variant={lockVariant(SURVEY.extension.lock)}>
                    {lockLabel(SURVEY.extension.lock)}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {baryOn ? "Barycenter of nodes 2–8" : selected ? selected.name : "Site"}
            </CardTitle>
            <CardDescription>
              {baryOn
                ? "Equal-weight ECEF centroid of the seven southern matrix nodes."
                : selected?.role}
            </CardDescription>
          </CardHeader>
          {baryOn ? (
            <dl className="grid grid-cols-2 gap-3 font-mono text-sm">
              <Stat label="Latitude" value={formatDms(SURVEY.barycenter.point.lat, "lat")} />
              <Stat label="Longitude" value={formatDms(SURVEY.barycenter.point.lon, "lon")} />
              <Stat label="From C-2" value={`${km(SURVEY.barycenter.km)} km`} />
              <Stat label="Azimuth" value={az(SURVEY.barycenter.az)} />
            </dl>
          ) : selected ? (
            <dl className="grid grid-cols-2 gap-3 font-mono text-sm">
              <Stat label="Distance" value={`${km(selected.km)} km`} />
              <Stat label="True azimuth" value={az(selected.az)} />
              <Stat label="Closest ray" value={`L${selected.rayLine} ${selected.ray}°`} />
              <Stat label="Δθ ray" value={`${selected.dRay >= 0 ? "+" : ""}${km(selected.dRay)}°`} />
              <Stat label="× 79 km" value={km(selected.x79, 3)} />
              <Stat label="× 118 km" value={km(selected.x118, 3)} />
            </dl>
          ) : null}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Internal steps</CardTitle>
            <CardDescription>Vincenty between nodes — not along-track subtraction.</CardDescription>
          </CardHeader>
          <ul className="space-y-2 font-mono text-xs">
            {SURVEY.edges.map((e) => (
              <li key={e.label} className="flex items-start justify-between gap-3">
                <span className="text-muted">{e.label}</span>
                <span className="shrink-0 text-fg">
                  {km(e.km)} km · {az(e.az)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Σ spokes and 137.22 km scaler</CardTitle>
              <CardDescription>
                Seven vectors from the ECEF centroid to nodes 2–8. Select Σ to brighten them on the
                satellite map.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant={baryOn ? "default" : "secondary"}
              onClick={() => setSelectedId("barycenter")}
            >
              Select Σ
            </Button>
          </div>
        </CardHeader>
        <dl className="mb-4 grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
          <Stat label="Latitude" value={formatDms(SURVEY.barycenter.point.lat, "lat")} />
          <Stat label="Longitude" value={formatDms(SURVEY.barycenter.point.lon, "lon")} />
          <Stat label="From C-2" value={`${km(SURVEY.barycenter.km)} km`} />
          <Stat label="Azimuth" value={az(SURVEY.barycenter.az)} />
        </dl>
        <BarySpokePlot selectedId={selectedId} onSelect={setSelectedId} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left font-mono text-xs">
            <thead className="text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Node</th>
                <th className="py-2 pr-3 font-medium">Site</th>
                <th className="py-2 pr-3 font-medium">km from Σ</th>
                <th className="py-2 font-medium">Az from Σ</th>
              </tr>
            </thead>
            <tbody>
              {SURVEY.barycenter.links.map((l) => (
                <tr
                  key={l.id}
                  className={cn(
                    "cursor-pointer border-b border-border/60",
                    selectedId === l.id ? "bg-elevated" : "hover:bg-elevated/50",
                  )}
                  onClick={() => setSelectedId(l.id)}
                >
                  <td className="py-2 pr-3 text-fg">{l.node}</td>
                  <td className="py-2 pr-3 text-fg">{l.name}</td>
                  <td className="py-2 pr-3 text-muted">{km(l.km)}</td>
                  <td className="py-2 text-muted">{az(l.az)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Separator className="my-4" />
        <p className="mb-3 text-sm leading-normal text-muted">
          Radius 137.22 km vs 79 / 118 and the 1800 magnetic-south line (179.0° true). Distance does
          not change with declination. Σ is not on that corridor.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left font-mono text-xs">
            <thead className="text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Step</th>
                <th className="py-2 pr-3 font-medium">Predicted</th>
                <th className="py-2 pr-3 font-medium">Residual</th>
                <th className="py-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {SURVEY.barycenter.scalers.map((s) => (
                <tr key={s.label} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-fg">{s.label}</td>
                  <td className="py-2 pr-3 text-muted">{km(s.predicted)} km</td>
                  <td className="py-2 pr-3 text-muted">
                    {s.residualKm >= 0 ? "+" : ""}
                    {km(s.residualKm)} km
                  </td>
                  <td className="py-2 text-muted">
                    {s.residualPct >= 0 ? "+" : ""}
                    {km(s.residualPct)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-normal text-muted">
          1800 mag south = 179.0° true (gold corridor). Σ bears {az(SURVEY.barycenter.az)} true /{" "}
          {az(SURVEY.barycenter.magAz1800)} magnetic — {km(SURVEY.barycenter.vsMagSouth1800)}° off the
          line. Same-radius station MS is {km(SURVEY.barycenter.magSouthOffsetKm)} km from Σ at{" "}
          {az(SURVEY.barycenter.magSouthOffsetAz)}. Closest scaler residuals are ~0.4 km. Neither is
          an exact lock.
        </p>
        <p className="mt-3 text-sm leading-normal text-muted">
          Adding Como shifts Σ {km(SURVEY.bary9.shiftKm)} km at {az(SURVEY.bary9.shiftAz)} to{" "}
          {formatDms(SURVEY.bary9.point.lat, "lat")} {formatDms(SURVEY.bary9.point.lon, "lon")}.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Magnetic declination vs Line 6</CardTitle>
          <CardDescription>
            Line 6 stays a house-wall ray. Tidewater is the 1795–1800 magnetic-south corridor.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left font-mono text-xs">
            <thead className="text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Year</th>
                <th className="py-2 pr-3 font-medium">D</th>
                <th className="py-2 pr-3 font-medium">Mag south (true)</th>
                <th className="py-2 pr-3 font-medium">vs Nansemond</th>
                <th className="py-2 font-medium">Line 6 as mag</th>
              </tr>
            </thead>
            <tbody>
              {SURVEY.declination.map((d) => (
                <tr key={d.year} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-fg">{d.year}</td>
                  <td className="py-2 pr-3 text-muted">
                    {d.D.toFixed(3)}° ({d.D < 0 ? "W" : "E"})
                  </td>
                  <td className="py-2 pr-3 text-muted">{az(d.magSouthTrue)}</td>
                  <td className="py-2 pr-3 text-muted">
                    {d.vsNansemond >= 0 ? "+" : ""}
                    {km(d.vsNansemond)}°
                  </td>
                  <td className="py-2 text-muted">{az(d.line6Magnetic)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nansemond / Chuckatuck patents</CardTitle>
          <CardDescription>
            Option 1 stays closed. Node 8 is a point, not a polygon. Node 9 is a{" "}
            {km(squareSideKm(100), 3)} km square footprint — scale only, unplotted.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left font-mono text-xs">
            <thead className="text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Instrument</th>
                <th className="py-2 pr-3 font-medium">Holder</th>
                <th className="py-2 pr-3 font-medium">Place</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {SURVEY.patents.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-fg">{p.name}</td>
                  <td className="py-2 pr-3 text-muted">{p.holder}</td>
                  <td className="py-2 pr-3 text-muted">{p.place}</td>
                  <td className="py-2">
                    <Badge variant={p.status === "DOCUMENTED" ? "accent" : "warn"}>
                      {p.status === "POINT_ONLY"
                        ? "point only"
                        : p.status === "COURSES_ABSENT"
                          ? "no courses"
                          : "documented"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className="mt-0.5 text-fg">{value}</dd>
    </div>
  );
}

function BarySpokePlot({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const plotR = 128;
  const maxKm = 160;
  const rnd = (n: number) => Math.round(n * 10) / 10;
  const polar = (bearing: number, dist: number) => {
    const r = (dist / maxKm) * plotR;
    const rad = (bearing * Math.PI) / 180;
    return { x: rnd(cx + r * Math.sin(rad)), y: rnd(cy - r * Math.cos(rad)) };
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md text-fg" role="img" aria-label="Spokes from barycenter">
      <circle cx={cx} cy={cy} r={plotR} fill="none" stroke="currentColor" strokeOpacity={0.12} />
      <circle cx={cx} cy={cy} r={plotR * 0.5} fill="none" stroke="currentColor" strokeOpacity={0.08} />
      {SURVEY.barycenter.links.map((l) => {
        const p = polar(l.az, l.km);
        const on = selectedId === l.id;
        return (
          <g
            key={l.id}
            role="button"
            tabIndex={0}
            className="cursor-pointer"
            onClick={() => onSelect(l.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(l.id);
            }}
          >
            <line
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              strokeOpacity={on ? 0.9 : 0.35}
              strokeWidth={on ? 1.75 : 1}
            />
            <circle cx={p.x} cy={p.y} r={on ? 5 : 3.5} fill="currentColor" fillOpacity={on ? 0.95 : 0.7} />
            <text
              x={p.x}
              y={rnd(p.y + (p.y >= cy ? 12 : -8))}
              textAnchor="middle"
              fill="currentColor"
              fillOpacity={0.7}
              fontSize={9}
              fontFamily="IBM Plex Mono, ui-monospace, monospace"
              pointerEvents="none"
            >
              {l.node} {l.name}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={5} fill="currentColor" />
      {(() => {
        const p = polar(SURVEY.barycenter.magSouthOffsetAz, SURVEY.barycenter.magSouthOffsetKm);
        const on = selectedId === "mag-south-1800";
        return (
          <g
            role="button"
            tabIndex={0}
            className="cursor-pointer"
            onClick={() => onSelect("mag-south-1800")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect("mag-south-1800");
            }}
          >
            <line
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              strokeOpacity={on ? 0.9 : 0.45}
              strokeWidth={on ? 1.75 : 1}
              strokeDasharray="4 3"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={on ? 5 : 3.5}
              fill="none"
              stroke="currentColor"
              strokeOpacity={on ? 0.95 : 0.7}
            />
            <text
              x={p.x}
              y={rnd(p.y - 8)}
              textAnchor="middle"
              fill="currentColor"
              fillOpacity={0.7}
              fontSize={9}
              fontFamily="IBM Plex Mono, ui-monospace, monospace"
              pointerEvents="none"
            >
              MS
            </text>
          </g>
        );
      })()}
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="currentColor"
        fontSize={10}
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        pointerEvents="none"
      >
        Σ
      </text>
    </svg>
  );
}
