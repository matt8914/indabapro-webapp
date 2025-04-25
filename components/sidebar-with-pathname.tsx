"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

export function SidebarWithPathname() {
  const pathname = usePathname();
  return <Sidebar currentPath={pathname} />;
} 