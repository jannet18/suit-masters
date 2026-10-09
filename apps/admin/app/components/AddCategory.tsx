"use client";

import type { ReactNode } from "react";
import FormSheet from "./FormSheet";
import CategoryForm from "./CategoryForm";

const AddCategory = ({ trigger }: { trigger: ReactNode }) => (
  <FormSheet trigger={trigger} title="Add Category">
    {(close) => <CategoryForm onSaved={close} />}
  </FormSheet>
);

export default AddCategory;
