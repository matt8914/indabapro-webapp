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

  return (
    <div className="flex h-screen bg-gray-50">
      {!isResetPasswordPage && (
        <div className="hidden md:flex md:w-64 md:flex-col">
          <SidebarWithPathname />
        </div>
      )}
      <div className={`flex flex-col flex-1 overflow-hidden ${isResetPasswordPage ? 'items-center justify-center' : ''}`}>
        <main className={`flex-1 relative overflow-y-auto focus:outline-none p-6 ${isResetPasswordPage ? 'flex items-center justify-center' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
} 