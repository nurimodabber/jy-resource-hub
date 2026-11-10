import React from 'react';

/**
 * Inhalts-Piktogramme für Karten und Detailseiten (Spiele, Dienst, Kunst). Bedien-Icons bleiben lucide.
 * Bauweise nach Leitsystem-Zeichen (Aicher München 1972, AIGA/DOT), damit sie von 16 bis 120 px tragen:
 * - Figur = gefüllter Kopf + Körper mit runden Schultern und Beinspalt (klein verschmilzt er, groß zeigt er Beine).
 * - Drei Figurgrößen: L (1), M (0,8), S (0,6). Arme 2,25 px (LIMB), Requisiten 2 px (SW), runde Enden.
 * - Kein Detail und keine Lücke unter 1,5 px; Ausstanzungen (Augen, Binde) per Maske statt aufgemalter Linien.
 * - Höchstens zwei ganze Figuren, Gruppen als Köpfe oder Büsten; keine Schrift außer einer einzelnen Ziffer.
 * - 24er-Raster mit 2 px Rand, Füße auf y 21.
 * strokeWidth von IconTile (1,75 für lucide) wird bewusst ignoriert: diese Familie hat ihre eigenen Stärken.
 */
type Props = { className?: string; strokeWidth?: number | string };

const SW = 2;
const LIMB = 2.25;
const L = 1;
const M = 0.8;
const S = 0.6;
const ink = { fill: 'currentColor', stroke: 'none' } as const;

