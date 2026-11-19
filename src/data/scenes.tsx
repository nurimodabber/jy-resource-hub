import React from 'react';
import type { Language } from '../types';
import { Fig, ink, LIMB, SW, type Arm } from './pictograms';

/**
 * Aufbau-Szenen für Spiel-Detailseiten: zeigen Aufstellung und Bewegung, bevor jemand den Text liest.
 * Prinzip angelehnt an die Szenenbilder des NEVEREST-Methodariums, gezeichnet aber nur mit unseren Piktogramm-Figuren.
 * Regeln:
 * - Gleiche Figuren und Strichstärken wie die Icons (Fig, LIMB, SW); Größen L/M/S geben Tiefe: hinten klein, vorne groß.
 * - Farben nur über Tokens: Figuren `text`, hintere Reihe und Bodenmarken `text-tertiary`,
 *   genau eine Akzentfarbe für die Rolle, um die es geht. Keine Verläufe, Schatten oder Animation.
 * - Bodenmarken gestrichelt mit 0,75 Strich, Bewegung als gestrichelte Bahn oder kurze Striche.
 * - Spiele ohne Eintrag zeigen keine Szene.
 */

const BACK = 'text-text-tertiary';
const ACCENT = 'text-accent';
const floor = { strokeWidth: 0.75, strokeDasharray: '2 2' } as const;

// Maße wie in Fig, damit Hände genau an Schultern, Bäuchen oder Händen anderer landen.
type P = { x: number; base: number; s: number };
const shoulder = (p: P, side: -1 | 1) => [p.x + side * (2.5 * p.s - 0.75), p.base - 9.5 * p.s + 0.25] as const;
/** Arm, dessen Hand genau auf `to` liegt. Armlänge bis etwa 8 · s wirkt natürlich. */
const reach = (p: P, side: -1 | 1, [tx, ty]: readonly [number, number]): Arm => {
  const [sx, sy] = shoulder(p, side);
  return { side, to: [[tx - sx, ty - sy]] };
};
const headTop = (p: P) => p.base - 12 * p.s - Math.max(p.s, 0.6) - 2 * Math.max(2.5 * p.s, 1.75);

/** Augenbinde: Band in der Farbe der Szenenfläche (surface-2) quer über den Kopf, wie beim Minenfeld. */
const Blindfold: React.FC<{ p: P }> = ({ p }) => {
  const r = Math.max(2.5 * p.s, 1.75);
  return (
    <path
      d={`M${p.x - r - 0.6} ${headTop(p) + r}h${2 * r + 1.2}`}
      strokeWidth={Math.max(1.9 * p.s, 1.2)}
      className="text-surface-2"
    />
  );
};

/** Sprechblase über dem Kopf von `p`. */
const Bubble: React.FC<{ p: P; text: string }> = ({ p, text }) => {
  const x = p.x;
  const y = headTop(p) - 0.5;
  const w = Math.max(6, text.length * 2 + 3);
  return (
    <g>
      <path d={`M${x - w / 2} ${y - 7}h${w}v5.5H${x + 1}l-1 1.5-1-1.5H${x - w / 2}z`} strokeWidth={0.9} />
      <text x={x} y={y - 3} fontSize={3.5} fontWeight={600} textAnchor="middle" {...ink}>{text}</text>
    </g>
  );
};

/** Schild über dem Kopf; ohne Text zeigt es ein kleines Haus (Ortskarte beim Spion). */
const Sign: React.FC<{ p: P; text?: string }> = ({ p, text }) => {
  const x = p.x;
  const y = headTop(p) - 5.25;
  return (
    <g>
      <rect x={x - 3} y={y} width={6} height={4.5} rx={1} strokeWidth={0.9} />
      {text
        ? <text x={x} y={y + 3.4} fontSize={3.5} fontWeight={700} textAnchor="middle" {...ink}>{text}</text>
        : <path d={`M${x - 1.5} ${y + 3.6}v-1.6l1.5-1.4 1.5 1.4v1.6z`} {...ink} />}
    </g>
  );
};

