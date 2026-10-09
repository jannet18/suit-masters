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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { slugify } from "../lib/slugify";
import { toMajorString, toMinorUnits } from "@repo/pricing";
import {
  createProduct,
  getProduct,
  getProductFormOptions,
  updateProduct,
} from "../../lib/catalog-actions";
import type { ProductFormOptions, ProductInput } from "../../lib/api-client";

const decimal = /^\d+(\.\d{1,2})?$/;
const wholeNumber = /^\d+$/;

// Inputs are kept as strings and converted on submit; product-service
// re-validates everything with the shared @repo/validation schemas.
const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(128),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase words separated by hyphens",
    ),
  categoryId: z.string().min(1, "Choose a category"),
  fabricId: z.string().min(1, "Choose a fabric"),
  productType: z.enum(["CUSTOM", "STANDARD"]),
  basePrice: z.string().regex(decimal, "Enter a price like 499 or 499.99"),
  description: z.string().max(5000),
  mainImage: z.union([z.literal(""), z.url("Must be a valid URL")]),
  isActive: z.boolean(),
  collectionIds: z.array(z.number()),
  initialStock: z.union([
    z.literal(""),
    z.string().regex(wholeNumber, "Whole number, or blank"),
  ]),
});

type FormValues = z.infer<typeof formSchema>;

const emptyValues: FormValues = {
  name: "",
  slug: "",
  categoryId: "",
  fabricId: "",
  productType: "CUSTOM",
  basePrice: "",
  description: "",
  mainImage: "",
  isActive: true,
  collectionIds: [],
  initialStock: "",
};

/**
 * Create or edit a product. Pass `productId` to edit; omit it to create.
 */
export default function ProductForm({
  productId,
  onSaved,
}: {
  productId?: number;
  onSaved?: () => void;
}) {
  const isEdit = productId !== undefined;
  const [options, setOptions] = useState<ProductFormOptions | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(isEdit);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [opts, existing] = await Promise.all([
        getProductFormOptions(),
        isEdit ? getProduct(productId) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      if (!opts.success) return setLoadError(opts.error);
      setOptions(opts);

      if (existing) {
        if (!existing.success) return setLoadError(existing.error);
        const p = existing.product;
        form.reset({
          ...emptyValues,
          name: p.name,
          slug: p.slug,
          categoryId: String(p.categoryId),
          fabricId: String(p.fabricId),
          productType: p.productType,
          basePrice: toMajorString(p.basePrice),
          description: p.description ?? "",
          mainImage: p.mainImage ?? "",
          isActive: p.isActive,
          collectionIds: p.collectionIds,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, productId, form]);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    const data: ProductInput = {
      name: values.name,
      slug: values.slug,
      categoryId: Number(values.categoryId),
      fabricId: Number(values.fabricId),
      productType: values.productType,
      // Typed in pounds ("499.99"), sent as integer pence (49999)
      basePrice: toMinorUnits(values.basePrice),
      description: values.description || undefined,
      mainImage: values.mainImage,
      isActive: values.isActive,
      collectionIds: values.collectionIds,
      ...(!isEdit && values.initialStock !== ""
        ? { initialStock: Number(values.initialStock) }
        : {}),
    };

    const result = isEdit
      ? await updateProduct(productId, data)
      : await createProduct(data);

    if (!result.success) return setSubmitError(result.error);
    if (!isEdit) {
      form.reset(emptyValues);
      setSlugEdited(false);
    }
    onSaved?.();
  };

  if (loadError) {
    return (
      <p className="text-sm text-red-500">
        Could not load the form: {loadError}
      </p>
    );
  }
  if (!options) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

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
              <FormDescription>Used in the product URL.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options.categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fabricId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fabric</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options.fabrics.map((fab) => (
                      <SelectItem key={fab.id} value={String(fab.id)}>
                        {fab.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CUSTOM">
                      Custom (configurable)
                    </SelectItem>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base price (£)</FormLabel>
                <FormControl>
                  <Input inputMode="decimal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {!isEdit && (
          <FormField
            control={form.control}
            name="initialStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial stock</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder="Made to order"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Leave blank for made-to-order products, which are never out of
                  stock.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mainImage"
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
        {options.collections.length > 0 && (
          <FormField
            control={form.control}
            name="collectionIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collections</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {options.collections.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={field.value.includes(col.id)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...field.value, col.id]
                              : field.value.filter((id) => id !== col.id),
                          )
                        }
                      />
                      {col.name}
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
            : isEdit
              ? "Save changes"
              : "Create product"}
        </Button>
      </form>
    </Form>
  );
}
