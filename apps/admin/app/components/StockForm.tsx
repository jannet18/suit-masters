"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { updateStock } from "../../lib/catalog-actions";

/**
 * Set a product's stock level, or adjust it up/down (e.g. +10 received,
 * -1 damaged). Adjustments are applied atomically on the server, so they're
 * safe while orders are coming in; "set" overwrites whatever is there.
 */
export default function StockForm({
  productId,
  currentStock,
  onSaved,
}: {
  productId: number;
  currentStock: number | null;
  onSaved?: () => void;
}) {
  const madeToOrder = currentStock === null;
  const [mode, setMode] = useState<"adjust" | "set">(
    madeToOrder ? "set" : "adjust",
  );
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(value);
    if (!Number.isInteger(n) || value.trim() === "")
      return setError("Enter a whole number");
    if (mode === "set" && n < 0) return setError("Stock cannot be negative");
    if (mode === "adjust" && n === 0)
      return setError("Adjustment cannot be zero");

    setSaving(true);
    setError(null);
    const result = await updateStock(
      productId,
      mode === "set" ? { stock: n } : { delta: n },
    );
    setSaving(false);
    if (!result.success) return setError(result.error);
    onSaved?.();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {madeToOrder
          ? "This product is made to order and not stock-limited. Setting a stock level starts tracking it."
          : `Current stock: ${currentStock}`}
      </p>
      {!madeToOrder && (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "adjust" ? "default" : "outline"}
            onClick={() => setMode("adjust")}
          >
            Adjust by
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "set" ? "default" : "outline"}
            onClick={() => setMode("set")}
          >
            Set to
          </Button>
        </div>
      )}
      <Input
        inputMode="numeric"
        placeholder={mode === "adjust" ? "e.g. 10 or -2" : "e.g. 25"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={mode === "adjust" ? "Stock adjustment" : "Stock level"}
      />
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Update stock"}
      </Button>
    </form>
  );
}
