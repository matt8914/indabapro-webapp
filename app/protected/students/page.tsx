import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { StudentsTable } from "@/components/students/students-table";

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
  const studentIds = [...new Set(enrollments?.map(e => e.student_id) || [])];

  // Fetch student details
  const { data: studentsData, error: studentsError } = await supabase
    .from('students')
    .select(`
      id,
      student_id,
      first_name,
      last_name,
      gender,
      school_id,
      schools(name)
    `)
    .in('id', studentIds.length > 0 ? studentIds : ['no-students']);

  // Fetch the class info for each student
  const { data: classEnrollments } = await supabase
    .from('class_enrollments')
    .select(`
      student_id,
      classes(class_name)
    `)
    .in('student_id', studentIds.length > 0 ? studentIds : ['no-students']);

  // Fetch latest assessment data
  const { data: progressData } = await supabase
    .from('student_progress')
    .select(`
      student_id,
      status,
      last_assessment_date
    `)
    .in('student_id', studentIds.length > 0 ? studentIds : ['no-students'])
    .order('last_assessment_date', { ascending: false });

  // Create a map of student ID to their latest assessment
  const progressMap = new Map();
  progressData?.forEach(progress => {
    if (!progressMap.has(progress.student_id)) {
      progressMap.set(progress.student_id, progress);
    }
  });

  // Create a map of student ID to their enrolled class
  const classMap = new Map();
  classEnrollments?.forEach(enrollment => {
    if (enrollment.classes) {
      classMap.set(enrollment.student_id, enrollment.classes.class_name);
    }
  });

  // Transform data for the students table
  const students = studentsData?.map(student => {
    const progress = progressMap.get(student.id);
    return {
      id: student.student_id,
      name: `${student.first_name} ${student.last_name}`,
      class: classMap.get(student.id) || 'Not Assigned',
      school: student.schools?.name || 'Unknown',
      gender: student.gender,
      lastAssessment: progress?.last_assessment_date || 'Not Assessed',
      progress: progress?.status || 'Not Assessed'
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
            <Input placeholder="Search students by name or ID..." className="pl-10" />
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