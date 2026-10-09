"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { slugify } from "../lib/slugify";
import {
  createCollection,
  getCatalogProducts,
  updateCollection,
} from "../../lib/catalog-actions";
import type { CatalogCollection, CatalogProduct } from "../../lib/api-client";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(128),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase words separated by hyphens",
    ),
  description: z.string().max(255),
  image: z.union([z.literal(""), z.url("Must be a valid URL")]),
  sortOrder: z.string().regex(/^\d+$/, "Whole number"),
  isActive: z.boolean(),
  productIds: z.array(z.number()),
});

type FormValues = z.infer<typeof formSchema>;

/** Create a collection, or edit `collection` when given. */
export default function CollectionForm({
  collection,
  onSaved,
}: {
  collection?: CatalogCollection;
  onSaved?: () => void;
}) {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(!!collection);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: collection?.name ?? "",
      slug: collection?.slug ?? "",
      description: collection?.description ?? "",
      image: collection?.image ?? "",
      sortOrder: String(collection?.sortOrder ?? 0),
      isActive: collection?.isActive ?? true,
      productIds: collection?.productIds ?? [],
    },
  });

  useEffect(() => {
    getCatalogProducts().then((result) =>
      setProducts(result.success ? result.products : []),
    );
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    const data = { ...values, sortOrder: Number(values.sortOrder) };
    const result = collection
      ? await updateCollection(collection.id, data)
      : await createCollection(data);
    if (!result.success) return setSubmitError(result.error);
    onSaved?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!slugEdited)
                      form.setValue("slug", slugify(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    setSlugEdited(true);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormDescription>Used in the collection URL.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort order</FormLabel>
              <FormControl>
                <Input inputMode="numeric" {...field} />
              </FormControl>
              <FormDescription>
                Lowest first. The first active collection is featured.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="productIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Products</FormLabel>
              {products === null ? (
                <p className="text-sm text-muted-foreground">
                  Loading products…
                </p>
              ) : (
                <ScrollArea className="h-48 rounded-md border p-2">
                  {products.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 py-1 text-sm"
                    >
                      <Checkbox
                        checked={field.value.includes(p.id)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...field.value, p.id]
                              : field.value.filter((id) => id !== p.id),
                          )
                        }
                      />
                      {p.name}
                      {!p.isActive && (
                        <span className="text-xs text-muted-foreground">
                          (inactive)
                        </span>
                      )}
                    </label>
                  ))}
                </ScrollArea>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
                Active (visible in the store)
              </label>
            </FormItem>
          )}
        />
        {submitError && (
          <p role="alert" className="text-sm text-red-500">
            {submitError}
          </p>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving…"
            : collection
              ? "Save changes"
              : "Create collection"}
        </Button>
      </form>
    </Form>
  );
}
