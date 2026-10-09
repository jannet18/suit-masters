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
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { slugify } from "../lib/slugify";
import {
  createCategory,
  getCategories,
  updateCategory,
} from "../../lib/catalog-actions";
import type { CatalogCategory } from "../../lib/api-client";

const NO_PARENT = "none";

const formSchema = z.object({
  name: z.string().min(1, "Name is required!").max(128),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase words separated by hyphens",
    ),
  parentId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

/** Create a category, or edit `category` when given. */
export default function CategoryForm({
  category,
  onSaved,
}: {
  category?: CatalogCategory;
  onSaved?: () => void;
}) {
  const [parents, setParents] = useState<CatalogCategory[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(!!category);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      parentId: category?.parentId ? String(category.parentId) : NO_PARENT,
    },
  });

  useEffect(() => {
    getCategories().then((result) => {
      if (result.success) {
        setParents(result.categories.filter((c) => c.id !== category?.id));
      }
    });
  }, [category?.id]);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    const data = {
      name: values.name,
      slug: values.slug,
      parentId: values.parentId === NO_PARENT ? null : Number(values.parentId),
    };
    const result = category
      ? await updateCategory(category.id, data)
      : await createCategory(data);
    if (!result.success) return setSubmitError(result.error);
    if (!category) {
      form.reset({ name: "", slug: "", parentId: NO_PARENT });
      setSlugEdited(false);
    }
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
              <FormDescription>Used in category URLs.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_PARENT}>None (top level)</SelectItem>
                  {parents.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
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
            : category
              ? "Save changes"
              : "Create category"}
        </Button>
      </form>
    </Form>
  );
}
