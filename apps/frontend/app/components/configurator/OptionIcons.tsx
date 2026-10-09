/**
 * Small schematic line-icons for the style option tiles — same spirit as
 * Hockerty's technical-drawing icons (thin outline, no fill), hand-drawn
 * here rather than sourced, so there's no real "icon per factory_code"
 * asset dependency.
 */
import type { ReactElement } from "react";

type IconProps = { className?: string };

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 32 32",
};

export function LapelNotchIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M6 8 L14 4 L16 10 L18 4 L26 8 L26 26 L6 26 Z" />
      <path d="M14 4 L16 16 L18 4" />
    </svg>
  );
}

export function LapelPeakIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M6 8 L14 4 L16 12 L12 14 L18 4 L26 8 L26 26 L6 26 Z" />
      <path d="M14 4 L16 16 L18 4" />
    </svg>
  );
}

export function LapelShawlIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M6 8 L14 4 Q16 12 16 20 Q16 12 18 4 L26 8 L26 26 L6 26 Z" />
    </svg>
  );
}

export function PocketFlapIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <rect x="6" y="6" width="20" height="20" rx="1" opacity="0.3" />
      <path d="M11 16 L21 16 L21 24 L11 24 Z" />
      <path d="M10 16 L16 12 L22 16" />
    </svg>
  );
}

export function PocketPipedIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <rect x="6" y="6" width="20" height="20" rx="1" opacity="0.3" />
      <path d="M10 18 L22 18" strokeWidth={2.2} />
    </svg>
  );
}

export function PocketTicketIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <rect x="6" y="6" width="20" height="20" rx="1" opacity="0.3" />
      <path d="M10 20 L20 20 L20 25 L10 25 Z" />
      <path d="M18 12 L25 12 L25 17 L18 17 Z" />
    </svg>
  );
}

function ButtonDots({ positions }: { positions: Array<[number, number]> }) {
  return (
    <>
      {positions.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} fill="currentColor" stroke="none" />
      ))}
    </>
  );
}

export function Button1Icon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M11 6 L21 6 L21 26 L11 26 Z" opacity="0.3" />
      <ButtonDots positions={[[16, 14]]} />
    </svg>
  );
}

export function Button2Icon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M11 6 L21 6 L21 26 L11 26 Z" opacity="0.3" />
      <ButtonDots positions={[[16, 12], [16, 18]]} />
    </svg>
  );
}

export function ButtonDbIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M8 6 L24 6 L24 26 L8 26 Z" opacity="0.3" />
      <ButtonDots
        positions={[
          [12, 10],
          [20, 10],
          [12, 15],
          [20, 15],
          [12, 20],
          [20, 20],
        ]}
      />
    </svg>
  );
}

export const LAPEL_ICON_BY_VALUE: Record<string, (p: IconProps) => ReactElement> = {
  "Notch Lapel": LapelNotchIcon,
  "Peak Lapel": LapelPeakIcon,
  "Shawl Lapel": LapelShawlIcon,
};

export const POCKET_ICON_BY_VALUE: Record<string, (p: IconProps) => ReactElement> = {
  "Flap Pocket": PocketFlapIcon,
  "Piped Pocket": PocketPipedIcon,
  "Ticket Pocket": PocketTicketIcon,
};

export const BUTTON_ICON_BY_VALUE: Record<string, (p: IconProps) => ReactElement> = {
  "1 Button": Button1Icon,
  "2 Button": Button2Icon,
  "Double Breasted 6 Button": ButtonDbIcon,
};
