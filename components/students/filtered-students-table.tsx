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

interface FilteredStudentsTableProps {
  students: Student[];
  uniqueClasses: string[];
}

export function FilteredStudentsTable({ students, uniqueClasses }: FilteredStudentsTableProps) {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Apply filters whenever filter criteria or students change
  useEffect(() => {
    let result = [...students];
    
    // Filter by class if a class is selected
    if (selectedClass) {
      result = result.filter(student => student.class === selectedClass);
    }
    
    // Filter by search term if entered
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.name.toLowerCase().includes(term)
      );
    }
    
    // Sort by first name
    result.sort((a, b) => {
      const nameA = a.name.split(' ')[0].toLowerCase();
      const nameB = b.name.split(' ')[0].toLowerCase();
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB);
      }
      // If first names are the same, sort by surname
      const surnameA = a.name.split(' ').slice(1).join(' ').toLowerCase();
      const surnameB = b.name.split(' ').slice(1).join(' ').toLowerCase();
      return surnameA.localeCompare(surnameB);
    });
    
    setFilteredStudents(result);
  }, [students, selectedClass, searchTerm]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
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
        <div>
          <select 
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {uniqueClasses.map(classItem => (
              <option key={classItem} value={classItem}>{classItem}</option>
            ))}
          </select>
        </div>
      </div>
      
      <StudentsTable students={filteredStudents} />
    </>
  );
} 