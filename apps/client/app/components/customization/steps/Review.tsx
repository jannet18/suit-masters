"use client";

import React, { useState } from "react";

interface ReviewProps {
  selectedOptions: Record<number, number>;
  measurements: Record<string, any>;
  total: number;
}

const ReviewStep: React.FC<ReviewProps> = ({
  selectedOptions,
  measurements,
  total,
}) => {
  // const [reviewData, setReviewData] = useState<string | null>(null);
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Review Your Custom Suit</h2>
      <div className="mb-4">
        <h3 className="font-semibold">Selected Options:</h3>
        {Object.entries(selectedOptions).map(([groupId, itemId]) => (
          <div key={groupId} className="ml-4">
            Group ID: {groupId}, Item ID: {itemId}
          </div>
        ))}
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Measurements:</h3>
        {Object.entries(measurements).map(([key, value]) => (
          <div key={key} className="ml-4">
            {/* {key}: {value} */}
            {key}: {JSON.stringify(value)}
          </div>
        ))}
      </div>
      <div className="font-bold text-lg">Total Price: ${total}</div>
    </div>
  );
};

export default ReviewStep;
// "use client";

// import React from "react";
// import { CartItem, CustomizationGroup } from "@/app/lib/types";

// interface ReviewProps {
//   cartItem: CartItem;
//   groups?: CustomizationGroup[];
// }

// const ReviewStep: React.FC<ReviewProps> = ({ cartItem, groups }) => {
//   return (
//     <div>
//       <h3>Review Step</h3>
//       <p>Name: {cartItem.name}</p>
//       <p>Quantity: {cartItem.quantity}</p>
//       <p>Price: {cartItem.base_price}</p>
//       {cartItem.customizations && groups && (
//         <div>
//           <h4>Customizations:</h4>
//           {groups.map((group) => (
//             <div key={group.id}>
//               <strong>{group.name}</strong>:{" "}
//               {group.items
//                 ?.filter((item) => cartItem.customizations![group.id] === item.id)
//                 .map((item) => item.value)
//                 .join(", ")}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ReviewStep;
