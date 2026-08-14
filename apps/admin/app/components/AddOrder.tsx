"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Trash2, Plus } from "lucide-react";
import type { AdminUser, AdminProduct } from "@/lib/api-client";

const PRODUCT_SERVICE_URL =
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:4000";
const ORDER_SERVICE_URL =
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://localhost:4001";

type LineItem = { productId: string; quantity: number };

const emptyShipping = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
};

const AddOrder = () => {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ productId: "", quantity: 1 }]);
  const [shipping, setShipping] = useState(emptyShipping);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          fetch(`${PRODUCT_SERVICE_URL}/users`, { credentials: "include" }),
          fetch(`${PRODUCT_SERVICE_URL}/products`),
        ]);
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users || []);
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to load users/products for order form:", err);
      }
    };
    load();
  }, []);

  const updateItem = (index: number, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  const removeItem = (index: number) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const onUserSelect = (id: string) => {
    setUserId(id);
    const user = users.find((u) => u.id === id);
    if (user) {
      setShipping((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || prev.phone,
        addressLine1: user.address || prev.addressLine1,
      }));
    }
  };

  const total = items.reduce((sum, item) => {
    const p = products.find((pr) => String(pr.id) === item.productId);
    return sum + (p ? p.base_price * item.quantity : 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userId) {
      setError("Select a customer");
      return;
    }
    const validItems = items.filter((it) => it.productId);
    if (validItems.length === 0) {
      setError("Add at least one product");
      return;
    }
    if (!shipping.name || !shipping.email || !shipping.phone || !shipping.addressLine1 || !shipping.city || !shipping.region || !shipping.postalCode || !shipping.country) {
      setError("Fill in all required shipping fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${ORDER_SERVICE_URL}/orders/admin/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          shipping,
          items: validItems.map((it) => ({
            productId: Number(it.productId),
            quantity: it.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }
      setSuccess(`Order #${data.orderId} created`);
      setItems([{ productId: "", quantity: 1 }]);
      setUserId("");
      setShipping(emptyShipping);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle className="mb-4">Add Order</SheetTitle>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Select value={userId} onValueChange={onUserSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Items</label>
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    value={item.productId}
                    onValueChange={(v) => updateItem(i, { productId: v })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} — ${p.base_price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(i, { quantity: Math.max(1, Number(e.target.value) || 1) })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add item
              </Button>
              <p className="text-sm text-muted-foreground">Total: ${total.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Shipping</label>
              <Input
                placeholder="Full name"
                value={shipping.name}
                onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={shipping.email}
                onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={shipping.phone}
                onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
              />
              <Input
                placeholder="Address line 1"
                value={shipping.addressLine1}
                onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })}
              />
              <Input
                placeholder="Address line 2 (optional)"
                value={shipping.addressLine2}
                onChange={(e) => setShipping({ ...shipping, addressLine2: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="City"
                  value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                />
                <Input
                  placeholder="Region/State"
                  value={shipping.region}
                  onChange={(e) => setShipping({ ...shipping, region: e.target.value })}
                />
                <Input
                  placeholder="Postal code"
                  value={shipping.postalCode}
                  onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                />
                <Input
                  placeholder="Country"
                  value={shipping.country}
                  onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                />
              </div>
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

export default AddOrder;