const make = (children: React.ReactNode): React.FC<Props> => {
  const Icon: React.FC<Props> = ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={SW}
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
type Arm = { side: -1 | 1; to: Vec[] };

/** Stehende Figur, Füße auf `base`. Bei L: Kopf r 2,5 (oben y 3), Schultern ab y 9, Hüfte y 16. */
const Fig: React.FC<{ x: number; base?: number; s?: number; arms?: Arm[] }> = ({ x, base = 21, s = L, arms = [] }) => {
  const hr = Math.max(2.5 * s, 1.75);
  const half = 2.5 * s;
  const top = base - 12 * s;
  const shY = top + half;
  const hip = base - 5 * s;
  const gap = Math.max(0.5 * s, 0.35);
  return (
    <g>
      <circle cx={x} cy={top - Math.max(s, 0.6) - hr} r={hr} {...ink} />
      <path
        d={`M${x - half} ${base}V${shY}a${half} ${half} 0 0 1 ${2 * half} 0V${base}H${x + gap}V${hip}H${x - gap}V${base}z`}
        {...ink}
      />
      {arms.map(({ side, to }, i) => (
        <path
          key={i}
          d={`M${x + side * (half - 0.75)} ${shY + 0.25}${to.map(([dx, dy]) => `l${dx} ${dy}`).join('')}`}
          strokeWidth={LIMB}
        />
      ))}
    </g>
  );
};

/** Büste: gefüllter Kopf über gefüllten Schultern, Unterkante y 21. */
const Bust: React.FC<{ x: number; head: number; r?: number; w?: number }> = ({ x, head, r = 3, w = 6 }) => (
  <g {...ink}>
    <circle cx={x} cy={head} r={r} />
    <path d={`M${x - w} 21v-.5a${w} ${w * 0.8} 0 0 1 ${2 * w} 0v.5z`} />
  </g>
);

/** Ausstanzung aus gefüllten Formen. Gleiche ID auf mehreren Karten ist unkritisch: gleicher Inhalt. */
const Knock: React.FC<{ id: string; cut: React.ReactNode; children: React.ReactNode }> = ({ id, cut, children }) => (
  <>
    <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" />
      <g stroke="black" fill="none" strokeWidth="1.5">
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

const waves = 'M2 21c1.7-1.2 3.3-1.2 5 0s3.3 1.2 5 0 3.3-1.2 5 0 3.3 1.2 5 0';
const dot = { fill: 'black', stroke: 'none' } as const;

/**
 * Form aus Material Symbols (Google, Apache-2.0, https://github.com/google/material-design-icons),
 * Stil "rounded", gefüllt. Deren Raster ist 960 mit Ursprung unten; hier auf 24 umgerechnet und um 10 %
 * vergrößert, damit die Fläche zu den eigenen Piktogrammen passt.
 */
const Mat: React.FC<{ d: string }> = ({ d }) => <path d={d} transform="translate(-1.2 25.2) scale(.0275)" {...ink} />;

// ── Spiele: Zusammenarbeit ─────────────────────────────────────

/** Zwei Figuren, die Arme zweimal umeinander gedreht. */
export const KnotIcon = make(
  <>
    <Fig x={4} />
    <Fig x={20} />
    <path d="M5.75 11.5c3 0 3.25 5 6.25 5s3.25-5 6.25-5M5.75 16.5c3 0 3.25-5 6.25-5s3.25 5 6.25 5" strokeWidth={LIMB} />
  </>,
);

/** Stange liegt auf je einem Finger. */
export const HeliumStickIcon = make(
  <>
    <path d="M2 3h20" />
    <Fig x={7} s={M} arms={[{ side: 1, to: [[1, -1.5], [0, -7.4]] }]} />
    <Fig x={17} s={M} arms={[{ side: -1, to: [[-1, -1.5], [0, -7.4]] }]} />
  </>,
);

/** Begleitung führt die Person mit Augenbinde an der Hand und spricht mit ihr; Hütchen am Boden. */
export const MinefieldIcon = make(
  <>
    <Fig x={5.5} arms={[{ side: 1, to: [[5.25, 3.5]] }]} />
    <path d="M9.75 4a2.5 2.5 0 0 1 0 3.5M12 2.75a4.5 4.5 0 0 1 0 6" />
    <Knock id="jyp-mine3" cut={<path d="M14 5.5h9" />}>
      <Fig x={18.5} arms={[{ side: -1, to: [[-2.5, 3.5]] }]} />
    </Knock>
    <Knock id="jyp-cone" cut={<path d="M8 18.75h8" />}>
      <path d="M10 21l1.5-4.5h1L14 21z" {...ink} />
    </Knock>
  </>,
);

/** Zwei Figuren halten je ein schräges Rohrstück vor der Brust, der Ball rollt oben los. */
export const BallRunIcon = make(
  <>
    <mask id="jyp-pipe" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" />
      <path d="M2 12l9 2.25M13 14.5l9 2.25" stroke="black" strokeWidth={4.5} />
    </mask>
    <g mask="url(#jyp-pipe)">
      <Fig x={7} s={M} />
      <Fig x={17} s={M} />
    </g>
    <path d="M2 12l9 2.25M13 14.5l9 2.25" />
    <circle cx="4" cy="9.5" r="1.75" {...ink} />
  </>,
);

/** Vier Köpfe mit Augenbinde halten das Seil als Quadrat. */
export const BlindSquareIcon = make(
  <>
    <Knock id="jyp-square" cut={<path d="M1 4.5h7M16 4.5h7M1 19.5h7M16 19.5h7" />}>
      {[[4.5, 4.5], [19.5, 4.5], [4.5, 19.5], [19.5, 19.5]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" {...ink} />
      ))}
    </Knock>
    <path d="M8 4.5h8M8 19.5h8M4.5 8v8M19.5 8v8" />
  </>,
);

/** Figur steht auf der Decke, Pfeil zeigt das Wenden. */
export const BlanketFlipIcon = make(
  <>
    <path d="M2 21l3.5-4H22l-3.5 4z" />
    <Fig x={11} base={18.5} s={M} />
    <path d="M15 3a5 5 0 0 1 5 5M18 6l2 2 2-2" />
  </>,
);

/** Figur auf der Scholle, Sprungbogen zur nächsten, Wasser darunter. */
export const IceFloeIcon = make(
  <>
    <path d={waves} />
    <rect x="2" y="16.5" width="7" height="2" rx="1" {...ink} />
    <rect x="15" y="16.5" width="7" height="2" rx="1" {...ink} />
    <Fig x={5.5} base={16.5} s={M} />
    <path d="M9.5 11c0-3.5 2.5-4.5 4.5-4.5s4.5 1.25 4.5 3.5" />
    <path d="M16.75 10.25h3.5L18.5 13.25z" {...ink} />
  </>,
);

/** Zaun aus zwei Pfosten und zwei durchgehenden Drähten, darüber der Blitz, der Bogenpfeil führt über beides. */
export const ElectricFenceIcon = make(
  <>
    <path d="M4 13v8M20 13v8M4 15.5h16M4 19h16" />
    <path d="M13 5.75l-2.75 3.75h2L11.5 13l2.75-4h-2z" {...ink} />
    <path d="M5 10C5 5.5 8.5 3.5 12 3.5s7 2 7 4.75" />
    <path d="M16.5 7.75h5L19 11.25z" {...ink} />
  </>,
);

/** Eimer mit Henkel hängt an zwei Seilen über der Säure. */
export const AcidLakeIcon = make(
  <>
    <path d="M3 3l9 4.75M21 3l-9 4.75M8.5 11a3.5 3.5 0 0 1 7 0" />
    <path d="M7.5 11h9l-1 6h-7z" {...ink} />
    <path d={waves} />
  </>,
);

/** Rahmen mit dem versteckten Pfad als gefüllte Felder (ohne Gitterlinien, damit es klein ruhig bleibt). */
export const SilentGridIcon = make(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <g {...ink}>
      {[[0, 3], [1, 3], [1, 2], [2, 2], [2, 1], [3, 1], [3, 0]].map(([c, r]) => (
        <rect key={`${c}${r}`} x={5 + c * 3.5} y={5 + r * 3.5} width="3.5" height="3.5" rx="0.5" />
      ))}
    </g>
  </>,
);

/** Drei Figuren, der Größe nach. */
export const SilentLineIcon = make(
  <>
    <Fig x={4.5} s={S} />
    <Fig x={11.5} s={M} />
    <Fig x={19} s={L} />
  </>,
);

/** Zwei Figuren auf einer kleinen Insel, Pfeile von außen: sie schrumpft. */
export const ShrinkingIslandIcon = make(
  <>
    <ellipse cx="12" cy="19.5" rx="5.5" ry="1.5" {...ink} />
    <Fig x={9.75} base={18.5} s={S + 0.1} />
    <Fig x={14.25} base={18.5} s={S + 0.1} />
    <path d="M2 12h2M22 12h-2" />
    <path d="M3.75 10.25v3.5L6.25 12zM20.25 10.25v3.5L17.75 12z" {...ink} />
  </>,
);

/** Zwei in der Hocke, Rücken an Rücken und Arme eingehakt, drücken sich hoch. */
export const BackToBackIcon = make(
  <>
    <circle cx="9.25" cy="4.5" r="2.25" {...ink} />
    <circle cx="14.75" cy="4.5" r="2.25" {...ink} />
    <path
      d="M7 13V9.5a2.125 2.125 0 0 1 4.25 0V13a1.5 1.5 0 0 1-1.5 1.5H8.5A1.5 1.5 0 0 1 7 13zM12.75 13V9.5a2.125 2.125 0 0 1 4.25 0V13a1.5 1.5 0 0 1-1.5 1.5h-1.25a1.5 1.5 0 0 1-1.5-1.5z"
      {...ink}
    />
    <path d="M9.5 13.25H7a2 2 0 0 0-2 2V20.5M14.5 13.25H17a2 2 0 0 1 2 2V20.5" strokeWidth={3} />
    <path d="M10 10.75h4" strokeWidth={LIMB} />
    <path d="M3 9.5V6M21 9.5V6" />
    <path d="M1.25 6.5h3.5L3 3.5zM19.25 6.5h3.5L21 3.5z" {...ink} />
  </>,
);

/** Ball oben, zwei Figuren spielen ihn hoch. */
export const BallKeepUpIcon = make(
  <>
    <circle cx="12" cy="4.5" r="2.5" {...ink} />
    <Fig x={5} s={M} arms={[{ side: 1, to: [[3, -4]] }]} />
    <Fig x={19} s={M} arms={[{ side: -1, to: [[-3, -4]] }]} />
  </>,
);

// ── Spiele: Kennenlernen, Energie, Ruhe ───────────────────────

/** Drei Büsten, darüber eine gemeinsame Sprechblase, die weitergeht (…). */
export const StoryCircleIcon = make(
  <>
    <path d="M5.5 2h13A2.5 2.5 0 0 1 21 4.5v2A2.5 2.5 0 0 1 18.5 9H14l-2 2-2-2H5.5A2.5 2.5 0 0 1 3 6.5v-2A2.5 2.5 0 0 1 5.5 2z" />
    <circle cx="8" cy="5.5" r="1.25" {...ink} />
    <circle cx="12" cy="5.5" r="1.25" {...ink} />
    <circle cx="16" cy="5.5" r="1.25" {...ink} />
    <Bust x={5} head={15.25} r={2} w={3} />
    <Bust x={12} head={15.25} r={2} w={3} />
    <Bust x={19} head={15.25} r={2} w={3} />
  </>,
);

/** Köpfe im Kreis, der Klatsch-Impuls läuft rundherum. */
export const ClapCircleIcon = make(
  <>
    {ring(6, 8.5, 2.25)}
    <path d="M12 8a4 4 0 1 1-4 4" />
    <path d="M6.25 12.75h3.5L8 10.25z" {...ink} />
  </>,
);

/** Augen geschlossen, eine Zahl in der Sprechblase. */
export const CountTogetherIcon = make(
  <>
    <Knock id="jyp-count" cut={<path d="M6.75 10.75c.6.6 1.4.6 2 0M9.25 10.75c.6.6 1.4.6 2 0" />}>
      <Bust x={9} head={10.5} r={3.75} w={6.5} />
    </Knock>
    <path d="M15 2h5a2 2 0 0 1 2 2v3.5a2 2 0 0 1-2 2h-2l-2.5 2v-2H15a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    <path d="M16.75 4.25l1.25-.75v3.75" strokeWidth={1.75} />
  </>,
);

/** Kleines Huhn am Boden, Pfeil, großer aufrechter Mensch: die Entwicklungsstufen. */
export const EvolutionIcon = make(
  <>
    <Knock id="jyp-evo" cut={<circle cx="9.4" cy="8.4" r="1" {...dot} />}>
      <g {...ink} transform="translate(2 19.5) scale(.6) translate(-2 -20)">
        <path d="M2 9.5l2.75 3.25c1-.5 2-.75 3-.75l.25-1.5h2l.25 2c.75.75 1.25 1.75 1.25 3 0 2.75-2.25 4.5-5 4.5S2 18.25 2 15.5z" />
        <circle cx="9" cy="8.75" r="2.25" />
        <path d="M7.25 6.75a1 1 0 0 1 1.5-1.25 1 1 0 0 1 1.75.25 1 1 0 0 1 .75 1.5z" />
        <path d="M11 8l1.75.85L11 9.7z" />
      </g>
    </Knock>
    <path d="M4.1 19.75V21M5.6 19.75V21" strokeWidth={1.5} />
    <path d="M3.5 7.5h8" />
    <path d="M11 5.25v4.5L14 7.5z" {...ink} />
    <Fig x={18.5} />
  </>,
);

/** Hände über dem Kopf zusammen, Ruf nach beiden Seiten. */
export const ChopIcon = make(
  <>
    <Fig x={12} arms={[{ side: -1, to: [[-2, -5], [3, -4]] }, { side: 1, to: [[2, -5], [-3, -4]] }]} />
    <path d="M5 6.5L3 5.5M5 9.5H2.5M19 6.5l2-1M19 9.5h2.5" />
  </>,
);

/** Angriff links auf die erhobene Hand rechts, Treffer-Striche. */
export const NinjaIcon = make(
  <>
    <Fig x={5} arms={[{ side: 1, to: [[5, -4]] }]} />
    <Fig x={19} arms={[{ side: -1, to: [[-2.5, -3.5]] }]} />
    <path d="M12.25 3.5l.75 1.5M14.75 3l-.25 1.75" strokeWidth={1.5} />
  </>,
);

// ── Spiele: Raten ──────────────────────────────────────────────

/** Zettel mit Fragezeichen klebt schräg auf der Stirn. */
export const WhoAmIIcon = make(
  <>
    <mask id="jyp-who-head" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" />
      <rect x="7" y=".5" width="10" height="9" rx="2" fill="black" stroke="none" transform="rotate(-8 12 5)" />
    </mask>
    <g mask="url(#jyp-who-head)">
      <Bust x={12} head={11} r={3.5} w={6.5} />
    </g>
    <mask id="jyp-who-q" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" />
      <path d="M10.75 3.75a1.25 1.25 0 1 1 1.85 1.1c-.4.2-.6.45-.6.85" stroke="black" strokeWidth={1.5} fill="none" />
      <circle cx="12" cy="7.5" r=".8" fill="black" stroke="none" />
    </mask>
    <rect x="8" y="1.5" width="8" height="7" rx="1" transform="rotate(-8 12 5)" mask="url(#jyp-who-q)" {...ink} />
  </>,
);

/** Drei Köpfe, ihre geheimen Zahlenkarten steigen an. */
export const NumberLineIcon = make(
  <>
    <g {...ink}>
      <rect x="3" y="8" width="4" height="3" rx="0.75" />
      <rect x="10" y="5.5" width="4" height="3" rx="0.75" />
      <rect x="17" y="3" width="4" height="3" rx="0.75" />
      {[5, 12, 19].map((x) => (
        <g key={x}>
          <circle cx={x} cy="15" r="2.25" />
          <path d={`M${x - 3} 21v-.5a3 2.5 0 0 1 6 0v.5z`} />
        </g>
      ))}
    </g>
  </>,
);

/** Wolfskopf frontal, weiche Ohren und Kinn, Mond. */
export const WerewolfIcon = make(
  <>
    <path d="M19.5 2a3.5 3.5 0 1 0 2.5 6A3 3 0 1 1 19.5 2z" {...ink} />
    <Knock id="jyp-wolf" cut={<path d="M5.5 12.5l2 1M12.5 12.5l-2 1" strokeWidth={1.75} />}>
      <path
        d="M4 4.5c.6-.4 1.3-.2 1.8.3L8 7.5h2l2.2-2.7c.5-.5 1.2-.7 1.8-.3.5.3.7.9.7 1.5L15 12c0 5-3 9-6 9s-6-4-6-9l.3-5.5c0-.6.2-1.2.7-1.5z"
        {...ink}
      />
    </Knock>
  </>,
);

/** Hut, dunkle Brille, Mantel mit V-Ausschnitt. */
export const SpyIcon = make(
  <>
    <Knock id="jyp-spy" cut={<path d="M7 13.5h4M13 13.5h4" strokeWidth={2.25} />}>
      <g {...ink}>
        <path d="M7 9l1.2-5.2c.2-.9 1.1-1.4 2-1.1l1.8.6 1.8-.6c.9-.3 1.8.2 2 1.1L17 9z" />
        <ellipse cx="12" cy="9.5" rx="10" ry="1.75" />
        <path d="M7.5 12v1.5a4.5 4.5 0 0 0 9 0V12z" />
        <path d="M3.5 21.5V21c0-1.75 1.25-2.75 3.25-3.25L12 20.75l5.25-3c2 .5 3.25 1.5 3.25 3.25v.5z" />
      </g>
    </Knock>
  </>,
);

/** Lupe über zwei Personen. */
export const InvestigatorIcon = make(
  <>
    <circle cx="16" cy="7" r="4.5" />
    <path d="M19.25 10.25L22 13" strokeWidth={2.5} />
    <g {...ink}>
      <circle cx="5" cy="13.5" r="2.25" />
      <path d="M1.5 21v-.5a3.5 3 0 0 1 7 0v.5z" />
      <circle cx="12" cy="15" r="2.25" />
      <path d="M8.5 21v-.5a3.5 2.5 0 0 1 7 0v.5z" />
    </g>
  </>,
);

/** Anführer mit Krone, ein Eingegliederter legt die Hand auf seine Schulter. */
export const EmpireIcon = make(
  <>
    <path d="M5 6V2.5l1.75 1.5L8 2l1.25 2L11 2.5V6z" {...ink} />
    <Fig x={8} s={M} />
    <Fig x={17} s={M} arms={[{ side: -1, to: [[-5.25, 0]] }]} />
  </>,
);

/** Zwinkerndes Gesicht: ein Auge offen, eins zu, Lächeln (die übliche Zwinker-Form). */
export const WinkIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="8.75" cy="10" r="1.5" {...ink} />
    <path d="M13.5 10.5c1-1.25 2.75-1.25 3.75 0" strokeWidth={LIMB} />
    <path d="M8 14.5c2 2.25 6 2.25 8 0" />
  </>,
);

