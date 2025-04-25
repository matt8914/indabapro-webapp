import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

interface ClassCardProps {
  className: string;
  gradeLevel: string;
  year: string;
  studentCount: number;
  id: string;
}

export function ClassCard({
  className,
  gradeLevel,
  year,
  studentCount,
  id,
}: ClassCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-medium text-gray-900">{className}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Grade {gradeLevel} • {year}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {studentCount} Students
          </div>
          <Button asChild variant="outline" className="text-sm">
            <Link href={`/protected/classes/${id}`}>
              View Class
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 