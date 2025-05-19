import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface ClassCardProps {
  className: string;
  gradeLevel: string;
  year: string;
  studentCount: number;
  id: string;
  teacher?: string;
  isTherapistClass?: boolean;
  onDeleteRequest: (classInfo: {id: string, studentCount: number, className: string}) => void;
}

export function ClassCard({
  className,
  gradeLevel,
  year,
  studentCount,
  id,
  teacher = "Ms. Johnson",
  isTherapistClass = false,
  onDeleteRequest,
}: ClassCardProps) {
  const router = useRouter();

  const handleEditClick = () => {
    router.push(`/protected/classes/${id}/edit`);
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6 relative">
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDeleteRequest({ id, studentCount, className })} 
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="space-y-4 mt-8">
        <div>
          <h3 className="text-xl font-medium text-gray-900">{className}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Grade {gradeLevel} • {year}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {isTherapistClass ? "Therapist:" : "Teacher:"} {teacher}
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