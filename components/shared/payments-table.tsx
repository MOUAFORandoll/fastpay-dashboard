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
import { MoreHorizontal, Eye, Trash2, Copy, Check } from "lucide-react";
interface Payment {
  id: string;
  reference?: string;
  amount: number;
  description?: string;
  status: string;
  transaction_type?: string;
  createdAt?: string;
  launch_url?: string;
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

interface PaymentsTableProps {
  data: Payment[];
  onView?: (id: string) => void;
  onDelete?: (id: string, reference?: string) => void;
  isLoading?: boolean;
  pagination?: {
    page: number;
    size: number;
    total: number;
  };
  onPaginationChange?: (page: number, size: number) => void;
}

const statusColors: Record<string, string> = {
  INIT: "bg-gray-100 text-gray-800",
  INEXECUTION: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETE: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  TIMEOUT: "bg-orange-100 text-orange-800",
};

export const PaymentsTable = ({
  data,
  onView,
  onDelete,
  isLoading = false,
  pagination,
  onPaginationChange,
}: PaymentsTableProps) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyLink = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.reference || row.original.id}</div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const amount = row.original.amount;
          return (
            <div className="font-medium">
              {typeof amount === "number"
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "XOF",
                  }).format(amount)
                : amount}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.original.description || row.original.organisation?.description || "-"}
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status || "INIT";
          return (
            <Badge
              variant="outline"
              className={statusColors[status] || statusColors.INIT}
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "transaction_type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.transaction_type || "PAYMENT_LINK"}
          </Badge>
        ),
      },
      {
        accessorKey: "launch_url",
        header: "Payment Link",
        cell: ({ row }) => {
          const launchUrl = row.original.launch_url;
          if (!launchUrl) return <div className="text-muted-foreground">-</div>;
          
          const isCopied = copiedId === row.original.id;
          
          return (
            <div className="flex items-center gap-2 max-w-[300px]">
              <div className="flex-1 truncate text-sm font-mono text-primary">
                {launchUrl}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => handleCopyLink(launchUrl, row.original.id)}
                title="Copy payment link"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
          const date = row.original.createdAt;
          if (!date) return "-";
          return new Date(date as string).toLocaleDateString();
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(row.original.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(row.original.id, row.original.reference)}
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
    [onView, onDelete, copiedId]
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

  // Handle pagination changes - use a ref to track previous values
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
    
    // Only trigger if pagination actually changed and doesn't match current pagination state
    if (
      (currentPageIndex !== prevPageIndex || currentPageSize !== prevPageSize) &&
      (currentPageIndex + 1 !== pagination.page || currentPageSize !== pagination.size)
    ) {
      onPaginationChange(currentPageIndex + 1, currentPageSize);
      prevPaginationRef.current = { pageIndex: currentPageIndex, pageSize: currentPageSize };
    }
  }, [table.getState().pagination.pageIndex, table.getState().pagination.pageSize]);

  return <DataTable table={table} />;
};

