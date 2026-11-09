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

/** Figur auf der Scholle, Sprung zur nächsten, Wasser darunter. */
export const IceFloeIcon = make(
  <>
    <path d={waves} />
    <rect x="2" y="16.5" width="7" height="2" rx="1" {...ink} />
    <rect x="15" y="16.5" width="7" height="2" rx="1" {...ink} />
    <Fig x={5.5} base={16.5} s={M} />
    <path d="M10.5 9c2-2.5 5-2.5 7 0M15 9h2.5V6.5" />
  </>,
);

/** Figur vor dem Seil zwischen zwei Pfosten, Blitz im Seil, Bogenpfeil zeigt: drüber. */
export const ElectricFenceIcon = make(
  <>
    <Fig x={5} />
    <path d="M12.5 11V21M21 11V21M12.5 13H15M19 13h2" />
    <path d="M18.25 10L14.75 15h2.5L16 20.5l4-6h-2.5l1.25-4.5z" {...ink} />
    <path d="M9 8.5C10.5 2 17.5 1.25 20 6.5M17.5 5.5L20 6.5l.75-2.75" />
  </>,
);

/** Eimer hängt an zwei Seilen über der Säure. */
export const AcidLakeIcon = make(
  <>
    <path d="M3 3l9 8M21 3l-9 8" />
    <path d="M9 11h6l-1 5h-4z" {...ink} />
    <path d={waves} />
  </>,
);

