"use client";

import { useEffect } from "react";
import { useAuthStore, type UserRole } from "@/stores/auth.store";
import { useOrganisationsStore } from "@/stores/organisations.store";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { OrganizationOverlay } from "@/components/organization-overlay";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { PageLoader } from "@/components/ui/page-loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const {
    organisations,
    organisation,
    hasOrganisation,
    fetchMyOrganisations,
    isLoading: orgLoading,
  } = useOrganisationsStore();
  const role = user?.role as UserRole | undefined;

  // Fetch organizations for merchant users
  useEffect(() => {
    if (isAuthenticated && role === "MERCHANT") {
      // Only fetch if we don't have organizations and we're not already loading
      if (organisations.length === 0 && !orgLoading) {
        fetchMyOrganisations();
      }
    }
  }, [isAuthenticated, role, organisations.length, orgLoading, fetchMyOrganisations]);

  // Show loading state while fetching organization
  if (role === "MERCHANT" && orgLoading && !organisation) {
    return <PageLoader text="Loading dashboard..." />;
  }

  // Check if merchant user has organization
  // Only show overlay if: user is merchant, not loading, and definitely doesn't have organization
  const isMerchant = role === "MERCHANT";
  const showOverlay = isMerchant && !orgLoading && !hasOrganisation() && !organisation;

  // AuthProvider handles routing, so if we reach here, user is authenticated
  // and has access to the current route

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
      {showOverlay && <OrganizationOverlay />}
    </SidebarProvider>
  );
}

