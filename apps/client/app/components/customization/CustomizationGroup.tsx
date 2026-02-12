import { Group } from "@/app/lib/types";
import OptionCard from "./OptionCard";
import { CustomOption } from "@/app/stores/cartStore";
import React from "react";

interface Props {
  group: Group;
  selectedOptions: CustomOption[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<CustomOption[]>>;
}

export default function CustomisationGroup({
  group,
  selectedOptions,
  setSelectedOptions,
}: Props) {
  /**
   * When user selects an option:
   * 1. Remove any previously selected option from this group
   * 2. Add the new option
   */
  const handleSelect = (item: Group["items"][0]) => {
    setSelectedOptions((prev) => {
      // Remove any previously selected option from this group
      const filtered = prev.filter((opt) => opt.group_id !== group.id);
      // Add the new option
      const newOption: CustomOption = {
        id: item.id,
        group_id: group.id,
        label: item.value,
        price_impact: item.price_delta ? item.price_delta.toString() : "0",
      };
      return [...filtered, newOption];
    });
  };

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-600 mb-3">{group.name}</h3>

      <div className="grid grid-cols-2 gap-4">
        {group.items.map((item) => (
          <OptionCard
            key={item.id}
            item={item}
            isSelected={selectedOptions.some((opt) => opt.id === item.id)}
            onSelect={() => handleSelect(item)}
          />
        ))}
      </div>
    </div>
  );
}
