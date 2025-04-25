import Link from "next/link";
import React from "react";

interface ActionCardProps {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function ActionCard({ label, href, icon }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center rounded-lg p-4 border border-gray-200 bg-white hover:bg-gray-50 group"
    >
      <div className="flex items-center">
        <div className="text-gray-400 group-hover:text-[#f6822d] mr-3">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
    </Link>
  );
} 