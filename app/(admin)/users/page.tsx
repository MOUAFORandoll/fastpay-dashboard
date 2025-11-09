"use client";

import { useEffect, useState, Suspense } from "react";
import { usersController } from "@/controllers/users.controller";
import { useAuthStore } from "@/stores/auth.store";
import { UsersTable } from "@/components/shared/users-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { UserDto } from "@/types/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Note: This would need a proper endpoint to fetch all users
      // For now, this is a placeholder
      const currentUser = await usersController.getCurrentUser();
      setUsers([currentUser]);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await usersController.deleteUser(id);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={6} rowCount={5} />
          ) : (
            <Suspense
              fallback={<DataTableSkeleton columnCount={6} rowCount={5} />}
            >
              <UsersTable
                data={users}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

