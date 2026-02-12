"use client";

import {
  CustomizationGroup as Group,
  CustomizationItem,
} from "@/app/lib/types";

export default function CustomizationGroup({
  group,
  selectedOptions,
  setSelectedOptions,
}: {
  group: Group;
  selectedOptions: Record<number, number>;
  setSelectedOptions: (opts: Record<number, number>) => void;
}) {
  const handleSelect = (item: CustomizationItem) => {
    setSelectedOptions({ ...selectedOptions, [group.id]: item.id });
  };

  return (
    <div className="mt-2">
      <p className="text-gray-500 text-sm font-medium mb-1">{group.name}</p>
      <div className="flex flex-wrap gap-2">
        {group.items?.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className={`px-2 py-1 border rounded-md text-sm ${
              selectedOptions[group.id] === item.id
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-800"
            }`}
          >
            {item.value} {item.price_delta && `(+${item.price_delta})`}
          </button>
        ))}
      </div>
    </div>
  );
}
