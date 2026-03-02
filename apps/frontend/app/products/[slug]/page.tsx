// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { api } from "@/lib/api/api-client";

// interface Product {
//   id: number;
//   name: string;
//   description: string;
//   basePrice: number;
//   product_image: string;
// }

// interface Collection {
//   id: number;
//   name: string;
//   slug: string;
//   description: string;
//   image: string;
//   products: Product[];
// }

// export default function CollectionPage({
//   params,
// }: {
//   params: { slug: string };
// }) {
//   const [collection, setCollection] = useState<Collection | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     async function loadCollection() {
//       if (!params.slug) return;
//       const res = await api.getCollectionBySlug(params.slug); // your API should accept slug
//       if (res.success) setCollection(res.collection);
//     }
//     loadCollection();
//   }, [params.slug]);

//   if (!collection)
//     return <div className="text-white p-10">Loading collection...</div>;

//   return (
//     <div className="min-h-screen bg-[#0f0f0f] text-white p-10">
//       <h1 className="text-4xl mb-4">{collection.name}</h1>
//       <p className="mb-6">{collection.description}</p>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {collection.products.map((product) => (
//           <div
//             key={product.id}
//             className="bg-[#1a1a1a] p-4 rounded-lg cursor-pointer"
//             onClick={() => router.push(`/products/${product.id}`)}
//           >
//             <img
//               src={product.product_image}
//               alt={product.name}
//               className="mb-2 w-full h-48 object-cover rounded"
//             />
//             <h2 className="text-xl font-bold">{product.name}</h2>
//             <p className="text-[#c9a96e]">${product.basePrice}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/api-client";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_image: string;
  base_price: string;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<{
    [groupId: number]: number; // optionId
  }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await api.getProductBySlug(params.slug);
      if (res.success) setProduct(res.product);
      setLoading(false);
    };

    fetchProduct();
  }, [params.slug]);

  const handleSelect = (groupId: number, optionId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));
  };
  if (loading) return <p className="text-white p-10">Loading...</p>;

  if (!product) return <p className="text-white p-10">Product not found</p>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-10">
      <h1 className="text-4xl mb-4">{product.name}</h1>
      <img
        src={product.product_image}
        alt={product.name}
        className="w-full max-w-md mb-6"
      />
      <p className="mb-4">{product.description}</p>
      <p className="text-xl text-[#c9a96e]">USD {product.base_price}</p>

      <button
        onClick={() => router.push(`/products/${product.slug}/configure`)}
        className="mt-6 bg-white text-black px-6 py-3 rounded"
      >
        Customize This Suit
      </button>
    </div>
  );
}
