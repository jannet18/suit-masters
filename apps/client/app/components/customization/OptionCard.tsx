import { CustomizationItem } from "@/app/lib/types";

interface Props {
  item: CustomizationItem;
  isSelected: boolean;
  onSelect: () => void;
}

export default function OptionCard({ item, isSelected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`border rounded-md p-3 text-sm transition ${
        isSelected ? "bg-black text-white" : "bg-white hover:bg-gray-100"
      }`}
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.value}
          className="w-full h-24 object-cover mb-2"
        />
      )}

      <div>{item.value}</div>

      {item.price_delta && (
        <div className="text-xs mt-1">+KES {item.price_delta}</div>
      )}
    </button>
  );
}
