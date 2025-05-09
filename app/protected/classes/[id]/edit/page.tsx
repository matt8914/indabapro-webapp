import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { EditClassForm } from "@/components/classes/edit-class-form"; // New client component for the form

// Define the shape of the class data we expect to fetch.
// This can also be in a shared types file.
interface ClassDetails {
  id: string;
  class_name: string;
  grade_level: string;
  academic_year: string;
  // Add other fields if necessary, e.g., teacher_id, school_id, if they are part of the form or needed for context
}

// Remove EditClassPageProps interface
// interface EditClassPageProps {
//   params: { id: string };
// }

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) { // Use inline type for params, now a Promise
  const { id: classId } = await params; // Await the params
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }

  const { data: classDetails, error } = await supabase
    .from('classes')
    .select('id, class_name, grade_level, academic_year') // Select only fields needed for the edit form
    .eq('id', classId)
    .eq('teacher_id', user.id) // Ensure the user owns the class they are trying to edit
    .single();

  if (error || !classDetails) {
    console.error("Error fetching class details for edit or class not found/not owned:", error);
    // Redirect to classes list or show a specific error message/page
    return redirect("/protected/classes?error=notFoundOrNotPermitted"); 
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Class: {classDetails.class_name}</h1>
      <EditClassForm classDetails={classDetails} />
    </div>
  );
} 