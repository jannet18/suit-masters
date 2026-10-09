"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import FormSheet from "../components/FormSheet";
import CategoryForm from "../components/CategoryForm";
import { deleteCategory } from "../../lib/catalog-actions";
import type { CatalogCategory } from "../../lib/api-client";

export function CategoryTable({
  categories,
}: {
  categories: CatalogCategory[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  const remove = (category: CatalogCategory) => {
    if (
      !confirm(`Delete "${category.name}"? Its sub-categories are deleted too.`)
    )
      return;
    startTransition(async () => {
      setError(null);
      const result = await deleteCategory(category.id);
      if (!result.success) setError(result.error);
    });
  };

  return (
    <div className="rounded-md border">
      {error && (
        <p role="alert" className="m-4 text-sm text-red-500">
          {error}
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead className="text-right">Products</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length ? (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {category.slug}
                </TableCell>
                <TableCell>
                  {category.parentId
                    ? (nameById.get(category.parentId) ?? "—")
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {category.productCount}
                </TableCell>
                <TableCell className="text-right">
                  <FormSheet
                    title={`Edit ${category.name}`}
                    trigger={
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    }
                  >
                    {(close) => (
                      <CategoryForm category={category} onSaved={close} />
                    )}
                  </FormSheet>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    disabled={pending || category.productCount > 0}
                    title={
                      category.productCount > 0
                        ? "Move or delete this category's products first"
                        : undefined
                    }
                    onClick={() => remove(category)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No categories.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
