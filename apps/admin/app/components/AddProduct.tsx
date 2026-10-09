"use client";

import type { ReactNode } from "react";
import FormSheet from "./FormSheet";
import ProductForm from "./ProductForm";

const AddProduct = ({ trigger }: { trigger: ReactNode }) => (
  <FormSheet trigger={trigger} title="Add Product">
    {(close) => <ProductForm onSaved={close} />}
  </FormSheet>
);

export default AddProduct;
