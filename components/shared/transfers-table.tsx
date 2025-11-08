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
import { MoreHorizontal, Eye } from "lucide-react";
interface Transfer {
  id: string;
  amount: number;
  name: string;
  phone: string;
  service_mobile_code: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface TransfersTableProps {
  data: Transfer[];
  onView?: (id: string) => void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  INIT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETE: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export const TransfersTable = ({
  data,
  onView,
  isLoading = false,
}: TransfersTableProps) => {
  const columns = useMemo<ColumnDef<Transfer>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Recipient",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => <div>{row.original.phone}</div>,
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
        accessorKey: "service_mobile_code",
        header: "Service",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.service_mobile_code}
          </Badge>
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
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onView]
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / 10),
  });

  return <DataTable table={table} />;
};