/** Raster mit dem versteckten Pfad als gefüllte Felder. */
export const SilentGridIcon = make(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M7.5 3v18M12 3v18M16.5 3v18M3 7.5h18M3 12h18M3 16.5h18" strokeWidth={1.25} />
    <g {...ink}>
      {[[0, 3], [1, 3], [1, 2], [2, 2], [2, 1], [3, 1], [3, 0]].map(([c, r]) => (
        <rect key={`${c}${r}`} x={3.75 + c * 4.5} y={3.75 + r * 4.5} width="3" height="3" rx="0.75" />
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
    <path d="M2 12h3.5M3.5 10l2 2-2 2M22 12h-3.5M20.5 10l-2 2 2 2" />
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
    <path d="M3 9.5V3.5M1.25 5.25L3 3.5l1.75 1.75M21 9.5V3.5M19.25 5.25L21 3.5l1.75 1.75" />
  </>,
);

/** Ball oben, zwei Figuren spielen ihn hoch. */
export const BallKeepUpIcon = make(
  <>
    <circle cx="12" cy="4.5" r="2.5" />
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
    {ring(8, 9, 1.75)}
    <path d="M12 7a5 5 0 1 1-5 5M5 10l2 2 2-2" />
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

/** Huhn (Stufe am Boden) steigt zum aufrechten Menschen auf. */
export const EvolutionIcon = make(
  <>
    <Knock id="jyp-evo" cut={<circle cx="9.4" cy="8.4" r=".6" {...dot} />}>
      <g {...ink}>
        <path d="M2 9.5l2.75 3.25c1-.5 2-.75 3-.75l.25-1.5h2l.25 2c.75.75 1.25 1.75 1.25 3 0 2.75-2.25 4.5-5 4.5S2 18.25 2 15.5z" />
        <circle cx="9" cy="8.75" r="2.25" />
        <path d="M7.25 6.75a1 1 0 0 1 1.5-1.25 1 1 0 0 1 1.75.25 1 1 0 0 1 .75 1.5z" />
        <path d="M11 8l1.75.85L11 9.7z" />
      </g>
    </Knock>
    <path d="M5.5 20v1M8 20v1" />
    <path d="M3 3h11M12 1l2 2-2 2" />
    <Fig x={19} s={M} />
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
      <rect x="7" y=".5" width="10" height="9" rx="2" fill="black" transform="rotate(-8 12 5)" />
    </mask>
    <g mask="url(#jyp-who-head)">
      <Bust x={12} head={11} r={3.5} w={6.5} />
    </g>
    <mask id="jyp-who-q" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" />
      <path d="M10.75 3.75a1.25 1.25 0 1 1 1.85 1.1c-.4.2-.6.45-.6.85" stroke="black" strokeWidth={1.5} fill="none" />
      <circle cx="12" cy="7.5" r=".8" fill="black" />
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

/** Ein Auge offen, eins zwinkert. */
export const WinkIcon = make(
  <>
    <path d="M2 12c1.5-3 3.5-4.5 5.5-4.5S11.5 9 13 12c-1.5 3-3.5 4.5-5.5 4.5S3.5 15 2 12z" />
    <circle cx="7.5" cy="12" r="1.75" {...ink} />
    <path d="M15 12.5c1.5 1.5 4.5 1.5 6 0M16 14l-.75 1.5M18 14.5V16M20 14l.75 1.5" />
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

/** Umwelt: Keimling mit zwei Blättern auf Erde. */
export const EnvironmentIcon = make(
  <>
    <path d="M4 21a8 3.5 0 0 1 16 0z" {...ink} />
    <path d="M12 18V10.5" />
    <path d="M11.5 13.5c-4.5 0-7-2.5-7-6.5 4.5 0 7 2.5 7 6.5zM12.5 11c0-4 2.5-7 7-7 0 4-2.5 7-7 7z" {...ink} />
  </>,
);

/** Nachbarschaft: zwei Häuser nebeneinander. */
export const NeighborhoodIcon = make(
  <Knock id="jyp-houses" cut={<path d="M7.25 21v-4.5M18 15.25h.01" strokeWidth={2.5} />}>
    <path d="M2 21v-8.5c0-.4.2-.8.5-1.1l4.75-4.3 4.75 4.3c.3.3.5.7.5 1.1V21zM13.5 21v-6.5c0-.4.2-.8.5-1.1l4-3.4 4 3.4v7.6z" {...ink} />
  </Knock>,
);

/** Generationen: Ältere Person mit Stock hält ein Kind an der Hand. */
export const GenerationsIcon = make(
  <>
    <path d="M3.25 14v7" />
    <Fig x={7} arms={[{ side: -1, to: [[-2, 3]] }, { side: 1, to: [[3.5, 3.5]] }]} />
    <Fig x={16.5} s={S} arms={[{ side: -1, to: [[-2.5, -0.25]] }]} />
  </>,
);

/** Kinder: Bauklötze, ausgestanzte Formen. */
export const ChildrenIcon = make(
  <Knock
    id="jyp-blocks"
    cut={
      <>
        <circle cx="7" cy="17" r="1.6" />
        <path d="M15.5 18.6l1.5-3.2 1.5 3.2z" />
        <rect x="10.4" y="6.4" width="3.2" height="3.2" rx="0.4" />
      </>
    }
  >
    <g {...ink}>
      <rect x="3" y="13" width="8" height="8" rx="1.75" />
      <rect x="13" y="13" width="8" height="8" rx="1.75" />
      <rect x="8" y="4" width="8" height="8" rx="1.75" />
    </g>
  </Knock>,
);

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

/** Theater: lachende und weinende Maske. */
export const DramaIcon = make(
  <>
    <Knock id="jyp-mask1" cut={<path d="M5 7h1.5M8.5 7H10M5.5 10.25c1 1 3 1 4 0" />}>
      <path d="M3 3.5h9V9a4.5 4.5 0 0 1-9 0z" {...ink} />
    </Knock>
    <Knock id="jyp-mask2" cut={<path d="M14.5 13h1.5M18 13h1.5M15 17c1-1 3-1 4 0" />}>
      <path d="M12.5 9.5h9V15a4.5 4.5 0 0 1-9 0z" {...ink} />
    </Knock>
  </>,
);

/** Musik und Poesie: zwei verbundene Achtelnoten. */
export const MusicIcon = make(
  <>
    <path d="M9 17.5V5.5M20 15.5v-12" />
    <path d="M9 4.25l11-2v3l-11 2z" {...ink} />
    <ellipse cx="6.25" cy="17.75" rx="3" ry="2.25" transform="rotate(-20 6.25 17.75)" {...ink} />
    <ellipse cx="17.25" cy="15.75" rx="3" ry="2.25" transform="rotate(-20 17.25 15.75)" {...ink} />
  </>,
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
