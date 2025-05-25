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
  isTherapistClass?: boolean;
}

// Define an interface that includes our new columns
interface ClassData {
  id: string;
  class_name: string;
  grade_level: string;
  academic_year: string;
  is_therapist_class?: boolean;
  therapist_name?: string;
  teacher_id: string;
  users?: {
    first_name: string;
    last_name: string;
  } | null;
}

export default async function ClassesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  
  // Get user role to determine how to display the classes
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
  const isTherapist = userData?.role === 'therapist';

  const { data: classesData, error: classesError } = await supabase
    .from('classes')
    .select(`
      id,
      class_name,
      grade_level,
      academic_year,
      is_therapist_class,
      therapist_name,
      teacher_id,
      users:teacher_id(first_name, last_name)
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (classesError) {
    console.error("Error fetching classes:", classesError);
  }

  const formattedClasses: ClassDisplayInfo[] = [];

  if (classesData) {
    // Use type assertion to tell TypeScript about our data structure
    const typedClassesData = classesData as unknown as ClassData[];
    
    for (const classItem of typedClassesData) {
      const { count, error: studentCountError } = await supabase
        .from('class_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classItem.id);

      if (studentCountError) {
        console.error(`Error fetching student count for class ${classItem.id}:`, studentCountError);
      }
      
      // Determine teacher name based on class type
      let teacherName = 'Not Assigned';
      if (classItem.is_therapist_class === true && classItem.therapist_name) {
        teacherName = classItem.therapist_name;
      } else if (classItem.users && classItem.users.first_name && classItem.users.last_name) {
        teacherName = `${classItem.users.first_name} ${classItem.users.last_name}`;
      }

      formattedClasses.push({
        id: classItem.id,
        className: classItem.class_name,
        gradeLevel: classItem.grade_level,
        year: classItem.academic_year,
        studentCount: count || 0,
        teacher: teacherName,
        isTherapistClass: classItem.is_therapist_class,
      });
    }
  }

  return (
    <ClassListDisplay initialClassesData={formattedClasses} />
  );
} 