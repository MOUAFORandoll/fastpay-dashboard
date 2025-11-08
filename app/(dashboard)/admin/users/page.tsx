"use client";

import { useEffect, useState, Suspense } from "react";
import { usersController } from "@/controllers/users.controller";
import { UsersTable } from "@/components/shared/users-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { UserDto } from "@/types/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Note: This would need a proper endpoint to fetch all users
      // For now, this is a placeholder
      const currentUser = await usersController.getCurrentUser();
      setUsers([currentUser]);
    } catch (error) {
      // Error is already handled by API base (toast shown, logged to console)
      // Set users to empty array to show empty UI
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await usersController.deleteUser(id);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        // Error is already handled by API base (toast shown, logged to console)
        // No need to show duplicate toast or handle error state
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading users...</div>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading table...</div>
                </div>
              }
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

