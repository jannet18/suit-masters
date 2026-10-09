"use client";

import { formatCurrency } from "@repo/pricing";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import type { CatalogProduct } from "../../lib/api-client";
import { ProductRowActions } from "./row-actions";

export type Product = CatalogProduct;

const sortableHeader =
  (label: string): ColumnDef<Product>["header"] =>
  ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => {
      const src = row.original.mainImage || row.original.productImage;
      return src ? (
        // Plain img: product images come from arbitrary hosts not configured
        // for next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={row.original.name}
          className="w-9 h-9 rounded-full object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-muted" />
      );
    },
  },
  {
    accessorKey: "name",
    header: sortableHeader("Name"),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.slug}</div>
      </div>
    ),
  },
  {
    accessorKey: "categoryName",
    header: "Category",
  },
  {
    accessorKey: "basePrice",
    header: sortableHeader("Price"),
    cell: ({ row }) => formatCurrency(row.original.basePrice),
  },
  {
    accessorKey: "stock",
    header: sortableHeader("Stock"),
    sortUndefined: "last",
    cell: ({ row }) => {
      const stock = row.original.stock;
      if (stock === null)
        return <span className="text-muted-foreground">Made to order</span>;
      if (stock === 0) return <Badge variant="destructive">Out of stock</Badge>;
      return stock;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant="secondary">Active</Badge>
      ) : (
        <Badge variant="outline">Inactive</Badge>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductRowActions product={row.original} />,
  },
];
