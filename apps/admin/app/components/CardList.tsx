import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

const popularProducts = [
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
  },
];

const latestTransactions = [
  {
    id: 1,
    title: "Order Payments",
    badge: "John Doe",
    image: "",
    count: 1400,
  },
  {
    id: 2,
    title: "Order Payments",
    badge: "Jane Smith",
    image: "",
    count: 2100,
  },
  {
    id: 3,
    title: "Order Payments",
    badge: "Michael Johnson",
    image: "",
    count: 1300,
  },
  {
    id: 4,
    title: "Order Payments",
    badge: "Lily Adams",
    image: "",
    count: 2500,
  },
  {
    id: 5,
    title: "Order Payments",
    badge: "Sam Brown",
    image: "",
    count: 1400,
  },
];

const CardList = ({ title }: { title: string }) => {
  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">{title}</h1>
      <div className="flex flex-col gap-2">
        {title === "popularProducts"
          ? popularProducts.map((item) => (
              <Card
                key={item.id}
                className="flex-row items-center justify-between gap-4 p-4"
              >
                <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                  <img
                    src={Object.values(item.image)[0] || ""}
                    alt={item.name}
                    // fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="flex-1 p-0">
                  <CardTitle className="text-sm font-medium">
                    {item.name}
                  </CardTitle>
                </CardContent>
                <CardFooter className="p-0">${item.price}K</CardFooter>
              </Card>
            ))
          : latestTransactions.map((item) => (
              <Card
                key={item.id}
                className="flex-row items-center justify-between gap-4 p-4"
              >
                <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="flex-1 p-0">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  <Badge variant="secondary">{item.badge}</Badge>
                </CardContent>
                <CardFooter className="p-0">${item.count}</CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default CardList;