/** Schere über den Fans. */
export const ShowdownIcon = make(
  <>
    <circle cx="8.5" cy="10.5" r="2" />
    <circle cx="15.5" cy="10.5" r="2" />
    <path d="M9.75 8.75L15.5 2M14.25 8.75L8.5 2" />
    <g {...ink}>
      {[4, 12, 20].map((x) => (
        <g key={x}>
          <circle cx={x} cy="16.5" r="1.75" />
          <path d={`M${x - 2.5} 21.5v-.5a2.5 2 0 0 1 5 0v.5z`} />
        </g>
      ))}
    </g>
  </>,
);

/** Schüssel mit Zetteln. */
export const SaladBowlIcon = make(
  <>
    <path d="M6 12l1.25-7.25 3 .5L9.4 12zM11 12V3.75h3V12zM15.6 12l1.9-6.5 2.9.85L19 12z" {...ink} />
    <path d="M3 12h18c0 5-4 9-9 9s-9-4-9-9z" />
  </>,
);

/** Rückfall für neue Spiele ohne eigenes Icon: Würfel. */
export const GameFallbackIcon = make(
  <Knock
    id="jyp-die"
    cut={[[8, 8], [16, 8], [12, 12], [8, 16], [16, 16]].map(([cx, cy]) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="1.5" {...dot} />)}
  >
    <rect x="3" y="3" width="18" height="18" rx="4" {...ink} />
  </Knock>,
);

