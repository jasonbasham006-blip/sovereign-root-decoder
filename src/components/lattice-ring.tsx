import { useMemo } from "react";
import type { LatticeExtract } from "@/lib/decoder";

type Props = {
  extract: LatticeExtract;
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function LatticeRing({ extract }: Props) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = 124;

  const points = useMemo(() => {
    const n = extract.ring.length || 1;
    return [...extract.ring].map((ch, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        i,
        ch,
        x: round(cx + r * Math.cos(a)),
        y: round(cy + r * Math.sin(a)),
        onPath: extract.pathIndices.includes(i),
      };
    });
  }, [extract.ring, extract.pathIndices, cx, cy, r]);

  const pathD = extract.pathIndices
    .map((idx, k) => {
      const p = points[idx];
      if (!p) return "";
      return `${k === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto w-full max-w-sm text-fg"
      role="img"
      aria-label={`Circular lattice extracting token ${extract.token}`}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.12}
        strokeWidth={1}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r - 28}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.06}
        strokeWidth={1}
      />
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.55}
          strokeWidth={1.25}
          strokeLinejoin="round"
        />
      )}
      {points.map((p) => (
        <g key={p.i}>
          {p.onPath && (
            <circle cx={p.x} cy={p.y} r={12} fill="currentColor" fillOpacity={0.12} />
          )}
          <text
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono"
            fill="currentColor"
            fillOpacity={p.onPath ? 1 : 0.38}
            fontSize={p.onPath ? 13 : 10}
            fontWeight={p.onPath ? 600 : 400}
          >
            {p.ch}
          </text>
        </g>
      ))}
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        className="font-mono"
        fill="currentColor"
        fontSize={11}
        fillOpacity={0.5}
      >
        101 / 3
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        className="font-mono"
        fill="currentColor"
        fontSize={13}
        fontWeight={500}
      >
        {extract.token || "—"}
      </text>
    </svg>
  );
}
