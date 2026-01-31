import Link from "next/link";
import React from "react";

export const collections = [
  {
    id: 1,
    title: "Wedding Suits",
    slug: "wedding-suits",
    description:
      "Make a statement on your special day with our elegant wedding collection.",
    image:
      "https://images.unsplash.com/photo-1594938291221-94f18cbb5660?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    products: [
      {
        id: "navy-tuxedo",
        name: "Navy Tuxedo",
        price: 450,
        image:
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "classic-black",
        name: "Classic Black Suit",
        price: 399,
        image:
          "https://images.unsplash.com/photo-1520975918318-3e1677c5c9a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: 2,
    title: "Business Suits",
    slug: "business-suits",
    description:
      "Command respect in the boardroom with our sharp, professional suits.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    products: [
      {
        id: "grey-check",
        name: "Grey Checkered Suit",
        price: 350,
        image:
          "https://images.unsplash.com/photo-1535043205849-513fe27dbb56?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: 3,
    title: "Tuxedos",
    slug: "tuxedos",
    description:
      "Timeless elegance for your most prestigious events and celebrations.",
    image:
      "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    products: [
      {
        id: "white-dinner",
        name: "White Dinner Jacket",
        price: 500,
        image:
          "https://images.unsplash.com/photo-1584447159075-ffcd2a45c28b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

const FeaturedCollections = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Featured Collections
          </h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections, each designed with precision and an
            unwavering commitment to quality.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="group overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-md"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-gray-900 to-transparent opacity-60"></div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-serif font-bold mb-2">
                  {collection.title}
                </h3>
                <p className="text-gray-600 mb-4">{collection.description}</p>
                <Link
                  href={`/collection/${collection.slug}`}
                  className="inline-block text-amber-600 font-medium hover:text-amber-800 transition-colors duration-300 relative group"
                >
                  View Collection
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeaturedCollections;
