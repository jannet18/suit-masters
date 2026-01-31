"use client";

const Cart = () => {
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

  const cartItems = [
    {
      id: 1,
      name: "Maroon 5 piece Men Wedding Suit",
      image: {
        default:
          "https://5.imimg.com/data5/XV/JQ/MY-65715759/nehru-jacket-modi-jacket-500x500.jpg",
      },
      sizes: ["S", "M", "L", "XL"],
      colors: ["Red", "Blue", "Green"],
      price: 2415,
      originalPrice: 2465,
      discount: 2,
      sku: "SKU-O3WBHT",
      rating: 0,
      delivery: "2-4 weeks",
      category: "Wedding Suits",
      Quantity: 1,
      selectedSize: "XL",
      selectedColor: "Blue",
    },
    {
      id: 2,
      name: "Light Brown 3 piece Wedding Suit",
      image: {
        default:
          "https://i.etsystatic.com/40108629/r/il/6e9fa5/5442139537/il_1080xN.5442139537_k204.jpg",
      },
      sizes: ["S", "M", "L", "XL"],
      colors: ["Brown", "Beige", "Black"],
      price: 697,
      originalPrice: 884,
      discount: 21,
      sku: "SKU-JJWIELXW",
      rating: 0,
      delivery: "1-2 weeks",
      category: "Wedding Suits",
      Quantity: 1,
      selectedSize: "2XL",
      selectedColor: "Black",
    },
    {
      id: 3,
      name: "Beige 3 piece Men Wedding Suit",
      image: {
        default: "https://m.media-amazon.com/images/I/61jdMns0BPL._UY1000_.jpg",
      },
      sizes: ["S", "M", "L", "XL"],
      colors: ["Beige", "White", "Gray"],
      price: 3800,
      originalPrice: 3800,
      discount: 0,
      sku: "SKU-SJWBKXW",
      rating: 0,
      delivery: "0-24 hours",
      category: "Wedding Suits",
      Quantity: 1,
      selectedSize: "M",
      selectedColor: "Gray",
    },
    {
      id: 4,
      name: "Tuxedo Suit",
      image: {
        default:
          "https://www.brides.com/thmb/N-dw0wQ8caEbmEqp88N-mkxBao0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Wedding-Tuxedos-Kelley-Williams-Photography-Main-04d3f4e087f443de9b08b93dc9a01900.jpg",
      },
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Navy", "Gray"],
      price: 599,
      originalPrice: 999,
      discount: 40,
      sku: "SKU-UMZWREKB",
      rating: 0,
      delivery: "2-4 weeks",
      category: "Tuxedos",
      Quantity: 1,
      selectedSize: "XL",
      selectedColor: "Navy",
    },
  ];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-semibold mb-6">Your Shopping Cart</h1>
      <p className="text-gray-600">Your cart is currently empty.</p>
    </div>
  );
};

export default Cart;
