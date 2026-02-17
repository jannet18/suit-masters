// import { CartItem } from "./types";

// export function getCart(): CartItem[] {
//   const data = localStorage.getItem("cart");
//   return data ? JSON.parse(data) : [];
// }

// export function setCart(cart: CartItem[]) {
//   localStorage.setItem("cart", JSON.stringify(cart));
// }

// export function addToCart(item: CartItem) {
//   const cart = getCart();
//   const existingIndex = cart.findIndex((i) => i.productId === item.productId);
//   if (existingIndex >= 0) {
//     cart[existingIndex]?.quantity += item.quantity;
//   } else {
//     cart.push(item);
//   }
//   setCart(cart);
// }

// export function clearCart() {
//   localStorage.removeItem("cart");
// }
