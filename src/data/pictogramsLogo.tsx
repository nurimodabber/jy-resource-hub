import React from 'react';

/**
 * Spiel-Icons im Stil des Logos (Entscheidung des Inhabers, 2026-11-19).
 * - Figur wie im Logo: runder Kopf über einem gefüllten Bogen-Körper mit kleiner Beinkerbe. Keine dünnen Strichfiguren.
 * - Eine Idee pro Icon. Figuren in der neutralen Kachelfarbe, nur der Gegenstand, um den es geht, in Logo-Gold (`text-icon-gold`).
 * - 24er-Raster, 2 px Rand, Füße auf y 21. Arme 2,4 px, Gegenstände 1,5–2 px, nichts unter 1,5 px.
 */
type Props = { className?: string; strokeWidth?: number | string };

const GOLD = 'text-icon-gold';
const ink = { fill: 'currentColor', stroke: 'none' } as const;
const ARM = 2.4;
const dash = { strokeWidth: 1.5, strokeDasharray: '1.5 2' } as const;

const make = (children: React.ReactNode): React.FC<Props> => {
  const Icon: React.FC<Props> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
  return Icon;
};

/** Logo-Figur: Bogen-Körper der Breite w, oben bei `top`, Füße auf `base`. Arme gehen von der Schulter zur Hand (Zielpunkt). */
const Person: React.FC<{ x: number; w?: number; top?: number; base?: number; arms?: [number, number][] }> = ({
  x, w = 6.5, top = 10.5, base = 21, arms = [],
}) => {
  const r = w * 0.42;
  const n = 0.8;
  const shoulderY = top + w / 2 + 0.5;
  return (
    <g>
      <circle cx={x} cy={top - 1.2 - r} r={r} {...ink} />
      <path d={`M${x - w / 2} ${base}V${top + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${base}H${x + n}v-2.2a${n} ${n} 0 0 0 ${-2 * n} 0V${base}z`} {...ink} />
      {arms.map(([tx, ty], i) => (
        <path key={i} d={`M${x + Math.sign(tx - x) * (w / 2 - 1.2)} ${shoulderY}L${tx} ${ty}`} strokeWidth={ARM} />
      ))}
    </g>
  );
};
/** Kopfmitte einer Person, für Augenbinden. */
const headY = (w = 6.5, top = 10.5) => top - 1.2 - w * 0.42;

/** Schneidet eine waagerechte Binde aus dem Inhalt (Augenbinde). Gleiche ID auf mehreren Karten ist unkritisch: gleicher Inhalt. */
const Blind: React.FC<{ id: string; y: number; x1: number; x2: number; children: React.ReactNode }> = ({ id, y, x1, x2, children }) => (
  <>
    <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" stroke="none" />
      <path d={`M${x1} ${y}H${x2}`} stroke="black" strokeWidth={1.6} />
    </mask>
    <g mask={`url(#${id})`}>{children}</g>
  </>
);

/** Goldene Fläche mit ausgestanztem Zeichen (Ziffer, Fragezeichen). */
const Card: React.FC<{ id: string; x: number; y: number; w: number; h: number; text: string; tail?: boolean }> = ({ id, x, y, w, h, text, tail }) => (
  <g className={GOLD}>
    <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" stroke="none" />
      <text x={x + w / 2} y={y + h / 2 + 1.6} fontSize={4.6} fontWeight={800} textAnchor="middle" fill="black" stroke="none">{text}</text>
    </mask>
    <g mask={`url(#${id})`}>
      <rect x={x} y={y} width={w} height={h} rx={1.25} {...ink} />
      {tail && <path d={`M${x + w / 2 - 1.25} ${y + h - 0.2}l1.25 1.8 1.25-1.8z`} {...ink} />}
    </g>
  </g>
);

const Arrow: React.FC<{ d: string; head: string; className?: string }> = ({ d, head, className }) => (
  <g className={className}><path d={d} /><path d={head} /></g>
);

// ── Zusammenarbeit ─────────────────────────────────────────────

export const KnotLogo = make(
  <>
    <Person x={5.5} />
    <Person x={18.5} />
    <path d="M7.55 14.25L14 9.5M16.45 14.25L10 9.5" strokeWidth={ARM} className={GOLD} />
  </>,
);

