import { redirect } from "next/navigation";
import { api } from "@/lib/api/api-client";

export default async function ConfigurePage() {
  try {
    // Fetch available products
    const result = await api.getProducts();

    if (result.success && result.products && result.products.length > 0) {
      // Find the first product that has a slug
      const firstProduct = result.products[0];
      if (firstProduct.slug) {
        // Redirect to the first product's configure page
        redirect(`/products/${firstProduct.slug}/configure`);
      }
    }

    // If no products found or no slug, redirect to home page
    // Alternatively, we could show an error page
    redirect("/");
  } catch (error) {
    console.error("Error fetching products for configure page:", error);
    // Fallback to home page on error
    redirect("/");
  }

  // This return statement won't be reached due to redirect
  return null;
}
