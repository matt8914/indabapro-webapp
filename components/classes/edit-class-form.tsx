'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateClass } from '@/app/actions'; // Assuming updateClass is the server action

interface ClassDetails {
  id: string;
  class_name: string;
  grade_level: string;
  academic_year: string;
}

interface EditClassFormProps {
  classDetails: ClassDetails;
}

export function EditClassForm({ classDetails }: EditClassFormProps) {
  const router = useRouter();
  const [className, setClassName] = useState(classDetails.class_name);
  const [gradeLevel, setGradeLevel] = useState(classDetails.grade_level);
  const [academicYear, setAcademicYear] = useState(classDetails.academic_year);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const originalPath = `/protected/classes/${classDetails.id}`; // Path to the class details page

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('classId', classDetails.id);
    formData.append('className', className);
    formData.append('gradeLevel', gradeLevel);
    formData.append('academicYear', academicYear);
    formData.append('originalPath', originalPath); 

    // Server action `updateClass` is expected to handle redirection on success
    // or return an error object.
    const result = await updateClass(formData);

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      // Success is handled by redirection in the server action.
      // If not redirecting, you might want to set a success message here.
      // For now, we assume redirection takes care of it.
      // setSuccessMessage("Class updated successfully!");
      // router.push(originalPath); // Or let the server action redirect
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {error && <p className="text-red-500 bg-red-50 p-3 rounded-md">Error: {error}</p>}
      {successMessage && <p className="text-green-500 bg-green-50 p-3 rounded-md">{successMessage}</p>}

      <div>
        <Label htmlFor="className">Class Name</Label>
        <Input 
          id="className" 
          type="text" 
          value={className} 
          onChange={(e) => setClassName(e.target.value)} 
          required 
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="gradeLevel">Grade Level</Label>
        <Input 
          id="gradeLevel" 
          type="text" 
          value={gradeLevel} 
          onChange={(e) => setGradeLevel(e.target.value)} 
          required 
          className="mt-1"
        />
        {/* Consider making this a select dropdown if you have predefined grade levels */}
      </div>

      <div>
        <Label htmlFor="academicYear">Academic Year</Label>
        <Input 
          id="academicYear" 
          type="text" 
          value={academicYear} 
          onChange={(e) => setAcademicYear(e.target.value)} 
          required 
          placeholder="e.g., 2024-2025" 
          className="mt-1"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#f6822d] hover:bg-orange-600" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
} 