export const CountLogo = make(
  <>
    <Person x={5.5} top={12} />
    <Person x={18.5} top={12} />
    <Card id="lg-count" x={8.75} y={2} w={6.5} h={5.5} text="1" tail />
  </>,
);

export const StoryLogo = make(
  <>
    <Person x={5.5} top={12} />
    <Person x={18.5} top={12} />
    {/* Jede Person sagt ein Wort, das nächste schließt an. */}
    <g className={GOLD}>
      <rect x={2.5} y={2} width={6} height={3.25} rx={1.6} {...ink} />
      <rect x={15.5} y={2} width={6} height={3.25} rx={1.6} {...ink} />
    </g>
    <Arrow d="M10 3.6h3.5" head="M12.25 2.4l1.25 1.2-1.25 1.2" />
  </>,
);

export const StickLogo = make(
  <>
    <Person x={6} />
    <Person x={18} />
    <path d="M2 14H22" strokeWidth={ARM} className={GOLD} />
  </>,
);

export const BackToBackLogo = make(
  <>
    <Person x={9} w={6} top={11} />
    <Person x={15} w={6} top={11} />
    <g className={GOLD} strokeWidth={1.75}>
      <path d="M3.25 19.5V11M1.9 12.5l1.35-1.5 1.35 1.5M20.75 19.5V11M19.4 12.5l1.35-1.5 1.35 1.5" />
    </g>
  </>,
);

export const SilentLineLogo = make(
  <>
    <Person x={4.5} w={5} top={14} />
    <g className={GOLD}><Person x={11.5} w={5.5} top={12} /></g>
    <Person x={19} w={6} top={10} />
  </>,
);

export const IceFloeLogo = make(
  <>
    <Person x={8} w={5.5} top={8.5} base={17} arms={[[13.5, 12.5]]} />
    <path d="M3 19.5l1.5-2.25h8l-1.5 2.25zM15.5 15.25l1-1.5h5l-1 1.5z" {...ink} className={GOLD} />
    <path d="M3 21.5q1.5-1 3 0t3 0 3 0 3 0 3 0 3 0" strokeWidth={1.5} />
  </>,
);

export const BallRunLogo = make(
  <>
    <Person x={4.5} w={5} top={12} arms={[[7.5, 15.2]]} />
    <Person x={16} w={5} top={12} arms={[[19, 16.2]]} />
    <path d="M6.5 15l5.5 1M18 16l4 .8" strokeWidth={2} className={GOLD} />
    <circle cx={10} cy={14} r={1.6} {...ink} />
  </>,
);

export const BlindSquareLogo = make(
  <>
    <path d="M3.5 16L7.5 11.5h9l4 4.5-3 4h-11z" className={GOLD} />
    <Blind id="lg-bsq" y={headY(6, 9.5)} x1={8} x2={16}>
      <Person x={12} w={6} top={9.5} arms={[[4.5, 15.5], [19.5, 15.5]]} />
    </Blind>
  </>,
);

export const BlanketFlipLogo = make(
  <>
    <path d="M3 21l2-3.25h11l-2 3.25z" {...ink} className={GOLD} />
    <path d="M16.75 17.75L19 21h-3.5z" {...ink} className={GOLD} />
    <Person x={9.5} w={6} top={8} base={17} />
    <Arrow d="M21 15.5c0-3-1.75-4.75-4.5-4.75" head="M16.5 10.75l1.5-1.25M16.5 10.75l1.5 1.25" />
  </>,
);

export const BallKeepUpLogo = make(
  <>
    <Person x={9} top={12} arms={[[14.5, 8.75]]} />
    <circle cx={16.5} cy={4.5} r={2.2} {...ink} className={GOLD} />
    <path d="M13 3.5v-1.25M20 3.5v-1.25" strokeWidth={1.5} />
  </>,
);

export const NumberLineLogo = make(
  <>
    {[4.5, 12, 19.5].map(x => <Person key={x} x={x} w={5.5} top={12} />)}
    <g className={GOLD}>
      {[4.5, 12, 19.5].map(x => <rect key={x} x={x - 2} y={2} width={4} height={3} rx={0.75} {...ink} />)}
    </g>
  </>,
);

