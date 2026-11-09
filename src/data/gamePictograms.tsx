import React from 'react';

/**
 * Eigene Spiel-Piktogramme. Bauweise nach Otl Aichers Olympia-Piktogrammen (München 1972) und AIGA/DOT:
 * - ein Figur-Modul für alle Icons: gefüllter Kopf, Rumpf und Glieder in fester Stärke (FIG), runde Enden;
 * - Requisiten (Seil, Ball, Blase, Raster) in der normalen lucide-Linie, damit Figur und Gegenstand sich trennen;
 * - Winkel nur 0°, 45° und 90°, 2 px Rand im 24er-Raster, keine Schrift-Glyphen.
 * Gleiche Stärke bei verkleinerten Figuren ist Absicht: so bleiben alle Icons eine Familie.
 */
type Props = { className?: string; strokeWidth?: number | string };

const FIG = 2.25;
const ink = { fill: 'currentColor', stroke: 'none' } as const;

const make = (children: React.ReactNode): React.FC<Props> => {
  const Icon: React.FC<Props> = ({ className, strokeWidth = 1.75 }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
  return Icon;
};

type Vec = [number, number];
const ARMS = {
  down: [[-2.5, 5], [2.5, 5]] as Vec[],
  up: [[-3.5, -3.5], [3.5, -3.5]] as Vec[],
  raise: [[-1.5, -5.5], [1.5, -5.5]] as Vec[],
  out: [[-4.5, 0], [4.5, 0]] as Vec[],
};

/** Stehende Figur. base = Fußlinie, s = Größe (1 = volle Höhe 2..20.5), arms = Endpunkte relativ zur Schulter. */
const Fig: React.FC<{ x: number; base?: number; s?: number; arms?: Vec[]; blind?: boolean }> = ({
  x,
  base = 20.5,
  s = 1,
  arms = ARMS.down,
  blind,
}) => {
  const headY = base - 16.25 * s;
  const sh = base - 12 * s;
  const hip = base - 6 * s;
  const r = Math.max(2.25 * s, 1.75);
  return (
    <g>
      <path
        d={`M${x} ${base - 12.5 * s}V${hip}L${x - 2 * s} ${base}M${x} ${hip}L${x + 2 * s} ${base}${arms
          .map(([dx, dy]) => `M${x} ${sh}l${dx * s} ${dy * s}`)
          .join('')}`}
        strokeWidth={FIG}
      />
      <circle cx={x} cy={headY} r={r} {...ink} />
      {blind && <path d={`M${x - r - 1.25} ${headY}h${2 * r + 2.5}l1 1.5`} strokeWidth={1.25} />}
    </g>
  );
};

/** Büste: gefüllter Kopf über gefüllten Schultern. */
const Bust: React.FC<{ x: number; head: number; r?: number; w?: number }> = ({ x, head, r = 3, w = 6.5 }) => (
  <g {...ink}>
    <circle cx={x} cy={head} r={r} />
    <path d={`M${x - w} 21.5a${w} ${w * 0.9} 0 0 1 ${2 * w} 0z`} />
  </g>
);

/** Ausstanzung (Augen, Brille) aus gefüllten Formen. Gleiche ID bei mehreren Karten ist unkritisch: gleicher Inhalt. */
const Knock: React.FC<{ id: string; cut: React.ReactNode; children: React.ReactNode }> = ({ id, cut, children }) => (
  <>
    <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" />
      <g stroke="black" fill="black">
        {cut}
      </g>
    </mask>
    <g mask={`url(#${id})`}>{children}</g>
  </>
);

const ring = (n: number, rad: number, r: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return <circle key={i} cx={12 + rad * Math.cos(a)} cy={12 + rad * Math.sin(a)} r={r} {...ink} />;
  });

// ── Zusammenarbeit ─────────────────────────────────────────────

export const KnotIcon = make(
  <>
    <Fig x={5} arms={[[-2.5, 5]]} />
    <Fig x={19} arms={[[2.5, 5]]} />
    <path d="M5 8.5l14 5M19 8.5l-14 5" strokeWidth={FIG} />
  </>,
);

