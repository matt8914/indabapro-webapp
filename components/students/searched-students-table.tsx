"use client";

import { useState, useEffect } from "react";
import { StudentsTable } from "./students-table";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Use the same Student interface as in students-table.tsx
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

interface SearchedStudentsTableProps {
  students: Student[];
  showClassColumn?: boolean;
}

export function SearchedStudentsTable({ students, showClassColumn = true }: SearchedStudentsTableProps) {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Apply search filter whenever search term or students change
  useEffect(() => {
    let result = [...students];
    
    // Filter by search term if entered
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.name.toLowerCase().includes(term)
      );
    }
    
    setFilteredStudents(result);
  }, [students, searchTerm]);

  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search students by name..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <StudentsTable students={filteredStudents} showClassColumn={showClassColumn} />
    </>
  );
} 