export const ElectricFenceLogo = make(
  <>
    <Person x={6} w={5.5} />
    <path d="M10.5 21v-8M21 21v-8" />
    <path d="M10.5 14.5H21" strokeWidth={2} className={GOLD} />
    <Arrow d="M8.5 5.5C11 1.75 17 2 19 9" head="M19 9l.4-2.2M19 9l-2-.9" />
  </>,
);

export const AcidLakeLogo = make(
  <>
    <Person x={4.5} w={5.5} arms={[[8, 14.75]]} />
    <Person x={19.5} w={5.5} arms={[[16, 14.75]]} />
    <path d="M8 14.75l2.5 1.25M16 14.75l-2.5 1.25" strokeWidth={1.5} />
    <path d="M9.75 15.25h4.5l-.75 3.5h-3z" {...ink} className={GOLD} />
    <path d="M8 21h8" {...dash} />
  </>,
);

export const SilentGridLogo = make(
  <>
    <path d="M3 21l2.5-7h13l2.5 7zM4.25 17.5h15.5M9.33 14L8 21M14.67 14L16 21" strokeWidth={1.5} />
    <path d="M8.67 17.5h6.66L16 21H8z" {...ink} className={GOLD} />
    <Person x={12} w={4.5} top={7.5} base={14.5} />
  </>,
);

export const ShrinkingIslandLogo = make(
  <>
    {[7, 12, 17].map(x => <Person key={x} x={x} w={4.5} top={10} base={19} />)}
    <rect x={4} y={19.75} width={16} height={1.75} rx={0.875} {...ink} className={GOLD} />
    <path d="M2 20.6h.5M21.5 20.6h.5" strokeWidth={1.5} />
  </>,
);

export const EvolutionLogo = make(
  <>
    <Person x={4.5} w={5} top={15} />
    <Arrow className={GOLD} d="M9 15h5" head="M12.5 13.25L14.25 15l-1.75 1.75" />
    <Person x={18.5} top={10.5} arms={[[21, 6.5]]} />
  </>,
);

export const ClapCircleLogo = make(
  <>
    {[0, 1, 2, 3, 4, 5].map(i => {
      const a = (i * Math.PI) / 3 - Math.PI / 2;
      return <circle key={i} cx={12 + 7.5 * Math.cos(a)} cy={12 + 7.5 * Math.sin(a)} r={2.25} {...ink} />;
    })}
    <Arrow className={GOLD} d="M15.25 12a3.25 3.25 0 1 1-1.2-2.5" head="M14.05 9.5l.25-1.9M14.05 9.5l-1.9.1" />
  </>,
);

// ── Raten und Rollen ───────────────────────────────────────────

export const WhoAmILogo = make(
  <>
    <Person x={12} w={7} top={11.5} />
    <Card id="lg-who" x={8.75} y={2} w={6.5} h={5} text="?" />
  </>,
);

export const WerewolfLogo = make(
  <>
    <Person x={10} w={7.5} top={10} />
    <path d="M7.3 4.6L7.9 1.2l1.9 2.3zM12.7 4.6l-.6-3.4-1.9 2.3z" {...ink} />
    <path d="M19.5 2.5a3.5 3.5 0 1 0 2.5 6a2.8 2.8 0 0 1-2.5-6z" {...ink} className={GOLD} />
  </>,
);

export const SpyLogo = make(
  <>
    <Person x={12} w={7} top={11.5} />
    <g className={GOLD}>
      <rect x={6.5} y={4.75} width={11} height={1.6} rx={0.8} {...ink} />
      <path d="M9.25 5V2.75A.75.75 0 0 1 10 2h4a.75.75 0 0 1 .75.75V5z" {...ink} />
    </g>
  </>,
);

export const InvestigatorLogo = make(
  <>
    <Person x={7.5} />
    <g className={GOLD}>
      <circle cx={16} cy={8} r={3.25} strokeWidth={2} />
      <path d="M18.4 10.4l2.6 2.6" strokeWidth={ARM} />
    </g>
  </>,
);

