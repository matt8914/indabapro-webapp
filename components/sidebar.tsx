"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, BookOpen, Users, BarChart2, Settings, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SidebarItem = {
  name: string;
  icon: React.ReactNode;
  href: string;
  current: boolean;
};

interface SidebarProps {
  currentPath: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navigation: SidebarItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/protected",
      current: currentPath === "/protected" || currentPath === "/protected/",
    },
    {
      name: "My Classes",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/protected/classes",
      current: currentPath.includes("/protected/classes"),
    },
    {
      name: "Students",
      icon: <Users className="h-5 w-5" />,
      href: "/protected/students",
      current: currentPath.includes("/protected/students"),
    },
    {
      name: "Assessments",
      icon: <BarChart2 className="h-5 w-5" />,
      href: "/protected/assessments",
      current: currentPath.includes("/protected/assessments"),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-6 flex justify-center">
        <Link href="/protected">
          <div className="flex items-center justify-center">
            <Image 
              src="/images/indabapro logo.png" 
              alt="IndabaPro Logo" 
              width={130}
              height={55}
              priority
            />
          </div>
        </Link>
      </div>
      <nav className="space-y-1 px-2 flex-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`
              flex items-center px-4 py-3 text-sm font-medium rounded-lg
              ${
                item.current
                  ? "bg-orange-50 text-[#f6822d]"
                  : "text-gray-600 hover:bg-gray-50"
              }
            `}
          >
            <div className={`${item.current ? "text-[#f6822d]" : "text-gray-400"} mr-3`}>
              {item.icon}
            </div>
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center cursor-pointer">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#f6822d] text-white">
                  DU
                </div>
              </div>
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-gray-700">Demo User</p>
                <p className="text-xs font-medium text-gray-500">Demo School</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center gap-2 text-red-500">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
        IndabaPro Teacher MVP
        <br />
        © 2025 IndabaPro
      </div>
    </div>
  );
} 