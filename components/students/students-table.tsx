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
  name: string;
  class: string;
  school: string;
  gender: string;
  lastAssessment: string;
  progress: string;
}

export function StudentsTable({ students }: { students: Student[] }) {
  const handleRowClick = (studentId: string, e: React.MouseEvent) => {
    // Prevent navigation when clicking on the actions column
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-dropdown-trigger]')) {
      return;
    }
    window.location.href = `/protected/students/${studentId}`;
  };
  
  const handleEditClick = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/protected/students/${studentId}/edit`;
  };
  
  const handleDeleteClick = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle delete action
    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
      console.log(`Deleting student ${student.id}`);
      // Replace with actual delete logic
    }
  };
  
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left font-medium text-sm p-4">Student ID</th>
              <th className="text-left font-medium text-sm p-4">Name</th>
              <th className="text-left font-medium text-sm p-4">Class</th>
              <th className="text-left font-medium text-sm p-4">School</th>
              <th className="text-left font-medium text-sm p-4">Gender</th>
              <th className="text-left font-medium text-sm p-4">Last Assessment</th>
              <th className="text-left font-medium text-sm p-4">Progress</th>
              <th className="text-left font-medium text-sm p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr 
                key={student.id} 
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={(e) => handleRowClick(student.id, e)}
              >
                <td className="p-4">{student.id}</td>
                <td className="p-4 font-medium">{student.name}</td>
                <td className="p-4">{student.class}</td>
                <td className="p-4">{student.school}</td>
                <td className="p-4">{student.gender}</td>
                <td className="p-4">{student.lastAssessment}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.progress === 'Improving' ? 'bg-green-100 text-green-800' : 
                    student.progress === 'Steady' ? 'bg-blue-100 text-blue-800' : 
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {student.progress}
                  </span>
                </td>
                <td className="p-4">
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