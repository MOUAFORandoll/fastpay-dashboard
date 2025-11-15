"use client";

import { useEffect, Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGroupedPaymentsStore } from "@/stores/grouped-payments.store";
import { groupedPaymentsController } from "@/controllers/grouped-payments.controller";
import { PaymentsTable } from "@/components/shared/payments-table";
import { PaymentDetailsSheet } from "@/components/shared/payment-details-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { FilterDto, PaymentResponseDto } from "@/types/api";

export default function GroupedPaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const groupedPaymentId = params?.id as string;
  
  const [transactions, setTransactions] = useState<PaymentResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  const { selectedGroupedPayment, fetchGroupedPaymentByRef } = useGroupedPaymentsStore();
  
  const [selectedPayment, setSelectedPayment] = useState<{
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
      [key: string]: unknown;
    };
    [key: string]: unknown;
  } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchTransactions = async (page = 1, size = 10) => {
    if (!groupedPaymentId) return;
    
    setIsLoading(true);
    try {
      // Ensure dates are integers (Unix timestamps in milliseconds)
      const now = Math.floor(Date.now());
      const thirtyDaysAgo = Math.floor(now - (30 * 24 * 60 * 60 * 1000));
      
      const filters: FilterDto = {
        transaction_type: "PAYMENT",
        status: "INIT",
        dateFrom: thirtyDaysAgo,
        dateTo: now,
      };
      
      const response = await groupedPaymentsController.getGroupedPaymentTransactions(
        groupedPaymentId,
        filters,
        { page, size }
      );
      
      // Parse response similar to payments store
      let data: PaymentResponseDto[] = [];
      let total = 0;
      
      if (response && typeof response === "object") {
        const payments = (response as { payments?: { content?: PaymentResponseDto[]; page?: number; size?: number; total?: number } })?.payments;
        if (payments) {
          data = Array.isArray(payments.content) ? payments.content : [];
          total = payments.total || 0;
        } else if (Array.isArray(response)) {
          data = response;
          total = data.length;
        } else if ((response as { data?: PaymentResponseDto[] })?.data) {
          data = (response as { data?: PaymentResponseDto[] })?.data || [];
          total = data.length;
        }
      } else if (Array.isArray(response)) {
        data = response;
        total = data.length;
      }
      
      setTransactions(data);
      setPagination({ page, size, total });
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (groupedPaymentId) {
      fetchTransactions(1, 10);
    }
  }, [groupedPaymentId]);

  const handleRowClick = (payment: {
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
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }) => {
    setSelectedPayment(payment);
    setSheetOpen(true);
  };

  const handleCopyLink = async () => {
    const launchUrl = selectedGroupedPayment?.launch_url;
    if (!launchUrl) {
      toast.error("No payment link available");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(launchUrl);
      setCopied(true);
      toast.success("Payment link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const safePayments = Array.isArray(transactions) ? transactions : [];
  const launchUrl = selectedGroupedPayment?.launch_url;

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Group Payment Details</h1>
          <p className="text-muted-foreground">
            View all transactions for this group payment link
          </p>
        </div>
      </div>

      {/* Group Payment Info Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <CardTitle>
                {selectedGroupedPayment?.reason || "Group Payment"}
              </CardTitle>
              <CardDescription>
                Reference: {selectedGroupedPayment?.reference || groupedPaymentId}
              </CardDescription>
              {selectedGroupedPayment?.when_created && (
                <CardDescription>
                  Created: {new Date(selectedGroupedPayment.when_created).toLocaleDateString()}
                </CardDescription>
              )}
            </div>
            {launchUrl && (
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate text-sm font-mono text-primary max-w-[300px]">
                  {launchUrl}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                All payments made using this group payment link
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={9} rowCount={5} />
          ) : (
            <Suspense
              fallback={<DataTableSkeleton columnCount={9} rowCount={5} />}
            >
              {safePayments.length > 0 ? (
                <PaymentsTable
                  data={safePayments}
                  onRowClick={handleRowClick}
                  isLoading={isLoading}
                  pagination={pagination}
                  onPaginationChange={(page, size) => fetchTransactions(page, size)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">
                    No transactions found for this group payment link yet.
                  </p>
                </div>
              )}
            </Suspense>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Sheet */}
      <PaymentDetailsSheet
        payment={selectedPayment}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

