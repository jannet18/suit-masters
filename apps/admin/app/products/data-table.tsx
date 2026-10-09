"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { DataTablePagination } from "../components/TablePagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Bulk action for selected rows; the button is hidden when omitted. */
  onDeleteSelected?: (
    ids: (string | number)[],
  ) => Promise<{ success: boolean; error?: string }>;
  deleteLabel?: string;
}

export function DataTable<TData extends { id: string | number }, TValue>({
  columns,
  data,
  onDeleteSelected,
  deleteLabel = "Delete selected",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  const deleteSelected = () =>
    startTransition(async () => {
      if (!onDeleteSelected) return;
      setError(null);
      const ids = table
        .getSelectedRowModel()
        .rows.map((row) => row.original.id);
      const result = await onDeleteSelected(ids);
      if (result.success) setRowSelection({});
      else setError(result.error ?? "Action failed");
    });

  return (
    <div className="rounded-md border">
      {onDeleteSelected && Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center justify-end gap-4">
          {error && (
            <span role="alert" className="text-sm text-red-500">
              {error}
            </span>
          )}
          <button
            onClick={deleteSelected}
            disabled={pending}
            className="flex items-center gap-2 bg-red-500 text-white px-2 py-1 text-sm rounded-md m-4 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {pending ? "Working…" : deleteLabel}
          </button>
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
