"use client";

import type { ReactElement } from "react";
import { Check } from "lucide-react";
import { formatCurrency } from "@repo/pricing";

interface IconOptionTileProps {
  label: string;
  priceDelta: number;
  selected: boolean;
  onClick: () => void;
  icon?: (props: { className?: string }) => ReactElement;
}

/** Icon-on-top, label-below option tile — mirrors the line-art picker
 * pattern used by Hockerty's configurator (icon + label + selected badge). */
export function IconOptionTile({
  label,
  priceDelta,
  selected,
  onClick,
  icon: Icon,
}: IconOptionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 border text-center transition-all ${
        selected
          ? "border-[#c9a96e] bg-[#c9a96e]/8"
          : "border-[#2e2e2e] hover:border-[#c9a96e]/30"
      }`}
    >
      {selected && (
        <span className="absolute top-2 left-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9a96e] text-[#0f0f0f]">
          <Check size={10} strokeWidth={3} />
        </span>
      )}
      {Icon && (
        <Icon
          className={`w-8 h-8 ${selected ? "text-[#c9a96e]" : "text-[#9a9490]"}`}
        />
      )}
      <div className="font-serif text-[#f5f0eb] text-sm font-medium">{label}</div>
      {priceDelta > 0 && (
        <div className="text-[#c9a96e] text-[10px]">+ {formatCurrency(priceDelta)}</div>
      )}
    </button>
  );
}
