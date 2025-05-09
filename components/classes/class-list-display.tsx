'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ClassCard } from "@/components/classes/class-card";
import { deleteClass } from "@/app/actions";

// Type for the data displayed for each class
interface ClassDisplayInfo {
  id: string;
  className: string;
  gradeLevel: string;
  year: string;
  studentCount: number;
  teacher: string;
}

// Type for the data passed to/from modal confirmation for delete action
interface ClassActionInfo {
    id: string;
    className: string;
    studentCount: number;
}

interface DeleteClassModalProps {
  isOpen: boolean;
  classInfo: ClassActionInfo | null;
  onClose: () => void;
  onConfirmDelete: (classId: string) => Promise<void>;
  isLoading: boolean;
}

const DeleteClassConfirmationModal: React.FC<DeleteClassModalProps> = ({ isOpen, classInfo, onClose, onConfirmDelete, isLoading }) => {
  if (!isOpen || !classInfo) return null;
  const canDelete = classInfo.studentCount === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Delete Class</h2>
        {canDelete ? (
          <p className="mb-6">
            Are you sure you want to delete the class "{classInfo.className}"? This action cannot be undone.
          </p>
        ) : (
          <p className="mb-6">
            The class "{classInfo.className}" has {classInfo.studentCount} student(s) enrolled. 
            Please remove all students from this class before you can delete it.
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {canDelete ? 'Cancel' : 'OK'}
          </Button>
          {canDelete && (
            <Button 
              variant="destructive" 
              onClick={() => onConfirmDelete(classInfo.id)} 
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Class'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ClassListDisplayProps {
  initialClassesData: ClassDisplayInfo[];
}

export function ClassListDisplay({ initialClassesData }: ClassListDisplayProps) {
  const [classes, setClasses] = useState<ClassDisplayInfo[]>(initialClassesData);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<ClassActionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setClasses(initialClassesData);
  }, [initialClassesData]);

  const handleDeleteRequest = (classData: ClassActionInfo) => {
    setClassToDelete(classData);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
    setClassToDelete(null);
  };

  const handleConfirmDeleteClass = async (classId: string) => {
    if (!classToDelete || classToDelete.studentCount > 0) return;
    setIsLoading(true);
    const result = await deleteClass(classId);
    setIsLoading(false);

    if (result.error) {
      alert(`Failed to delete class: ${result.error}`); // Consider a more robust notification system
    } else {
      setClasses(prevClasses => prevClasses.filter(c => c.id !== classId));
      handleCloseModal();
      // Revalidation should be handled by the server action revalidatePath
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Classes</h1>
          <p className="text-gray-500 mt-1">
            Manage and view all your assigned classes.
          </p>
        </div>
        <Button asChild className="bg-[#f6822d] hover:bg-orange-600">
          <Link href="/protected/classes/new">
            <PlusIcon className="h-5 w-5 mr-1" /> Add Class
          </Link>
        </Button>
      </div>
      
      {classes && classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              id={classItem.id}
              className={classItem.className}
              gradeLevel={classItem.gradeLevel}
              year={classItem.year}
              studentCount={classItem.studentCount}
              teacher={classItem.teacher}
              onDeleteRequest={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <p className="text-gray-500">No classes added yet. Create your first class to get started.</p>
        </div>
      )}

      <DeleteClassConfirmationModal
        isOpen={isDeleteModalOpen}
        classInfo={classToDelete}
        onClose={handleCloseModal}
        onConfirmDelete={handleConfirmDeleteClass}
        isLoading={isLoading}
      />
    </div>
  );
} 