const Svg: React.FC<{ box: string; className: string; children: React.ReactNode }> = ({ box, className, children }) => (
  <svg
    viewBox={box}
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

/** Kniende Figur, Blick nach `side`. Gleicher Oberkörper wie Fig, Beine als Strich in Körperbreite. */
const Kneel: React.FC<{ x: number; side: -1 | 1; base?: number; s?: number; arm?: [number, number][] }> = ({
  x, side, base = 24, s = 0.8, arm = [],
}) => {
  const half = 2.5 * s;
  const hip = base - 4 * s;
  const top = hip - 7 * s;
  const shY = top + half;
  const hr = Math.max(2.5 * s, 1.75);
  const leg = 1.6 * half;
  return (
    <g>
      <circle cx={x} cy={top - s - hr} r={hr} {...ink} />
      <path d={`M${x - half} ${hip}V${shY}a${half} ${half} 0 0 1 ${2 * half} 0V${hip}z`} {...ink} />
      <path d={`M${x} ${hip - 0.5}h${side * 4 * s}V${base}`} strokeWidth={leg} />
      <path d={`M${x} ${hip - 0.5}L${x - side * 0.5 * s} ${base}h${-side * 3 * s}`} strokeWidth={leg} />
      {arm.length > 0 && (
        <path d={`M${x + side * (half - 0.75)} ${shY + 0.25}${arm.map(([dx, dy]) => `l${dx} ${dy}`).join('')}`} strokeWidth={LIMB} />
      )}
    </g>
  );
};

// ── Billy Billy Bob: vier Posen, je drei Personen (links, Mitte, rechts) ─────────

const poses: { label: { de: string; en: string }; art: React.ReactNode }[] = [
  {
    label: { de: 'Toaster', en: 'Toaster' },
    art: (
      <>
        <g className={ACCENT}>
          <Fig x={18} base={16.5} s={0.8} />
          <path d="M14 4l-1.25-1.5M22 4l1.25-1.5" strokeWidth={1.25} />
        </g>
        <Fig x={9} base={24} s={0.8} arms={[{ side: 1, to: [[5.25, 0]] }]} />
        <Fig x={27} base={24} s={0.8} arms={[{ side: -1, to: [[-5.25, 0]] }]} />
      </>
    ),
  },
  {
    label: { de: 'Känguru', en: 'Kangaroo' },
    art: (
      <>
        {[1, -1].map(d => (
          <g key={d} transform={`rotate(${15 * d} ${18 - 10.5 * d} 24)`}>
            <Fig x={18 - 10.5 * d} base={24} s={0.8} />
            <path d={`M${18 - 8.2 * d} 12.8q${2.5 * d} .5 ${3.25 * d} 4.5`} strokeWidth={1.1} strokeDasharray="1.2 1.2" />
          </g>
        ))}
        <g className={ACCENT}>
          <Fig x={18} base={24} s={0.8} arms={[{ side: -1, to: [[-1.5, 2.75], [2.5, 2]] }, { side: 1, to: [[1.5, 2.75], [-2.5, 2]] }]} />
        </g>
      </>
    ),
  },
  {
    label: { de: 'James Bond', en: 'James Bond' },
    art: (
      <>
        <Kneel x={8} side={1} arm={[[2, -2.5], [1.5, -2]]} />
        <g className={ACCENT}>
          <Fig x={18} base={24} s={0.8} arms={[{ side: 1, to: [[1.5, -2.5], [0, -4.5]] }, { side: -1, to: [[1.5, 3]] }]} />
        </g>
        <Kneel x={28} side={-1} arm={[[-2, -2.5], [-1.5, -2]]} />
      </>
    ),
  },
  {
    label: { de: 'Waschmaschine', en: 'Washing machine' },
    art: (
      <>
        <g className={ACCENT}>
          <Fig x={18} base={24} s={0.8} />
          <path d="M21.2 6.6a3.2 3.2 0 1 1-1.6-2.77" strokeWidth={1} />
          <path d="M18.4 3.2l1.2.63-.3 1.3" strokeWidth={1} />
        </g>
        {/* Die Arme der beiden Äußeren treffen sich oben und unten im rechten Winkel: eine Raute. */}
        <Fig x={12.5} base={24} s={0.8} arms={[{ side: 1, to: [[4.25, -4.25]] }, { side: 1, to: [[4.25, 4.25]] }]} />
        <Fig x={23.5} base={24} s={0.8} arms={[{ side: -1, to: [[-4.25, -4.25]] }, { side: -1, to: [[-4.25, 4.25]] }]} />
      </>
    ),
  },
];

const BillyBillyBob: React.FC<{ language: Language }> = ({ language }) => (
  <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
    {poses.map(p => (
      <li key={p.label.en} className="flex flex-col items-center gap-2">
        <Svg box="0 0 36 26" className="w-full max-w-[9rem] h-auto text-text">{p.art}</Svg>
        <span className="text-sm font-semibold text-text">{p.label[language]}</span>
      </li>
    ))}
  </ul>
);

// ── Einzelne Aufbau-Szenen (Raster 120 × 44, viewBox je Szene eng zugeschnitten) ─────────

const wide = 'block mx-auto w-full max-w-xl h-auto text-text';

/** Fünf Personen im Kreis; die vorderen greifen über Kreuz zur gegenüberliegenden Seite, so entsteht der Knoten. */
const Knot = () => {
  const a = { x: 44, base: 34, s: 0.7 }, b = { x: 60, base: 32, s: 0.65 }, c = { x: 76, base: 34, s: 0.7 };
  const d = { x: 50, base: 42, s: 1 }, e = { x: 70, base: 42, s: 1 };
  return (
    <Svg box="30 16 60 28" className={wide}>
      <ellipse cx={60} cy={37} rx={20} ry={4.5} className={BACK} {...floor} />
      <g className={BACK}>
        <Fig {...a} arms={[reach(a, 1, [47.5, 30]), reach(a, -1, [41, 31])]} />
        <Fig {...b} arms={[reach(b, -1, [56.5, 28.5]), reach(b, 1, [63.5, 28.5])]} />
        <Fig {...c} arms={[reach(c, -1, [72.5, 30]), reach(c, 1, [79, 31])]} />
      </g>
      <g className={ACCENT}>
        <Fig {...d} arms={[reach(d, 1, [63.5, 28.5]), reach(d, -1, [47.5, 30])]} />
      </g>
      <Fig {...e} arms={[reach(e, -1, [56.5, 28.5]), reach(e, 1, [72.5, 30])]} />
    </Svg>
  );
};

/** Spielfeld mit Hindernissen; die blinde Person (Akzent) geht, die Begleitung ruft von außen. */
const Minefield = () => {
  const cone = (x: number, y: number) => <path key={`${x}-${y}`} d={`M${x - 2} ${y}L${x} ${y - 3.5}L${x + 2} ${y}z`} {...ink} />;
  return (
    <Svg box="8 15 112 29" className={wide}>
      <path d="M30 22H86L104 41H12z" className={BACK} {...floor} />
      <g className={BACK}>{[cone(40, 30), cone(58, 26), cone(72, 33), cone(84, 28), cone(48, 38), cone(90, 38)]}</g>
      <g className={ACCENT}>
        <path d="M20 39C30 39 34 34 44 34" strokeWidth={0.9} strokeDasharray="2 2" />
        <Fig x={52} base={36} s={0.8} arms={[{ side: -1, to: [[-2.5, -1.5]] }, { side: 1, to: [[3, -1]] }]} />
      </g>
      <path d="M49.4 23.6h5.2" strokeWidth={1.5} className="text-surface-2" />
      <Fig x={112} base={41} s={0.8} arms={[{ side: -1, to: [[-2, -3], [-1, -2.5]] }]} />
      <path d="M104 25.5a3 3 0 0 0 0 4M101.5 24a5 5 0 0 0 0 7" strokeWidth={0.9} />
    </Svg>
  );
};

/** Ei fällt aus Höhe in die Konstruktion; zwei Personen schauen gespannt zu. */
const EggDrop = () => (
  <Svg box="18 1 90 43" className={wide}>
    <path d="M18 41H108" className={BACK} strokeWidth={0.75} />
    <g className={BACK}>
      <path d="M100 4V41M98 4h4M98 13.25h4M98 22.5h4M98 31.75h4" strokeWidth={0.75} />
    </g>
    <g className={ACCENT}>
      <ellipse cx={60} cy={7} rx={2.6} ry={3.4} {...ink} />
      <path d="M60 13V28" strokeWidth={0.9} strokeDasharray="2 2" />
    </g>
    <path d="M53 41V32H67V41M53 32L67 41M67 32L53 41M60 32V41" strokeWidth={1.25} />
    <Fig x={30} base={41} s={1} arms={[{ side: 1, to: [[2.5, -3], [0.5, -4]] }, { side: -1, to: [[-2.5, -3], [-0.5, -4]] }]} />
    <Fig x={84} base={41} s={1} arms={[{ side: -1, to: [[-2, -3], [2, -2.5]] }, { side: 1, to: [[2, -3], [-2, -2.5]] }]} />
  </Svg>
);

// ── Kreis-Spiele: Personen auf einer Ellipse, hinten klein und grau, vorn groß ─────────

type Arms = React.ComponentProps<typeof Fig>['arms'];
/** Position im Kreis; Index 0 steht vorn, leicht links. Versetzt, damit hintere Köpfe nicht hinter vorderen stehen. */
const spots = (n: number, rx = 34, ry = 6, cx = 60, cy = 34) =>
  Array.from({ length: n }, (_, i) => {
    const a = Math.PI / 2 + ((i + 0.25) * 2 * Math.PI) / n;
    const base = cy + ry * Math.sin(a);
    return { i, x: cx + rx * Math.cos(a), base, s: 0.6 + (0.4 * (base - cy + ry)) / (2 * ry) };
  });

const Ring: React.FC<{
  n?: number; rx?: number; ry?: number; accent?: number; skip?: number; arms?: Record<number, Arms>; box?: string;
  mid?: React.ReactNode; children?: React.ReactNode;
}> = ({ n = 6, rx = 34, ry = 6, accent, skip, arms = {}, box = '20 14 80 29', mid, children }) => {
  const all = spots(n, rx, ry).filter(p => p.i !== skip).sort((a, b) => a.base - b.base);
  const fig = (p: ReturnType<typeof spots>[number]) => (
    <g key={p.i} className={p.i === accent ? ACCENT : p.base < 33.9 ? BACK : undefined}>
      <Fig x={p.x} base={p.base} s={p.s} arms={arms[p.i]} />
    </g>
  );
  return (
    <Svg box={box} className={wide}>
      <ellipse cx={60} cy={34} rx={rx + 4} ry={ry + 1.5} className={BACK} {...floor} />
      {all.filter(p => p.base < 34).map(fig)}
      {mid}
      {all.filter(p => p.base >= 34).map(fig)}
      {children}
    </Svg>
  );
};
// Ring mit n = 6 (x | Fußlinie | Größe): 0 (51,2 | 39,8 | 1) vorn, 1 (27,2 | 35,6 | 0,85) links, 2 (36 | 29,8) und 3 (68,8 | 28,2) hinten,
// 4 (92,8 | 32,5 | 0,75) rechts, 5 (84 | 38,2 | 0,94) vorn rechts.

/** Sprechen: zwei Bögen neben dem Kopf. */
const Talk: React.FC<{ x: number; y: number; dir?: 1 | -1 }> = ({ x, y, dir = 1 }) => {
  const sw = dir > 0 ? 1 : 0;
  return <path d={`M${x} ${y - 1.75}a2.5 2.5 0 0 ${sw} 0 3.5M${x + 2 * dir} ${y - 3.25}a4.5 4.5 0 0 ${sw} 0 6.5`} strokeWidth={1.25} />;
};
const Ball: React.FC<{ x: number; y: number }> = ({ x, y }) => <circle cx={x} cy={y} r={1.75} {...ink} />;
const trail = { strokeWidth: 0.9, strokeDasharray: '2 2' } as const;

/** Drei Personen nacheinander im Kreis, die letzte (Akzent) spricht gerade. */
const Chain: React.FC<{ words: [string, string, string] }> = ({ words }) => {
  const p = spots(6);
  return (
    <Ring accent={5} box="20 10 80 33">
      <Bubble p={p[1]} text={words[0]} />
      <Bubble p={p[0]} text={words[1]} />
      <g className={ACCENT}><Bubble p={p[5]} text={words[2]} /></g>
    </Ring>
  );
};

const CountTogether = () => <Chain words={['1', '2', '3']} />;

const WordStory: React.FC<{ language: Language }> = ({ language }) => (
  <Chain words={language === 'de' ? ['Es', 'war', 'einmal'] : ['Once', 'upon', 'a time']} />
);

/** Zwei Reihen, der Stab liegt auf Brusthöhe nur auf den Zeigefingern. */
const HeliumStick = () => (
  <Svg box="20 20 82 24" className={wide}>
    <g className={BACK}>
      {[40, 60, 80].map(x => <Fig key={x} x={x} base={36.5} s={0.6} arms={[{ side: 1, to: [[1, 3]] }]} />)}
    </g>
    {[30, 50, 70, 90].map(x => <Fig key={x} x={x} base={42} arms={[{ side: 1, to: [[1.75, 2.75]] }]} />)}
    <path d="M24 34.25H98" strokeWidth={1.5} className={ACCENT} />
  </Svg>
);

/** Seitenansicht: zwei Personen in der Hocke, Rücken an Rücken, gleiche Maße wie Fig (s 1). */
const StandUp = () => (
  <Svg box="38 20 44 23" className={wide}>
    <path d="M40 41H80" className={BACK} strokeWidth={0.75} />
    {[-1, 1].map(d => {
      const back = 60 + d * 0.25;
      const front = back + d * 5;
      const mid = (back + front) / 2;
      return (
        <g key={d}>
          <circle cx={mid} cy={25.5} r={2.5} {...ink} />
          <path d={`M${back} 36V31.5a2.5 2.5 0 0 ${d > 0 ? 1 : 0} ${d * 5} 0V36z`} {...ink} />
          <path d={`M${mid} 34.75H${mid + d * 6}V39.75h${d * 2}`} strokeWidth={2.5} />
        </g>
      );
    })}
    <g className={ACCENT} strokeWidth={1.25}>
      <path d="M44 36V29M42 31l2-2 2 2M76 36V29M74 31l2-2 2 2" />
    </g>
  </Svg>
);

/** Die Reihe sortiert sich stumm nach Größe; eine Person (Akzent) geht in die Lücke, die Nachbarin winkt sie heran. */
const SilentLine = () => {
  const row: P[] = [0.66, 0.72, 0.78, 0.9, 0.96].map((s, i) => ({ x: [24, 36, 48, 72, 84][i], base: 41, s }));
  return (
    <Svg box="16 16 92 30" className={wide}>
      <path d="M18 41H106" className={BACK} {...floor} />
      <path d="M20 28.75L88 22.85" className={BACK} {...floor} />
      {row.map((p, i) => <Fig key={p.x} {...p} arms={i === 2 ? [reach(p, 1, [54, 31])] : undefined} />)}
      <g className={ACCENT}>
        <Fig x={100} base={41} s={0.84} />
        <path d="M98 43.5C85 45 70 45 62 43.5" {...trail} />
        <path d="M62 43.5l2.3-.9M62 43.5l2.1 1.2" strokeWidth={0.9} />
      </g>
    </Svg>
  );
};

const IceFloes = () => {
  const floe = (x: number) => `M${x - 5} 42l1.5-2.5h8l-1.5 2.5z`;
  return (
    <Svg box="6 16 104 28" className={wide}>
      <path d="M16 30L10 43M102 30L108 43" className={BACK} {...floor} />
      <g className={BACK}>{[32, 48, 64].map(x => <path key={x} d={floe(x)} {...ink} />)}</g>
      {[32, 48].map(x => <Fig key={x} x={x + 1} base={39.5} s={0.85} />)}
      <Fig x={65} base={39.5} s={0.85} arms={[{ side: 1, to: [[5, 3]] }]} />
      <path d={floe(84)} className={ACCENT} {...ink} />
    </Svg>
  );
};

const MarbleRun = () => (
  <Svg box="16 10 84 34" className={wide}>
    <path d="M26 22C40 12 80 12 92 24" className={BACK} {...trail} />
    <path d="M92 24l-.5-2.5M92 24l-2.5-.5" className={BACK} strokeWidth={0.9} />
    {[30, 46, 62, 78].map((x, i) => {
      // Jede Person hält ein eigenes kurzes Rohrstück, leicht abfallend; dazwischen bleibt eine Lücke.
      const p = { x, base: 41, s: 0.85 };
      // Rohr seitlich neben dem Körper, sonst verschmelzen Rohr, Arme und Körper zu einer Fläche.
      const y = 33.5 + i * 1.1;
      return (
        <g key={x}>
          <Fig {...p} arms={[reach(p, 1, [x + 5, y + 0.2])]} />
          <path d={`M${x + 3} ${y}L${x + 12.5} ${y + 1.1}`} strokeWidth={1.75} />
        </g>
      );
    })}
    <g className={ACCENT}><Ball x={93} y={37.4} /></g>
  </Svg>
);

const BlindSquare = () => (
  <Svg box="20 14 80 30" className={wide}>
    <g className={BACK}>
      <Fig x={42} base={30} s={0.65} arms={[{ side: -1, to: [[-0.5, 2.5]] }, { side: 1, to: [[0.5, 2.5]] }]} />
      <Fig x={78} base={30} s={0.65} arms={[{ side: -1, to: [[-0.5, 2.5]] }, { side: 1, to: [[0.5, 2.5]] }]} />
    </g>
    <path d="M42 27H78L90 35H30z" className={ACCENT} strokeWidth={1.5} />
    <Fig x={30} base={41} s={0.95} arms={[{ side: -1, to: [[-0.5, 3]] }, { side: 1, to: [[0.5, 3]] }]} />
    <Fig x={90} base={41} s={0.95} arms={[{ side: -1, to: [[-0.5, 3]] }, { side: 1, to: [[0.5, 3]] }]} />
    {[{ x: 42, base: 30, s: 0.65 }, { x: 78, base: 30, s: 0.65 }, { x: 30, base: 41, s: 0.95 }, { x: 90, base: 41, s: 0.95 }].map(p => (
      <Blindfold key={p.x} p={p} />
    ))}
  </Svg>
);

/** Alle stehen auf der Decke; vorn rechts klappt eine Person die Ecke um (Akzent), der alte Umriss ist gestrichelt. */
const BlanketFlip = () => {
  const turner = { x: 76, base: 39, s: 0.85 };
  return (
    <Svg box="20 14 80 30" className={wide}>
      <path d="M34 31H86L91 36.5L84 42H24z" className={BACK} strokeWidth={1.25} />
      <path d="M84 42H96L91 36.5" className={BACK} {...floor} />
      <g className={BACK}>{[42, 54, 66].map(x => <Fig key={x} x={x} base={33.5} s={0.65} />)}</g>
      {[34, 48, 62].map(x => <Fig key={x} x={x} base={40} s={0.9} />)}
      <Fig {...turner} arms={[reach(turner, 1, [82.5, 35.5])]} />
      <g className={ACCENT}>
        <path d="M84 42L91 36.5L82.5 35.5z" {...ink} />
        <path d="M96 40C97 33 90 30 85.5 32.5" {...trail} />
        <path d="M85.5 32.5l2.3.26M85.5 32.5l1.03-2.07" strokeWidth={0.9} />
      </g>
    </Svg>
  );
};

const HundredHits = () => (
  <Ring box="20 4 80 40" arms={{ 5: [{ side: 1, to: [[0.5, -6]] }] }}>
    <g className={ACCENT}>
      <path d="M86 20C84 11 70 7 63.5 8" {...trail} />
      <Ball x={60} y={8} />
    </g>
  </Ring>
);

/** Jede Person trägt eine Zahl, die sie selbst nicht kennt; die 11 (Akzent) sucht ihren Platz zwischen 8 und 14. */
const BlindNumbers = () => {
  const me = { x: 66, base: 34, s: 0.65 };
  return (
    <Svg box="16 14 88 30" className={wide}>
      {([[24, '2'], [38, '5'], [52, '8'], [80, '14'], [94, '19']] as const).map(([x, n]) => {
        const p = { x, base: 41, s: 0.85 };
        return <g key={x}><Fig {...p} /><Sign p={p} text={n} /></g>;
      })}
      <g className={ACCENT}>
        <Fig {...me} />
        <Sign p={me} text="11" />
        <path d="M66 36v4M64.5 38.5L66 40l1.5-1.5" strokeWidth={0.9} />
      </g>
    </Svg>
  );
};

/** Seil auf Brusthöhe; zwei Personen heben eine dritte darüber, ihre Hände tragen sie an den Füßen. */
const ElectricFence = () => (
  <Svg box="24 8 72 36" className={wide}>
    <path d="M30 41V30M90 41V30" className={BACK} strokeWidth={1.25} />
    <path d="M30 33H90" className={ACCENT} strokeWidth={1.5} />
    <Fig x={60} base={24} s={0.8} />
    <Fig x={51} base={41} arms={[reach({ x: 51, base: 41, s: 1 }, 1, [58.25, 24.75])]} />
    <Fig x={69} base={41} arms={[reach({ x: 69, base: 41, s: 1 }, -1, [61.75, 24.75])]} />
  </Svg>
);

const AcidLake = () => (
  <Svg box="16 20 88 24" className={wide}>
    <ellipse cx={60} cy={38} rx={22} ry={4} className={BACK} {...floor} />
    <path d="M30.75 33.25L56 34.5M89.25 33.25L64 34.5" strokeWidth={1} />
    <Fig x={26} base={41} arms={[{ side: 1, to: [[3, 1]] }]} />
    <Fig x={94} base={41} arms={[{ side: -1, to: [[-3, 1]] }]} />
    <path d="M55.5 34h9l-1.25 5.5h-6.5z" className={ACCENT} {...ink} />
  </Svg>
);

const SilentGrid = () => (
  <Svg box="12 13 96 31" className={wide}>
    <g className={BACK}>
      {[40, 60, 80].map(x => <Fig key={x} x={x} base={28} s={0.55} />)}
      <path d="M30 30H90L104 42H16zM25.3 34H94.7M20.7 38H99.3M45 30L38 42M60 30V42M75 30L82 42" strokeWidth={0.75} />
    </g>
    <g className={ACCENT}><Fig x={52} base={37} s={0.75} arms={[{ side: 1, to: [[3, 2]] }]} /></g>
  </Svg>
);

/** Die Fläche wird von Runde zu Runde kleiner: alte Ränder grau, die heutige Insel im Akzent. */
const ShrinkingIsland = () => (
  <Svg box="16 16 88 29" className={wide}>
    <path d="M30 32H90L98 43.5H22z" className={BACK} {...floor} />
    <path d="M38 34H82L88 42.5H32z" className={BACK} strokeWidth={0.75} strokeDasharray="1 1.5" />
    <g className={ACCENT}>
      <path d="M46 36H74L78 41.5H42z" strokeWidth={1.5} />
      <path d="M25 38h5.5M28.5 36.5L30.5 38l-2 1.5M95 38h-5.5M91.5 36.5L89.5 38l2 1.5" strokeWidth={0.9} />
    </g>
    <Fig x={52} base={40} s={0.8} arms={[{ side: 1, to: [[3.5, -0.5]] }]} />
    <Fig x={68} base={40} s={0.8} arms={[{ side: -1, to: [[-3.5, -0.5]] }]} />
    <Fig x={60} base={41} s={0.85} />
  </Svg>
);

/** Hinten die Stufen Ei, Huhn, Affe, Mensch (Akzent); vorn spielen zwei Schere-Stein-Papier. */
const RpsEvolution = () => (
  <Svg box="20 14 80 30" className={wide}>
    <g className={BACK}>
      <path d="M27 30a3 3.6 0 0 1 6 0z" {...ink} />
      <circle cx={30} cy={24.4} r={1.75} {...ink} />
      <Fig x={46} base={30} s={0.6} arms={[{ side: -1, to: [[-1.75, 0.75], [1, 1.5]] }, { side: 1, to: [[1.75, 0.75], [-1, 1.5]] }]} />
      <Fig x={62} base={27.5} s={0.6} arms={[{ side: -1, to: [[-1.5, 2.5]] }, { side: 1, to: [[1.5, 2.5]] }]} />
      <path d="M60.5 29.5h3" strokeWidth={0.9} />
    </g>
    <g className={ACCENT}>
      <Fig x={80} base={30} s={0.6} arms={[{ side: -1, to: [[-2.5, -3]] }, { side: 1, to: [[2.5, -3]] }]} />
    </g>
    <Fig x={54} base={41} s={0.9} arms={[{ side: 1, to: [[3, 1], [0, -2]] }]} />
    <Fig x={70} base={41} s={0.9} arms={[{ side: -1, to: [[-3, 1], [0, -2]] }]} />
  </Svg>
);

const ImpulseCircle = () => {
  const ps = spots(10, 20, 6);
  const arms: Record<number, NonNullable<Arms>> = {};
  ps.forEach(a => {
    const b = ps[(a.i + 1) % ps.length];
    const side: -1 | 1 = b.x > a.x ? 1 : -1;
    const [ax, ay] = shoulder(a, side);
    const [bx, by] = shoulder(b, -side as -1 | 1);
    // Hände etwas unter Schulterhöhe, damit die Arme locker hängen.
    const hand = [(ax + bx) / 2, (ay + by) / 2 + 1.5 * Math.min(a.s, b.s)] as const;
    (arms[a.i] ??= []).push(reach(a, side, hand));
    (arms[b.i] ??= []).push(reach(b, -side as -1 | 1, hand));
  });
  return (
    <Ring n={10} rx={20} ry={6} accent={0} arms={arms} box="26 12 68 33">
      <g className={ACCENT}>
        <path d="M57 43.2C63 44.6 71 44.2 77 41.5" {...trail} />
        <path d="M77 41.5l-2.3-.1M77 41.5l-1.1 2" strokeWidth={0.9} />
      </g>
    </Ring>
  );
};

const WhoAmI = () => {
  const front = [38, 60, 82].map(x => ({ x, base: 42, s: 1 }));
  const back = [49, 71].map(x => ({ x, base: 33, s: 0.7 }));
  return (
    <Svg box="28 12 64 32" className={wide}>
      <g className={BACK}>
        {back.map(p => <g key={p.x}><Fig {...p} /><Sign p={p} text="?" /></g>)}
      </g>
      {front.map((p, i) => (
        <g key={p.x} className={i === 0 ? ACCENT : undefined}>
          <Fig {...p} />
          <Sign p={p} text="?" />
        </g>
      ))}
      <g className={ACCENT}><Talk x={41.5} y={26.5} /></g>
    </Svg>
  );
};

/** Kopfmitte und Radius wie in Fig. */
const head = (p: P) => {
  const r = Math.max(2.5 * p.s, 1.75);
  return { x: p.x, y: p.base - 12 * p.s - Math.max(p.s, 0.6) - r, r };
};

/** Rollen als Zeichen am Kopf: Werwolf Ohren, Seherin Auge, Hexe Hut. Spielleitung steht außen, darüber der Mond. */
const Werewolf = () => {
  const [witch, seer, , , , wolf] = spots(6).map(head);
  return (
    <Ring accent={5} box="20 10 96 33">
      <g className={ACCENT} {...ink}>
        {[-1, 1].map(d => (
          <path key={d} d={`M${wolf.x + d * wolf.r * 0.95} ${wolf.y - wolf.r * 0.2}L${wolf.x + d * wolf.r * 0.8} ${wolf.y - wolf.r - 2}L${wolf.x + d * wolf.r * 0.1} ${wolf.y - wolf.r * 0.9}z`} />
        ))}
      </g>
      <path d={`M${witch.x - witch.r - 1.25} ${witch.y - witch.r * 0.55}h${2 * witch.r + 2.5}`} strokeWidth={1.25} />
      <path d={`M${witch.x - witch.r * 0.8} ${witch.y - witch.r * 0.6}L${witch.x + 0.75} ${witch.y - witch.r - 4.5}L${witch.x + witch.r * 0.8} ${witch.y - witch.r * 0.6}z`} {...ink} />
      <path d={`M${seer.x - 2.5} ${seer.y - seer.r - 2.5}q2.5 -2 5 0q-2.5 2 -5 0z`} strokeWidth={0.9} />
      <circle cx={seer.x} cy={seer.y - seer.r - 2.5} r={0.8} {...ink} />
      <Fig x={108} base={40} s={0.95} />
      <path d="M109 12a3.5 3.5 0 1 0 3 5.5a2.8 2.8 0 0 1 -3 -5.5z" {...ink} />
    </Ring>
  );
};

/** Alle haben eine Ortskarte über sich, nur der Spion (Akzent) ein Fragezeichen. */
const Spy = () => (
  <Ring accent={5} box="20 10 80 33">
    {spots(6).map(p => (
      <g key={p.i} className={p.i === 5 ? ACCENT : p.base < 33.9 ? BACK : undefined}>
        <Sign p={p} text={p.i === 5 ? '?' : undefined} />
      </g>
    ))}
  </Ring>
);

/** Die Fragende (Akzent) steht außen. Die Antwort gilt für die Nachbarin links, das zeigt der Pfeil. */
const Psychiatrist = () => {
  const asker = { x: 108, base: 40, s: 0.95 };
  return (
    <Ring box="20 12 96 31">
      <Talk x={55.2} y={24.4} />
      <g className={ACCENT}>
        <path d="M49 20.5C44 14 34 14 29.5 18.5" {...trail} />
        <path d="M29.5 18.5l.4-2.4M29.5 18.5l2.4-.3" strokeWidth={0.9} />
        <Fig {...asker} arms={[{ side: -1, to: [[-3, -2.5]] }]} />
        <Bubble p={asker} text="?" />
      </g>
    </Ring>
  );
};

/** Zwei Reiche: vorn je eine Anführerin mit Krone, ihr Reich hält sich an ihren Schultern fest. Hinten wartet jemand ohne Reich. */
const Empire = () => {
  const p = (x: number) => ({ x, base: 41, s: 0.9 });
  const crown = (x: number) => {
    const t = headTop(p(x));
    return <path d={`M${x - 2} ${t - 0.5}V${t - 3}l1 1.2 1-1.7 1 1.7 1-1.2V${t - 0.5}z`} {...ink} />;
  };
  const follow = (x: number, side: -1 | 1) => <Fig {...p(x)} arms={[reach(p(x), side, shoulder(p(x + 10 * side), (-side) as -1 | 1))]} />;
  return (
    <Svg box="14 16 92 28" className={wide}>
      <g className={BACK}><Fig x={60} base={33} s={0.65} /></g>
      {follow(20, 1)}{follow(30, 1)}
      <g className={ACCENT}><Fig {...p(40)} />{crown(40)}<Talk x={43.5} y={27.05} /></g>
      <Fig {...p(80)} />{crown(80)}
      {follow(90, -1)}{follow(100, -1)}
    </Svg>
  );
};

const SleepyMurderer = () => (
  <Ring accent={0} skip={4} box="20 14 84 29">
    <g className={ACCENT}><path d="M54.5 23.6l2-.7M54.7 25.5l2 .2" strokeWidth={1.25} /></g>
    <g transform="rotate(35 92.8 32.5)" className={BACK}><Fig x={92.8} base={32.5} s={0.75} /></g>
  </Ring>
);

const RpsShowdown = () => (
  <Svg box="18 14 84 30" className={wide}>
    <g className={BACK}>
      {[26, 36, 84, 94].map(x => (
        <Fig key={x} x={x} base={33} s={0.65} arms={[{ side: -1, to: [[-1, -4]] }, { side: 1, to: [[1, -4]] }]} />
      ))}
    </g>
    <Fig x={50} base={42} arms={[{ side: 1, to: [[3.5, 1], [0, -2.5]] }]} />
    <g className={ACCENT}><Fig x={70} base={42} arms={[{ side: -1, to: [[-3.5, 1], [0, -2.5]] }]} /></g>
  </Svg>
);

const SaladBowl = () => (
  <Svg box="22 16 76 28" className={wide}>
    <Fig x={34} base={42} arms={[{ side: 1, to: [[3, -1.5]] }]} />
    <Talk x={39} y={26.5} />
    <Fig x={86} base={42} arms={[{ side: -1, to: [[-1, -5]] }]} />
    <g className={ACCENT}>
      <path d="M51 35h18a9 6 0 0 1-18 0z" {...ink} />
      <rect x={54} y={30} width={4} height={3} rx={0.5} transform="rotate(-15 56 31.5)" {...ink} />
      <rect x={61} y={29.5} width={4} height={3} rx={0.5} transform="rotate(12 63 31)" {...ink} />
    </g>
  </Svg>
);

const HiHaHo = () => {
  const left = { x: 41, base: 37, s: 0.9 };
  const right = { x: 59, base: 39, s: 0.95 };
  const a = { x: 82, base: 39, s: 0.95 };
  return (
    <Svg box="22 11 72 33" className={wide}>
      <ellipse cx={57} cy={34.5} rx={32} ry={6} className={BACK} {...floor} />
      <g className={BACK}>
        <Fig x={30} base={31} s={0.62} />
        <Fig x={72} base={30} s={0.62} />
      </g>
      <Fig {...left} arms={[reach(left, 1, [46.5, 33.5])]} />
      <Bubble p={left} text="HA" />
      <g className={ACCENT}>
        <Fig x={50} base={40} arms={[{ side: -1, to: [[-3, -6.5]] }, { side: 1, to: [[3, -6.5]] }]} />
      </g>
      <Fig {...right} arms={[reach(right, -1, [53.5, 33.5])]} />
      <Bubble p={right} text="HA" />
      <Fig {...a} arms={[reach(a, -1, [77.5, 26.5]), reach(a, 1, [77.5, 26.5])]} />
      <Bubble p={a} text="HI" />
    </Svg>
  );
};

const Ninja = () => {
  const attacker = { x: 47, base: 40, s: 1 };
  return (
    <Svg box="24 13 64 31" className={wide}>
      <ellipse cx={55} cy={34.5} rx={26} ry={6} className={BACK} {...floor} />
      <g className={BACK}>
        <Fig x={38} base={31} s={0.65} />
        <Fig x={71} base={30.5} s={0.65} />
      </g>
      <Fig x={30} base={35} s={0.85} arms={[{ side: 1, to: [[3, -2.5]] }, { side: -1, to: [[-2, -3]] }]} />
      <Fig x={80} base={35} s={0.85} arms={[{ side: -1, to: [[-3, -2]] }, { side: 1, to: [[2, 2.5]] }]} />
      <Fig x={62} base={39} s={0.95} arms={[{ side: -1, to: [[-1.5, -4.5]] }, { side: 1, to: [[3, -2]] }]} />
      <g className={ACCENT}>
        <Fig {...attacker} arms={[reach(attacker, 1, [55.5, 29.5]), { side: -1, to: [[-3, 1], [-1, -3]] }]} />
      </g>
    </Svg>
  );
};

/** Je zwei haben dieselbe Frucht. Die Rufende in der Mitte nennt die Äpfel, beide tauschen die Plätze. */
const FruitSalad = () => (
  <Ring box="20 12 80 31" mid={
    <>
      <Fig x={62} base={34} s={0.8} />
      <Talk x={59} y={21.6} dir={-1} />
      <g className={ACCENT}>
        <path d="M31 34C45 30 75 29 89 31" {...trail} />
        <path d="M89 31l-1.75-1.6M89 31l-2.1 1.1" strokeWidth={0.9} />
        <path d="M89 34.5C75 37 45 37.5 31 36.5" {...trail} />
        <path d="M31 36.5l1.9 1.5M31 36.5l2.05-1.25" strokeWidth={0.9} />
      </g>
    </>
  }>
    {spots(6).map(p => {
      const y = headTop(p) - 2.5;
      // Je zwei haben dieselbe Frucht: Äpfel (Akzent, sie tauschen gerade), Zitronen, Kirschen.
      const fruit = p.i % 3 === 1
        ? <><circle cx={p.x} cy={y} r={1.5} {...ink} /><path d={`M${p.x} ${y - 1.5}l.6-1`} strokeWidth={0.9} /></>
        : p.i % 3 === 0
          ? <ellipse cx={p.x} cy={y} rx={1.9} ry={1.3} {...ink} />
          : <><circle cx={p.x - 1.1} cy={y + 0.5} r={1} {...ink} /><circle cx={p.x + 1.1} cy={y + 0.5} r={1} {...ink} /><path d={`M${p.x - 1.1} ${y - 0.5}L${p.x} ${y - 2.5}L${p.x + 1.1} ${y - 0.5}`} strokeWidth={0.75} /></>;
      return <g key={p.i} className={p.i % 3 === 1 ? ACCENT : p.base < 33.9 ? BACK : undefined}>{fruit}</g>;
    })}
  </Ring>
);

/** Lea ruft ihren Namen und wirft; der Pfeil zeigt, zu wem. */
const NameBall = () => (
  <Ring accent={1} box="20 6 80 38" arms={{ 1: [{ side: 1, to: [[2, -4]] }], 4: [{ side: -1, to: [[-2, -4]] }] }}>
    <g className={ACCENT}>
      <Bubble p={spots(6)[1]} text="Lea" />
      <path d="M31.5 22.5C44 10 78 9 89 19" {...trail} />
      <path d="M89 19l-.5-2.3M89 19l-2.4-.3" strokeWidth={0.9} />
      <Ball x={60} y={11.5} />
    </g>
  </Ring>
);

const Juggle = () => (
  <Ring box="20 6 80 38" arms={{ 1: [{ side: 1, to: [[2, -4]] }], 5: [{ side: 1, to: [[0.5, -5]] }] }}>
    <g className={BACK}>
      <path d="M31 21C42 9 70 9 76 17" {...trail} />
      <path d="M86 22C83 13 58 11 48 17" {...trail} />
    </g>
    <g className={ACCENT}><Ball x={52} y={12} /><Ball x={68} y={13.5} /><Ball x={40} y={14.5} /></g>
  </Ring>
);

const SpaghettiTower = () => (
  <Svg box="24 7 72 37" className={wide}>
    <path d="M30 36H90M36 36V44M84 36V44" className={BACK} strokeWidth={1.25} />
    <path d="M52 36L57.5 16h5L68 36M54.5 28h11M56.2 21.5h7.6M54.5 28l9.3-6.5M65.5 28l-9.3-6.5" strokeWidth={1.25} />
    <rect x={57} y={10.5} width={6} height={5} rx={1.5} className={ACCENT} {...ink} />
    <Fig x={38} base={44} s={0.9} arms={[{ side: 1, to: [[4, -4]] }]} />
    <Fig x={82} base={44} s={0.9} arms={[{ side: -1, to: [[-4, -4]] }]} />
  </Svg>
);

const Robot = () => (
  <Svg box="36 16 68 28" className={wide}>
    <path d="M100 22V42" className={BACK} strokeWidth={1.25} />
    <Fig x={50} base={41} s={0.85} arms={[{ side: 1, to: [[10, -0.5]] }]} />
    <g className={ACCENT}>
      <Fig x={66} base={41} arms={[{ side: -1, to: [[-1, 4]] }, { side: 1, to: [[1, 4]] }]} />
      <path d="M74 42H92M92 42l-2-1.5M92 42l-2 1.5" {...trail} />
    </g>
  </Svg>
);

/** Die Gruppe lenkt den Delfin (Akzent) nur mit Klatschen: je näher am Ziel, desto lauter. */
const Dolphin = () => (
  <Svg box="20 12 80 32" className={wide}>
    <g className={BACK}>
      {[60, 72, 84].map(x => (
        <g key={x}>
          <Fig x={x} base={30} s={0.6} arms={[{ side: 1, to: [[2, -3]] }, { side: -1, to: [[-2, -3]] }]} />
          <path d={`M${x - 3.5} 15.5l.75 1.25M${x} 14v1.5M${x + 3.5} 15.5l-.75 1.25`} strokeWidth={0.9} />
        </g>
      ))}
    </g>
    <path d="M90 41l3-5 3 5z" className={BACK} {...ink} />
    <g className={ACCENT}>
      <Fig x={44} base={41} arms={[{ side: 1, to: [[3.5, 1]] }]} />
      <path d="M52 41.5C62 42 74 42 86 41" {...trail} />
    </g>
  </Svg>
);

const RopeHouse = () => (
  <Svg box="24 10 72 34" className={wide}>
    <g className={BACK}>
      <Fig x={60} base={27} s={0.55} />
      <Fig x={41} base={33} s={0.7} /><Fig x={79} base={33} s={0.7} />
    </g>
    <path d="M36 41H84L79 33H41zM41 33L60 26.5L79 33M36 41L79 33M84 41L41 33" className={ACCENT} strokeWidth={1.25} />
    <Fig x={34} base={42} s={0.95} /><Fig x={86} base={42} s={0.95} />
  </Svg>
);

const ChairTilt = () => {
  const chair = (x: number) => (
    <g key={x} transform={`rotate(-15 ${x} 41)`}><path d={`M${x} 41V29M${x} 35h5v6`} strokeWidth={1.5} /></g>
  );
  return (
    <Svg box="18 20 84 25" className={wide}>
      {[28, 56, 84].map(x => (
        <g key={x}>
          <Fig x={x} base={41} s={0.85} arms={[{ side: 1, to: [[3.5, -3.8]] }]} />
          {chair(x + 6.5)}
        </g>
      ))}
      <g className={ACCENT}><path d="M30 43.5C40 45 52 45 60 43M60 43l-2.4-.4M60 43l-1.6 1.8" {...trail} /></g>
    </Svg>
  );
};

const PenStrings = () => (
  <Svg box="14 14 92 30" className={wide}>
    <path d="M36 31H84L92 41H28z" className={BACK} strokeWidth={0.75} />
    <g className={BACK}>
      <Fig x={36} base={29} s={0.6} arms={[{ side: 1, to: [[2, -0.5]] }]} />
      <Fig x={84} base={29} s={0.6} arms={[{ side: -1, to: [[-2, -0.5]] }]} />
    </g>
    <path d="M60 28L38.5 23.5M60 28L81.5 23.5M60 28L27 32.5M60 28L93 32.5" strokeWidth={0.9} />
    <Fig x={22} base={41} s={0.95} arms={[{ side: 1, to: [[3, 0]] }]} />
    <Fig x={98} base={41} s={0.95} arms={[{ side: -1, to: [[-3, 0]] }]} />
    <g className={ACCENT}>
      <path d="M59 27.5h2v7l-1 2-1-2z" {...ink} />
      <path d="M48 38c4-2 8 1 11.5-1.5" strokeWidth={1.25} />
    </g>
  </Svg>
);

const NamePoem = () => (
  <Svg box="26 12 68 32" className={wide}>
    <rect x={47} y={14} width={26} height={28} rx={2} strokeWidth={1.25} />
    <g className={ACCENT}>
      {['L', 'E', 'A'].map((c, i) => (
        <text key={c} x={52.75} y={23 + 7 * i} fontSize={5} fontWeight={700} textAnchor="middle" {...ink}>{c}</text>
      ))}
    </g>
    <path d="M58 21.5h10M58 28.5h7M58 35.5h9" className={BACK} strokeWidth={1.25} />
  </Svg>
);

const SoundGuess = () => (
  <Svg box="20 8 80 36" className={wide}>
    <path d="M48 42V18M72 42V18" className={BACK} strokeWidth={1.25} />
    <path d="M48 19h24v16H48z" className={BACK} {...ink} />
    <g className={ACCENT} strokeWidth={1.25}><path d="M56 14.5a5 5 0 0 1 8 0M53 11.5a9 9 0 0 1 14 0" /></g>
    <Fig x={30} base={42} arms={[{ side: 1, to: [[1.25, -3.5], [-0.25, -2]] }]} />
    <Fig x={90} base={42} arms={[{ side: -1, to: [[-1.25, -3.5], [0.25, -2]] }]} />
  </Svg>
);

/** Sitzende Person (gleiche Form wie das Atem-Icon), Füße auf `base`. */
const Sit: React.FC<{ x: number; base: number; s: number }> = ({ x, base, s }) => (
  <g transform={`translate(${x - 12 * s} ${base - 21 * s}) scale(${s})`}>
    <circle cx="12" cy="6.5" r="2.5" {...ink} />
    <path d="M9.5 17v-4.5a2.5 2.5 0 0 1 5 0V17z" {...ink} />
    <path d="M5 21a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 21z" {...ink} />
    <path d="M10 13l-3 4.5M14 13l3 4.5" strokeWidth={LIMB} />
  </g>
);

const BreathCircle = () => {
  const all = spots(6).sort((a, b) => a.base - b.base);
  return (
    <Svg box="20 16 80 27" className={wide}>
      <ellipse cx={60} cy={34} rx={38} ry={7.5} className={BACK} {...floor} />
      {all.map(p => (
        <g key={p.i} className={p.i === 0 ? ACCENT : p.base < 33.9 ? BACK : undefined}>
          <Sit x={p.x} base={p.base} s={p.s * 0.9} />
        </g>
      ))}
      <g className={ACCENT}><path d="M46.3 23.5a5.4 5.4 0 0 0 0 5.4M56.1 23.5a5.4 5.4 0 0 1 0 5.4" strokeWidth={1.25} /></g>
    </Svg>
  );
};

const DropCurtain = () => (
  <Svg box="14 12 92 32" className={wide}>
    <g className={BACK}>
      {[20, 30, 90, 100].map(x => <Fig key={x} x={x} base={34} s={0.65} />)}
    </g>
    <g className={BACK}>
      {/* Zwei Personen halten das Tuch an den oberen Ecken. */}
      <Fig x={49} base={36} s={0.7} arms={[reach({ x: 49, base: 36, s: 0.7 }, 1, [54, 22.5])]} />
      <Fig x={71} base={36} s={0.7} arms={[reach({ x: 71, base: 36, s: 0.7 }, -1, [66, 22.5])]} />
    </g>
    <Fig x={38} base={42} arms={[{ side: 1, to: [[3, -1.5]] }]} />
    <Fig x={82} base={42} arms={[{ side: -1, to: [[-3, -1.5]] }]} />
    <g className={ACCENT}>
      <rect x={54} y={22} width={12} height={14} rx={1} {...ink} />
      <path d="M58 38v3.5M62 38v3.5M56.5 40L58 41.5l1.5-1.5M60.5 40L62 41.5l1.5-1.5" strokeWidth={0.9} />
    </g>
  </Svg>
);

/** Vorn ein Paar mit gedachter Spiegelfläche dazwischen, der Spiegel (Akzent) macht die Bewegung seitenverkehrt mit; hinten ein zweites Paar. */
const Mirror = () => {
  const lead = { x: 46, base: 41, s: 1 }, mirror = { x: 66, base: 41, s: 1 };
  const backA = { x: 84, base: 33, s: 0.65 }, backB = { x: 98, base: 33, s: 0.65 };
  return (
    <Svg box="26 15 80 29" className={wide}>
      <path d="M28 41H104" className={BACK} strokeWidth={0.75} />
      <g className={BACK}>
        <Fig {...backA} arms={[reach(backA, 1, [89, 24.5]), { side: -1, to: [[-2.5, 2]] }]} />
        <Fig {...backB} arms={[reach(backB, -1, [93, 24.5]), { side: 1, to: [[2.5, 2]] }]} />
        <path d="M56 18V43" {...floor} />
      </g>
      <Fig {...lead} arms={[reach(lead, 1, [54.5, 26.5]), { side: -1, to: [[-3, 4]] }]} />
      <g className={ACCENT}>
        <Fig {...mirror} arms={[reach(mirror, -1, [57.5, 26.5]), { side: 1, to: [[3, 4]] }]} />
      </g>
    </Svg>
  );
};

/** Eine Kleingruppe steht erstarrt als Standbild auf einer Fläche; die anderen gehen herum und beschreiben, was sie sehen. */
const Sculpture = () => {
  const a = { x: 46, base: 40, s: 0.95 }, b = { x: 60, base: 40, s: 0.95 }, c = { x: 74, base: 40, s: 0.95 };
  const viewer = { x: 26, base: 37, s: 0.7 };
  return (
    <Svg box="16 12 88 34" className={wide}>
      <path d="M38 41.25H82" className={BACK} strokeWidth={2} />
      <g className={BACK}>
        <Fig {...viewer} arms={[reach(viewer, 1, [33, 29])]} />
        <Fig x={94} base={37} s={0.7} />
        <Fig x={84} base={30} s={0.55} />
        <path d="M28 41C40 46 80 46 94 40.5" {...trail} />
        <path d="M94 40.5l-2.4.1M94 40.5l-1.3 2" strokeWidth={0.9} />
      </g>
      <Fig {...a} arms={[reach(a, 1, [53, 25]), { side: -1, to: [[-3, -5.5]] }]} />
      <Fig {...c} arms={[reach(c, -1, [67, 25]), { side: 1, to: [[3, -5.5]] }]} />
      <g className={ACCENT}>
        <Fig {...b} arms={[reach(b, -1, [53, 25]), reach(b, 1, [67, 25])]} />
      </g>
    </Svg>
  );
};

const SCENES: Record<string, React.FC<{ language: Language }>> = {
  spiegel: Mirror,
  'lebendige-skulptur': Sculpture,
  'billy-billy-bob': BillyBillyBob,
  'menschlicher-knoten': Knot,
  minenfeld: Minefield,
  eierfall: EggDrop,
  'gemeinsam-zaehlen': CountTogether,
  'ein-wort-geschichte': WordStory,
  'helium-stick': HeliumStick,
  'stand-up-ruecken': StandUp,
  'stumme-reihe': SilentLine,
  'eisschollen-rettung': IceFloes,
  'lebender-balltransport': MarbleRun,
  'blindes-quadrat': BlindSquare,
  'decke-wenden': BlanketFlip,
  '100-schlaege-ball': HundredHits,
  'blindes-zahlen-sortieren': BlindNumbers,
  'elektrischer-zaun': ElectricFence,
  saeuresee: AcidLake,
  'stille-matrix': SilentGrid,
  'schrumpfende-insel': ShrinkingIsland,
  'ssp-evolution': RpsEvolution,
  'impuls-kreis': ImpulseCircle,
  'wer-bin-ich': WhoAmI,
  werwolf: Werewolf,
  spion: Spy,
  psychiater: Psychiatrist,
  empire: Empire,
  'schlafmuetze-moerder': SleepyMurderer,
  'ssp-showdown': RpsShowdown,
  'salad-bowl': SaladBowl,
  'hi-ha-ho': HiHaHo,
  ninja: Ninja,
  obstsalat: FruitSalad,
  namensball: NameBall,
  'ball-jonglage': Juggle,
  'spaghetti-turm': SpaghettiTower,
  roboterspiel: Robot,
  'delfin-training': Dolphin,
  hexenhaus: RopeHouse,
  'stuehle-balancieren': ChairTilt,
  'stift-an-schnueren': PenStrings,
  'namens-akrostichon': NamePoem,
  'geraeusche-raten': SoundGuess,
  'atem-zaehlen': BreathCircle,
  'vorhang-faellt': DropCurtain,
};

export const getGameScene = (id: string) => SCENES[id];
