"use client";

import { useMemo } from "react";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface GroupedPayment {
  id: string;
  reference?: string;
  reason?: string;
  launch_url?: string;
  currency?: string;
  when_created?: string;
  createdAt?: string;
  organisation?: {
    id: string;
    libelle?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    apiKeys?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface GroupedPaymentsTableProps {
  data: GroupedPayment[];
  onView?: (id: string) => void;
  onDelete?: (id: string, reference?: string) => void;
  onRowClick?: (payment: GroupedPayment) => void;
  isLoading?: boolean;
  pagination?: {
    page: number;
    size: number;
    total: number;
  };
  onPaginationChange?: (page: number, size: number) => void;
}

export const GroupedPaymentsTable = ({
  data,
  onView,
  onDelete,
  onRowClick,
  isLoading = false,
  pagination,
  onPaginationChange,
}: GroupedPaymentsTableProps) => {
  const router = useRouter();

  const handleRowClickInternal = React.useCallback((payment: GroupedPayment) => {
    if (onRowClick) {
      onRowClick(payment);
    }
  }, [onRowClick]);

  const handleViewTransactions = React.useCallback((payment: GroupedPayment) => {
    router.push(`/merchant/payments/grouped/${payment.id}`);
  }, [router]);

  const columns = useMemo<ColumnDef<GroupedPayment>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <div className="font-medium font-mono text-sm">
            {row.original.id.slice(-8)}
          </div>
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.original.reason || "-"}
          </div>
        ),
      },
      {
        accessorKey: "organisation",
        header: "Organisation",
        cell: ({ row }) => (
          <div className="max-w-[150px] truncate">
            {row.original.organisation?.libelle || "-"}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const date = row.original.createdAt || row.original.when_created;
          if (!date) return "-";
          return new Date(date as string).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewTransactions(row.original);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Transactions
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row.original.id, row.original.reference || row.original.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onView, onDelete, handleRowClickInternal, handleViewTransactions]
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
      prevPaginationRef.current = { pageIndex: currentPageIndex, pageSize: currentPageSize };
    }
  }, [table.getState().pagination.pageIndex, table.getState().pagination.pageSize]);

  return <DataTable table={table} onRowClick={handleRowClickInternal} />;
};

