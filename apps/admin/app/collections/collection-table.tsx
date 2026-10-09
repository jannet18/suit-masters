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
import { Badge } from "../components/ui/badge";
import FormSheet from "../components/FormSheet";
import CollectionForm from "../components/CollectionForm";
import { deleteCollection, updateCollection } from "../../lib/catalog-actions";
import type { CatalogCollection } from "../../lib/api-client";

export function CollectionTable({
  collections,
}: {
  collections: CatalogCollection[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<{ success: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.success) setError(result.error ?? "Action failed");
    });

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
            <TableHead className="w-16">Order</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.length ? (
            collections.map((col) => (
              <TableRow key={col.id}>
                <TableCell>{col.sortOrder}</TableCell>
                <TableCell className="font-medium">{col.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {col.slug}
                </TableCell>
                <TableCell className="text-right">
                  {col.productIds.length}
                </TableCell>
                <TableCell>
                  {col.isActive ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Hidden</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <FormSheet
                    title={`Edit ${col.name}`}
                    trigger={
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    }
                  >
                    {(close) => (
                      <CollectionForm collection={col} onSaved={close} />
                    )}
                  </FormSheet>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      run(() =>
                        updateCollection(col.id, { isActive: !col.isActive }),
                      )
                    }
                  >
                    {col.isActive ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    disabled={pending}
                    onClick={() => {
                      if (
                        confirm(`Delete "${col.name}"? Its products are kept.`)
                      ) {
                        run(() => deleteCollection(col.id));
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No collections.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
