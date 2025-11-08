"use client";

import { useAuthStore, type UserRole } from "@/stores/auth.store";
import { useOrganisationsStore } from "@/stores/organisations.store";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Building2 } from "lucide-react";

export function SiteHeader() {
  const { user } = useAuthStore();
  const { getCurrentOrganisation } = useOrganisationsStore();
  const role = user?.role as UserRole | undefined;
  const isMerchant = role === "MERCHANT";
  const currentOrg = isMerchant ? getCurrentOrganisation() : null;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        {currentOrg && (
          <>
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium text-foreground">
                {currentOrg.libelle}
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
