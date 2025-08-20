"use client";

import Link from "next/link";
import { MoreVertical, Edit, Trash, TrendingUp, TrendingDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteStudent, archiveStudent } from "@/app/actions";
import { useState, useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onArchive: (studentId: string) => Promise<void>;
  onDelete: (studentId: string) => Promise<void>;
}

// Placeholder for the actual ConfirmationModal component
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, student, onClose, onArchive, onDelete }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Confirm Action</h2>
        <p className="mb-6">
          Are you sure you want to proceed with an action for {student.name}? Archiving will remove the student from active lists but keep their data. Deleting will permanently remove all data for this student.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await onArchive(student.id);
              onClose();
            }}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
          >
            Archive Learner
          </button>
          <button
            onClick={async () => {
              await onDelete(student.id);
              onClose();
            }}
            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

interface AcademicAge {
  academicAge: string | null;
  difference: string | null;
  isDeficit: boolean;
}

interface Student {
  id: string;
  name: string;
  class: string;
  gender: string;
  chronologicalAge: string;
  mathsAge: AcademicAge;
  spellingAge: AcademicAge;
  readingAge: AcademicAge;
}

export function StudentsTable({ students: initialStudents, showClassColumn = true }: { students: Student[], showClassColumn?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<Student | null>(null);
  const [currentStudents, setCurrentStudents] = useState<Student[]>(initialStudents);

  // Temporarily remove useEffect to isolate optimistic update behavior
  // useEffect(() => {
  //   // Keep currentStudents in sync with initialStudents when initialStudents prop changes
  //   setCurrentStudents(initialStudents);
  // }, [initialStudents]);

  // When the component mounts, or initialStudents changes, initialize currentStudents
  useEffect(() => {
    setCurrentStudents(initialStudents);
  }, [initialStudents]);

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
    setSelectedStudentForAction(student);
    setShowConfirmationModal(true);
  };

  const handleArchiveStudent = async (studentId: string) => {
    if (isArchiving) return;
    setIsArchiving(true);
    try {
      const result = await archiveStudent(studentId);
      if (result.error) {
        console.error("Archive student error:", result.error);
        alert(`Failed to archive student: ${result.error}`);
      } else {
        console.log(result.success);
        // Optimistically remove student from current list or rely on revalidation
        setCurrentStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
      }
    } catch (error) {
      console.error("An unexpected error occurred during archiving:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsArchiving(false);
      setShowConfirmationModal(false); // Close modal after action
      setSelectedStudentForAction(null); // Clear selected student
    }
  };

  const handleDeletePermanently = async (studentId: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await deleteStudent(studentId);
      if (result.error) {
        console.error("Delete student error:", result.error);
        alert(`Failed to delete student: ${result.error}`);
      } else {
        console.log(result.success);
        // Optimistically remove student from current list or rely on revalidation
        setCurrentStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
      }
    } catch (error) {
      console.error("An unexpected error occurred during deletion:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirmationModal(false); // Close modal after action
      setSelectedStudentForAction(null); // Clear selected student
    }
  };
  
  // Display academic age with difference indicator
  const renderAcademicAge = (ageData: AcademicAge) => {
    if (!ageData.academicAge) return "N/A";
    
    // Convert decimal age format to years and months format
    const academicAgeValue = parseFloat(ageData.academicAge);
    const years = Math.floor(academicAgeValue);
    const months = Math.round((academicAgeValue - years) * 12);
    const formattedAge = `${years} years ${months} months`;
    
    return (
      <div className="flex items-center">
        <span className="mr-2">{formattedAge}</span>
        {ageData.difference && (
          <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            ageData.isDeficit 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {ageData.isDeficit ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : (
              <TrendingUp className="h-3 w-3 mr-1" />
            )}
            {ageData.difference}
          </div>
        )}
      </div>
    );
  };
  
  // Format chronological age to years and months
  const formatChronologicalAge = (age: string) => {
    if (age === 'N/A') return age;
    
    const parts = age.split('.');
    if (parts.length !== 2) return age;
    
    const years = parseInt(parts[0], 10);
    const months = parseInt(parts[1], 10);
    return `${years} years ${months} months`;
  };
  
  return (
    <>
      <ConfirmationModal
        isOpen={showConfirmationModal}
        student={selectedStudentForAction}
        onClose={() => setShowConfirmationModal(false)}
        onArchive={handleArchiveStudent}
        onDelete={handleDeletePermanently}
      />
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left font-medium text-sm p-4">Name</th>
                {showClassColumn && <th className="text-left font-medium text-sm p-4">Class</th>}
                <th className="text-left font-medium text-sm p-4">Gender</th>
                <th className="text-left font-medium text-sm p-4">Chronological Age</th>
                <th className="text-left font-medium text-sm p-4">Maths Age</th>
                <th className="text-left font-medium text-sm p-4">Spelling Age</th>
                <th className="text-left font-medium text-sm p-4">Reading Age</th>
                <th className="text-left font-medium text-sm p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr 
                  key={student.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => handleRowClick(student.id, e)}
                >
                  <td className="p-4 font-medium">{student.name}</td>
                  {showClassColumn && <td className="p-4">{student.class}</td>}
                  <td className="p-4">{student.gender.charAt(0).toUpperCase() + student.gender.slice(1).toLowerCase()}</td>
                  <td className="p-4">{formatChronologicalAge(student.chronologicalAge)}</td>
                  <td className="p-4">{renderAcademicAge(student.mathsAge)}</td>
                  <td className="p-4">{renderAcademicAge(student.spellingAge)}</td>
                  <td className="p-4">{renderAcademicAge(student.readingAge)}</td>
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
                          disabled={isDeleting || isArchiving}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteClick(student, e)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          disabled={isDeleting || isArchiving}
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
    </>
  );
} 