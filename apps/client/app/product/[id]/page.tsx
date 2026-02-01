import ProductInteraction from "@/app/components/ProductInteraction";
import { Product } from "@/app/lib/types";
import Image from "next/image";

const product: Product = {
  id: 1,
  name: "Classic Blue Suit",
  image: {
    default: "/products/blue-suit-default.jpg",
    blue: "/products/blue-suit-blue.jpg",
    gray: "/products/blue-suit-gray.jpg",
    black: "/products/blue-suit-black.jpg",
  },
  colors: ["blue", "gray", "black"],
  sizes: ["36", "38", "40", "42", "44"],
  price: 299.99,
  description:
    "A timeless classic blue suit made from high-quality materials, perfect for any formal occasion.",
  originalPrice: 399.99,
  discount: 25,
  sku: "BS-001",
  rating: 4.5,
  delivery: "Free delivery within 5-7 business days",
  category: "suits",
};

const SingleProduct = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color: string; size: string }>;
}) => {
  const { size, color } = await searchParams;
  const selectedSize = size || (product?.sizes?.[0] as string);
  const selectedColor = color || (product?.colors?.[0] as string);
  return (
    <div className="flex flex-col gap-4 lg:flex-row md:gap-12 mt-12">
      {/* IMAGE */}
      <div className="w-full lg:w-5/12">
        <Image
          src={product.image[selectedColor]}
          alt={product.name}
          // fill
          className="object-contain rounded-md"
        />
      </div>
      {/* DETAILS */}
      <div className="w-full lg:w-7/12 flex flex-col gap-4">
        <h1 className="text-2xl font-medium">{product.name}</h1>
        <p className="text-gray-500">{product.description}</p>
        <h2 className="text-xl font-semibold">${product.price.toFixed(2)}</h2>
        <ProductInteraction
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
        />
        {/* CART INFO */}
        <div className="flex items-center gap-2 mt-4">
          <Image
            src="/klarna.png"
            alt="klarna"
            width={50}
            height={25}
            className="rounded-md"
          />
          <Image
            src="/cards.png"
            alt="cards"
            width={50}
            height={25}
            className="rounded-md"
          />
          <Image
            src="/stripe.png"
            alt="stripe"
            width={50}
            height={25}
            className="rounded-md"
          />
        </div>
        <p className="text-gray-500 text-xs">
          By clicking Pay Now, you agree to our
          <span className="underline hover:text-black">
            Terms & Conditions
          </span>{" "}
          and <span className="underline hover:text-black">Privacy Policy</span>
          . You authorize us to charge your selected payment method for the
          total amount shown. All sales are subject to our return and
          <span className="underline hover:text-black">Refund Policies</span>.
        </p>
      </div>
    </div>
  );
};

export default SingleProduct;
