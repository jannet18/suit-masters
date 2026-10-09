"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import FormSheet from "../components/FormSheet";
import ProductForm from "../components/ProductForm";
import StockForm from "../components/StockForm";
import { deleteProducts, updateProduct } from "../../lib/catalog-actions";
import type { CatalogProduct } from "../../lib/api-client";

export function ProductRowActions({ product }: { product: CatalogProduct }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<{ success: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.success) setError(result.error ?? "Action failed");
    });

  return (
    <div className="flex items-center justify-end gap-1">
      <FormSheet
        title={`Edit ${product.name}`}
        trigger={
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        }
      >
        {(close) => <ProductForm productId={product.id} onSaved={close} />}
      </FormSheet>
      <FormSheet
        title={`Stock: ${product.name}`}
        trigger={
          <Button variant="ghost" size="sm">
            Stock
          </Button>
        }
      >
        {(close) => (
          <StockForm
            productId={product.id}
            currentStock={product.stock}
            onSaved={close}
          />
        )}
      </FormSheet>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={pending}>
            <span className="sr-only">More actions</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(String(product.id))}
          >
            Copy product ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {product.isActive ? (
            <DropdownMenuItem
              onClick={() => run(() => deleteProducts([product.id]))}
            >
              Deactivate (hide from store)
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                run(() => updateProduct(product.id, { isActive: true }))
              }
            >
              Reactivate
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => {
              if (
                confirm(
                  `Permanently delete "${product.name}"? Its SKUs, stock and cart entries are removed. Past orders keep their snapshots.`,
                )
              ) {
                run(() => deleteProducts([product.id], { hard: true }));
              }
            }}
          >
            Delete permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <span role="alert" className="text-xs text-red-500 max-w-40">
          {error}
        </span>
      )}
    </div>
  );
}