// ── Dienst-Bereiche ────────────────────────────────────────────

/** Umwelt: Hand, die etwas Wertvolles hält – Fürsorge (Material Symbols: volunteer_activism). */
export const EnvironmentIcon = make(<Mat d="M549-53q8 2 17 2t17-2l297-91q0-54-30.5-80.5T762-251H587q-45 0-69.5-4.5T477-265l-61-21q-6-2-8.5-7.5T407-305q2-6 7.5-8.5t11.5-.5l59 19q24 8 44 11t46 3h73q8 0 13-5t5-13q0-23-16-45.5T604-378l-245-92q-5-2-10.5-3t-10.5-1h-83v337l294 84ZM40-140q0 25 17.5 42.5T100-80h34q25 0 42.5-17.5T194-140v-274q0-25-17.5-42.5T134-474h-34q-25 0-42.5 17.5T40-414v274Zm606-340q-11 0-22-4.5T604-497L482-616q-30-29-50-64.5T412-758q0-51 35.5-86.5T534-880q34 0 62 17.5t50 43.5q22-26 50-43.5t62-17.5q51 0 86.5 35.5T880-758q0 42-20 77.5T810-616L688-497q-9 8-20 12.5t-22 4.5Z" />);

/** Nachbarschaft: zwei Häuser nebeneinander. */
export const NeighborhoodIcon = make(
  <Knock id="jyp-houses" cut={<path d="M7.25 21v-4.5M18 15.25h.01" strokeWidth={2.5} />}>
    <path d="M2 21v-8.5c0-.4.2-.8.5-1.1l4.75-4.3 4.75 4.3c.3.3.5.7.5 1.1V21zM13.5 21v-6.5c0-.4.2-.8.5-1.1l4-3.4 4 3.4v7.6z" {...ink} />
  </Knock>,
);

