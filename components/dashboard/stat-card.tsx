import Link from "next/link";
import React from "react";

interface StatCardProps {
  title: string;
  description: string;
  actionLabel: string;
  actionLink: string;
  icon: React.ReactNode;
}

export function StatCard({
  title,
  description,
  actionLabel,
  actionLink,
  icon,
}: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
        <div className="mt-6">
          <Link
            href={actionLink}
            className="text-[#f6822d] hover:text-orange-600 text-sm font-medium"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
} 