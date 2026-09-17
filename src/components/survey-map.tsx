import { useMemo } from "react";
import { OCTAGON_RAYS, SCALER_KM, SURVEY, TRUE_SOUTH, type SitePlot } from "@/lib/decoder/survey";

const SIZE = 640;
const CX = SIZE / 2;
const CY = SIZE / 2;
const PLOT_R = 268;
const MAX_KM = 350;

function rnd(n: number): number {
  return Math.round(n * 100) / 100;
}

function polar(az: number, km: number): { x: number; y: number } {
  const r = (km / MAX_KM) * PLOT_R;
  const rad = (az * Math.PI) / 180;
  return { x: rnd(CX + r * Math.sin(rad)), y: rnd(CY - r * Math.cos(rad)) };
}

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export function SurveyMap({ selectedId, onSelect }: Props) {
  const sites = useMemo(
    () => [SURVEY.origin, ...SURVEY.sites.filter((s) => s.family !== "probe")],
    [],
  );
  const rings = [SCALER_KM.gold, SCALER_KM.silver, 158, 284, 325];

  const wedge = useMemo(() => {
    const inner = 8;
    const outer = MAX_KM;
    const a0 = 178;
    const a1 = 187.6;
    const steps = 12;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const az = a0 + ((a1 - a0) * i) / steps;
      const p = polar(az, outer);
      pts.push(`${i === 0 ? "M" : "L"} ${p.x} ${p.y}`);
    }
    for (let i = steps; i >= 0; i--) {
      const az = a0 + ((a1 - a0) * i) / steps;
      const p = polar(az, inner);
      pts.push(`L ${p.x} ${p.y}`);
    }
    return `${pts.join(" ")} Z`;
  }, []);

  const southEnd = polar(TRUE_SOUTH, MAX_KM);
  const comoAz = SURVEY.sites.find((s) => s.id === "como")?.az ?? 186;
  const comoEnd = polar(comoAz, MAX_KM);
  const cross = polar(208, SURVEY.crossing.km);

  const octagon = useMemo(() => {
    const r = 16;
    const verts = OCTAGON_RAYS.map((ray) => {
      const az = ray.az + 22.5;
      const rad = (az * Math.PI) / 180;
      return `${rnd(CX + r * Math.sin(rad))},${rnd(CY - r * Math.cos(rad))}`;
    });
    return verts.join(" ");
  }, []);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full text-fg"
      role="img"
      aria-label="Azimuthal equidistant plot from Lutherville octagon origin"
    >
      <rect width={SIZE} height={SIZE} fill="currentColor" fillOpacity={0.03} />
      <path d={wedge} fill="currentColor" fillOpacity={0.05} />

      {rings.map((km) => {
        const r = rnd((km / MAX_KM) * PLOT_R);
        const isScaler = km === SCALER_KM.gold || km === SCALER_KM.silver;
        return (
          <g key={km}>
            <circle
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeOpacity={isScaler ? 0.28 : 0.1}
              strokeWidth={isScaler ? 1.25 : 1}
              strokeDasharray={isScaler ? undefined : "3 5"}
            />
            <text
              x={CX + 4}
              y={rnd(CY - r + 3)}
              fill="currentColor"
              fillOpacity={0.4}
              fontSize={9}
              fontFamily="IBM Plex Mono, ui-monospace, monospace"
              pointerEvents="none"
            >
              {km} km
            </text>
          </g>
        );
      })}

      {OCTAGON_RAYS.map((ray) => {
        const end = polar(ray.az, MAX_KM);
        const is7 = ray.line === 7;
        const lab = polar(ray.az, MAX_KM + 8);
        return (
          <g key={ray.line}>
            <line
              x1={CX}
              y1={CY}
              x2={end.x}
              y2={end.y}
              stroke="currentColor"
              strokeOpacity={is7 ? 0.85 : 0.18}
              strokeWidth={is7 ? 1.75 : 1}
            />
            <text
              x={lab.x}
              y={lab.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              fillOpacity={is7 ? 0.9 : 0.4}
              fontSize={10}
              fontFamily="IBM Plex Mono, ui-monospace, monospace"
              pointerEvents="none"
            >
              L{ray.line} {String(ray.az).padStart(3, "0")}°
            </text>
          </g>
        );
      })}

      <line
        x1={CX}
        y1={CY}
        x2={southEnd.x}
        y2={southEnd.y}
        stroke="currentColor"
        strokeOpacity={0.45}
        strokeWidth={1.25}
        strokeDasharray="5 4"
      />
      <line
        x1={CX}
        y1={CY}
        x2={comoEnd.x}
        y2={comoEnd.y}
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={1}
        strokeDasharray="2 4"
      />

      <polygon
        points={octagon}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.7}
        strokeWidth={1.25}
      />
      <circle cx={CX} cy={CY} r={3} fill="currentColor" />

      <polygon
        points={`${cross.x},${cross.y - 6} ${cross.x + 5},${cross.y} ${cross.x},${cross.y + 6} ${cross.x - 5},${cross.y}`}
        fill="currentColor"
        fillOpacity={0.9}
      />

      {sites
        .filter((s) => s.id !== "origin")
        .map((s) => (
          <SiteMark
            key={s.id}
            site={s}
            selected={selectedId === s.id}
            onSelect={onSelect}
          />
        ))}

      <text
        x={CX}
        y={SIZE - 14}
        textAnchor="middle"
        fill="currentColor"
        fillOpacity={0.4}
        fontSize={10}
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
      >
        Azimuthal equidistant · WGS84 Vincenty · N up · origin C-2
      </text>
    </svg>
  );
}

function SiteMark({
  site,
  selected,
  onSelect,
}: {
  site: SitePlot;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const p = polar(site.az, site.km);
  const labelR = Math.min(MAX_KM, site.km + 22);
  const lab = polar(site.az, labelR);
  const nudge = site.id === "vts" ? 10 : site.id === "arlington" ? -8 : 0;
  const lx = lab.x;
  const ly = rnd(lab.y + nudge);
  const fill =
    site.family === "lee" ? 0.85 : site.family === "winborne" ? 0.7 : 0.55;
  return (
    <g
      role="button"
      tabIndex={0}
      className="cursor-pointer"
      onClick={() => onSelect(site.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(site.id);
      }}
    >
      {selected && <circle cx={p.x} cy={p.y} r={11} fill="currentColor" fillOpacity={0.12} />}
      <circle
        cx={p.x}
        cy={p.y}
        r={selected ? 5 : 3.5}
        fill="currentColor"
        fillOpacity={fill}
      />
      <text
        x={lx}
        y={ly}
        textAnchor={p.x >= CX ? "start" : "end"}
        dominantBaseline="middle"
        fill="currentColor"
        fillOpacity={selected ? 0.95 : 0.55}
        fontSize={10}
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        pointerEvents="none"
      >
        {site.short}
      </text>
    </g>
  );
}