export const EmpireLogo = make(
  <>
    <Person x={9} top={12} />
    <Person x={18.5} w={5} top={13.5} />
    <path d="M6.25 4.75V2.5l1.6 1.15L9 2l1.15 1.65L11.75 2.5v2.25z" {...ink} className={GOLD} />
  </>,
);

export const WinkLogo = make(
  <>
    <Person x={7.5} />
    <path d="M11.5 5.5l2.25-1M11.5 7.75l2.25 1" strokeWidth={1.5} className={GOLD} />
    {/* Die getroffene Person liegt am Boden. */}
    <circle cx={20} cy={18.75} r={2} {...ink} />
    <rect x={12} y={16.75} width={6} height={4.25} rx={2.1} {...ink} />
  </>,
);

export const ShowdownLogo = make(
  <>
    <Person x={5.5} top={12} />
    <Person x={18.5} top={12} />
    <g className={GOLD} strokeWidth={1.5}>
      <circle cx={10.4} cy={8.5} r={1.5} />
      <circle cx={13.6} cy={8.5} r={1.5} />
      <path d="M11.2 7.2L14.5 2.25M12.8 7.2L9.5 2.25" />
    </g>
  </>,
);

export const SaladBowlLogo = make(
  <>
    <g transform="rotate(-14 9 7)"><rect x={6.75} y={3.5} width={4.5} height={6} rx={0.75} {...ink} /></g>
    <g transform="rotate(12 15 6.5)"><rect x={12.75} y={3} width={4.5} height={6} rx={0.75} {...ink} /></g>
    <path d="M3 11.5h18a9 8.5 0 0 1-18 0z" {...ink} className={GOLD} />
  </>,
);

// ── Energie ────────────────────────────────────────────────────

export const ChopLogo = make(
  <>
    <Person x={12} top={12} arms={[[6.25, 9.5], [17.75, 9.5]]} />
    <path d="M2.5 7.5l1.75.75M3.5 4.75l1.5 1.5M21.5 7.5l-1.75.75M20.5 4.75l-1.5 1.5" strokeWidth={1.5} className={GOLD} />
  </>,
);

export const NinjaLogo = make(
  <>
    <Person x={6} arms={[[10.5, 8.5]]} />
    <Person x={18} arms={[[13.5, 8.5]]} />
    <path d="M12 2.25v2M9.5 3.5l1.1 1.4M14.5 3.5l-1.1 1.4" strokeWidth={1.5} className={GOLD} />
  </>,
);

export const ToasterLogo = make(
  <>
    <Person x={4} w={5} top={12} arms={[[7.25, 9]]} />
    <Person x={20} w={5} top={12} arms={[[16.75, 9]]} />
    <g className={GOLD}><Person x={12} w={5} top={8.5} base={16.5} /></g>
    <path d="M10.5 19.5h3" strokeWidth={1.5} />
  </>,
);

export const FruitSaladLogo = make(
  <>
    <path d="M2.5 9v12M2.5 15H7v6" strokeWidth={2} />
    <path d="M21.5 9v12M21.5 15H17v6" strokeWidth={2} className={GOLD} />
    <Person x={12} w={5.5} top={10.5} arms={[[8.75, 17.5], [15.25, 11.5]]} />
  </>,
);

export const NameBallLogo = make(
  <>
    <Person x={5} top={11} arms={[[9.5, 11]]} />
    <Person x={19} top={11} arms={[[14.5, 11]]} />
    <path d="M9.5 9Q12 2 14.5 9" {...dash} />
    <circle cx={12} cy={4.5} r={2.3} {...ink} className={GOLD} />
  </>,
);

export const JuggleLogo = make(
  <>
    <Person x={5} top={12} arms={[[9, 12]]} />
    <Person x={19} top={12} arms={[[15, 12]]} />
    <g className={GOLD}>
      <circle cx={8.75} cy={5.5} r={1.6} {...ink} />
      <circle cx={12} cy={3.25} r={1.6} {...ink} />
      <circle cx={15.25} cy={5.5} r={1.6} {...ink} />
    </g>
  </>,
);

export const DolphinLogo = make(
  <>
    <Person x={6.5} top={11} arms={[[11, 15]]} />
    <path d="M13 20.25h4" {...dash} />
    <circle cx={20} cy={20} r={1.5} {...ink} />
    <path d="M13.75 6l1.25 1.75M17.25 4.5v2.25M20.75 6L19.5 7.75" strokeWidth={1.5} className={GOLD} />
  </>,
);