export const HeliumStickIcon = make(
  <>
    <path d="M2.5 3h19" />
    <Fig x={7} base={21} s={0.8} arms={[[-2, -7.5], [2, -7.5]]} />
    <Fig x={17} base={21} s={0.8} arms={[[-2, -7.5], [2, -7.5]]} />
  </>,
);

export const BlanketFlipIcon = make(
  <>
    <path d="M2 21l4-4.5h16L18 21z" />
    <Fig x={11} base={18.5} s={0.85} />
    <path d="M16 3.5a4.5 4.5 0 0 1 4.5 4.5M18.5 6.5l2 2 2-2" />
  </>,
);

export const IceFloeIcon = make(
  <>
    <path d="M2 21.5c1.7-1 3.3-1 5 0s3.3 1 5 0 3.3-1 5 0 3.3 1 5 0" />
    <path d="M2 17.5h7M15 17.5h7" />
    <Fig x={5.5} base={16} s={0.8} />
    <path d="M10.5 9.5c2-2.5 5-2.5 7 0M15.5 9.5h2v-2" />
  </>,
);

export const MinefieldIcon = make(
  <>
    <Fig x={7} arms={[[4, 0], [4, 3]]} blind />
    <path d="M15 16l3 3M18 16l-3 3M18 9l3 3M21 9l-3 3" />
  </>,
);

export const BallRunIcon = make(
  <>
    <circle cx="4" cy="4.5" r="2" {...ink} />
    <path d="M1.5 7.5h9M13.5 7.5h9" />
    <Fig x={6} base={21} s={0.75} arms={ARMS.raise.map(([dx]) => [dx, -6.5] as Vec)} />
    <Fig x={18} base={21} s={0.75} arms={ARMS.raise.map(([dx]) => [dx, -6.5] as Vec)} />
  </>,
);

export const BlindSquareIcon = make(
  <>
    <path d="M8.5 5h7M8.5 19h7M5 8.5v7M19 8.5v7" />
    {[[5, 5], [19, 5], [5, 19], [19, 19]].map(([cx, cy]) => (
      <g key={`${cx}-${cy}`}>
        <circle cx={cx} cy={cy} r="2.5" {...ink} />
        <path d={`M${cx - 3.5} ${cy}h7`} strokeWidth={1.25} />
      </g>
    ))}
  </>,
);

export const NumberLineIcon = make(
  <>
    {[4.5, 12, 19.5].map((x) => (
      <g key={x}>
        <rect x={x - 2.5} y="2" width="5" height="5" rx="1" />
        <Fig x={x} base={21} s={0.7} />
      </g>
    ))}
    <path d="M4.2 3.9l.6-.5v2.4M11 3.8a1 1 0 0 1 2 .2c0 .7-2 1.8-2 1.8h2M18.5 3.4h2l-1 1a.9.9 0 1 1-1 1.4" strokeWidth={1} />
  </>,
);

export const ElectricFenceIcon = make(
  <>
    <path d="M3 10.5V21M21 10.5V21M3 13.5h18" />
    <circle cx="9" cy="4" r="2" {...ink} />
    <path d="M11 6l3.5 3.5L18 6M14.5 9.5l3.5 0M11 6l-2.5 3.5" strokeWidth={FIG} />
    <path d="M7 16.5l-1.5 2h3L7 20.5" strokeWidth={1.25} />
  </>,
);

export const AcidLakeIcon = make(
  <>
    <path d="M2 2.5l10 8.5M22 2.5l-10 8.5" />
    <path d="M9 13h6l-1 5h-4z" {...ink} />
    <path d="M10 13a2 2 0 0 1 4 0" />
    <path d="M2 21.5c1.7-1 3.3-1 5 0s3.3 1 5 0 3.3-1 5 0 3.3 1 5 0" strokeDasharray="0" />
  </>,
);

