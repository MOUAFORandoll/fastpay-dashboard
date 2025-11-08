"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { RoleSwitcher } from "@/components/role-switcher";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If user is authenticated, redirect to their dashboard
    if (isAuthenticated && user) {
      const { getRoleRoute } = useAuthStore.getState();
      const route = getRoleRoute();
      router.push(route);
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-6">
      <RoleSwitcher />
    </div>
  );
}