/** Generationen: gebeugte ältere Person mit Gehstock hält ein Kind an der Hand. */
export const GenerationsIcon = make(
  <>
    <circle cx="12" cy="5" r="2.5" {...ink} />
    <path d="M7.25 21v-7c0-3.1 1.9-5.25 4.4-5.25 1.9 0 3.35 1.5 3.35 3.4V21h-3v-5h-1.5v5z" {...ink} />
    <path d="M8.25 12.25L5.5 14.25M14.25 12.25l2.25 2.25" strokeWidth={LIMB} />
    <path d="M3.5 21v-6.75a1 1 0 0 1 2 0" />
    <Fig x={20} s={S} arms={[{ side: -1, to: [[-2.25, -0.5]] }]} />
  </>,
);

/** Kinder: Gruppe aus drei Köpfen, die mittlere vorn (Material Symbols: diversity_3). */
export const ChildrenIcon = make(<Mat d="M40-190v-130q0-29 20.5-49.5T110-390h141q17 0 32.5 8.5T310-358q29 42 74 65t96 23q51 0 96-23t75-65q11-15 26-23.5t32-8.5h141q29 0 49.5 20.5T920-320v130q0 13-8.5 21.5T890-160H690q-13 0-21.5-8.5T660-190v-89q-36 33-82.5 51T480-210q-51 0-97-18t-83-51v89q0 13-8.5 21.5T270-160H70q-13 0-21.5-8.5T40-190Zm440-140q-35 0-67.5-16.5T360-392q-16-23-38.5-37T273-448q29-30 91-46t116-16q54 0 116.5 16t91.5 46q-26 5-48.5 19T601-392q-20 29-52.5 45.5T480-330ZM160-460q-45 0-77.5-32.5T50-570q0-46 32.5-78t77.5-32q46 0 78 32t32 78q0 45-32 77.5T160-460Zm640 0q-45 0-77.5-32.5T690-570q0-46 32.5-78t77.5-32q46 0 78 32t32 78q0 45-32 77.5T800-460ZM480-580q-45 0-77.5-32.5T370-690q0-46 32.5-78t77.5-32q46 0 78 32t32 78q0 45-32 77.5T480-580Z" />);

