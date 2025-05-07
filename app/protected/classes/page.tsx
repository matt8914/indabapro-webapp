import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ClassCard } from "@/components/classes/class-card";
import Link from "next/link";

export default async function ClassesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch classes taught by this teacher
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select(`
      id,
      class_name,
      grade_level,
      academic_year,
      school_id,
      teacher_id,
      users(first_name, last_name)
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  // Get student counts for each class
  const classStudentCounts = new Map();
  
  if (classes && classes.length > 0) {
    // For each class, fetch the count of enrolled students
    for (const classItem of classes) {
      const { count } = await supabase
        .from('class_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classItem.id);
      
      classStudentCounts.set(classItem.id, count || 0);
    }
  }

  // Format class data for display
  const formattedClasses = classes?.map(classItem => {
    const teacherName = classItem.users 
      ? `${classItem.users.first_name} ${classItem.users.last_name}`
      : 'Not Assigned';
      
    return {
      id: classItem.id,
      className: classItem.class_name,
      gradeLevel: classItem.grade_level,
      year: classItem.academic_year,
      studentCount: classStudentCounts.get(classItem.id) || 0,
      teacher: teacherName
    };
  }) || [];

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
      
      {classesError && (
        <div className="bg-red-50 p-4 rounded-md text-red-500">
          Failed to load classes: {classesError.message}
        </div>
      )}
      
      {formattedClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              id={classItem.id}
              className={classItem.className}
              gradeLevel={classItem.gradeLevel}
              year={classItem.year}
              studentCount={classItem.studentCount}
              teacher={classItem.teacher}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <p className="text-gray-500">No classes added yet. Create your first class to get started.</p>
        </div>
      )}
    </div>
  );
} 