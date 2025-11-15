"use client";

import { useEffect, Suspense, useState } from "react";
import { useTransfersStore } from "@/stores/transfers.store";
import { useAuthStore } from "@/stores/auth.store";
import { useMobileServicesStore } from "@/stores/mobile-services.store";
import { TransfersTable } from "@/components/shared/transfers-table";
import { TransferDetailsSheet } from "@/components/shared/transfer-details-sheet";
import { CreateTransferDialog } from "@/components/shared/create-transfer-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Plus, Building2, Smartphone, RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { CreateTransfertDto } from "@/types/api";

interface Transfer {
  id: string;
  amount: number;
  reference?: string;
  status?: string;
  createdAt?: string;
  beneficiary?: {
    id: string;
    name?: string | null;
    phone?: string;
    [key: string]: unknown;
  };
  service_mobile?: {
    id: string;
    name?: string;
    country?: string;
    code_prefix?: string;
    api_endpoint?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export default function TransfersPage() {
  const { transfers, isLoading, pagination, fetchTransfers, initializeTransfer } = useTransfersStore();
  const { isAuthenticated } = useAuthStore();
  const { services, fetchServices } = useMobileServicesStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransfers({ page: 1, size: 10 });
      fetchServices();
    }
  }, [isAuthenticated, fetchTransfers, fetchServices]);

  const handleCreateTransfer = async (data: CreateTransfertDto) => {
    setIsCreating(true);
    try {
      await initializeTransfer(data);
      await fetchTransfers({ page: 1, size: 10 });
      setIsCreateDialogOpen(false);
    } catch (error) {
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleRowClick = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setSheetOpen(true);
  };

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
          <Button size="lg" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create new transfer
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
              <TransfersTable
                data={Array.isArray(transfers) ? transfers : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                pagination={pagination}
                onPaginationChange={(page, size) => fetchTransfers({ page, size })}
              />
            </Suspense>
          )}
        </CardContent>
      </Card>

      {/* Create Transfer Dialog */}
      <CreateTransferDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        services={services}
        onCreateTransfer={handleCreateTransfer}
        isLoading={isCreating}
      />

      {/* Transfer Details Sheet */}
      <TransferDetailsSheet
        transfer={selectedTransfer}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

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