/** Institutionen: Gebäude mit Giebel und Säulen. */
export const InstitutionIcon = make(
  <>
    <path d="M2.5 9L12 3.25 21.5 9z" {...ink} />
    <path d="M5 11.5v6M9.67 11.5v6M14.33 11.5v6M19 11.5v6" strokeWidth={2.5} />
    <path d="M2.5 20.5h19" />
  </>,
);

/** Kreativ: Pinsel mit Farbtropfen. */
export const CreativeIcon = make(
  <>
    <path d="M20.5 3.5l-7.25 7.25" strokeWidth={2.5} />
    <path d="M12.6 9.4l2 2-1.65 1.65-2-2z" {...ink} />
    <path d="M10.2 11.8l2 2c-.4 3.5-3 6.5-7.6 7.2-.6.1-1-.4-.8-1C5 15 7 12.2 10.2 11.8z" {...ink} />
  </>,
);

/** Rückfall Dienst: Herz. */
export const ServiceFallbackIcon = make(
  <path d="M12 20.5S3 15.25 3 9a4.75 4.75 0 0 1 9-2.1A4.75 4.75 0 0 1 21 9c0 6.25-9 11.5-9 11.5z" {...ink} />,
);

// ── Kunstformen ────────────────────────────────────────────────

/** Theater: lachende Maske vorn, weinende dahinter, leicht gegeneinander gedreht; Augen und offene Münder ausgestanzt. */
export const DramaIcon = make(
  <>
    <mask id="jyp-drama-back" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" stroke="none" />
      <path d="M2.5 9.5c3.1-1.6 6.4-1.6 9.5 0V14c0 2.9-2.1 5.25-4.75 5.25S2.5 16.9 2.5 14z" fill="black" stroke="black" strokeWidth={3} transform="rotate(-8 7.25 14)" />
      <g transform="rotate(8 16.75 8)">
        <path d="M13.75 7.25l2-.75M19.75 7.25l-2-.75" stroke="black" strokeWidth={1.75} />
        <path d="M14.5 12.25a2.25 2 0 0 1 4.5 0z" fill="black" stroke="none" />
      </g>
    </mask>
    <path d="M12 4c3.1-1.6 6.4-1.6 9.5 0v4.5c0 2.9-2.1 5.25-4.75 5.25S12 11.4 12 8.5z" {...ink} transform="rotate(8 16.75 8)" mask="url(#jyp-drama-back)" />
    <mask id="jyp-drama-front" maskUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32">
      <rect x="-4" y="-4" width="32" height="32" fill="white" stroke="none" />
      <path d="M4.5 12.25c.55-.8 1.45-.8 2 0M8 12.25c.55-.8 1.45-.8 2 0" stroke="black" strokeWidth={1.75} fill="none" />
      <path d="M5 14.5h4.5a2.25 2.25 0 0 1-4.5 0z" fill="black" stroke="none" />
    </mask>
    <path d="M2.5 9.5c3.1-1.6 6.4-1.6 9.5 0V14c0 2.9-2.1 5.25-4.75 5.25S2.5 16.9 2.5 14z" {...ink} transform="rotate(-8 7.25 14)" mask="url(#jyp-drama-front)" />
  </>,
);