export const RobotLogo = make(
  <>
    <Person x={5.5} w={6} top={11.5} arms={[[12.25, 14.5]]} />
    <Person x={16} top={11.5} />
    <g className={GOLD}>
      <path d="M16 4.8V3.4" strokeWidth={1.5} />
      <circle cx={16} cy={2.6} r={1.1} {...ink} />
    </g>
  </>,
);

// ── Bauen und Gestalten ────────────────────────────────────────

export const TowerLogo = make(
  <>
    <Person x={4.5} w={4.5} top={13} arms={[[8, 15.5]]} />
    <g className={GOLD} strokeWidth={1.5}>
      <path d="M9 21L12 7.5h2L17 21M10.2 15.5h5.6M11.1 11.25h3.8M10.2 15.5l4.7-4.25M15.8 15.5l-4.7-4.25" />
    </g>
    <rect x={11.25} y={3} width={3.5} height={3} rx={1} {...ink} />
  </>,
);

export const EggDropLogo = make(
  <>
    <ellipse cx={12} cy={5} rx={2.2} ry={2.8} {...ink} className={GOLD} />
    <path d="M12 9.5v2.5" {...dash} />
    <path d="M7 21v-7h10v7zM7 14l10 7M17 14L7 21" strokeWidth={1.5} />
  </>,
);

export const RopeHouseLogo = make(
  <>
    <path d="M6 20V11h12v9zM6 11l6-6 6 6M6 11l12 9M18 11L6 20" className={GOLD} />
    <circle cx={6} cy={20} r={2} {...ink} />
    <circle cx={18} cy={20} r={2} {...ink} />
    <circle cx={12} cy={4.5} r={2} {...ink} />
  </>,
);

export const ChairTiltLogo = make(
  <>
    <Person x={4.5} w={5} top={12.5} arms={[[8.6, 9.5]]} />
    <g transform="rotate(-20 13 21)" className={GOLD}>
      <path d="M13 21V6M13 13.5h7V21" strokeWidth={2.25} />
    </g>
  </>,
);

export const PenStringsLogo = make(
  <>
    <path d="M12 8L4 4.5M12 8l8-3.5M12 8l-8 5M12 8l8 5" strokeWidth={1.5} />
    {[[4, 4.5], [20, 4.5], [4, 13], [20, 13]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={2} {...ink} />)}
    <path d="M10.75 6h2.5v8.5L12 17l-1.25-2.5z" {...ink} className={GOLD} />
    <path d="M12 20.25c-2.5 1.25-5-.75-8 .5" strokeWidth={1.5} />
  </>,
);

export const NamePoemLogo = make(
  <>
    <Person x={6} top={11} arms={[[12, 14.5]]} />
    <mask id="lg-poem" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" stroke="none" />
      <path d="M14.5 8h4M14.5 11.5h3M14.5 15h4" stroke="black" strokeWidth={1.5} />
    </mask>
    <rect x={12} y={5} width={9} height={13} rx={1.5} mask="url(#lg-poem)" {...ink} className={GOLD} />
  </>,
);

export const SculptureLogo = make(
  <>
    <Person x={7} w={6} top={9.5} base={18.5} arms={[[12, 9.5], [3.25, 9]]} />
    <Person x={17} w={6} top={9.5} base={18.5} arms={[[12, 9.5], [20.75, 9]]} />
    <rect x={3.5} y={19.25} width={17} height={1.75} rx={0.875} {...ink} className={GOLD} />
  </>,
);

// ── Ruhe und Wahrnehmung ───────────────────────────────────────

export const MinefieldLogo = make(
  <>
    <Blind id="lg-blind" y={headY(7.5, 9.5)} x1={3} x2={11}>
      <Person x={7} w={7.5} top={9.5} arms={[[12.5, 12.5]]} />
    </Blind>
    <path d="M14 21l2-4 2 4zM18.5 15l1.75-3.5L22 15z" {...ink} className={GOLD} />
  </>,
);

