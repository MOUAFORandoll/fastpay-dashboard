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
import type { UserDto } from "@/types/api";

interface UsersTableProps {
  data: UserDto[];
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  MERCHANT: "bg-blue-100 text-blue-800",
  CLIENT: "bg-green-100 text-green-800",
};

const statusColors: Record<string, string> = {
  INIT: "bg-gray-100 text-gray-800",
  COMPLETE: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
};

export const UsersTable = ({
  data,
  onView,
  onDelete,
  isLoading = false,
}: UsersTableProps) => {
  const columns = useMemo<ColumnDef<UserDto>[]>(
    () => [
      {
        accessorKey: "fullname",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.fullname}</div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div>{row.original.email}</div>,
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
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={roleColors[row.original.role] || roleColors.CLIENT}
          >
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={statusColors[row.original.status] || statusColors.INIT}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => (
          <div className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "XOF",
            }).format(row.original.balance || 0)}
          </div>
        ),
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

