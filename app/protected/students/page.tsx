import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { StudentsTable } from "@/components/students/students-table";
import { calculateChronologicalAge, formatChronologicalAge, formatAgeDifferenceInMonths } from "@/utils/academic-age-utils";

export default async function StudentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user role and school
  const { data: userData } = await supabase
    .from('users')
    .select('role, school_id')
    .eq('id', user.id)
    .single();

  // Get classes taught by this teacher
  const { data: classes } = await supabase
    .from('classes')
    .select('id, class_name')
    .eq('teacher_id', user.id);

  // Get class IDs to use in the query
  const classIds = classes?.map(c => c.id) || [];

  // Get students enrolled in these classes
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('student_id')
    .in('class_id', classIds.length > 0 ? classIds : ['no-classes']);

  // Get unique student IDs
  const studentIds = enrollments ? Array.from(new Set(enrollments.map(e => e.student_id))) : [];

  // Fetch student details
  const { data: studentsData, error: studentsError } = await supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      gender,
      date_of_birth,
      school_id,
      schools(name)
    `)
    .in('id', studentIds.length > 0 ? studentIds : ['no-students'])
    .eq('is_archived', false);

  // Fetch the class info for each student
  const { data: classEnrollments } = await supabase
    .from('class_enrollments')
    .select(`
      student_id,
      classes(class_name)
    `)
    .in('student_id', studentIds.length > 0 ? studentIds : ['no-students']);

  // Fetch latest academic age assessments for each student
  // 1. Maths
  const { data: mathsAssessments } = await supabase
    .from('student_academic_ages')
    .select(`
      student_id,
      academic_age,
      age_difference,
      is_deficit,
      created_at
    `)
    .eq('test_type', 'maths')
    .in('student_id', studentIds.length > 0 ? studentIds : ['no-students'])
    .order('created_at', { ascending: false });

  // 2. Spelling
  const { data: spellingAssessments } = await supabase
    .from('student_academic_ages')
    .select(`
      student_id,
      academic_age,
      age_difference,
      is_deficit,
      created_at
    `)
    .eq('test_type', 'spelling')
    .in('student_id', studentIds.length > 0 ? studentIds : ['no-students'])
    .order('created_at', { ascending: false });

  // 3. Reading
  const { data: readingAssessments } = await supabase
    .from('student_academic_ages')
    .select(`
      student_id,
      academic_age,
      age_difference,
      is_deficit,
      created_at
    `)
    .eq('test_type', 'reading')
    .in('student_id', studentIds.length > 0 ? studentIds : ['no-students'])
    .order('created_at', { ascending: false });

  // Create maps for the latest assessment of each type by student ID
  const mathsMap = new Map();
  mathsAssessments?.forEach(assessment => {
    if (!mathsMap.has(assessment.student_id)) {
      mathsMap.set(assessment.student_id, {
        academicAge: assessment.academic_age,
        difference: formatAgeDifferenceInMonths(assessment.age_difference),
        isDeficit: assessment.is_deficit
      });
    }
  });

  const spellingMap = new Map();
  spellingAssessments?.forEach(assessment => {
    if (!spellingMap.has(assessment.student_id)) {
      spellingMap.set(assessment.student_id, {
        academicAge: assessment.academic_age,
        difference: formatAgeDifferenceInMonths(assessment.age_difference),
        isDeficit: assessment.is_deficit
      });
    }
  });

  const readingMap = new Map();
  readingAssessments?.forEach(assessment => {
    if (!readingMap.has(assessment.student_id)) {
      readingMap.set(assessment.student_id, {
        academicAge: assessment.academic_age,
        difference: formatAgeDifferenceInMonths(assessment.age_difference),
        isDeficit: assessment.is_deficit
      });
    }
  });

  // Create a map of student ID to their enrolled class
  const classMap = new Map();
  classEnrollments?.forEach(enrollment => {
    if (enrollment.classes) {
      classMap.set(enrollment.student_id, enrollment.classes.class_name);
    }
  });

  // Get current date for chronological age calculation
  const currentDate = new Date().toISOString().split('T')[0];

  // Define the student interface that matches the StudentsTable component
  interface Student {
    id: string;
    name: string;
    class: string;
    gender: string;
    chronologicalAge: string;
    mathsAge: {
      academicAge: string | null;
      difference: string | null;
      isDeficit: boolean;
    };
    spellingAge: {
      academicAge: string | null;
      difference: string | null;
      isDeficit: boolean;
    };
    readingAge: {
      academicAge: string | null;
      difference: string | null;
      isDeficit: boolean;
    };
  }

  // Transform data for the students table
  const students: Student[] = studentsData?.map(student => {
    // Calculate chronological age
    const chronologicalAge = student.date_of_birth 
      ? formatChronologicalAge(calculateChronologicalAge(student.date_of_birth, currentDate, 'months'))
      : 'N/A';

    return {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      class: classMap.get(student.id) || 'Not Assigned',
      gender: student.gender,
      chronologicalAge,
      mathsAge: mathsMap.get(student.id) || {
        academicAge: null,
        difference: null,
        isDeficit: false
      },
      spellingAge: spellingMap.get(student.id) || {
        academicAge: null,
        difference: null,
        isDeficit: false
      },
      readingAge: readingMap.get(student.id) || {
        academicAge: null,
        difference: null,
        isDeficit: false
      }
    };
  }) || [];

  // Get unique classes for filter dropdown
  const uniqueClasses: string[] = [];
  students.forEach(student => {
    if (student.class && !uniqueClasses.includes(student.class)) {
      uniqueClasses.push(student.class);
    }
  });

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="text-gray-500 mt-1">
            View and manage all students in your classes.
          </p>
        </div>
        <Button asChild className="bg-[#f6822d] hover:bg-orange-600">
          <Link href="/protected/students/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search students by name..." className="pl-10" />
          </div>
        </div>
        <div>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <option value="">All Classes</option>
            {uniqueClasses.map(classItem => (
              <option key={classItem} value={classItem}>{classItem}</option>
            ))}
          </select>
        </div>
      </div>

      {studentsError && (
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          Error loading students: {studentsError.message}
        </div>
      )}

      {students.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">No students found. Add students to your class to get started.</p>
        </div>
      ) : (
        <StudentsTable students={students} />
      )}
    </div>
  );
} 