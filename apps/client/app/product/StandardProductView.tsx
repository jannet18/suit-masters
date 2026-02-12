// "use client";

// import { useCartStore } from "../stores/cartStore";

// interface Props {
//   product: any;
// }

// export default function StandardProductView({ product }: Props) {
//   // const { addStandardItem } = useCartStore();

//   const handleAddToCart = () => {
//     addStandardItem({
//       product_type: "STANDARD",
//       id: product.id,
//       name: product.name,
//       image_url: product.image,
//       quantity: 1,
//       base_price: product.price,
//     });
//   };

//   return (
//     <div className="grid md:grid-cols-2 gap-10">
//       <img src={product.image} alt={product.name} />

//       <div>
//         <h1 className="text-2xl font-semibold">{product.name}</h1>

//         <p className="text-lg mt-2">KES {product.price}</p>

//         <button
//           onClick={handleAddToCart}
//           className="mt-6 px-6 py-3 bg-black text-white"
//         >
//           Add to Cart
//         </button>
//       </div>
//     </div>
//   );
// }
