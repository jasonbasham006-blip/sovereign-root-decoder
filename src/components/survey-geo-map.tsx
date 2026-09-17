"use client";

import { useEffect, useRef } from "react";
import {
  LUTHERVILLE,
  MAG_SOUTH_1800,
  OCTAGON_RAYS,
  ROTATED_RAYS,
  SURVEY,
  TRUE_SOUTH,
  raySamples,
} from "@/lib/decoder/survey";

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
  frame: "matrix" | "west" | "corridor";
};

type Kind = "matrix" | "ext" | "bary" | "probe";

function nodeHtml(label: string, active: boolean, kind: Kind) {
  const bg = kind === "bary" ? "#c8ccd4" : "#1a1a1e";
  const fg = kind === "bary" ? "#09090b" : "#f1efe8";
  const ring = active ? "#c8ccd4" : "rgba(241,239,232,0.45)";
  const size = kind === "bary" || kind === "probe" ? 22 : 28;
  return `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${bg};color:${fg};border:1px solid ${ring};display:flex;align-items:center;justify-content:center;font:600 10px 'IBM Plex Mono',ui-monospace,monospace;box-shadow:0 0 0 1px rgba(9,9,11,0.5)">${label}</div>`;
}

function kindOf(id: string): Kind {
  if (id === "barycenter") return "bary";
  if (id === "como") return "ext";
  if (SURVEY.probes.some((p) => p.id === id)) return "probe";
  return "matrix";
}

function labelOf(id: string): string {
  if (id === "barycenter") return "Σ";
  const probe = SURVEY.probes.find((p) => p.id === id);
  if (probe) return probe.short;
  return String([...SURVEY.matrix, SURVEY.extension].find((s) => s.id === id)?.node ?? "");
}

