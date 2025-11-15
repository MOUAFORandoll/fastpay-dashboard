"use client";

import { useEffect, Suspense } from "react";
import { useBeneficiariesStore } from "@/stores/beneficiaries.store";
import { useAuthStore } from "@/stores/auth.store";
import { useOrganisationsStore } from "@/stores/organisations.store";
import { BeneficiariesTable } from "@/components/shared/beneficiaries-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { User } from "lucide-react";

export default function BeneficiariesPage() {
  const {
    beneficiaries,
    isLoading,
    pagination,
    fetchMyBeneficiaries,
    fetchBeneficiariesByOrganisation,
  } = useBeneficiariesStore();
  const { isAuthenticated } = useAuthStore();
  const { organisation } = useOrganisationsStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (organisation?.id) {
        fetchBeneficiariesByOrganisation(organisation.id, { page: 1, size: 10 });
      } else {
        fetchMyBeneficiaries({ page: 1, size: 10 });
      }
    }
  }, [isAuthenticated, organisation?.id, fetchMyBeneficiaries, fetchBeneficiariesByOrganisation]);

  const handlePaginationChange = (page: number, size: number) => {
    if (organisation?.id) {
      fetchBeneficiariesByOrganisation(organisation.id, { page, size });
    } else {
      fetchMyBeneficiaries({ page, size });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-primary/10 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/20">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/30">
            <User className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Beneficiaries</h1>
        <p className="max-w-2xl text-muted-foreground">
          View your saved beneficiaries for quick transfers and payments.
        </p>
      </div>

      {/* Beneficiaries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Beneficiaries</CardTitle>
          <CardDescription>
            View your saved beneficiaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={4} rowCount={5} />
          ) : (
            <Suspense
              fallback={<DataTableSkeleton columnCount={4} rowCount={5} />}
            >
              <BeneficiariesTable
                data={Array.isArray(beneficiaries) ? beneficiaries : []}
                isLoading={isLoading}
                pagination={pagination}
                onPaginationChange={handlePaginationChange}
              />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

