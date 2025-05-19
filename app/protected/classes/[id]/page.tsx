import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, UserPlus, BarChart2, Download, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentsTable } from "@/components/students/students-table";
import { SearchedStudentsTable } from "@/components/students/searched-students-table";
import { calculateChronologicalAge, formatChronologicalAge, formatAgeDifferenceInMonths } from "@/utils/academic-age-utils";

// Define database types directly in this file instead of importing
type Database = {
  public: {
    Tables: {
      classes: {
        Row: {
          id: string;
          class_name: string;
          grade_level: string;
          academic_year: string;
          school_id: string;
          teacher_id: string;
          is_therapist_class?: boolean;
          therapist_name?: string;
          users?: {
            first_name: string;
            last_name: string;
          } | null;
        };
      };
      students: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          gender: string;
          notes?: string | null;
          date_of_birth?: string | null;
        };
      };
      class_enrollments: {
        Row: {
          student_id: string;
          class_id: string;
          students?: {
            id: string;
            first_name: string;
            last_name: string;
            gender: string;
            notes?: string | null;
            date_of_birth?: string | null;
          } | null;
        };
      };
      student_academic_ages: {
        Row: {
          student_id: string;
          academic_age: string;
          age_difference: number;
          is_deficit: boolean;
          created_at: string;
          test_type: string;
        };
      };
      users: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role: string;
          school_id?: string;
        };
      };
    };
  };
};

// Helper type to extract Row types from the Database interface
type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

// Define a more specific type for enrollments with students
type EnrollmentWithStudent = Tables<"class_enrollments"> & {
  students: Pick<Tables<"students">, "id" | "first_name" | "last_name" | "gender" | "notes" | "date_of_birth"> | null;
};

// Updated typing to match Next.js 15 expectations
// type PageProps = {
//   params: { id: string };
//   searchParams: { [key: string]: string | string[] | undefined };
// }

