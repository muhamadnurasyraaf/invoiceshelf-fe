"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { PortalHeader } from "@/components/portal/portal-header";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, isCustomer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isCustomer) {
        // If logged in as user, redirect to admin dashboard
        router.push("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, isCustomer, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isCustomer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader />
      <div className="flex">
        <PortalSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
