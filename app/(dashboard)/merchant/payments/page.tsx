"use client";

import { useEffect, Suspense, useState } from "react";
import { usePaymentsStore } from "@/stores/payments.store";
import { useMobileServicesStore } from "@/stores/mobile-services.store";
import { useAuthStore } from "@/stores/auth.store";
import { PaymentsTable } from "@/components/shared/payments-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Plus, Zap, RefreshCw, CreditCard, Clock, Link2, Settings, Phone, Receipt, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { NewCreateDirectPaymentDto } from "@/types/api";

interface DirectPaymentFormData {
  amount: number;
  description: string;
  phone: string;
  service_mobile_code?: string;
}

export default function PaymentsPage() {
  const { payments, isLoading, pagination, fetchPayments, deletePayment, createDirectPayment } = usePaymentsStore();
  const { services, fetchServices } = useMobileServicesStore();
  const { isAuthenticated } = useAuthStore();
  const [isDirectPaymentOpen, setIsDirectPaymentOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string; reference?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingDirectPayment, setIsCreatingDirectPayment] = useState(false);

  const directPaymentForm = useForm<DirectPaymentFormData>({
    defaultValues: {
      amount: 0,
      description: "",
      phone: "",
      service_mobile_code: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments({ page: 1, size: 10 });
      fetchServices();
    }
  }, [isAuthenticated, fetchPayments, fetchServices]);

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
      toast.success("Payment deleted successfully");
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

  const handleCreateDirectPayment = async (data: DirectPaymentFormData) => {
    setIsCreatingDirectPayment(true);
    try {
      const payload: NewCreateDirectPaymentDto = {
        amount: data.amount,
        description: data.description,
        phone: data.phone,
        service_mobile_code: data.service_mobile_code || undefined,
      };
      await createDirectPayment(payload);
      toast.success("Direct payment initialized successfully");
      setIsDirectPaymentOpen(false);
      directPaymentForm.reset();
      await fetchPayments({ page: pagination.page, size: pagination.size });
    } catch (error) {
      // Error is already handled by the store
    } finally {
      setIsCreatingDirectPayment(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const hasPayments = payments.length > 0;
  const totalPayments = pagination.total;
  const initiatedPayments = payments.filter((p) => p.status === "INIT").length;
  const failedPayments = payments.filter((p) => p.status === "FAILED").length;

  const statCards = [
    {
      title: "Total Payments",
      value: totalPayments,
      description: "All payment links created",
      icon: Receipt,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Payments Initiated",
      value: initiatedPayments,
      description: "Payment links ready",
      icon: CheckCircle2,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Payments Failed",
      value: failedPayments,
      description: "Failed payment attempts",
      icon: XCircle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/20",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      {/* Header Section - Only show when no payments */}
      {!hasPayments && (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-primary/10 p-8 text-center animate-slide-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/20">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Start receiving payments</h1>
        <p className="max-w-2xl text-muted-foreground">
          Create your first payment link and start accepting payments from your
          customers in just a few minutes.
        </p>
          <div className="flex flex-wrap gap-4 justify-center">
          <Dialog open={isDirectPaymentOpen} onOpenChange={setIsDirectPaymentOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Phone className="mr-2 h-4 w-4" />
                Direct Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Initialize Direct Payment</DialogTitle>
                <DialogDescription>
                  Initialize a direct payment to a specific phone number.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={directPaymentForm.handleSubmit(handleCreateDirectPayment)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="direct-amount">Amount *</Label>
                  <Input
                    id="direct-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    {...directPaymentForm.register("amount", {
                      required: "Amount is required",
                      min: { value: 0.01, message: "Amount must be greater than 0" },
                      valueAsNumber: true,
                    })}
                  />
                  {directPaymentForm.formState.errors.amount && (
                    <p className="text-sm text-destructive">
                      {directPaymentForm.formState.errors.amount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direct-phone">Phone Number *</Label>
                  <Input
                    id="direct-phone"
                    type="tel"
                    placeholder="Enter phone number"
                    {...directPaymentForm.register("phone", {
                      required: "Phone number is required",
                    })}
                  />
                  {directPaymentForm.formState.errors.phone && (
                    <p className="text-sm text-destructive">
                      {directPaymentForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-mobile-code">Mobile Service</Label>
                  <Select
                    value={directPaymentForm.watch("service_mobile_code") || ""}
                    onValueChange={(value) =>
                      directPaymentForm.setValue("service_mobile_code", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mobile service (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.code_prefix}>
                          {service.name} ({service.code_prefix})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direct-description">Description *</Label>
                  <Textarea
                    id="direct-description"
                    placeholder="Enter payment description"
                    {...directPaymentForm.register("description", {
                      required: "Description is required",
                    })}
                  />
                  {directPaymentForm.formState.errors.description && (
                    <p className="text-sm text-destructive">
                      {directPaymentForm.formState.errors.description.message}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDirectPaymentOpen(false)}
                    disabled={isCreatingDirectPayment}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingDirectPayment}>
                    {isCreatingDirectPayment ? "Initializing..." : "Initialize Payment"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button size="lg" asChild>
            <Link href="/merchant/payments/manage-payment-links">
              <Settings className="mr-2 h-4 w-4" />
              Manage Payment Links
            </Link>
          </Button>
          </div>
        </div>
      )}

      {/* Page Title - Show when payments exist */}
      {hasPayments && (
        <div className="flex flex-col gap-2 animate-slide-up">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your payment transactions
          </p>
        </div>
      )}

      {/* Stat Cards - Show when payments exist */}
      {hasPayments && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="animate-slide-up"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: "both",
                }}
              >
          <CardHeader>
                  <div
                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded ${card.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
                  <CardDescription>{card.title}</CardDescription>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <CardTitle className="text-2xl font-semibold tabular-nums">
                      {formatNumber(card.value)}
                    </CardTitle>
                  )}
          </CardHeader>
          <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
          </CardContent>
        </Card>
            );
          })}
            </div>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{hasPayments ? "Transactions" : "Recent Transactions"}</CardTitle>
              <CardDescription>
                {hasPayments
                  ? "View and manage your payment transactions"
                  : "View and manage your payment transactions"}
              </CardDescription>
            </div>
            {/* Action Buttons - Moved to table header */}
            {hasPayments && (
              <div className="flex flex-wrap gap-2">
                <Dialog open={isDirectPaymentOpen} onOpenChange={setIsDirectPaymentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Phone className="mr-2 h-4 w-4" />
                      Direct Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Initialize Direct Payment</DialogTitle>
                      <DialogDescription>
                        Initialize a direct payment to a specific phone number.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={directPaymentForm.handleSubmit(handleCreateDirectPayment)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="direct-amount">Amount *</Label>
                        <Input
                          id="direct-amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter amount"
                          {...directPaymentForm.register("amount", {
                            required: "Amount is required",
                            min: { value: 0.01, message: "Amount must be greater than 0" },
                            valueAsNumber: true,
                          })}
                        />
                        {directPaymentForm.formState.errors.amount && (
                          <p className="text-sm text-destructive">
                            {directPaymentForm.formState.errors.amount.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="direct-phone">Phone Number *</Label>
                        <Input
                          id="direct-phone"
                          type="tel"
                          placeholder="Enter phone number"
                          {...directPaymentForm.register("phone", {
                            required: "Phone number is required",
                          })}
                        />
                        {directPaymentForm.formState.errors.phone && (
                          <p className="text-sm text-destructive">
                            {directPaymentForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-mobile-code">Mobile Service</Label>
                        <Select
                          value={directPaymentForm.watch("service_mobile_code") || ""}
                          onValueChange={(value) =>
                            directPaymentForm.setValue("service_mobile_code", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mobile service (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.code_prefix}>
                                {service.name} ({service.code_prefix})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="direct-description">Description *</Label>
                        <Textarea
                          id="direct-description"
                          placeholder="Enter payment description"
                          {...directPaymentForm.register("description", {
                            required: "Description is required",
                          })}
                        />
                        {directPaymentForm.formState.errors.description && (
                          <p className="text-sm text-destructive">
                            {directPaymentForm.formState.errors.description.message}
                          </p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDirectPaymentOpen(false)}
                          disabled={isCreatingDirectPayment}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isCreatingDirectPayment}>
                          {isCreatingDirectPayment ? "Initializing..." : "Initialize Payment"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button size="sm" asChild>
                  <Link href="/merchant/payments/manage-payment-links">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Links
                  </Link>
                </Button>
              </div>
            )}
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
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the payment.
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
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Help Section - Only show when no payments */}
      {!hasPayments && (
      <div className="flex flex-col gap-4 rounded-lg border p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Need help getting started?</h3>
          <p className="text-muted-foreground">
            Consult our guides and documentation to get started quickly.
          </p>
          <Link href="/support" className="mt-2 text-primary hover:underline">
            Contact support →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Getting started guide</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Learn the basics step by step
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">API documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Explore our integration guides
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Video tutorials</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Watch step-by-step guides
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Find answers to common questions
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}