export const SilentGridIcon = make(
  <>
    <rect x="2.5" y="2.5" width="19" height="19" rx="2.5" />
    <path d="M7.25 2.5v19M12 2.5v19M16.75 2.5v19M2.5 7.25h19M2.5 12h19M2.5 16.75h19" strokeWidth={0.9} strokeOpacity={0.45} />
    <path d="M4.9 19.1h4.7v-4.7h4.8V9.6h4.7V4.9" strokeWidth={FIG} />
  </>,
);

export const SilentLineIcon = make(
  <>
    <Fig x={4.5} s={0.6} />
    <Fig x={12} s={0.8} />
    <Fig x={19.5} s={1} />
  </>,
);

export const ShrinkingIslandIcon = make(
  <>
    <ellipse cx="12" cy="19.5" rx="10" ry="2.5" strokeDasharray="2.5 2.5" />
    <ellipse cx="12" cy="19.5" rx="5.5" ry="1.25" {...ink} />
    <Fig x={9.5} base={18.5} s={0.8} arms={[[-3.5, 0], [1.5, 5]]} />
    <Fig x={14.5} base={18.5} s={0.8} arms={[[-1.5, 5], [3.5, 0]]} />
  </>,
);

export const BackToBackIcon = make(
  <>
    <circle cx="9.5" cy="5.5" r="2.25" {...ink} />
    <circle cx="14.5" cy="5.5" r="2.25" {...ink} />
    <path d="M9.5 9.5V14l-3.5 3v3.5M14.5 9.5V14l3.5 3v3.5M9.5 11h5" strokeWidth={FIG} />
    <path d="M3 9V3M1 5l2-2 2 2" />
  </>,
);

export const BallKeepUpIcon = make(
  <>
    <circle cx="12" cy="4.5" r="2.5" />
    <Fig x={5} base={21} s={0.85} arms={[[-2, -4.5], [3.5, -3.5]]} />
    <Fig x={19} base={21} s={0.85} arms={[[-3.5, -3.5], [2, -4.5]]} />
  </>,
);

// ── Kennenlernen, Energie, Ruhe ───────────────────────────────

export const StoryCircleIcon = make(
  <>
    {ring(6, 8.5, 1.9)}
    <path d="M8.5 9h7a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1h-3.5l-2 2v-2h-1.5a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1z" />
  </>,
);

export const ClapCircleIcon = make(
  <>
    {ring(8, 9, 1.6)}
    <path d="M12 6.5a5.5 5.5 0 1 1-5.5 5.5M4.5 10l2 2 2-2" />
  </>,
);

export const CountTogetherIcon = make(
  <>
    <Knock id="jyp-count" cut={<path d="M6.2 11.4c.5.6 1.3.6 1.8 0M9.6 11.4c.5.6 1.3.6 1.8 0" strokeWidth={1.1} fill="none" />}>
      <Bust x={8.8} head={11} r={3.75} w={6.5} />
    </Knock>
    <path d="M14 2.5h6.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H18l-2 2v-2h-2A1.5 1.5 0 0 1 12.5 8V4A1.5 1.5 0 0 1 14 2.5z" />
    <path d="M15.4 5l.9-.6v3.2M17.9 5.1a1 1 0 0 1 1.9.3c0 .8-2 2.2-2 2.2h2.1" strokeWidth={1.1} />
  </>,
);

export const EvolutionIcon = make(
  <>
    <ellipse cx="3.75" cy="18.25" rx="2" ry="2.5" {...ink} />
    <circle cx="10" cy="10" r="1.9" {...ink} />
    <path d="M11 13l2.5 3.5-1.5 4M13.5 16.5l1.5 4M11 13l-1.5 5" strokeWidth={FIG} />
    <Fig x={19.5} s={0.95} />
  </>,
);

export const ChopIcon = make(
  <>
    <Fig x={8} arms={[[6, -6], [6, -4.5]]} />
    <path d="M17.5 8.5h4M17 12l3 2M16.5 5l2-2.5" />
  </>,
);

