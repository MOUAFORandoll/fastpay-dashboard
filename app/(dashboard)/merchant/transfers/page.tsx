"use client";

import { useEffect, Suspense } from "react";
import { useTransfersStore } from "@/stores/transfers.store";
import { useAuthStore } from "@/stores/auth.store";
import { TransfersTable } from "@/components/shared/transfers-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Plus, Building2, Smartphone, RefreshCw, Shield } from "lucide-react";
import Link from "next/link";

export default function TransfersPage() {
  const { transfers, isLoading, fetchTransfers } = useTransfersStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransfers();
    }
  }, [isAuthenticated, fetchTransfers]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-primary/10 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/20">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/30">
            <span className="text-2xl font-bold text-primary">$</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold">Start making withdrawals</h1>
        <p className="max-w-2xl text-muted-foreground">
          Transfer your income to your bank or mobile money account. Automate
          your withdrawals via our API.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/merchant/transfers/create">
              <Plus className="mr-2 h-4 w-4" />
              Create new transfer
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
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-primary/20">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Bank transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>To all bank accounts</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-primary/20">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Mobile Money</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Retraits instantanés</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-primary/20">
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Automatic withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Schedule your transfers</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-orange-100">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle>Maximum safety</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Secure transactions</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transfers</CardTitle>
          <CardDescription>View and manage your transfer transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={6} rowCount={5} />
          ) : (
            <Suspense
              fallback={<DataTableSkeleton columnCount={6} rowCount={5} />}
            >
              <TransfersTable data={Array.isArray(transfers) ? transfers : []} isLoading={isLoading} />
            </Suspense>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="flex flex-col gap-4 rounded-lg border p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Need help with transfers?</h3>
          <p className="text-muted-foreground">
            Find out how to set up and optimize your withdrawals.
          </p>
          <Link href="/support" className="mt-2 text-primary hover:underline">
            Contact support →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Withdrawal guide</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                All about transfers
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">API documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Integrate automatic withdrawals
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Schedule transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Set up recurring withdrawals
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Common questions about transfers
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