export default async function ClassDetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { id } = await params; // Await params
  const resolvedSearchParams = await searchParams; // Await searchParams

  // Fetch the class data from the database
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select(`
      id,
      class_name,
      grade_level,
      academic_year,
      school_id,
      teacher_id,
      is_therapist_class,
      therapist_name,
      users!classes_teacher_id_fkey(first_name, last_name)
    `)
    .eq('id', id)
    .single();

  if (classError || !classData) {
    console.error("Error fetching class:", classError);
    return (
      <div className="p-6 bg-red-50 rounded-md">
        <p className="text-red-700">Failed to load class details. The class may not exist or you don't have permission to view it.</p>
        <Button asChild className="mt-4">
          <Link href="/protected/classes">Back to My Classes</Link>
        </Button>
      </div>
    );
  }

  // TypeScript is sometimes struggling with the Supabase query results
  // This helps us safely work with the data
  type ClassDataType = typeof classData & {
    is_therapist_class?: boolean;
    therapist_name?: string;
  };

  // Use type assertion
  const typedClassData = classData as ClassDataType;

  // Get the count of students in this class
  const { count: studentCount } = await supabase
    .from('class_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', id);

  // Fetch students enrolled in this class
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('class_enrollments')
    .select(`
      student_id,
      students(
        id,
        first_name,
        last_name,
        gender,
        notes,
        date_of_birth
      )
    `)
    .eq('class_id', id)
    .returns<EnrollmentWithStudent[]>(); // Specify the return type

  if (enrollmentsError) {
    console.error("Error fetching enrollments:", enrollmentsError.message);
    // Handle error appropriately, maybe return or show a message
  }

  // Get student IDs in this class for academic age fetching
  const studentIdsInClass = enrollments
    ?.map(e => e.students?.id)
    .filter((id): id is string => id !== undefined && id !== null)
    || [];
  // console.log("Student IDs in class:", studentIdsInClass); // For debugging locally

  // Fetch latest academic age assessments for these students
  // === UNCOMMENTING ACADEMIC AGE FETCHING ===
  
  // 1. Maths
  const { data: mathsAssessments } = await supabase
    .from('student_academic_ages')
    .select('student_id, academic_age, age_difference, is_deficit, created_at')
    .eq('test_type', 'maths')
    .in('student_id', studentIdsInClass.length > 0 ? studentIdsInClass : ['dummy-id'])
    .order('created_at', { ascending: false });

  // 2. Spelling
  const { data: spellingAssessments } = await supabase
    .from('student_academic_ages')
    .select('student_id, academic_age, age_difference, is_deficit, created_at')
    .eq('test_type', 'spelling')
    .in('student_id', studentIdsInClass.length > 0 ? studentIdsInClass : ['dummy-id'])
    .order('created_at', { ascending: false });

  // 3. Reading
  const { data: readingAssessments } = await supabase
    .from('student_academic_ages')
    .select('student_id, academic_age, age_difference, is_deficit, created_at')
    .eq('test_type', 'reading')
    .in('student_id', studentIdsInClass.length > 0 ? studentIdsInClass : ['dummy-id'])
    .order('created_at', { ascending: false });
  

  // Create maps for the latest assessment of each type by student ID
  const mathsMap = new Map();
  mathsAssessments?.forEach(assessment => { // UNCOMMENTED
    if (!mathsMap.has(assessment.student_id)) {
      mathsMap.set(assessment.student_id, {
        academicAge: assessment.academic_age,
        difference: formatAgeDifferenceInMonths(assessment.age_difference),
        isDeficit: assessment.is_deficit
      });
    }
  });

  const spellingMap = new Map();
  spellingAssessments?.forEach(assessment => { // UNCOMMENTED
    if (!spellingMap.has(assessment.student_id)) {
      spellingMap.set(assessment.student_id, {
        academicAge: assessment.academic_age,
        difference: formatAgeDifferenceInMonths(assessment.age_difference),
        isDeficit: assessment.is_deficit
      });
    }
  });

  const readingMap = new Map();
  readingAssessments?.forEach(assessment => { // UNCOMMENTED
    if (!readingMap.has(assessment.student_id)) {
      readingMap.set(assessment.student_id, {
        academicAge: assessment.academic_age,
        difference: formatAgeDifferenceInMonths(assessment.age_difference),
        isDeficit: assessment.is_deficit
      });
    }
  });

  // Get current date for chronological age calculation
  const currentDate = new Date().toISOString().split('T')[0];

  // Define the student interface that matches the StudentsTable component
  // This interface is defined in StudentsTable, but we need the shape for mapping
  interface StudentForTable {
    id: string;
    name: string;
    class: string; // Will be empty/dummy as it's not shown
    gender: string;
    chronologicalAge: string;
    mathsAge: { academicAge: string | null; difference: string | null; isDeficit: boolean; };
    spellingAge: { academicAge: string | null; difference: string | null; isDeficit: boolean; };
    readingAge: { academicAge: string | null; difference: string | null; isDeficit: boolean; };
  }

  // Format students for the StudentsTable component
  const studentsForTable: StudentForTable[] = enrollments?.map(enrollment => {
    const student = enrollment.students; // No longer 'as any' if EnrollmentWithStudent is correct
    
    if (!student || !student.id) {
      // This case should ideally not happen if enrollments are clean
      return null; 
    }

    const chronologicalAge = student.date_of_birth 
      ? formatChronologicalAge(calculateChronologicalAge(student.date_of_birth, currentDate, 'months'))
      : 'N/A';
    
    return {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      class: '', // Class column is not shown, so this can be empty
      gender: student.gender || 'Not specified',
      chronologicalAge,
      mathsAge: mathsMap.get(student.id) || { academicAge: null, difference: null, isDeficit: false },
      spellingAge: spellingMap.get(student.id) || { academicAge: null, difference: null, isDeficit: false },
      readingAge: readingMap.get(student.id) || { academicAge: null, difference: null, isDeficit: false },
      // notes: student.notes // notes is not part of StudentsTable's Student interface
    };
  }).filter(student => student !== null) as StudentForTable[] || [];

  // Sort students alphabetically by name
  studentsForTable.sort((a, b) => a.name.localeCompare(b.name));

  // Format teacher name and determine class type  
  // First check if it's a therapist class and use therapist_name
  const isTherapistClass = 'is_therapist_class' in classData && classData.is_therapist_class === true;
  let displayName = 'Not Assigned';
  
  if (isTherapistClass && classData.therapist_name) {
    // For therapist classes, use the therapist_name field directly
    displayName = classData.therapist_name;
  } else if (classData["users!classes_teacher_id_fkey"]) {
    // For teacher classes, use the teacher relationship
    displayName = `${classData["users!classes_teacher_id_fkey"].first_name} ${classData["users!classes_teacher_id_fkey"].last_name}`;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/protected/classes" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{classData.class_name}</h1>
          </div>
          <p className="text-gray-500 mt-1 ml-7">
            Grade {classData.grade_level} • {classData.academic_year} • {isTherapistClass ? "Therapist:" : "Teacher:"} {displayName}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-[#f6822d] hover:bg-orange-600 flex items-center gap-1">
            <Link href={`/protected/students/new?class=${id}&return_to=/protected/classes/${id}`}>
              <UserPlus className="h-4 w-4" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Student List</h2>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex items-center gap-1">
              <Link href="#">
                <Upload className="h-4 w-4" />
                Import List
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex items-center gap-1">
              <Link href="#">
                <Download className="h-4 w-4" />
                Export
              </Link>
            </Button>
          </div>
        </div>
        
        {studentsForTable.length > 0 ? (
          <SearchedStudentsTable students={studentsForTable} showClassColumn={false} />
        ) : (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-1">No students enrolled in this class yet.</p>
            <p className="text-gray-500 mb-4">Add students to get started.</p>
            <Button asChild className="bg-[#f6822d] hover:bg-orange-600">
              <Link href={`/protected/students/new?class=${id}&return_to=/protected/classes/${id}`}>
                <UserPlus className="h-4 w-4 mr-1" />
                Add Student
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 