"use client";

import { useMemo } from "react";
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
interface Payment {
  id: string;
  reference?: string;
  amount: number;
  description: string;
  status: string;
  transaction_type: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface PaymentsTableProps {
  data: Payment[];
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
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
}: PaymentsTableProps) => {
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
            {row.original.description}
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
            {row.original.transaction_type || "PAYMENT"}
          </Badge>
        ),
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
                  onClick={() => onDelete(row.original.id)}
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
    [onView, onDelete]
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / 10),
  });

  return <DataTable table={table} />;
};

