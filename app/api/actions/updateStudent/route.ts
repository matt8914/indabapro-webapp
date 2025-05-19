import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract data from form
    const studentId = formData.get('studentId') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const gender = formData.get('gender') as string;
    const classId = formData.get('classId') as string;
    const schoolId = formData.get('schoolId') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const place = formData.get('place') as string;
    const homeLanguage = formData.get('homeLanguage') as string;
    const occupationalTherapy = formData.get('occupationalTherapy') as string;
    const speechTherapy = formData.get('speechTherapy') as string;
    const medication = formData.get('medication') as string;
    const counselling = formData.get('counselling') as string;
    const eyesight = formData.get('eyesight') as string;
    const speech = formData.get('speech') as string;
    const hearing = formData.get('hearing') as string;
    const student_id = formData.get('student_id') as string;
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Authentication error:", userError);
      return NextResponse.json(
        { message: "You must be logged in to update a student" },
        { status: 401 }
      );
    }
    
    // Convert string values to appropriate types
    const convertToBoolean = (value: string | null): boolean | null => {
      if (value === null || value === undefined || value === '') return null;
      if (value === 'true' || value === 'yes') return true;
      if (value === 'false' || value === 'no' || value === 'none') return false;
      return value === 'true';
    };
    
    // Update student record
    const { data: updateData, error: updateError } = await supabase
      .from('students')
      .update({
        first_name: firstName,
        last_name: lastName,
        gender: gender,
        date_of_birth: dateOfBirth || null,
        school_id: schoolId,
        location: place,
        home_language: homeLanguage,
        occupational_therapy: convertToBoolean(occupationalTherapy),
        speech_language_therapy: convertToBoolean(speechTherapy),
        medication: medication,
        counselling: convertToBoolean(counselling),
        eyesight: eyesight,
        speech: speech,
        hearing: hearing,
        student_id: student_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId)
      .select()
      .single();
    
    if (updateError) {
      console.error("Error updating student:", updateError);
      return NextResponse.json(
        { message: `Failed to update student: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    // Update class enrollment if class has changed
    if (classId) {
      // Get current class enrollment
      const { data: currentEnrollment, error: enrollmentError } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('student_id', studentId)
        .maybeSingle();
      
      if (enrollmentError) {
        console.error("Error checking class enrollment:", enrollmentError);
      }
      
      // If enrollment exists and class ID is different, update it
      if (currentEnrollment) {
        if (currentEnrollment.class_id !== classId) {
          const { error: updateEnrollmentError } = await supabase
            .from('class_enrollments')
            .update({ class_id: classId })
            .eq('student_id', studentId);
          
          if (updateEnrollmentError) {
            console.error("Error updating class enrollment:", updateEnrollmentError);
            return NextResponse.json(
              { 
                message: "Student updated, but failed to update class enrollment", 
                student: updateData 
              },
              { status: 207 }
            );
          }
        }
      } else {
        // If no enrollment exists, create a new one
        const { error: createEnrollmentError } = await supabase
          .from('class_enrollments')
          .insert({
            student_id: studentId,
            class_id: classId
          });
        
        if (createEnrollmentError) {
          console.error("Error creating class enrollment:", createEnrollmentError);
          return NextResponse.json(
            { 
              message: "Student updated, but failed to create class enrollment", 
              student: updateData 
            },
            { status: 207 }
          );
        }
      }
    }
    
    // Return success response with updated student
    return NextResponse.json(
      { message: "Student updated successfully", student: updateData },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 