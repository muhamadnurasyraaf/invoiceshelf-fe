"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const navItems = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/invoices", label: "Invoices" },
  { href: "/portal/estimates", label: "Estimates" },
  { href: "/portal/payments", label: "Payments" },
  { href: "/portal/settings", label: "Settings" },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, isCustomer, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (!isLoading && isAuthenticated && !isCustomer) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, isCustomer, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isCustomer) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/portal") {
      return pathname === "/portal";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Nav Items */}
            <div className="flex items-center">
              {/* Logo */}
              <Link href="/portal" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">
                  <span className="text-indigo-600">VX</span>
                  <span className="text-gray-900">INVOICE</span>
                </span>
              </Link>

              {/* Nav Items */}
              <div className="hidden sm:ml-10 sm:flex sm:space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                      isActive(item.href)
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.username || user?.email}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="sm:hidden border-t border-gray-200">
          <div className="flex overflow-x-auto px-4 py-2 space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition ${
                  isActive(item.href)
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