/** Musik und Poesie: eine große Achtelnote mit geschwungenem, spitz auslaufendem Fähnchen. */
export const MusicIcon = make(
  <g {...ink}>
    <ellipse cx="8" cy="17.75" rx="4" ry="2.9" transform="rotate(-22 8 17.75)" />
    <rect x="10.75" y="2.5" width="2" height="15.5" rx="1" />
    <path d="M10.75 2.5h2c.4 2.6 2.4 3.9 4 5.4 1.7 1.6 2.6 4 1.4 7.1-.4-2.9-2.6-4.9-5.4-5.5V10h-2z" />
  </g>,
);

/** Bildende Kunst: Palette mit Farbflecken. */
export const PaletteIcon = make(
  <Knock
    id="jyp-palette"
    cut={[[7.5, 11], [9.5, 7], [14, 6.5], [7.75, 15.25]].map(([cx, cy]) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="1.5" {...dot} />)}
  >
    <path
      d="M12 2.5a9.5 9.5 0 0 0 0 19c1.5 0 2.25-1 2.25-2.25 0-1-.75-1.5-.75-2.5 0-1.25 1-2.25 2.5-2.25h2c2 0 3.5-1.5 3.5-3.5C21.5 6.25 17.25 2.5 12 2.5z"
      {...ink}
    />
  </Knock>,
);

/** Wandbild: Farbrolle über der frisch gestrichenen Bahn. */
export const MuralIcon = make(
  <>
    <rect x="3" y="3" width="14" height="5.5" rx="1.75" {...ink} />
    <rect x="3" y="10.5" width="5.5" height="10.5" rx="1.25" {...ink} />
    <path d="M17 5.75h2.5a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1H12v2.75" />
    <rect x="10.25" y="14" width="3.5" height="7.5" rx="1.25" {...ink} />
  </>,
);
