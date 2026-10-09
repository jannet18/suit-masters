"use client";

import type { ReactNode } from "react";
import FormSheet from "./FormSheet";
import CollectionForm from "./CollectionForm";

const AddCollection = ({ trigger }: { trigger: ReactNode }) => (
  <FormSheet trigger={trigger} title="Add Collection">
    {(close) => <CollectionForm onSaved={close} />}
  </FormSheet>
);

export default AddCollection;
