"use client";

import { useEffect, Suspense, useState } from "react";
import { usePaymentsStore } from "@/stores/payments.store";
import { useAuthStore } from "@/stores/auth.store";
import { PaymentsTable } from "@/components/shared/payments-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { ArrowLeft, Link2, Plus } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { NewCreatePaymentDto } from "@/types/api";

interface PaymentFormData {
  amount: number;
  description: string;
}

export default function ManagePaymentLinksPage() {
  const { payments, isLoading, pagination, fetchPayments, deletePayment, createPayment } = usePaymentsStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string; reference?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const paymentForm = useForm<PaymentFormData>({
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments({ page: 1, size: 10 });
    }
  }, [isAuthenticated, fetchPayments]);

  const handleDeleteClick = (id: string, reference?: string) => {
    setPaymentToDelete({ id, reference });
    setDeleteConfirmText("");
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    
    const confirmValue = paymentToDelete.reference || paymentToDelete.id;
    if (deleteConfirmText !== confirmValue) {
      toast.error("Confirmation text does not match");
      return;
    }

    setIsDeleting(true);
    try {
      await deletePayment(paymentToDelete.id);
      toast.success("Payment link deleted successfully");
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
      setDeleteConfirmText("");
      await fetchPayments({ page: pagination.page, size: pagination.size });
    } catch (error) {
      // Error is already handled by the store
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreatePayment = async (data: PaymentFormData) => {
    setIsCreatingPayment(true);
    try {
      const payload: NewCreatePaymentDto = {
        amount: data.amount,
        description: data.description,
      };
      await createPayment(payload);
      toast.success("Payment link created successfully");
      setIsCreatePaymentOpen(false);
      paymentForm.reset();
      await fetchPayments({ page: pagination.page, size: pagination.size });
    } catch (error) {
      // Error is already handled by the store
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/merchant/payments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Manage Payment Links</h1>
          <p className="text-muted-foreground">
            View and manage all your payment links
          </p>
        </div>
      </div>

      {/* Payment Links Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                <CardTitle>All Payment Links</CardTitle>
              </div>
              <CardDescription>
                View and manage all payment links. You can create new links or delete payment links that are no longer needed.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog open={isCreatePaymentOpen} onOpenChange={setIsCreatePaymentOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Payment Link</DialogTitle>
                    <DialogDescription>
                      Create a new payment link that customers can use to make payments.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={paymentForm.handleSubmit(handleCreatePayment)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter amount"
                        {...paymentForm.register("amount", {
                          required: "Amount is required",
                          min: { value: 0.01, message: "Amount must be greater than 0" },
                          valueAsNumber: true,
                        })}
                      />
                      {paymentForm.formState.errors.amount && (
                        <p className="text-sm text-red-500">
                          {paymentForm.formState.errors.amount.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter payment description"
                        {...paymentForm.register("description", {
                          required: "Description is required",
                        })}
                      />
                      {paymentForm.formState.errors.description && (
                        <p className="text-sm text-red-500">
                          {paymentForm.formState.errors.description.message}
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreatePaymentOpen(false)}
                        disabled={isCreatingPayment}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreatingPayment}>
                        {isCreatingPayment ? "Creating..." : "Create Payment Link"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={7} rowCount={5} />
          ) : (
            <Suspense
              fallback={<DataTableSkeleton columnCount={7} rowCount={5} />}
            >
              <PaymentsTable
                data={Array.isArray(payments) ? payments : []}
                onDelete={handleDeleteClick}
                isLoading={isLoading}
                pagination={pagination}
                onPaginationChange={(page, size) => fetchPayments({ page, size })}
              />
            </Suspense>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Link</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the payment link.
              <br />
              <br />
              To confirm, please type{" "}
              <strong className="font-mono">
                {paymentToDelete?.reference || paymentToDelete?.id}
              </strong>{" "}
              below:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Input
              placeholder="Enter confirmation text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={isDeleting}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={
                isDeleting ||
                deleteConfirmText !== (paymentToDelete?.reference || paymentToDelete?.id)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