export function SurveyGeoMap({ selectedId, onSelect, frame }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const Lref = useRef<any>(null);
  const markers = useRef<Record<string, any>>({});
  const spokes = useRef<any[]>([]);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  selectedRef.current = selectedId;
  onSelectRef.current = onSelect;
  const iconFn = useRef<((label: string, active: boolean, kind: Kind) => unknown) | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !el.current) return;
      const L = leaflet.default;
      Lref.current = L;

      const makeIcon = (label: string, active: boolean, kind: Kind) =>
        L.divIcon({
          className: "survey-node",
          iconSize: kind === "bary" || kind === "probe" ? [22, 22] : [28, 28],
          iconAnchor: kind === "bary" || kind === "probe" ? [11, 11] : [14, 14],
          html: nodeHtml(label, active, kind),
        });
      iconFn.current = makeIcon;

      const map = L.map(el.current, {
        zoomControl: true,
        attributionControl: true,
        worldCopyJump: false,
      });
      mapRef.current = map;

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri", maxZoom: 18 },
      ).addTo(map);
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Esri reference", maxZoom: 18, opacity: 0.85 },
      ).addTo(map);

      const toLatLngs = (pts: { lat: number; lon: number }[]) =>
        pts.map((p) => [p.lat, p.lon] as [number, number]);

      for (const ray of OCTAGON_RAYS) {
        const is7 = ray.line === 7;
        L.polyline(toLatLngs(raySamples(ray.az)), {
          color: "#f1efe8",
          weight: is7 ? 2.4 : 1,
          opacity: is7 ? 0.9 : 0.28,
          interactive: false,
        }).addTo(map);
      }

      for (const ray of ROTATED_RAYS) {
        L.polyline(toLatLngs(raySamples(ray.az)), {
          color: "#c8ccd4",
          weight: ray.line === 7 || ray.line === 1 || ray.line === 6 ? 1.6 : 1,
          opacity: 0.35,
          dashArray: "4 7",
          interactive: false,
        }).addTo(map);
      }

      L.polyline(toLatLngs(raySamples(TRUE_SOUTH)), {
        color: "#f1efe8",
        weight: 1.6,
        opacity: 0.7,
        dashArray: "6 6",
        interactive: false,
      }).addTo(map);

      L.polyline(toLatLngs(raySamples(MAG_SOUTH_1800)), {
        color: "#c4b08a",
        weight: 2.2,
        opacity: 0.88,
        interactive: false,
      }).addTo(map);

      const band = [...raySamples(178), ...[...raySamples(187.6)].reverse()];
      L.polygon(toLatLngs(band), {
        color: "#c8ccd4",
        weight: 0,
        fillColor: "#c8ccd4",
        fillOpacity: 0.12,
        interactive: false,
      }).addTo(map);

      for (const e of SURVEY.edges) {
        const pool = [...SURVEY.matrix, ...SURVEY.sites, ...SURVEY.probes];
        const a = pool.find((s) => s.id === e.from);
        const b = pool.find((s) => s.id === e.to);
        if (!a || !b) continue;
        L.polyline(
          [
            [a.lat, a.lon],
            [b.lat, b.lon],
          ],
          { color: "#c8ccd4", weight: 1.4, opacity: 0.55, dashArray: "2 6", interactive: false },
        ).addTo(map);
      }

      const bary = SURVEY.barycenter.point;
      spokes.current = [];
      for (const s of SURVEY.matrix) {
        if (s.node == null || s.node < 2) continue;
        const line = L.polyline(
          [
            [bary.lat, bary.lon],
            [s.lat, s.lon],
          ],
          {
            color: "#c8ccd4",
            weight: selectedRef.current === "barycenter" ? 2.2 : 1,
            opacity: selectedRef.current === "barycenter" ? 0.8 : 0.22,
            interactive: false,
          },
        ).addTo(map);
        spokes.current.push(line);
      }

      L.polyline(
        [
          [bary.lat, bary.lon],
          [SURVEY.barycenter.magSouthStation.lat, SURVEY.barycenter.magSouthStation.lon],
        ],
        {
          color: "#c4b08a",
          weight: 2,
          opacity: 0.8,
          dashArray: "5 4",
          interactive: false,
        },
      ).addTo(map);

      const addMark = (id: string, lat: number, lon: number, label: string, kind: Kind) => {
        const m = L.marker([lat, lon], {
          icon: makeIcon(label, id === selectedRef.current, kind),
          zIndexOffset: kind === "bary" ? 600 : kind === "probe" ? 500 : 400,
        }).addTo(map);
        m.on("click", () => onSelectRef.current(id));
        markers.current[id] = m;
      };

      for (const s of SURVEY.matrix) addMark(s.id, s.lat, s.lon, String(s.node), "matrix");
      addMark(SURVEY.extension.id, SURVEY.extension.lat, SURVEY.extension.lon, "9", "ext");
      addMark("barycenter", SURVEY.barycenter.point.lat, SURVEY.barycenter.point.lon, "Σ", "bary");
      for (const p of SURVEY.probes) addMark(p.id, p.lat, p.lon, p.short, "probe");

      const pts = [
        LUTHERVILLE,
        ...SURVEY.matrix.map((s) => ({ lat: s.lat, lon: s.lon })),
        SURVEY.extension,
      ];
      map.fitBounds(
        L.latLngBounds(pts.map((p) => [p.lat, p.lon] as [number, number])).pad(0.12),
      );
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markers.current = {};
      spokes.current = [];
    };
  }, []);

  useEffect(() => {
    const make = iconFn.current;
    if (!make) return;
    for (const [id, marker] of Object.entries(markers.current)) {
      marker.setIcon(make(labelOf(id), id === selectedId, kindOf(id)));
    }
    const on = selectedId === "barycenter";
    for (const line of spokes.current) {
      line.setStyle?.({ weight: on ? 2.2 : 1, opacity: on ? 0.8 : 0.22 });
    }
  }, [selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    const L = Lref.current;
    if (!map || !L) return;
    const pts =
      frame === "west"
        ? [
            LUTHERVILLE,
            ...SURVEY.matrix.map((s) => ({ lat: s.lat, lon: s.lon })),
            SURVEY.extension,
            ...SURVEY.probes.map((p) => ({ lat: p.lat, lon: p.lon })),
          ]
        : frame === "corridor"
          ? [
              LUTHERVILLE,
              SURVEY.barycenter.point,
              SURVEY.barycenter.magSouthStation,
              ...SURVEY.matrix.filter((s) => s.id === "nansemond" || s.id === "stratford"),
            ]
          : [
              LUTHERVILLE,
              ...SURVEY.matrix.map((s) => ({ lat: s.lat, lon: s.lon })),
              SURVEY.extension,
            ];
    map.fitBounds(L.latLngBounds(pts.map((p: { lat: number; lon: number }) => [p.lat, p.lon])).pad(0.12));
  }, [frame]);

  return (
    <div className="overflow-hidden rounded-lg shadow-[var(--shadow-border)]">
      <div ref={el} className="h-[28rem] w-full sm:h-[36rem]" />
    </div>
  );
}
