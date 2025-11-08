"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, type UserRole } from "@/stores/auth.store";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;

  useEffect(() => {
    // If no user, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Role-based route protection
    if (pathname?.startsWith("/admin")) {
      if (role !== "ADMIN") {
        router.push("/");
        return;
      }
    } else if (pathname?.startsWith("/merchant")) {
      if (role !== "MERCHANT") {
        router.push("/");
        return;
      }
    } else if (pathname?.startsWith("/dashboard")) {
      if (role !== "CLIENT") {
        router.push("/");
        return;
      }
    }
  }, [user, role, pathname, router]);
  
  // Check if user has access to current route
  const hasAccess = 
    (pathname?.startsWith("/admin") && role === "ADMIN") ||
    (pathname?.startsWith("/merchant") && role === "MERCHANT") ||
    (pathname?.startsWith("/dashboard") && role === "CLIENT");

  // Show nothing while checking or if no access (but allow home page)
  if (!hasAccess && pathname !== "/" && pathname) {
    return null;
  }

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
    </SidebarProvider>
  );
}

