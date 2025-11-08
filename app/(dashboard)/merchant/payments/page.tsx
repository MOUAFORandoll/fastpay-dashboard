"use client";

import { useEffect, Suspense } from "react";
import { usePaymentsStore } from "@/stores/payments.store";
import { PaymentsTable } from "@/components/shared/payments-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Zap, RefreshCw, CreditCard, Clock } from "lucide-react";
import Link from "next/link";

export default function PaymentsPage() {
  const { payments, isLoading, fetchPayments, deletePayment } = usePaymentsStore();

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      await deletePayment(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-green-50 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-100">
          <Zap className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Start receiving payments</h1>
        <p className="max-w-2xl text-muted-foreground">
          Create your first payment link and start accepting payments from your
          customers in just a few minutes.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/merchant/payments/create">
              <Plus className="mr-2 h-4 w-4" />
              Create payment link
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            Learn more
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-green-100">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle>Instant payment</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Receive payments immediately</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-blue-100">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle>Real-time tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Monitor all your transactions</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-purple-100">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle>Multiple methods</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Mobile Money, Cards, Bank Transfers, Digital wallet
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-orange-100">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle>Detailed history</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Access all your data</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>View and manage your payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading payments...</div>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading table...</div>
                </div>
              }
            >
              <PaymentsTable
                data={Array.isArray(payments) ? payments : []}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            </Suspense>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="flex flex-col gap-4 rounded-lg border p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Need help getting started?</h3>
          <p className="text-muted-foreground">
            Consult our guides and documentation to get started quickly.
          </p>
          <Link href="/support" className="mt-2 text-green-600 hover:underline">
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
    </div>
  );
}

