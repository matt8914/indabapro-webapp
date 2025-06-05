import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract data from form
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const studentIdInput = formData.get('studentId') as string;
    const gender = formData.get('gender') as string;
    const classId = formData.get('classId') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const location = formData.get('location') as string;
    const homeLanguage = formData.get('homeLanguage') as string || 'english'; // Default to English
    const notes = formData.get('specialNeeds') as string;
    const occupationalTherapy = formData.get('occupationalTherapy') as string || 'none';
    const speechTherapy = formData.get('speechTherapy') as string || 'none';
    const medication = formData.get('medication') as string || 'none';
    const counselling = formData.get('counselling') as string || 'none';
    const eyesight = formData.get('eyesight') as string || 'none';
    const speech = formData.get('speech') as string || 'none';
    const hearing = formData.get('hearing') as string || 'none';
    const schoolIdFromForm = formData.get('schoolId') as string;
    const returnTo = formData.get('returnTo') as string;
    
    // Convert string values to appropriate types
    // Note: Not used for therapy fields which must be text values: 'none', 'recommended', or 'attending'
    const convertToBoolean = (value: string | null): boolean | null => {
      if (value === null || value === undefined || value === '') return null;
      if (value === 'true' || value === 'yes') return true;
      if (value === 'false' || value === 'no' || value === 'none') return false;
      return value === 'true';
    };
    
    // Log the form data for debugging
    console.log('Form data received:', {
      firstName,
      lastName,
      studentIdInput,
      gender,
      classId,
      homeLanguage,
      schoolIdFromForm,
      eyesight,
      speech,
      hearing
    });
    
    // Validate required fields
    if (!firstName || !lastName || !gender || !studentIdInput || !location || !dateOfBirth || !homeLanguage) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get cookie header for Supabase authentication
    const cookieHeader = request.headers.get('cookie') || '';
    const supabase = await createClient(cookieHeader);
    
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { message: "Authentication error. Make sure you are logged in.", details: authError || 'No user found' },
        { status: 401 }
      );
    }
    
    // Get user data to check role and school
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('id', user.id)
      .single();
      
    if (userError) {
      console.error('User data error:', userError);
      return NextResponse.json(
        { message: `Error getting user data: ${userError.message}` },
        { status: 500 }
      );
    }
    
    console.log('User data:', userData);
    
    const isTherapist = userData?.role === 'therapist';
    const schoolId = isTherapist ? schoolIdFromForm : userData.school_id;
    
    // For teachers/admins, require a school_id; for therapists check if they provided one
    const userSchoolId = userData?.school_id;
    
    if (!isTherapist && !userSchoolId) {
      return NextResponse.json(
        { message: "Your account is not associated with a school. Please contact your administrator." },
        { status: 400 }
      );
    }
    
    if (isTherapist && !schoolId) {
      return NextResponse.json(
        { message: "As a therapist, you must specify which school this student attends." },
        { status: 400 }
      );
    }
    
    try {
      // Generate a student ID if not provided
      const studentId = studentIdInput || `S${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Set created_at and updated_at fields
      const now = new Date().toISOString();
      
      // Create an object with basic and optional student data
      const studentData = {
        student_id: studentId,
        first_name: firstName,
        last_name: lastName,
        gender: gender.toLowerCase(),
        school_id: schoolId,
        home_language: homeLanguage.toLowerCase(),
        is_archived: false,
        created_at: now,
        updated_at: now,
        // Only include optional fields if they have values
        ...(dateOfBirth ? { date_of_birth: dateOfBirth } : {}),
        ...(notes ? { notes } : {}),
        ...(location ? { location } : {}),
        ...(occupationalTherapy ? { occupational_therapy: occupationalTherapy } : {}),
        ...(speechTherapy ? { speech_language_therapy: speechTherapy } : {}),
        ...(medication ? { medication } : {}),
        ...(counselling ? { counselling } : {}),
        ...(eyesight ? { eyesight } : {}),
        ...(speech ? { speech } : {}),
        ...(hearing ? { hearing } : {})
      };
      
      console.log('Attempting to insert student with data:', studentData);
      
      // Create the student in the database
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert(studentData as any)
        .select()
        .single();
      
      if (studentError) {
        console.error('Student creation error:', studentError);
        
        // Handle different types of errors
        if (studentError.message.includes('violates row-level security policy')) {
          return NextResponse.json(
            { 
              message: `RLS policy violation. Make sure you have permission to add students.`,
              details: studentError.message,
              data: studentData
            },
            { status: 403 }
          );
        }
        
        return NextResponse.json(
          { 
            message: `Failed to create student: ${studentError.message}`,
            details: studentError
          },
          { status: 500 }
        );
      }
      
      console.log('Student created successfully:', newStudent);
      
      // If classId is provided, enroll the student in the class
      if (classId) {
        const { error: enrollmentError } = await supabase
          .from('class_enrollments')
          .insert({
            class_id: classId,
            student_id: newStudent.id
          });
          
        if (enrollmentError) {
          console.error('Enrollment error:', enrollmentError);
          return NextResponse.json(
            { 
              message: `Student created but failed to enroll in class: ${enrollmentError.message}`,
              student: newStudent 
            },
            { status: 200 }
          );
        }
      }
      
      return NextResponse.json(
        { message: "Student created successfully", student: newStudent },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error in student creation:', error);
      return NextResponse.json(
        { message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
} 