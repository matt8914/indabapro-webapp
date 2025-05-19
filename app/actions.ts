"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const role = formData.get("role")?.toString();
  
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password || !firstName || !lastName || !role) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "All fields are required",
    );
  }

  // Sign up the user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role
      }
    },
  });

  if (authError) {
    console.error(authError.code + " " + authError.message);
    return encodedRedirect("error", "/sign-up", authError.message);
  }
  
  // The user profile will be created after email verification when they visit /auth/complete-profile
  
  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  
  if (!email) {
    return encodedRedirect(
      "error",
      "/protected/settings",
      "Email is required",
    );
  }
  
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=recovery`,
  });
  
  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect(
      "error",
      "/protected/settings",
      error.message,
    );
  }
  
  return encodedRedirect(
    "success",
    "/protected/settings",
    "Password reset email sent. Please check your inbox.",
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const updateProfileAction = async (formData: FormData) => {
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  
  if (!firstName || !lastName) {
    return encodedRedirect(
      "error",
      "/protected/settings",
      "First name and last name are required",
    );
  }
  
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect(
      "error",
      "/protected/settings",
      "You must be logged in to update your profile",
    );
  }
  
  // Update the user profile in the database
  const { error } = await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);
  
  if (error) {
    console.error('Error updating user profile:', error);
    return encodedRedirect(
      "error",
      "/protected/settings",
      "Failed to update profile. Please try again.",
    );
  }
  
  return encodedRedirect(
    "success",
    "/protected/settings",
    "Profile updated successfully.",
  );
};

export const createClassAction = async (formData: FormData) => {
  const className = formData.get("className")?.toString();
  const gradeLevel = formData.get("gradeLevel")?.toString();
  const academicYear = formData.get("year")?.toString();
  const userRole = formData.get("userRole")?.toString() || "teacher"; // Get user role from form
  
  if (!className || !gradeLevel || !academicYear) {
    return encodedRedirect(
      "error",
      "/protected/classes/new",
      "Class name, grade level, and year are required"
    );
  }
  
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect(
      "error", 
      "/protected/classes/new", 
      "You must be logged in to create a class"
    );
  }
  
  // Get the user's details
  const { data: userData } = await supabase
    .from('users')
    .select('school_id, first_name, last_name, role')
    .eq('id', user.id)
    .single();
  
  // Only check for school_id if user is not a therapist
  if (!userData?.school_id && userRole !== 'therapist') {
    return encodedRedirect(
      "error",
      "/protected/classes/new",
      "Your account is not associated with a school. Please contact your administrator."
    );
  }
  
  // For TypeScript type safety, create the base data object
  const baseClassData = {
    class_name: className,
    grade_level: gradeLevel,
    academic_year: academicYear,
    teacher_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Handle different cases for therapist vs. teacher/admin users
  let classInsertData;
  
  if (userRole === 'therapist') {
    // For therapists, set therapist_id and school_id=null
    classInsertData = {
      ...baseClassData,
      school_id: null,
      therapist_id: user.id,  // Set therapist_id to the user's ID
      is_therapist_class: true,
      therapist_name: userData ? `${userData.first_name} ${userData.last_name}` : ''
    };
  } else {
    // For teachers and admins, use the school_id
    classInsertData = {
      ...baseClassData,
      school_id: userData?.school_id,
      therapist_id: null,  // Explicitly set to null for non-therapists
      is_therapist_class: false
    };
  }
  
  // Create the class in the database with type assertion to handle new columns
  const { error } = await supabase
    .from('classes')
    .insert(classInsertData as any);
  
  if (error) {
    console.error('Error creating class:', error);
    return encodedRedirect(
      "error",
      "/protected/classes/new",
      `Failed to create class: ${error.message}`
    );
  }
  
  return redirect("/protected/classes");
};

export const createStudentAction = async (formData: FormData) => {
  // Required fields
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const gender = formData.get("gender")?.toString();
  const classId = formData.get("classId")?.toString();
  
  // Optional fields with defaults
  const studentIdInput = formData.get("studentId")?.toString();
  const dateOfBirth = formData.get("dateOfBirth")?.toString();
  const homeLanguage = formData.get("homeLanguage")?.toString() || "english";
  const notes = formData.get("specialNeeds")?.toString();
  
  // School ID for therapist-created students
  const schoolId = formData.get("schoolId")?.toString();
  
  // Get the return path if provided
  const returnTo = formData.get("returnTo")?.toString();
  
  // Support services - all use the default 'none' from DB if not provided
  const occupationalTherapy = formData.get("occupationalTherapy")?.toString();
  const speechTherapy = formData.get("speechTherapy")?.toString();
  const medication = formData.get("medication")?.toString();
  const counselling = formData.get("counselling")?.toString();
  
  // Convert string values to appropriate types
  const convertToBoolean = (value: string | null | undefined): boolean | null => {
    if (value === null || value === undefined || value === '') return null;
    if (value === 'true' || value === 'yes') return true;
    if (value === 'false' || value === 'no' || value === 'none') return false;
    return value === 'true';
  };
  
  if (!firstName || !lastName || !gender || !classId) {
    return encodedRedirect(
      "error",
      `/protected/students/new${classId ? `?class=${classId}` : ''}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
      "Student name, gender, and class are required"
    );
  }
  
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect(
      "error", 
      `/protected/students/new${classId ? `?class=${classId}` : ''}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
      "You must be logged in to add students"
    );
  }
  
  // Get the user's details including role
  const { data: userData } = await supabase
    .from('users')
    .select('school_id, role')
    .eq('id', user.id)
    .single();
  
  const isTherapist = userData?.role === 'therapist';
  
  // For teachers/admins, require a school_id; for therapists check if they provided one
  const userSchoolId = userData?.school_id;
  
  if (!isTherapist && !userSchoolId) {
    return encodedRedirect(
      "error",
      `/protected/students/new${classId ? `?class=${classId}` : ''}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
      "Your account is not associated with a school. Please contact your administrator."
    );
  }
  
  if (isTherapist && !schoolId) {
    return encodedRedirect(
      "error",
      `/protected/students/new${classId ? `?class=${classId}` : ''}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
      "As a therapist, you must specify which school this student attends."
    );
  }
  
  try {
    // Generate a student ID if not provided
    const studentId = studentIdInput || `S${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Set the school ID based on user role
    const studentSchoolId = isTherapist ? schoolId : userSchoolId;
    
    // Create an object with basic and optional student data
    // Use type assertion to assure TypeScript that we know what we're doing
    const studentData = {
      student_id: studentId,
      first_name: firstName,
      last_name: lastName,
      gender: gender,
      school_id: studentSchoolId,
      home_language: homeLanguage,
      // Only include optional fields if they have values
      ...(dateOfBirth ? { date_of_birth: dateOfBirth } : {}),
      ...(notes ? { notes } : {}),
      ...(occupationalTherapy ? { occupational_therapy: convertToBoolean(occupationalTherapy) } : {}),
      ...(speechTherapy ? { speech_language_therapy: convertToBoolean(speechTherapy) } : {}),
      ...(medication ? { medication } : {}),
      ...(counselling ? { counselling: convertToBoolean(counselling) } : {})
    };
    
    // Create the student in the database with type assertion to bypass TypeScript errors
    const { data: newStudent, error: studentError } = await supabase
      .from('students')
      .insert(studentData as any)
      .select()
      .single();
    
    if (studentError) {
      console.error('Error creating student:', studentError);
      return encodedRedirect(
        "error",
        `/protected/students/new${classId ? `?class=${classId}` : ''}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
        `Failed to create student: ${studentError.message}`
      );
    }
    
    // Enroll the student in the class
    const { error: enrollmentError } = await supabase
      .from('class_enrollments')
      .insert({
        class_id: classId,
        student_id: newStudent.id
      });
    
    if (enrollmentError) {
      console.error('Error enrolling student in class:', enrollmentError);
      // We created the student but failed to enroll them, let's continue anyway
      return encodedRedirect(
        "error",
        returnTo || `/protected/classes/${classId}`,
        `Student created but could not be enrolled in the class: ${enrollmentError.message}`
      );
    }
    
    // Redirect to the return path if provided, otherwise to the class page
    return redirect(returnTo || `/protected/classes/${classId}`);
  } catch (error) {
    console.error('Error in student creation process:', error);
    return encodedRedirect(
      "error",
      `/protected/students/new${classId ? `?class=${classId}` : ''}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
      `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export async function deleteStudent(studentId: string) {
  const supabase = await createClient();

  if (!studentId) {
    return { error: "Student ID is required." };
  }

  // Optional: Check if the user has permission to delete students
  // This might involve checking user roles or ownership
  // For now, we'll proceed assuming the user is authorized

  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId);

  if (error) {
    console.error("Error deleting student:", error);
    return { error: `Failed to delete student: ${error.message}` };
  }

  // Revalidate paths where student lists are shown
  revalidatePath("/protected/students");
  revalidatePath("/protected/classes", "layout"); // Revalidate all class detail pages

  return { success: "Student deleted successfully." };
}

export async function archiveStudent(studentId: string) {
  const supabase = await createClient();

  if (!studentId) {
    return { error: "Student ID is required." };
  }

  const { error } = await supabase
    .from("students")
    .update({ is_archived: true } as any)
    .eq("id", studentId);

  if (error) {
    console.error("Error archiving student:", error);
    return { error: `Failed to archive student: ${error.message}` };
  }

  // Revalidate paths where student lists are shown
  revalidatePath("/protected/students");
  revalidatePath("/protected/classes", "layout");

  return { success: "Student archived successfully." };
}

export async function deleteClass(classId: string) {
  const supabase = await createClient();

  if (!classId) {
    return { error: "Class ID is required." };
  }

  // Check if the user has permission (RLS policy should handle this, but good practice to double-check ownership if needed)
  // For now, relying on the RLS policy: "Teachers can delete their own classes"

  // Check if the class has any students enrolled
  const { count, error: countError } = await supabase
    .from('class_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', classId);

  if (countError) {
    console.error("Error counting students in class:", countError);
    return { error: `Failed to check students in class: ${countError.message}` };
  }

  if (count !== null && count > 0) {
    return { error: "Class cannot be deleted as it still has students enrolled. Please remove all students first." };
  }

  // Proceed to delete the class
  const { error: deleteError } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId);

  if (deleteError) {
    console.error("Error deleting class:", deleteError);
    return { error: `Failed to delete class: ${deleteError.message}` };
  }

  revalidatePath("/protected/classes");

  return { success: "Class deleted successfully." };
}

export async function updateClass(formData: FormData) {
  const supabase = await createClient();

  const classId = formData.get("classId")?.toString();
  const className = formData.get("className")?.toString();
  const gradeLevel = formData.get("gradeLevel")?.toString();
  const academicYear = formData.get("academicYear")?.toString();
  // We get the original path to redirect back to, ensuring we go to the class details page
  const originalPath = formData.get("originalPath")?.toString() || "/protected/classes";

  if (!classId) {
    return { error: "Class ID is missing." }; // Should not happen if form is set up correctly
  }

  if (!className || !gradeLevel || !academicYear) {
    return { error: "Class Name, Grade Level, and Academic Year are required." };
  }

  // RLS policy `teachers_can_update_own_classes` will ensure only the owner can update.
  const { data, error } = await supabase
    .from('classes')
    .update({
      class_name: className,
      grade_level: gradeLevel,
      academic_year: academicYear,
      updated_at: new Date().toISOString(),
    })
    .eq('id', classId)
    .select()
    .single(); // Use single to get the updated record or null if not found/allowed

  if (error) {
    console.error("Error updating class:", error);
    return { error: `Failed to update class: ${error.message}` };
  }

  if (!data) {
    // This could happen if RLS prevented the update or the classId was invalid
    return { error: "Failed to update class. Record not found or update not permitted." };
  }

  // Revalidate the paths to ensure fresh data is loaded
  revalidatePath("/protected/classes"); // Revalidate the list of classes
  revalidatePath(originalPath); // Revalidate the specific class page e.g. /protected/classes/[id]
  revalidatePath(`/protected/classes/${classId}/edit`); // Revalidate the edit page itself

  // Redirect back to the class details page (originalPath should be /protected/classes/[id])
  // If originalPath wasn't correctly set to the class detail page, it defaults to /protected/classes
  return redirect(originalPath);
}
