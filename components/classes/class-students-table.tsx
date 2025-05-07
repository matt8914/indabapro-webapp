"use client";

import Link from "next/link";
import { MoreVertical, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  notes?: string;
  lastAssessment?: string;
  progress?: string;
}

export function ClassStudentsTable({ students, classId }: { students: Student[], classId: string }) {
  const handleRowClick = (studentId: string, e: React.MouseEvent) => {
    // Prevent navigation when clicking on the actions column
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-dropdown-trigger]')) {
      return;
    }
    window.location.href = `/protected/students/${studentId}?classId=${classId}`;
  };
  
  const handleEditClick = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/protected/students/${studentId}/edit?classId=${classId}`;
  };
  
  const handleDeleteClick = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle delete action
    if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      console.log(`Deleting student ${student.id}`);
      // Replace with actual delete logic
    }
  };

  // Add mock data for last assessment and progress if not provided
  const studentsWithData = students.map(student => ({
    ...student,
    lastAssessment: student.lastAssessment || `2024-08-${Math.floor(Math.random() * 20) + 1}`,
    progress: student.progress || ['Improving', 'Steady', 'Struggling'][Math.floor(Math.random() * 3)]
  }));
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-6 font-medium text-gray-600">Student ID</th>
              <th className="text-left py-3 px-6 font-medium text-gray-600">Name</th>
              <th className="text-left py-3 px-6 font-medium text-gray-600">Gender</th>
              <th className="text-left py-3 px-6 font-medium text-gray-600">Last Assessment</th>
              <th className="text-left py-3 px-6 font-medium text-gray-600">Progress</th>
              <th className="text-right py-3 px-6 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {studentsWithData.map((student) => (
              <tr 
                key={student.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={(e) => handleRowClick(student.id, e)}
                title={student.notes ? `Notes: ${student.notes}` : ""}
              >
                <td className="py-3 px-6">{student.id}</td>
                <td className="py-3 px-6 font-medium">
                  {student.firstName} {student.lastName}
                  {student.notes && (
                    <span className="ml-1 inline-block w-2 h-2 bg-blue-500 rounded-full" title={student.notes}></span>
                  )}
                </td>
                <td className="py-3 px-6">{student.gender}</td>
                <td className="py-3 px-6">{student.lastAssessment}</td>
                <td className="py-3 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.progress === 'Improving' ? 'bg-green-100 text-green-800' : 
                    student.progress === 'Steady' ? 'bg-blue-100 text-blue-800' : 
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {student.progress}
                  </span>
                </td>
                <td className="py-3 px-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="focus:outline-none" 
                        data-dropdown-trigger
                      >
                        <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => handleEditClick(student.id, e)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => handleDeleteClick(student, e)}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 