export const MirrorLogo = make(
  <>
    <Person x={6} arms={[[10.6, 10.5]]} />
    <Person x={18} arms={[[13.4, 10.5]]} />
    <path d="M12 3V21" className={GOLD} />
  </>,
);

export const SoundGuessLogo = make(
  <>
    <Person x={5} w={6} top={11} arms={[[7.6, 7.3]]} />
    <rect x={13} y={11} width={8} height={10} rx={1} {...ink} />
    <path d="M14.5 7.5a3.5 3.5 0 0 1 5 0M13 5a6 6 0 0 1 8 0" className={GOLD} />
  </>,
);

export const BreathLogo = make(
  <>
    <circle cx={12} cy={6.5} r={2.6} {...ink} />
    <path d="M9 17v-4.25a3 3 0 0 1 6 0V17z" {...ink} />
    <rect x={5} y={17.25} width={14} height={3.75} rx={1.875} {...ink} />
    <path d="M6.5 4a6 6 0 0 0 0 7M17.5 4a6 6 0 0 1 0 7" className={GOLD} />
  </>,
);

export const CurtainLogo = make(
  <>
    <Person x={4.5} w={5} top={12} />
    <Person x={19.5} w={5} top={12} />
    <rect x={9.5} y={2.5} width={5} height={11} rx={1} {...ink} className={GOLD} />
    <Arrow d="M12 16v4.5" head="M10.5 19l1.5 1.5 1.5-1.5" />
  </>,
);

/** Ein Icon pro Spiel-ID. */
export const LOGO_GAME_ICONS: Record<string, React.FC<Props>> = {
  'menschlicher-knoten': KnotLogo,
  'gemeinsam-zaehlen': CountLogo,
  minenfeld: MinefieldLogo,
  'ein-wort-geschichte': StoryLogo,
  'helium-stick': StickLogo,
  'stand-up-ruecken': BackToBackLogo,
  'stumme-reihe': SilentLineLogo,
  'eisschollen-rettung': IceFloeLogo,
  'lebender-balltransport': BallRunLogo,
  'blindes-quadrat': BlindSquareLogo,
  'decke-wenden': BlanketFlipLogo,
  '100-schlaege-ball': BallKeepUpLogo,
  'blindes-zahlen-sortieren': NumberLineLogo,
  'elektrischer-zaun': ElectricFenceLogo,
  saeuresee: AcidLakeLogo,
  'stille-matrix': SilentGridLogo,
  'schrumpfende-insel': ShrinkingIslandLogo,
  'ssp-evolution': EvolutionLogo,
  'impuls-kreis': ClapCircleLogo,
  'wer-bin-ich': WhoAmILogo,
  werwolf: WerewolfLogo,
  spion: SpyLogo,
  psychiater: InvestigatorLogo,
  empire: EmpireLogo,
  'schlafmuetze-moerder': WinkLogo,
  'ssp-showdown': ShowdownLogo,
  'salad-bowl': SaladBowlLogo,
  'hi-ha-ho': ChopLogo,
  ninja: NinjaLogo,
  'billy-billy-bob': ToasterLogo,
  obstsalat: FruitSaladLogo,
  namensball: NameBallLogo,
  'ball-jonglage': JuggleLogo,
  'spaghetti-turm': TowerLogo,
  roboterspiel: RobotLogo,
  eierfall: EggDropLogo,
  'delfin-training': DolphinLogo,
  hexenhaus: RopeHouseLogo,
  'stuehle-balancieren': ChairTiltLogo,
  'stift-an-schnueren': PenStringsLogo,
  'namens-akrostichon': NamePoemLogo,
  'geraeusche-raten': SoundGuessLogo,
  'atem-zaehlen': BreathLogo,
  'vorhang-faellt': CurtainLogo,
  spiegel: MirrorLogo,
  'lebendige-skulptur': SculptureLogo,
};

// ── Dienst und Kunst: ein Icon pro Bereich bzw. Kunstform ─────────

export const EnvironmentLogo = make(
  <>
    <Person x={7} />
    <g className={GOLD}>
      <path d="M17 21v-6.5" strokeWidth={2} />
      <path d="M17 14.5c0-3.25 1.75-5 4.75-5 0 3.25-1.75 5-4.75 5zM17 17.25c0-2.5-1.5-4-4-4 0 2.5 1.5 4 4 4z" {...ink} />
    </g>
  </>,
);

