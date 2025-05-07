"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const role = formData.get("role")?.toString();
  const schoolId = formData.get("schoolId")?.toString();
  
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
        role: role,
        school_id: schoolId || null
      }
    },
  });

  if (authError) {
    console.error(authError.code + " " + authError.message);
    return encodedRedirect("error", "/sign-up", authError.message);
  }
  
  // If the user was created successfully, create a user record in the database
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: role,
        school_id: schoolId || null
      });
      
    if (profileError) {
      console.error("Error creating user profile:", profileError);
      return encodedRedirect(
        "error", 
        "/sign-up", 
        "Account created but profile setup failed. Please contact support."
      );
    }
  }

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
  
  // Get the user's school ID
  const { data: userData } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', user.id)
    .single();
  
  if (!userData?.school_id) {
    return encodedRedirect(
      "error",
      "/protected/classes/new",
      "Your account is not associated with a school. Please contact your administrator."
    );
  }
  
  // Create the class in the database
  const { error } = await supabase
    .from('classes')
    .insert({
      class_name: className,
      grade_level: gradeLevel,
      academic_year: academicYear,
      school_id: userData.school_id,
      teacher_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
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
  
  // Get the return path if provided
  const returnTo = formData.get("returnTo")?.toString();
  
  // Support services - all use the default 'none' from DB if not provided
  const occupationalTherapy = formData.get("occupationalTherapy")?.toString();
  const speechTherapy = formData.get("speechTherapy")?.toString();
  const medication = formData.get("medication")?.toString();
  const counselling = formData.get("counselling")?.toString();
  
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
  
  // Get the user's school ID
  const { data: userData } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', user.id)
    .single();
  
  if (!userData?.school_id) {
    return encodedRedirect(
      "error",
      `/protected/students/new${classId ? `?class=${classId}` : ''}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ''}`,
      "Your account is not associated with a school. Please contact your administrator."
    );
  }
  
  try {
    // Generate a student ID if not provided
    const studentId = studentIdInput || `S${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create an object with basic and optional student data
    // Use type assertion to assure TypeScript that we know what we're doing
    const studentData = {
      student_id: studentId,
      first_name: firstName,
      last_name: lastName,
      gender: gender,
      school_id: userData.school_id,
      home_language: homeLanguage,
      // Only include optional fields if they have values
      ...(dateOfBirth ? { date_of_birth: dateOfBirth } : {}),
      ...(notes ? { notes } : {}),
      ...(occupationalTherapy ? { occupational_therapy: occupationalTherapy } : {}),
      ...(speechTherapy ? { speech_language_therapy: speechTherapy } : {}),
      ...(medication ? { medication } : {}),
      ...(counselling ? { counselling } : {})
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
