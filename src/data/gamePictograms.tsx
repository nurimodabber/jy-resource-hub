import React from 'react';

/**
 * KONZEPT: eigene Spiel-Icons im Strichstil von lucide (24er Raster, runde Enden, currentColor),
 * für Spiele, bei denen ein Standard-Icon nichts über das Spiel sagt (Lineal für Helium-Stab, Bombe für Minenfeld).
 * Sie zeigen, was die Gruppe tut: Figuren, Gegenstand, Bewegung.
 */
type Props = { className?: string; strokeWidth?: number | string };

const Svg: React.FC<Props & { children: React.ReactNode }> = ({ className, strokeWidth = 1.75, children }) => (
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

const make = (children: React.ReactNode): React.FC<Props> => {
  const Icon: React.FC<Props> = (p) => <Svg {...p}>{children}</Svg>;
  return Icon;
};

/** Stehende Figur: Kopf, Rumpf, Beine. Arme zeichnet jedes Icon selbst. */
const fig = (x: number, head = 5, feet = 20) => {
  const hip = feet - 6;
  return (
    <>
      <circle cx={x} cy={head} r="1.75" />
      <path d={`M${x} ${head + 2.5}V${hip}l-2.5 6M${x} ${hip}l2.5 6`} />
    </>
  );
};

export const KnotIcon = make(
  <>
    {fig(5)}
    {fig(19)}
    <path d="M5 9.5C10 9.5 13 14 19 13M19 9.5C14 9.5 11 14 5 13" />
  </>,
);

export const HeliumStickIcon = make(
  <>
    <path d="M3 6h18" />
    {fig(7, 10, 21)}
    {fig(17, 10, 21)}
    <path d="M7 13.5L5 6M7 13.5L9 6M17 13.5L15 6M17 13.5L19 6" />
  </>,
);

export const BlanketFlipIcon = make(
  <>
    <path d="M2 21l4-4.5h16l-4 4.5z" />
    {fig(11, 4.5, 18.5)}
    <path d="M17 4a4 4 0 0 1 3.2 6.2M20.2 10.2l-2.4-.4M20.2 10.2l.5-2.3" />
  </>,
);

export const IceFloeIcon = make(
  <>
    <path d="M2 21.5c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0" />
    <path d="M2.5 17.5h7M14.5 17.5h7" />
    {fig(6, 4.5, 17.5)}
    <path d="M10.5 9.5q3.5-3.5 7 .5M18 10l-.3-2.3M18 10l-2.2.4" />
  </>,
);

export const SilentLineIcon = make(
  <>
    <circle cx="5" cy="12.5" r="1.6" />
    <path d="M3 21v-4.5a2 2 0 0 1 4 0V21" />
    <circle cx="12" cy="8.5" r="1.6" />
    <path d="M10 21v-8.5a2 2 0 0 1 4 0V21" />
    <circle cx="19" cy="4.5" r="1.6" />
    <path d="M17 21V8.5a2 2 0 0 1 4 0V21" />
  </>,
);

export const MinefieldIcon = make(
  <>
    <circle cx="7" cy="5" r="2.25" />
    <path d="M4 4.6h7l1.5 1.5" />
    <path d="M7 7.5V14l-2.5 6M7 14l2.5 6M7 9.5l4.5 1.5" />
    <path d="M15 17l3 3M18 17l-3 3M18.5 10.5l2.5 2.5M21 10.5l-2.5 2.5" />
  </>,
);

export const WhoAmIIcon = make(
  <>
    <rect x="7.5" y="1.5" width="9" height="7" rx="1.5" />
    <path d="M10.8 4.1a1.3 1.3 0 1 1 1.8 1.2c-.4.2-.6.5-.6.9M12 7.2h.01" />
    <circle cx="12" cy="12.5" r="3" />
    <path d="M5 21.5c0-3 3-5 7-5s7 2 7 5" />
  </>,
);

export const WerewolfIcon = make(
  <>
    <path d="M20 2.5a3 3 0 1 0 1.8 4.8A2.5 2.5 0 1 1 20 2.5z" />
    <circle cx="10" cy="12.5" r="4" />
    <path d="M7 9.5L6.5 5l3 2.6M13 9.5L13.5 5l-3 2.6" />
    <path d="M3 21.5c0-2.5 3-4.5 7-4.5s7 2 7 4.5" />
  </>,
);

export const BallKeepUpIcon = make(
  <>
    <circle cx="12" cy="4" r="2.25" />
    {fig(5, 10, 21)}
    {fig(19, 10, 21)}
    <path d="M5 13.5L3.5 9M5 13.5L8 8.5M19 13.5L20.5 9M19 13.5L16 8.5" />
  </>,
);

export const ShrinkingIslandIcon = make(
  <>
    <ellipse cx="12" cy="19.5" rx="10" ry="2.5" strokeDasharray="2 2.5" />
    <ellipse cx="12" cy="19.5" rx="6.5" ry="1.4" />
    {fig(8.5, 6, 19)}
    {fig(15.5, 6, 19)}
  </>,
);