export const NeighborhoodLogo = make(
  <>
    <Person x={5.5} />
    <path d="M11.5 11l5.25-4.5L22 11v10H11.5z" {...ink} className={GOLD} />
  </>,
);

export const GenerationsLogo = make(
  <>
    <Person x={7} arms={[[12.75, 15.75]]} />
    <Person x={17.5} w={5} top={13.5} arms={[[13.25, 15.75]]} />
    <path d="M12.5 10l-3-3a1.9 1.9 0 0 1 3-2.3 1.9 1.9 0 0 1 3 2.3z" {...ink} className={GOLD} />
  </>,
);

export const ChildrenLogo = make(
  <>
    <Person x={4.5} w={4.5} top={13} />
    <Person x={11.5} w={4.5} top={13} />
    <Person x={18.5} w={4.5} top={13} arms={[[19.5, 12]]} />
    <g className={GOLD}>
      <circle cx={18} cy={5} r={2.6} {...ink} />
      <path d="M18 7.6q-.75 2 1.5 4.4" strokeWidth={1.5} />
    </g>
  </>,
);

export const InstitutionLogo = make(
  <g className={GOLD}>
    <path d="M3 8.5L12 3.5l9 5z" {...ink} />
    {[5, 9, 13, 17].map(x => <rect key={x} x={x} y={10} width={2} height={7.5} rx={0.5} {...ink} />)}
    <rect x={3} y={19} width={18} height={2} rx={0.5} {...ink} />
  </g>,
);

export const CreativeLogo = make(
  <>
    <Person x={6} arms={[[13.5, 15.25]]} />
    <g className={GOLD}>
      <path d="M14.25 14.5l6-6.25" strokeWidth={2.25} />
      <path d="M13.5 15.25c-1.5.25-2.25 1.5-2 3.25 1.75.25 3-.5 3.25-2z" {...ink} />
    </g>
  </>,
);

export const DramaLogo = make(
  <>
    <Person x={6.5} arms={[[12.5, 10.5]]} />
    <mask id="lg-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" stroke="none" />
      <circle cx={15.5} cy={7.25} r={0.95} fill="black" stroke="none" />
      <circle cx={19} cy={7.25} r={0.95} fill="black" stroke="none" />
      <path d="M15.6 10.25a1.75 1.75 0 0 0 3.3 0" stroke="black" strokeWidth={1.1} />
    </mask>
    <path d="M13.5 4.5h7.5v5a3.75 3.75 0 0 1-7.5 0z" mask="url(#lg-mask)" {...ink} className={GOLD} />
  </>,
);

export const MusicLogo = make(
  <>
    <Person x={7} />
    <g className={GOLD}>
      <ellipse cx={15.75} cy={17.25} rx={2.5} ry={2} transform="rotate(-20 15.75 17.25)" {...ink} />
      <path d="M18 16.5V5c1.5 1 3.25 1.75 3.25 4" strokeWidth={2} />
    </g>
  </>,
);

export const PaletteLogo = make(
  <>
    <mask id="lg-palette" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" stroke="none" />
      {[[7.5, 11.5], [9, 7.5], [13, 6.25], [16.75, 8.25]].map(([x, y]) => <circle key={`${x}`} cx={x} cy={y} r={1.2} fill="black" stroke="none" />)}
    </mask>
    <path
      d="M12 3.5c-5 0-9 3.5-9 8.25S7 20 11.75 20c1.5 0 2-1 1.25-2.25-.75-1.25 0-2.5 1.5-2.5H17c2.25 0 4-1.75 4-4C21 6.75 17 3.5 12 3.5z"
      mask="url(#lg-palette)"
      {...ink}
      className={GOLD}
    />
  </>,
);

export const MuralLogo = make(
  <>
    <rect x={9} y={4} width={7.5} height={13} rx={1} {...ink} className={GOLD} />
    <Person x={4.5} w={5} top={12} arms={[[9.5, 9.5]]} />
    <Person x={19.5} w={5} top={12} arms={[[16, 12.5]]} />
  </>,
);
