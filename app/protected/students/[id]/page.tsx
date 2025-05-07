import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ASBProfileChart } from "@/components/students/asb-profile-chart";

// Define types for our data
interface ASBScore {
  component_name: string;
  raw_score: number;
  standardized_score: number;
}

// Define interface for the student data from database
interface StudentData {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth?: string;
  home_language: string;
  occupational_therapy?: string;
  speech_language_therapy?: string;
  medication?: string;
  counselling?: string;
  school?: {
    name: string;
    Location: string;
  };
  class_enrollments?: Array<{
    class_id: string;
    classes?: {
      class_name: string;
      teacher?: {
        first_name: string;
        last_name: string;
      };
    };
  }>;
}

// Updated typing to match Next.js 15 expectations
// type PageProps = {
//   params: { id: string };
//   searchParams: { [key: string]: string | string[] | undefined };
// }

export default async function StudentPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get the class ID from search params if available
  const classId = typeof resolvedSearch.classId === 'string' ? resolvedSearch.classId : "";
  
  // Determine the back link based on whether we came from a class page
  const backLink = classId ? `/protected/classes/${classId}` : "/protected/students";

  // Fetch the student information with expanded class and school details
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select(`
      *,
      school:school_id (
        name,
        Location
      ),
      class_enrollments (
        class_id,
        classes:class_id (
          class_name,
          teacher:teacher_id (
            first_name,
            last_name
          )
        )
      )
    `)
    .eq('student_id', id)
    .single();

  if (studentError) {
    console.error("Error fetching student:", studentError.message || JSON.stringify(studentError));
  }

  // Get assessment type ID first
  const { data: asbTypeData } = await supabase
    .from('assessment_types')
    .select('id')
    .eq('name', 'Aptitude Tests for School Beginners (ASB)')
    .single();

  const asbTypeId = asbTypeData?.id;

  // Fetch the most recent ASB test results for this student
  const { data: asbSessions, error: asbSessionsError } = await supabase
    .from('assessment_sessions')
    .select(`
      id,
      test_date,
      assessment_type_id,
      assessment_types(name),
      student_assessment_scores!inner(student_id)
    `)
    .eq('assessment_type_id', asbTypeId || '')
    .eq('student_assessment_scores.student_id', studentData?.id || '')
    .order('test_date', { ascending: false });

  if (asbSessionsError) {
    console.error("Error fetching ASB sessions:", asbSessionsError.message || JSON.stringify(asbSessionsError));
  }

  let asbScores: ASBScore[] = [];
  if (asbSessions && asbSessions.length > 0) {
    // Get the most recent ASB session
    const latestSession = asbSessions[0];
    
    // Fetch scores for the latest session
    const { data: scores, error: scoresError } = await supabase
      .from('student_assessment_scores')
      .select(`
        id,
        raw_score,
        standardized_score,
        assessment_components(id, name)
      `)
      .eq('session_id', latestSession.id)
      .eq('student_id', studentData?.id || '');
      
    if (scoresError) {
      console.error("Error fetching scores:", scoresError);
    } else if (scores && scores.length > 0) {
      asbScores = scores.map(score => ({
        component_name: score.assessment_components.name,
        raw_score: score.raw_score,
        standardized_score: score.standardized_score || 0  // Use 0 as fallback if null
      }));
    }
  }

  // Dictionary of mock student data, keyed by ID for fallback
  const mockStudentData: Record<string, any> = {
    "S20250001": {
      id: "S20250001",
      fullName: "Emily Johnson",
      class: "Grade 3A",
      teacher: "Ms. Thompson",
      school: "Springfield Elementary",
      place: "Cape Town",
      gender: "Female",
      homeLanguage: "English",
      dateOfBirth: "2018-05-15",
      age: "6 years, 9 months",
      specialNeeds: {
        occupationalTherapy: "None",
        speechTherapy: "Recommended",
        medication: "None",
        counselling: "None"
      },
      assessmentProfile: {
        perception: 5,
        spatial: 2,
        reasoning: 4,
        numerical: 2,
        gestalt: 2,
        coordination: 3,
        memory: 4,
        verbalComprehension: 4
      },
      progressData: [
        { date: "2024-02", score: 3, avgScore: 4 },
        { date: "2024-04", score: 4, avgScore: 5 },
        { date: "2024-06", score: 5, avgScore: 6 },
        { date: "2024-08", score: 6, avgScore: 7 },
      ]
    },
    // Add other students with similar data structure
  };

  // Use actual data if available, otherwise use mock data
  const studentInfo = studentData || mockStudentData[id] || {
    id: id,
    fullName: id === "S20250002" ? "Michael Smith" : 
              id === "S20250003" ? "Sophia Williams" : 
              id === "S20250004" ? "Daniel Brown" : 
              id === "S20250005" ? "Olivia Miller" :
              "Student " + id,
    class: "Grade 3A",
    teacher: "Ms. Johnson",
    school: "Springfield Elementary",
    place: "Cape Town",
    gender: id.endsWith("2") || id.endsWith("4") || id.endsWith("6") || id.endsWith("8") || id.endsWith("0") ? "Male" : "Female",
    homeLanguage: "English",
    dateOfBirth: "2018-07-22",
    age: "6 years, 7 months",
    specialNeeds: {
      occupationalTherapy: "None",
      speechTherapy: "None",
      medication: "None",
      counselling: "None"
    }
  };

  // Format student name
  const studentName = studentData ? 
    `${studentData.first_name} ${studentData.last_name}` : 
    studentInfo.fullName;

  // Get teacher name from actual data if available
  let teacherName = studentInfo.teacher;
  if (studentData && 
      studentData.class_enrollments && 
      studentData.class_enrollments.length > 0 && 
      studentData.class_enrollments[0].classes && 
      studentData.class_enrollments[0].classes.teacher) {
    const teacher = studentData.class_enrollments[0].classes.teacher;
    teacherName = `${teacher.first_name} ${teacher.last_name}`;
  }
  
  // Get class name from actual data if available
  let className = studentInfo.class;
  if (studentData && 
      studentData.class_enrollments && 
      studentData.class_enrollments.length > 0 && 
      studentData.class_enrollments[0].classes) {
    className = studentData.class_enrollments[0].classes.class_name;
  }
    
  // Use mock ASB data if no actual data is available
  if (asbScores.length === 0) {
    asbScores = [
      { component_name: "Visual Perception", raw_score: 8, standardized_score: 3 },
      { component_name: "Spatial", raw_score: 5, standardized_score: 3 },
      { component_name: "Reasoning", raw_score: 9, standardized_score: 4 },
      { component_name: "Numerical", raw_score: 6, standardized_score: 3 },
      { component_name: "Gestalt", raw_score: 85, standardized_score: 3 },
      { component_name: "Co-ordination", raw_score: 22, standardized_score: 3 },
      { component_name: "Memory", raw_score: 9, standardized_score: 4 },
      { component_name: "Verbal Comprehension", raw_score: 16, standardized_score: 4 }
    ];
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <Link href={backLink} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{studentName}</h1>
          <p className="text-gray-500 mt-1">
            {className} • {teacherName}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Information Card */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <h2 className="text-lg font-medium p-6 border-b border-gray-100">Student Information</h2>
          <div className="flex flex-col py-8">            
            <div className="w-full px-6 space-y-3">
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Full Name:</div>
                <div>{studentName}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Student ID:</div>
                <div>{id}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Class:</div>
                <div>{className}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Teacher:</div>
                <div>{teacherName}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">School:</div>
                <div>{studentData && studentData.school && studentData.school.name ? 
                  studentData.school.name : 
                  studentInfo.school}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Place:</div>
                <div>{studentData && studentData.school && studentData.school.Location ?
                  studentData.school.Location : 
                  studentInfo.place}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Gender:</div>
                <div>{studentData?.gender || studentInfo.gender}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Home Language:</div>
                <div>{studentData?.home_language || studentInfo.homeLanguage}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Date of Birth:</div>
                <div>{studentData?.date_of_birth?.substring(0, 10) || studentInfo.dateOfBirth}</div>
              </div>
              
              <div className="font-medium mt-4 border-b border-gray-100 py-2">Special Needs/Concerns:</div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2 pl-4">
                <div className="font-medium">Occupational Therapy:</div>
                <div>{studentData?.occupational_therapy || studentInfo.specialNeeds.occupationalTherapy}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2 pl-4">
                <div className="font-medium">Speech and Language Therapy:</div>
                <div>{studentData?.speech_language_therapy || studentInfo.specialNeeds.speechTherapy}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2 pl-4">
                <div className="font-medium">Medication:</div>
                <div>{studentData?.medication || studentInfo.specialNeeds.medication}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2 pl-4">
                <div className="font-medium">Counselling:</div>
                <div>{studentData?.counselling || studentInfo.specialNeeds.counselling}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ASB Test Profile Card */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <h2 className="text-lg font-medium p-6 border-b border-gray-100">ASB Test Profile</h2>
            <div className="p-6">
              {asbScores && asbScores.length > 0 ? (
                <ASBProfileChart 
                  studentName={studentName}
                  scores={asbScores}
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                  <p className="text-center text-gray-500">No ASB test data available for this student</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Overview Card */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <h2 className="text-lg font-medium p-6 border-b border-gray-100">Progress Overview</h2>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Performance trends over time</p>
              {/* This would normally be a real chart - using a placeholder div for now */}
              <div className="w-full h-48 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                <p className="text-center text-gray-500">Student progress chart would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 