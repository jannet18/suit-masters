"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { HeartIcon, ShoppingBagIcon } from "lucide-react";

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  tag?: string;
  colors?: string[];
  index?: number;
}
export function ProductCard({
  name,
  price,
  originalPrice,
  image,
  hoverImage,
  tag,
  colors = [],
  index = 0,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 30,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-60px",
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
      }}
      className="group"
    >
      <a href="#" className="block">
        {/* Image Container */}
        <div
          className="relative overflow-hidden bg-[#1a1a1a] aspect-3/4 mb-4"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Main Image */}
          <img
            src={image}
            alt={name}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${hovered && hoverImage ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
          />
          {/* Hover Image */}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${name} alternate view`}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
            />
          )}

          {/* Overlay on hover */}
          <div
            className={`absolute inset-0 bg-[#0f0f0f]/20 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
          />

          {/* Tags */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {tag && (
              <span className="bg-[#c9a96e] text-[#0f0f0f] text-[9px] tracking-[0.2em] uppercase font-bold px-2.5 py-1">
                {tag}
              </span>
            )}
            {discount && (
              <span className="bg-[#0f0f0f] text-[#f5f0eb] text-[9px] tracking-widest uppercase font-bold px-2.5 py-1">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.preventDefault();
              setWishlisted(!wishlisted);
            }}
            className={`absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-[#0f0f0f]/80 backdrop-blur-sm transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
          >
            <HeartIcon
              size={15}
              className={`transition-colors duration-200 ${wishlisted ? "fill-[#c9a96e] text-[#c9a96e]" : "text-[#f5f0eb]"}`}
            />
          </button>

          {/* Add to Cart */}
          <motion.button
            onClick={handleAddToCart}
            className={`absolute bottom-0 left-0 right-0 bg-[#0f0f0f]/90 backdrop-blur-sm text-[#f5f0eb] py-3.5 text-[10px] tracking-[0.25em] uppercase font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#c9a96e] hover:text-[#0f0f0f] ${hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
          >
            {addedToCart ? (
              <span className="text-[#c9a96e]">Added ✓</span>
            ) : (
              <>
                <ShoppingBagIcon size={13} />
                Add to Bag
              </>
            )}
          </motion.button>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Color swatches */}
          {colors.length > 0 && (
            <div className="flex gap-1.5">
              {colors.map((color) => (
                <div
                  key={color}
                  className="w-3 h-3 rounded-full border border-[#2e2e2e] hover:scale-125 transition-transform duration-150 cursor-pointer"
                  style={{
                    backgroundColor: color,
                  }}
                  title={color}
                />
              ))}
            </div>
          )}

          <h3 className="font-serif text-[#f5f0eb] text-base font-medium leading-snug group-hover:text-[#c9a96e] transition-colors duration-200">
            {name}
          </h3>

          <div className="flex items-center gap-3">
            <span className="text-[#f5f0eb] text-sm font-medium">
              ${price.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-[#9a9490] text-sm line-through">
                ${originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </a>
    </motion.article>
  );
}
