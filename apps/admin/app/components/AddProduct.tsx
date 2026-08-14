"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Textarea } from "@/app/components/ui/textarea";

const PRODUCT_SERVICE_URL =
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:4000";

type Category = { id: number; name: string; slug: string };
type Fabric = { id: number; name: string; sku: string };

const AddProduct = () => {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [fabricId, setFabricId] = useState("");
  const [productType, setProductType] = useState<"STANDARD" | "CUSTOM">("CUSTOM");
  const [basePrice, setBasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [categoriesRes, fabricsRes] = await Promise.all([
          fetch(`${PRODUCT_SERVICE_URL}/categories`),
          fetch(`${PRODUCT_SERVICE_URL}/products/fabrics`),
        ]);
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }
        if (fabricsRes.ok) {
          const data = await fabricsRes.json();
          setFabrics(data.fabrics || []);
        }
      } catch (err) {
        console.error("Failed to load categories/fabrics for product form:", err);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const price = Number(basePrice);
    if (!name || !categoryId || !fabricId || !basePrice || Number.isNaN(price) || price <= 0) {
      setError("Name, category, fabric, and a valid base price are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${PRODUCT_SERVICE_URL}/products`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId: Number(categoryId),
          fabricId: Number(fabricId),
          productType,
          basePrice: price,
          description: description || undefined,
          mainImage: mainImage || undefined,
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }
      setSuccess(`"${data.product.name}" created`);
      setName("");
      setCategoryId("");
      setFabricId("");
      setBasePrice("");
      setDescription("");
      setMainImage("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle className="mb-4">Add Product</SheetTitle>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fabric</label>
              <Select value={fabricId} onValueChange={setFabricId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a fabric" />
                </SelectTrigger>
                <SelectContent>
                  {fabrics.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name} ({f.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product type</label>
              <Select value={productType} onValueChange={(v) => setProductType(v as "STANDARD" | "CUSTOM")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Base price</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Main image URL</label>
              <Input value={mainImage} onChange={(e) => setMainImage(e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
              />
              <label htmlFor="isActive" className="text-sm">
                Active (visible in storefront)
              </label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Submit"}
            </Button>
          </form>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;
