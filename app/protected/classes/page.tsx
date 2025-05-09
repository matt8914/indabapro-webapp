import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ClassListDisplay } from "@/components/classes/class-list-display";

interface ClassDisplayInfo {
  id: string;
  className: string;
  gradeLevel: string;
  year: string;
  studentCount: number;
  teacher: string;
}

export default async function ClassesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: classesData, error: classesError } = await supabase
    .from('classes')
    .select(`
      id,
      class_name,
      grade_level,
      academic_year,
      users(first_name, last_name)
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (classesError) {
    console.error("Error fetching classes:", classesError);
  }

  const formattedClasses: ClassDisplayInfo[] = [];

  if (classesData) {
    for (const classItem of classesData) {
      const { count, error: studentCountError } = await supabase
        .from('class_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classItem.id);

      if (studentCountError) {
        console.error(`Error fetching student count for class ${classItem.id}:`, studentCountError);
      }
      
      const teacherName = classItem.users 
        ? `${classItem.users.first_name} ${classItem.users.last_name}`
        : 'Not Assigned';

      formattedClasses.push({
        id: classItem.id,
        className: classItem.class_name,
        gradeLevel: classItem.grade_level,
        year: classItem.academic_year,
        studentCount: count || 0,
        teacher: teacherName,
      });
    }
  }

  return (
    <ClassListDisplay initialClassesData={formattedClasses} />
  );
} 