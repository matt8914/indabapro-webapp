"use client";

import { SidebarWithPathname } from "@/components/sidebar-with-pathname";
import { usePathname } from "next/navigation";

export function ProtectedLayoutWithConditionalSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isResetPasswordPage = pathname === "/protected/reset-password" || 
                              pathname.startsWith("/protected/reset-password");
  const isAdminPage = pathname.startsWith("/protected/admin");

  // Hide sidebar for reset password pages and admin pages
  const shouldHideSidebar = isResetPasswordPage || isAdminPage;

  return (
    <div className="flex h-screen bg-gray-50">
      {!shouldHideSidebar && (
        <div className="hidden md:flex md:w-64 md:flex-col">
          <SidebarWithPathname />
        </div>
      )}
      <div className={`flex flex-col flex-1 overflow-hidden ${shouldHideSidebar && !isAdminPage ? 'items-center justify-center' : ''}`}>
        <main className={`flex-1 relative overflow-y-auto focus:outline-none ${shouldHideSidebar && !isAdminPage ? 'flex items-center justify-center p-6' : shouldHideSidebar ? '' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
} 