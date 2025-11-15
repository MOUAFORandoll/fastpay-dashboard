"use client";

import { useMemo } from "react";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";

interface Beneficiary {
  id: string;
  name: string;
  phone: string;
  country_id: string;
  code_phone?: string;
  [key: string]: unknown;
}

interface BeneficiariesTableProps {
  data: Beneficiary[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    size: number;
    total: number;
  };
  onPaginationChange?: (page: number, size: number) => void;
}

export const BeneficiariesTable = ({
  data,
  isLoading = false,
  pagination,
  onPaginationChange,
}: BeneficiariesTableProps) => {
  const columns = useMemo<ColumnDef<Beneficiary>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div>
            {row.original.code_phone && `${row.original.code_phone} `}
            {row.original.phone}
          </div>
        ),
      },
      {
        accessorKey: "country_id",
        header: "Country ID",
        cell: ({ row }) => (
          <div className="font-mono text-sm">{row.original.country_id}</div>
        ),
      },
    ],
    []
  );

  const pageCount = pagination
    ? Math.ceil(pagination.total / pagination.size)
    : Math.ceil(data.length / 10);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      pagination: pagination
        ? {
            pageIndex: pagination.page - 1,
            pageSize: pagination.size,
          }
        : undefined,
    },
  });

  const prevPaginationRef = React.useRef({
    pageIndex: pagination ? pagination.page - 1 : 0,
    pageSize: pagination?.size || 10,
  });

  React.useEffect(() => {
    if (!onPaginationChange || !pagination) return;

    const currentPageIndex = table.getState().pagination.pageIndex;
    const currentPageSize = table.getState().pagination.pageSize;
    const prevPageIndex = prevPaginationRef.current.pageIndex;
    const prevPageSize = prevPaginationRef.current.pageSize;

    if (
      (currentPageIndex !== prevPageIndex || currentPageSize !== prevPageSize) &&
      (currentPageIndex + 1 !== pagination.page || currentPageSize !== pagination.size)
    ) {
      onPaginationChange(currentPageIndex + 1, currentPageSize);
      prevPaginationRef.current = {
        pageIndex: currentPageIndex,
        pageSize: currentPageSize,
      };
    }
  }, [
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    onPaginationChange,
    pagination,
  ]);

  return <DataTable table={table} />;
};

