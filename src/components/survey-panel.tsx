"use client";

import { useMemo, useState } from "react";
import { SurveyMap } from "@/components/survey-map";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDms } from "@/lib/decoder/geodesy";
import { LUTHERVILLE, SURVEY, type SitePlot } from "@/lib/decoder/survey";
import { cn } from "@/lib/utils";

function lockVariant(lock: SitePlot["lock"]): "pass" | "warn" | "accent" | "default" {
  if (lock === "line7" || lock === "south") return "pass";
  if (lock === "meridian") return "accent";
  return "default";
}

function lockLabel(lock: SitePlot["lock"]): string {
  if (lock === "line7") return "Line 7";
  if (lock === "south") return "true south";
  if (lock === "meridian") return "meridian";
  return "open";
}

function km(n: number, digits = 2): string {
  return n.toFixed(digits);
}

function az(n: number): string {
  return `${n.toFixed(2)}°`;
}

export function SurveyPanel() {
  const [selectedId, setSelectedId] = useState("arlington");
  const selected = useMemo(
    () => SURVEY.sites.find((s) => s.id === selectedId) ?? SURVEY.sites[0],
    [selectedId],
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Geodetic estate plot</CardTitle>
              <CardDescription>
                Azimuthal equidistant from the Lutherville octagon (C-2 / Node 4). Eight structural
                rays at 45°. WGS84 Vincenty, not the spherical table.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="pass">{SURVEY.locks.line7} Line 7</Badge>
              <Badge variant="pass">{SURVEY.locks.south} south</Badge>
              <Badge variant="accent">{SURVEY.locks.meridian} meridian</Badge>
            </div>
          </div>
        </CardHeader>
        <p className="font-mono text-xs text-muted">
          Origin {formatDms(LUTHERVILLE.lat, "lat")} · {formatDms(LUTHERVILLE.lon, "lon")} · 1708
          Kurtz Avenue
        </p>
      </Card>

      <Card className="overflow-hidden p-2 sm:p-3">
        <SurveyMap selectedId={selectedId} onSelect={setSelectedId} />
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{selected.name}</CardTitle>
            <CardDescription>{selected.line}</CardDescription>
          </CardHeader>
          <dl className="grid grid-cols-2 gap-3 font-mono text-sm">
            <Stat label="Distance" value={`${km(selected.km)} km`} />
            <Stat label="True azimuth" value={az(selected.az)} />
            <Stat label="Closest ray" value={`L${selected.rayLine} ${selected.ray}°`} />
            <Stat label="Δθ ray" value={`${selected.dRay >= 0 ? "+" : ""}${km(selected.dRay)}°`} />
            <Stat label="Δθ south" value={`${selected.dSouth >= 0 ? "+" : ""}${km(selected.dSouth)}°`} />
            <Stat label="Line 7 X-track" value={`${km(selected.xt7)} km`} />
            <Stat label="× 79 km" value={km(selected.x79, 3)} />
            <Stat label="× 118 km" value={km(selected.x118, 3)} />
          </dl>
          {selected.statedKm != null && selected.statedAz != null && (
            <p className="mt-3 font-mono text-xs text-subtle">
              Table stated {selected.statedKm.toFixed(1)} km / {selected.statedAz.toFixed(1)}° ·
              Vincenty residual {km(selected.km - selected.statedKm)} km /{" "}
              {km(selected.az - selected.statedAz)}°
            </p>
          )}
          <p className="mt-2 text-xs leading-normal text-muted">{selected.source}</p>
          <div className="mt-3">
            <Badge variant={lockVariant(selected.lock)}>{lockLabel(selected.lock)}</Badge>
            <span className="ml-2 font-mono text-xs text-subtle">{selected.asset}</span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line 7 × Como meridian</CardTitle>
            <CardDescription>
              Geodesic at 208° from C-2 until longitude equals Como / Node 6 (77° 00′ 14″ W).
            </CardDescription>
          </CardHeader>
          <dl className="grid grid-cols-2 gap-3 font-mono text-sm">
            <Stat label="Station" value={`${km(SURVEY.crossing.km)} km`} />
            <Stat label="Latitude" value={formatDms(SURVEY.crossing.point.lat, "lat")} />
            <Stat label="Longitude" value={formatDms(SURVEY.crossing.point.lon, "lon")} />
            <Stat
              label="vs 79 km ring"
              value={`${km(79 - SURVEY.crossing.km)} km short`}
            />
          </dl>
          <p className="mt-3 text-sm leading-normal text-muted">
            The 208° flank crosses the Como meridian at the Arlington range — 70.62 km, 1.0 km
            before the 79 km gold scaler and 6.1 km east of Arlington House. Virginia Theological
            Seminary (Joseph Packard) sits 78.4 km at 211.5°, 0.6 km off the 79 km ring and 3.5°
            off Line 7.
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line 7 chain south</CardTitle>
          <CardDescription>
            Stations along azimuth 208° into northern, then central, Virginia.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left font-mono text-xs">
            <thead className="text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Station</th>
                <th className="py-2 pr-3 font-medium">km</th>
                <th className="py-2 pr-3 font-medium">Latitude</th>
                <th className="py-2 font-medium">Longitude</th>
              </tr>
            </thead>
            <tbody>
              {SURVEY.line7Stations.map((st) => (
                <tr key={st.label} className="border-b border-border/60">
                  <td className="py-2 pr-3 text-fg">{st.label}</td>
                  <td className="py-2 pr-3 text-muted">{km(st.km)}</td>
                  <td className="py-2 pr-3 text-muted">{formatDms(st.point.lat, "lat")}</td>
                  <td className="py-2 text-muted">{formatDms(st.point.lon, "lon")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estate table — recomputed</CardTitle>
          <CardDescription>
            Same coordinates as your plot. Distances and azimuths replaced with WGS84 Vincenty
            inverse from the Kurtz Avenue datum.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left font-mono text-xs">
            <thead className="text-subtle">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Site</th>
                <th className="py-2 pr-3 font-medium">km</th>
                <th className="py-2 pr-3 font-medium">Az</th>
                <th className="py-2 pr-3 font-medium">Ray</th>
                <th className="py-2 pr-3 font-medium">Δθ</th>
                <th className="py-2 pr-3 font-medium">×79</th>
                <th className="py-2 pr-3 font-medium">×118</th>
                <th className="py-2 font-medium">Lock</th>
              </tr>
            </thead>
            <tbody>
              {SURVEY.sites.map((s) => (
                <tr
                  key={s.id}
                  className={cn(
                    "cursor-pointer border-b border-border/60",
                    selectedId === s.id ? "bg-elevated" : "hover:bg-elevated/50",
                  )}
                  onClick={() => setSelectedId(s.id)}
                >
                  <td className="py-2 pr-3 text-fg">{s.name}</td>
                  <td className="py-2 pr-3 text-muted">{km(s.km)}</td>
                  <td className="py-2 pr-3 text-muted">{az(s.az)}</td>
                  <td className="py-2 pr-3 text-muted">
                    L{s.rayLine} {s.ray}°
                  </td>
                  <td className="py-2 pr-3 text-muted">
                    {s.dRay >= 0 ? "+" : ""}
                    {km(s.dRay)}°
                  </td>
                  <td className="py-2 pr-3 text-muted">{km(s.x79, 3)}</td>
                  <td className="py-2 pr-3 text-muted">{km(s.x118, 3)}</td>
                  <td className="py-2">
                    <Badge variant={lockVariant(s.lock)}>{lockLabel(s.lock)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Separator className="my-4" />
        <p className="text-sm leading-normal text-muted">
          Meridional corridor 178°–187.6° holds Walters (Charles Street, 14.1 km / 178.0°),
          Nansemond (284.3 km / 179.2°), Stratford–Chantilly–Menokin (186°–188°), and Como
          (324.6 km / 186.1°). Line 7 (208°) holds Arlington, Leesylvania, and VTS. Sully sits
          on the Line 7 / Line 8 bisector. Menokin is 1.8 km from 2 × 79 km. Como is 2.751 ×
          118 km.
        </p>
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
