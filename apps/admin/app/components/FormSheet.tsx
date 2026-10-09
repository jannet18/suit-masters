"use client";

import { useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";

/**
 * A side sheet opened by `trigger`, whose form closes it via `close()` once it
 * has saved.
 */
export default function FormSheet({
  trigger,
  title,
  description,
  children,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-screen">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          {/* Only mounted while open, so forms load fresh data each time */}
          <div className="px-4 pb-24">
            {open && children(() => setOpen(false))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
