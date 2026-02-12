"use client";

import React from "react";
import { CustomizationGroup } from "@/app/lib/types";

interface StyleProps {
  groups: CustomizationGroup[];
  selectedOptions: Record<number, number>;
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<Record<number, number>>
  >;
}

const StyleStep: React.FC<StyleProps> = ({
  groups,
  selectedOptions,
  setSelectedOptions,
}) => {
  const handleOptionChange = (groupId: number, itemId: number) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: itemId }));
  };

  return (
    <div>
      <h3>Style Step</h3>
      {groups.map((group) => (
        <div key={group.id}>
          <h4>{group.name}</h4>
          {group.items?.map((item) => (
            <button
              key={item.id}
              onClick={() => handleOptionChange(group.id, item.id)}
              style={{
                backgroundColor:
                  selectedOptions[group.id] === item.id ? "lightblue" : "white",
              }}
            >
              {item.value}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default StyleStep;