export const NinjaIcon = make(
  <>
    <Fig x={5} arms={[[6, -3.5], [-2.5, 5]]} />
    <Fig x={19} arms={[[-4.5, 0], [2.5, 5]]} />
    <path d="M10.5 2.5l1.5 1.5M13 2l-.5 2" strokeWidth={1.25} />
  </>,
);

// ── Raten ──────────────────────────────────────────────────────

export const WhoAmIIcon = make(
  <>
    <rect x="8" y="1.75" width="8" height="5.5" rx="1.25" />
    <path d="M11 3.9a1.1 1.1 0 1 1 1.6 1c-.4.2-.6.4-.6.8M12 6.4v0" strokeWidth={1.1} />
    <Bust x={12} head={11.75} r={3} w={7} />
  </>,
);

export const WerewolfIcon = make(
  <>
    <path d="M19.5 2a3.25 3.25 0 1 0 2.5 5.3A2.75 2.75 0 1 1 19.5 2z" {...ink} />
    <g {...ink}>
      <path d="M7 9L6 4.5l3.5 2.5zM13 9l1-4.5-3.5 2.5z" />
    </g>
    <Bust x={10} head={10.75} r={3.5} w={7} />
  </>,
);

export const SpyIcon = make(
  <>
    <Knock id="jyp-spy" cut={<rect x="8.5" y="10.25" width="7" height="1.75" rx="0.6" stroke="none" />}>
      <g {...ink}>
        <path d="M8.5 7.5l.75-4.5h5.5l.75 4.5z" />
      </g>
      <path d="M5.5 8h13" strokeWidth={FIG} />
      <Bust x={12} head={11.25} r={2.9} w={7} />
    </Knock>
  </>,
);

export const InvestigatorIcon = make(
  <>
    <circle cx="16.5" cy="7.5" r="4.5" />
    <path d="M19.75 10.75L22 13" strokeWidth={FIG} />
    <g {...ink}>
      <circle cx="5" cy="13.5" r="2.25" />
      <path d="M1 21.5a4 3.5 0 0 1 8 0z" />
      <circle cx="12" cy="15" r="2.25" />
      <path d="M8 21.5a4 3 0 0 1 8 0z" />
    </g>
  </>,
);

export const EmpireIcon = make(
  <>
    <path d="M3.5 4.75V2l1.75 1.25L6.5 1.5l1.25 1.75L9.5 2v2.75z" {...ink} />
    <Fig x={6.5} base={21} s={0.9} />
    <Fig x={13} base={21} s={0.75} arms={[[-4.5, 0], [2, 4.5]]} />
    <Fig x={19} base={21} s={0.75} arms={[[-4.5, 0], [2, 4.5]]} />
  </>,
);

export const WinkIcon = make(
  <>
    <Knock
      id="jyp-wink"
      cut={
        <>
          <circle cx="9.75" cy="8.75" r="1" stroke="none" />
          <path d="M13 9c.6.7 1.8.7 2.4 0M9.5 11.75c1.3 1.2 3.7 1.2 5 0" strokeWidth={1.25} fill="none" />
        </>
      }
    >
      <Bust x={12} head={9.5} r={5} w={7.5} />
    </Knock>
    <path d="M18.5 3.5l1.5-1.5M19.75 6.25h2" />
  </>,
);

export const ShowdownIcon = make(
  <>
    <Fig x={2.75} base={21} s={0.6} arms={ARMS.raise} />
    <Fig x={9} base={21} s={0.85} arms={[[-2.5, 5], [3, 0]]} />
    <Fig x={15} base={21} s={0.85} arms={[[-3, 0], [2.5, 5]]} />
    <Fig x={21.25} base={21} s={0.6} arms={ARMS.raise} />
  </>,
);

export const SaladBowlIcon = make(
  <>
    <path d="M2.5 12.5h19c0 4.8-4.25 8.5-9.5 8.5s-9.5-3.7-9.5-8.5z" />
    <path d="M6.5 12.5l1.5-6 3.5 1-1.5 5M13 12.5l2.5-5.5 3 1.5-1.75 4" />
    <path d="M10 4l2-2 2 2" />
  </>,
);
