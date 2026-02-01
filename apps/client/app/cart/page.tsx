"use client";
import { useSearchParams } from "next/navigation";
import { CartItemType } from "../lib/types";
import { useRouter } from "next/navigation";
import { ArrowRight, Trash2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import ShippingForm from "../components/ShippingForm";
import PaymentForm from "../components/PaymentForm";
import useCartStore from "../stores/cartStore";

const steps = [
  {
    id: 1,
    label: "shipping Cart",
    completed: true,
  },
  {
    id: 2,
    label: "Shipping Address",
    completed: false,
  },
  {
    id: 3,
    label: "Payment Method",
    completed: false,
  },
];

// const cartItems: CartItemType[] = [
//   {
//     id: 1,
//     name: "Maroon 5 piece Men Wedding Suit",
//     image: {
//       default:
//         "https://5.imimg.com/data5/XV/JQ/MY-65715759/nehru-jacket-modi-jacket-500x500.jpg",
//     },
//     sizes: ["S", "M", "L", "XL"],
//     colors: ["Red", "Blue", "Green"],
//     price: 2415,
//     originalPrice: 2465,
//     discount: 2,
//     sku: "SKU-O3WBHT",
//     rating: 0,
//     delivery: "2-4 weeks",
//     category: "Wedding Suits",
//     quantity: 1,
//     selectedSize: "XL",
//     selectedColor: "Blue",
//   },
//   {
//     id: 2,
//     name: "Light Brown 3 piece Wedding Suit",
//     image: {
//       default:
//         "https://i.etsystatic.com/40108629/r/il/6e9fa5/5442139537/il_1080xN.5442139537_k204.jpg",
//     },
//     sizes: ["S", "M", "L", "XL"],
//     colors: ["Brown", "Beige", "Black"],
//     price: 697,
//     originalPrice: 884,
//     discount: 21,
//     sku: "SKU-JJWIELXW",
//     rating: 0,
//     delivery: "1-2 weeks",
//     category: "Wedding Suits",
//     quantity: 1,
//     selectedSize: "2XL",
//     selectedColor: "Black",
//   },
//   {
//     id: 3,
//     name: "Beige 3 piece Men Wedding Suit",
//     image: {
//       default: "https://m.media-amazon.com/images/I/61jdMns0BPL._UY1000_.jpg",
//     },
//     sizes: ["S", "M", "L", "XL"],
//     colors: ["Beige", "White", "Gray"],
//     price: 3800,
//     originalPrice: 3800,
//     discount: 0,
//     sku: "SKU-SJWBKXW",
//     rating: 0,
//     delivery: "0-24 hours",
//     category: "Wedding Suits",
//     quantity: 1,
//     selectedSize: "M",
//     selectedColor: "Gray",
//   },
//   {
//     id: 4,
//     name: "Tuxedo Suit",
//     image: {
//       default:
//         "https://www.brides.com/thmb/N-dw0wQ8caEbmEqp88N-mkxBao0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Wedding-Tuxedos-Kelley-Williams-Photography-Main-04d3f4e087f443de9b08b93dc9a01900.jpg",
//     },
//     sizes: ["S", "M", "L", "XL"],
//     colors: ["Black", "Navy", "Gray"],
//     price: 599,
//     originalPrice: 999,
//     discount: 40,
//     sku: "SKU-UMZWREKB",
//     rating: 0,
//     delivery: "2-4 weeks",
//     category: "Tuxedos",
//     quantity: 1,
//     selectedSize: "XL",
//     selectedColor: "Navy",
//   },
// ];

const Cart = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shippingForm, setShippingForm] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  } | null>(null);

  const [paymentForm, setPaymentForm] = useState<any>(null);

  const activeStep = parseInt(searchParams.get("step") || "1");

  const { cart, removeFromCart } = useCartStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-semibold mb-6">Your Shopping Cart</h1>
      {/* <p className="text-gray-600">Your cart is currently empty.</p> */}
      {/* STEPS */}
      <div className="w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {steps.map((step) => (
          <div
            className={`flex items-center gap-2 border-b-2 pb-4 ${step.id === activeStep ? "border-gray-800" : "border-gray-400"}`}
            key={step.id}
          >
            <div
              className={`w-6 h-6 rounded-full text-white p-4 flex items-center justify-center ${step.id === activeStep ? "border-gray-800" : "border-gray-400"}`}
            >
              {step.id}
            </div>
            <p
              className={`text-sm font-medium ${step.id === activeStep ? "text-gray-800" : "text-gray-400"}`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
      {/* STEPS & DETAILS */}
      <div className="w-full flex flex-col lg:flex-row gap-16">
        {/* STEP */}
        <div className="w-full lg:w7/12 shadow-lg border border-gray-100 p-8 rounded-lg flex flex-col gap-8">
          {activeStep === 1 ? (
            cart.map((item) => (
              // SINGLE CART ITEM
              <div
                className="flex items-center justify-between"
                key={item.id + item.selectedSize + item.selectedColor}
              >
                {/* IMAGE AND DETAILS */}
                <div className="flex gap-8">
                  {/* IMAGE */}
                  <div className="relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={item.image[item.selectedColor]}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {/* ITEM DETAILS */}
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        Size: {item.selectedSize}
                      </p>
                      <p className="text-xs text-gray-500">
                        Color: {item.selectedColor}
                      </p>
                    </div>
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                {/* DELETE BUTTON */}
                <button
                  onClick={() => removeFromCart(item)}
                  className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-all duration-300 text-red-400 flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : activeStep === 2 ? (
            <ShippingForm setShippingForm={setShippingForm} />
          ) : activeStep === 3 && shippingForm ? (
            <PaymentForm setPaymentForm={setPaymentForm} />
          ) : (
            <p className="text-sm text-gray-500">
              Please fill in the shipping form to continue.
            </p>
          )}
        </div>
        {/* DETAILS */}
        <div className="w-full lg:w-5/12 shadow-lg border border-gray-100 p-8 rounded-lg flex flex-col gap-8 h-max">
          <h2 className="font-semibold">Cart Details</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Subtotal</p>
              <p className="font-medium">
                $
                {cart
                  .reduce((acc, item) => acc + item.price * item.quantity, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Discount(10%)</p>
              <p className="font-medium">$ 10</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Shipping Fee</p>
              <p className="font-medium">$10</p>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between">
              <p className="text-gray-800 font-semibold">Total</p>
              <p className="font-medium">
                $
                {cart
                  .reduce((acc, item) => acc + item.price * item.quantity, 0)
                  .toFixed(2)}
              </p>
            </div>
            {/* DETAILS */}
          </div>
          <div className="border border-gray-100 p-8 rounded-lg flex flex-col gap-8">
            <h2 className="font-semibold">Cart Details</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col justify-between text-sm">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="font-medium">
                  $
                  {cart
                    .reduce(
                      (acc: number, item: CartItemType) =>
                        acc + item.price * item.quantity,
                      0,
                    )
                    .toFixed()}
                </p>
              </div>
              <div className="flex flex-col justify-between text-sm">
                <p className="text-sm text-gray-500">Discount</p>
                <p className="font-medium">$ 10</p>
              </div>
              <div className="flex flex-col justify-between text-sm">
                <p className="text-sm text-gray-500">Shipping Fee</p>
                <p className="font-medium">$ 15</p>
              </div>
              <hr className="border-gray-200" />

              <div className="flex flex-col justify-between text-lg">
                <p className="text-sm text-gray-800">Total</p>
                <p className="font-semibold">
                  $
                  {cart
                    .reduce(
                      (acc: number, item: CartItemType) =>
                        acc + item.price * item.quantity,
                      0,
                    )
                    .toFixed()}
                </p>
              </div>
            </div>
            {activeStep === 1 && (
              <button
                className="w-full flex  justify-center items-center bg-gray-800 text-white p-2 rounded-lg cursor-pointer  gap-2 hover:bg-gray-900 transition-all duration-300"
                onClick={() =>
                  router.push(`/cart?step=${activeStep + 1}&scroll=false`)
                }
              >
                Continue <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
