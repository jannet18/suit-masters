import { Group } from "@/app/lib/types";
import OptionCard from "./OptionCard";

interface Props {
  group: Group;
  selectedOptions: Record<number, number>;
  setSelectedOptions: (opts: Record<number, number>) => void;
}

export default function CustomisationGroup({
  group,
  selectedOptions,
  setSelectedOptions,
}: Props) {
  const handleSelect = (itemId: number) => {
    setSelectedOptions({
      ...selectedOptions,
      [group.id]: itemId,
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
            isSelected={selectedOptions[group.id] === item.id}
            onSelect={() => handleSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
