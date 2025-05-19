import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EditAssessmentForm } from "@/components/assessments/edit-assessment-form";

export default async function EditAssessmentPage({ params }: { params: { id: string } }) {
  const assessmentId = params.id;
  const supabase = await createClient();

  // Check user authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return redirect("/sign-in");
  }

  // Fetch the assessment session
  const { data: session, error: sessionError } = await supabase
    .from("assessment_sessions")
    .select(`
      *,
      assessment_types: assessment_type_id (*),
      classes: class_id (*)
    `)
    .eq("id", assessmentId)
    .single();

  if (sessionError || !session) {
    return notFound();
  }

  // Fetch assessment categories and types
  const { data: categories, error: categoriesError } = await supabase
    .from("assessment_categories")
    .select(`
      *,
      types: assessment_types (
        *,
        components: assessment_components (*)
      )
    `)
    .order("name");

  if (categoriesError) {
    console.error("Error fetching assessment categories:", categoriesError);
    return <div>Error loading assessment data</div>;
  }

  // Fetch classes
  const { data: classes, error: classesError } = await supabase
    .from("classes")
    .select("*")
    .order("class_name");

  if (classesError) {
    console.error("Error fetching classes:", classesError);
    return <div>Error loading class data</div>;
  }

  // Fetch students for the class using class_enrollments table
  // First get the enrollment records for this class
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("class_enrollments")
    .select("student_id")
    .eq("class_id", session.class_id);

  if (enrollmentsError) {
    console.error("Error fetching enrollments:", enrollmentsError);
    return <div>Error loading enrollment data</div>;
  }

  let students = [];
  
  if (enrollments && enrollments.length > 0) {
    // Get the list of student IDs
    const studentIds = enrollments.map(e => e.student_id);
    
    // Then fetch the actual student records
    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("id, first_name, last_name, student_id, date_of_birth")
      .in("id", studentIds)
      .order("last_name");

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      return <div>Error loading student data</div>;
    }
    
    // Format student data for the form
    students = studentsData?.map(student => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      student_id: student.student_id,
      date_of_birth: student.date_of_birth
    })) || [];
  }

  // Check if this is an academic age assessment
  const isAcademicAgeAssessment = [
    "YOUNG Maths A Assessment",
    "SPAR Reading Assessment",
    "Schonell Spelling A"
  ].includes(session.assessment_types.name);

  // Fetch existing scores
  let existingScores: any[] = [];
  
  if (isAcademicAgeAssessment) {
    // Fetch academic age scores
    const { data: academicAgeScores, error: academicAgeError } = await supabase
      .from("student_academic_ages")
      .select("*")
      .eq("session_id", assessmentId);
      
    if (academicAgeError) {
      console.error("Error fetching academic age scores:", academicAgeError);
      return <div>Error loading scores data</div>;
    }
    
    existingScores = academicAgeScores || [];
  } else {
    // Fetch regular assessment scores
    const { data: assessmentScores, error: scoresError } = await supabase
      .from("student_assessment_scores")
      .select("*")
      .eq("session_id", assessmentId);
      
    if (scoresError) {
      console.error("Error fetching assessment scores:", scoresError);
      return <div>Error loading scores data</div>;
    }
    
    existingScores = assessmentScores || [];
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Link href="/protected/assessments" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessment List
        </Link>
      </div>
      
      <EditAssessmentForm
        session={session}
        classes={classes}
        students={students}
        assessmentCategories={categories || []}
        existingScores={existingScores}
        userId={user.id}
        isAcademicAgeAssessment={isAcademicAgeAssessment}
      />
    </div>
  );
} 