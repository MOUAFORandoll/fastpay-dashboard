"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, type UserRole, getRoleRoute } from "@/stores/auth.store";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider handles authentication state and role-based routing
 * It ensures users are redirected to the correct dashboard based on their role
 * and prevents unauthorized access to protected routes
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const role = user?.role as UserRole | undefined;
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/register"];
    const isPublicRoute = publicRoutes.includes(pathname || "");

    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated || !user) {
      if (!isPublicRoute) {
        hasRedirected.current = true;
        router.push("/login");
      }
      return;
    }

    // If user is authenticated and on a public route, redirect to their dashboard
    if (isAuthenticated && user && isPublicRoute) {
      hasRedirected.current = true;
      const route = getRoleRoute(role || "CLIENT");
      router.push(route);
      return;
    }

    // Role-based route protection
    if (pathname?.startsWith("/admin")) {
      if (role !== "ADMIN") {
        hasRedirected.current = true;
        const route = getRoleRoute(role || "CLIENT");
        router.push(route);
        return;
      }
    } else if (pathname?.startsWith("/merchant")) {
      if (role !== "MERCHANT") {
        hasRedirected.current = true;
        const route = getRoleRoute(role || "CLIENT");
        router.push(route);
        return;
      }
    } else if (pathname?.startsWith("/dashboard")) {
      if (role !== "CLIENT") {
        hasRedirected.current = true;
        const route = getRoleRoute(role || "CLIENT");
        router.push(route);
        return;
      }
    }
  }, [isAuthenticated, pathname, role, router, user]);

  return <>{children}</>;
};

