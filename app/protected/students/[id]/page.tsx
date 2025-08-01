import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { ASBProfileChart } from "@/components/students/asb-profile-chart";
import { ProgressOverviewChart } from "@/components/students/progress-overview-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  calculateChronologicalAge, 
  formatAgeDifferenceInMonths, 
  convertToReadingAge, 
  convertToSpellingAge, 
  convertToMathsAge 
} from "@/utils/academic-age-utils";
import { calculateCognitiveReadinessScore } from "@/utils/assessment-utils";
import { PrintStudentDetailsButton } from "@/components/students/print-student-details-button";

// Define types for our data
interface ASBScore {
  component_name: string;
  raw_score: number;
  standardized_score: number;
}

// Add type for class average scores
interface ASBClassAverageScore {
  component_name: string;
  average_standardized_score: number;
}

// Define interface for the student data from database
interface StudentData {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth?: string | null;
  home_language: string;
  notes?: string;
  occupational_therapy?: string;
  speech_language_therapy?: string;
  medication?: string;
  counselling?: string;
  eyesight?: string;
  speech?: string;
  hearing?: string;
  location?: string;
  schools?: {
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

  // First fetch the basic student data
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select(`
      id,
      student_id,
      first_name,
      last_name,
      gender,
      date_of_birth,
      home_language,
      school_id,
      location,
      notes,
      occupational_therapy,
      speech_language_therapy,
      medication,
      counselling,
      eyesight,
      speech,
      hearing
    `)
    .eq('id', id)
    .single();

  if (studentError) {
    console.error("Error fetching student:", studentError.message || JSON.stringify(studentError));
  }

  // If we have student data, fetch related data in separate queries
  let schoolData = null;
  let enrollmentData = null;
  
  if (studentData) {
    // Get school data
    if (studentData.school_id) {
      const { data: schoolResult } = await supabase
        .from('schools')
        .select('name, Location')
        .eq('id', studentData.school_id)
        .single();
      
      schoolData = schoolResult;
    }
    
    // Get class enrollment and teacher data
    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select(`
        class_id,
        classes (
          id,
          class_name,
          teacher_id,
          is_therapist_class
        )
      `)
      .eq('student_id', studentData.id);
    
    enrollmentData = enrollments;
    
    // If we have enrollments with teacher IDs, fetch the teacher data
    if (enrollmentData && enrollmentData.length > 0 && 
        enrollmentData[0].classes && enrollmentData[0].classes.teacher_id) {
      
      const teacherId = enrollmentData[0].classes.teacher_id;
      
      const { data: teacherData } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', teacherId)
        .single();
        
      // Attach teacher data to enrollment
      if (teacherData) {
        enrollmentData[0].classes.teacher = teacherData;
      }
    }
  }
  
  // Combine the data for use in the component
  const combinedStudentData = studentData ? {
    ...studentData,
    schools: schoolData,
    class_enrollments: enrollmentData
  } : null;

  // Initialize ASB related data
  let asbScores: ASBScore[] = [];
  // Initialize assessment date
  let asbTestDate: string | null = null;

  // Initialize academic assessments with proper typing
  let mathsAge = { academicAge: "N/A", difference: null as string | null, isDeficit: false, lastAssessmentDate: null as string | null };
  let spellingAge = { academicAge: "N/A", difference: null as string | null, isDeficit: false, lastAssessmentDate: null as string | null };
  let readingAge = { academicAge: "N/A", difference: null as string | null, isDeficit: false, lastAssessmentDate: null as string | null };
  
  // Current date for chronological age
  const currentDate = new Date().toISOString().split('T')[0];

  if (combinedStudentData) {
    // Calculate chronological age
    const chronologicalAge = combinedStudentData.date_of_birth ? 
      calculateChronologicalAge(combinedStudentData.date_of_birth, currentDate, 'months') : null;
      
    // Get assessment type ID first
    const { data: asbTypeData, error: asbTypeError } = await supabase
      .from('assessment_types')
      .select('id')
      .eq('name', 'Aptitude Tests for School Beginners (ASB)')
      .single();

    if (asbTypeError) {
      console.error("Error fetching ASB type ID:", asbTypeError.message);
    }
    
    const asbTypeId = asbTypeData?.id;

    if (asbTypeId && combinedStudentData.id) {
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
        .eq('assessment_type_id', asbTypeId)
        .eq('student_assessment_scores.student_id', combinedStudentData.id)
        .order('test_date', { ascending: false });

      if (asbSessionsError) {
        console.error("Error fetching ASB sessions:", asbSessionsError.message || JSON.stringify(asbSessionsError));
      } else if (asbSessions && asbSessions.length > 0) {
        const latestSession = asbSessions[0];
        // Store the test date
        asbTestDate = latestSession.test_date;
        
        if (latestSession && latestSession.id && combinedStudentData.id) {
          const { data: scores, error: scoresError } = await supabase
            .from('student_assessment_scores')
            .select(`
              id,
              raw_score,
              standardized_score,
              assessment_components(id, name)
            `)
            .eq('session_id', latestSession.id)
            .eq('student_id', combinedStudentData.id);
            
          if (scoresError) {
            console.error("Error fetching scores:", scoresError);
          } else if (scores && scores.length > 0) {
            asbScores = scores.map(score => ({
              component_name: score.assessment_components.name,
              raw_score: Number(score.raw_score),
              standardized_score: Number(score.standardized_score) || 0
            }));
          }
        }
      }

      // Fetch the most recent academic assessment results
      const { data: mathsAssessments, error: mathsError } = await supabase
        .from('student_academic_ages')
        .select('academic_age, age_difference, is_deficit, created_at')
        .eq('student_id', combinedStudentData.id)
        .eq('test_type', 'maths')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (mathsError) {
        console.error("Error fetching maths assessment:", mathsError.message);
      } else if (mathsAssessments && mathsAssessments.length > 0) {
        mathsAge = {
          academicAge: mathsAssessments[0].academic_age,
          difference: formatAgeDifferenceInMonths(mathsAssessments[0].age_difference),
          isDeficit: mathsAssessments[0].is_deficit,
          lastAssessmentDate: mathsAssessments[0].created_at
        };
      }
      
      const { data: spellingAssessments, error: spellingError } = await supabase
        .from('student_academic_ages')
        .select('academic_age, age_difference, is_deficit, created_at')
        .eq('student_id', combinedStudentData.id)
        .eq('test_type', 'spelling')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (spellingError) {
        console.error("Error fetching spelling assessment:", spellingError.message);
      } else if (spellingAssessments && spellingAssessments.length > 0) {
        spellingAge = {
          academicAge: spellingAssessments[0].academic_age,
          difference: formatAgeDifferenceInMonths(spellingAssessments[0].age_difference),
          isDeficit: spellingAssessments[0].is_deficit,
          lastAssessmentDate: spellingAssessments[0].created_at
        };
      }
      
      const { data: readingAssessments, error: readingError } = await supabase
        .from('student_academic_ages')
        .select('academic_age, age_difference, is_deficit, created_at')
        .eq('student_id', combinedStudentData.id)
        .eq('test_type', 'reading')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (readingError) {
        console.error("Error fetching reading assessment:", readingError.message);
      } else if (readingAssessments && readingAssessments.length > 0) {
        readingAge = {
          academicAge: readingAssessments[0].academic_age,
          difference: formatAgeDifferenceInMonths(readingAssessments[0].age_difference),
          isDeficit: readingAssessments[0].is_deficit,
          lastAssessmentDate: readingAssessments[0].created_at
        };
      }
    }
  } else {
    console.warn("Student data not found, ASB scores will not be fetched.");
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
  let studentInfo: any = combinedStudentData || mockStudentData[id] || {
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
    notes: "",
    specialNeeds: {
      occupationalTherapy: "None",
      speechTherapy: "None",
      medication: "None",
      counselling: "None"
    },
    healthInfo: {
      eyesight: "None",
      speech: "None",
      hearing: "None"
    }
  };

  // Format student name
  const studentName = combinedStudentData ? 
    `${combinedStudentData.first_name} ${combinedStudentData.last_name}` : 
    studentInfo.fullName;

  // Get teacher name from actual data if available
  let teacherName = studentInfo.teacher;
  let teacherLabel = "Teacher";
  
  if (combinedStudentData && 
      combinedStudentData.class_enrollments && 
      combinedStudentData.class_enrollments.length > 0 && 
      combinedStudentData.class_enrollments[0].classes && 
      combinedStudentData.class_enrollments[0].classes.teacher) {
    const teacher = combinedStudentData.class_enrollments[0].classes.teacher;
    const classData = combinedStudentData.class_enrollments[0].classes as any;
    const isTherapistClass = classData.is_therapist_class;
    
    teacherName = `${teacher.first_name} ${teacher.last_name}`;
    teacherLabel = isTherapistClass ? "Private Therapist" : "Remedial Teacher";
  }
  
  // Get class name from actual data if available
  let className = studentInfo.class;
  if (combinedStudentData && 
      combinedStudentData.class_enrollments && 
      combinedStudentData.class_enrollments.length > 0 && 
      combinedStudentData.class_enrollments[0].classes) {
    className = combinedStudentData.class_enrollments[0].classes.class_name;
  }
    
  // Use mock ASB data if no actual data is available
  if (asbScores.length === 0) {
    asbScores = [
      { component_name: "Visual Perception", raw_score: 0, standardized_score: studentInfo.assessmentProfile?.perception || 0 },
      { component_name: "Spatial", raw_score: 0, standardized_score: studentInfo.assessmentProfile?.spatial || 0 },
      { component_name: "Reasoning", raw_score: 0, standardized_score: studentInfo.assessmentProfile?.reasoning || 0 },
      { component_name: "Numerical", raw_score: 0, standardized_score: studentInfo.assessmentProfile?.numerical || 0 },
      { component_name: "Gestalt", raw_score: 0, standardized_score: studentInfo.assessmentProfile?.gestalt || 0 },
      { component_name: "Co-ordination", raw_score: 0, standardized_score: studentInfo.assessmentProfile?.coordination || 0 },
      { component_name: "Memory", raw_score: 0, standardized_score: studentInfo.assessmentProfile?.memory || 0 },
      { component_name: "Verbal Comprehension", raw_score: 0, standardized_score: studentInfo.assessmentProfile?.verbalComprehension || 0 },
    ];
  }

  // Calculate Level of Cognitive Readiness in Language of Assessment
  const getCognitiveReadinessScore = (scores: ASBScore[]): number => {
    // Find the required component scores
    const reasoningScore = scores.find(s => s.component_name === "Reasoning")?.standardized_score || 0;
    const numericalScore = scores.find(s => s.component_name === "Numerical")?.standardized_score || 0;
    const gestaltScore = scores.find(s => s.component_name === "Gestalt")?.standardized_score || 0;
    
    // Calculate cognitive readiness if all required scores are available
    if (reasoningScore > 0 && numericalScore > 0 && gestaltScore > 0) {
      return calculateCognitiveReadinessScore(reasoningScore, numericalScore, gestaltScore);
    }
    
    return 0; // Return 0 if any required score is missing
  };

  const cognitiveReadinessScore = getCognitiveReadinessScore(asbScores);

  console.log("[StudentPage] Props for ASBProfileChart:", { studentName, asbScores, cognitiveReadinessScore });

  // Determine which tab to show based on URL params
  const activeTab = 
    (resolvedSearch.tab === 'progress') 
    ? resolvedSearch.tab : 'info';

  // Fetch student's academic age assessments for progress overview
  const { data: academicAges, error: academicAgesError } = await supabase
    .from('student_academic_ages')
    .select(`
      id,
      test_type,
      academic_age,
      created_at,
      assessment_sessions(
        test_date,
        classes(grade_level)
      )
    `)
    .eq('student_id', id)
    .order('created_at', { ascending: true });

  if (academicAgesError) {
    console.error("[StudentPage] Error fetching academic ages:", academicAgesError.message);
  }

  // Process the academic age data for the progress chart
  // Group by grade level and latest assessment for each type (maths, reading, spelling)
  const gradeAssessments = new Map<string, { mathsAge: string | null, readingAge: string | null, spellingAge: string | null }>();
  
  if (academicAges && academicAges.length > 0) {
    academicAges.forEach(assessment => {
      // Skip if no grade level information is available
      if (!assessment.assessment_sessions?.classes?.grade_level) return;
      
      const grade = assessment.assessment_sessions.classes.grade_level;
      
      // Initialize grade entry if not exists
      if (!gradeAssessments.has(grade)) {
        gradeAssessments.set(grade, {
          mathsAge: null,
          readingAge: null,
          spellingAge: null
        });
      }
      
      // Update with the latest assessment for each type
      const currentGradeData = gradeAssessments.get(grade)!;
      
      if (assessment.test_type === 'maths') {
        currentGradeData.mathsAge = assessment.academic_age;
      } else if (assessment.test_type === 'reading') {
        currentGradeData.readingAge = assessment.academic_age;
      } else if (assessment.test_type === 'spelling') {
        currentGradeData.spellingAge = assessment.academic_age;
      }
      
      gradeAssessments.set(grade, currentGradeData);
    });
  }
  
  // Convert map to array sorted by grade level (numerically)
  const progressData = Array.from(gradeAssessments.entries())
    .map(([grade, data]) => ({
      grade,
      mathsAge: data.mathsAge,
      readingAge: data.readingAge,
      spellingAge: data.spellingAge
    }))
    .sort((a, b) => {
      // Extract numeric part of grade (e.g., "Grade 1" -> 1)
      const gradeNumA = parseInt(a.grade.replace(/\D/g, ''));
      const gradeNumB = parseInt(b.grade.replace(/\D/g, ''));
      return gradeNumA - gradeNumB;
    });
    
  console.log("[StudentPage] Prepared progress data:", progressData);

  // Use mock data if no actual data is available
  if (combinedStudentData) {
    studentInfo = {
      ...studentInfo,
      specialNeeds: {
        occupationalTherapy: combinedStudentData.occupational_therapy || "None",
        speechTherapy: combinedStudentData.speech_language_therapy || "None",
        medication: combinedStudentData.medication || "No medication",
        counselling: combinedStudentData.counselling || "None"
      },
      healthInfo: {
        eyesight: (combinedStudentData as any).eyesight || "None",
        speech: (combinedStudentData as any).speech || "None",
        hearing: (combinedStudentData as any).hearing || "None"
      }
    };
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
      
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 rounded-lg p-1">
          <TabsTrigger 
            value="info" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md"
          >
            Student Information
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md"
          >
            Progress Overview
          </TabsTrigger>
        </TabsList>

        {/* Student Information Tab */}
        <TabsContent value="info" className="mt-6">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium">Student Information</h2>
              <div className="flex gap-2">
                <PrintStudentDetailsButton 
                  studentData={{
                    fullName: studentName,
                    className: className,
                    teacher: teacherName,
                    teacherLabel: teacherLabel,
                    dateOfBirth: combinedStudentData?.date_of_birth || studentInfo.dateOfBirth,
                    gender: combinedStudentData?.gender || studentInfo.gender,
                    homeLanguage: combinedStudentData?.home_language || studentInfo.homeLanguage,
                    school: (combinedStudentData && combinedStudentData.schools && 
                      (typeof combinedStudentData.schools === 'object' && combinedStudentData.schools !== null && 'name' in combinedStudentData.schools) ? 
                      (combinedStudentData.schools as any).name : 
                      studentInfo.school),
                    location: (combinedStudentData && 'location' in combinedStudentData && combinedStudentData.location) || 
                      (combinedStudentData && combinedStudentData.schools && 
                      (typeof combinedStudentData.schools === 'object' && combinedStudentData.schools !== null && 'Location' in combinedStudentData.schools) ?
                      (combinedStudentData.schools as any).Location : 
                      studentInfo.place),
                    notes: (combinedStudentData as any)?.notes || studentInfo.notes || "",
                    chronologicalAge: combinedStudentData?.date_of_birth ? 
                      (() => {
                        const chrono = calculateChronologicalAge(combinedStudentData.date_of_birth, currentDate, 'months');
                        if (!chrono) return "N/A";
                        const parts = chrono.split('.');
                        if (parts.length !== 2) return chrono;
                        const years = parseInt(parts[0], 10);
                        const months = parseInt(parts[1], 10);
                        return `${years}y ${months}m`;
                      })() : 
                      "N/A",
                    mathsAge: mathsAge,
                    spellingAge: spellingAge,
                    readingAge: readingAge,
                    occupationalTherapy: combinedStudentData?.occupational_therapy || studentInfo.specialNeeds.occupationalTherapy,
                    speechTherapy: combinedStudentData?.speech_language_therapy || studentInfo.specialNeeds.speechTherapy,
                    medication: combinedStudentData?.medication || studentInfo.specialNeeds.medication,
                    counselling: combinedStudentData?.counselling || studentInfo.specialNeeds.counselling,
                    eyesight: (combinedStudentData as any)?.eyesight || studentInfo.healthInfo?.eyesight,
                    speech: (combinedStudentData as any)?.speech || studentInfo.healthInfo?.speech,
                    hearing: (combinedStudentData as any)?.hearing || studentInfo.healthInfo?.hearing,
                    asbTestDate: asbTestDate
                  }}
                  asbChartElementId="asb-profile-chart"
                />
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 text-[#f6822d] border-[#f6822d] hover:bg-orange-50"
                  asChild
                >
                  <Link href={`/protected/students/${id}/edit${classId ? `?classId=${classId}` : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Student
                  </Link>
                </Button>
              </div>
            </div>
            <div className="py-6 px-6">
              {/* Top row - Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Full Name</div>
                  <div className="font-medium text-lg">{studentName}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Class</div>
                  <div className="font-medium">{className}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">{teacherLabel}</div>
                  <div className="font-medium">{teacherName}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Date of Birth</div>
                  <div className="font-medium">{combinedStudentData?.date_of_birth?.substring(0, 10) || studentInfo.dateOfBirth}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Gender</div>
                  <div className="font-medium">{combinedStudentData?.gender ? 
                    combinedStudentData.gender.charAt(0).toUpperCase() + combinedStudentData.gender.slice(1) : 
                    studentInfo.gender.charAt(0).toUpperCase() + studentInfo.gender.slice(1)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Home Language</div>
                  <div className="font-medium">{combinedStudentData?.home_language ? 
                    combinedStudentData.home_language.charAt(0).toUpperCase() + combinedStudentData.home_language.slice(1) : 
                    studentInfo.homeLanguage.charAt(0).toUpperCase() + studentInfo.homeLanguage.slice(1)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">School</div>
                  <div className="font-medium">{combinedStudentData && combinedStudentData.schools && 
                    (typeof combinedStudentData.schools === 'object' && combinedStudentData.schools !== null && 'name' in combinedStudentData.schools) ? 
                    (combinedStudentData.schools as any).name : 
                    studentInfo.school}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="font-medium">{
                    // Access location safely with proper type checking
                    (combinedStudentData && 'location' in combinedStudentData && combinedStudentData.location) || 
                    (combinedStudentData && combinedStudentData.schools && 
                    (typeof combinedStudentData.schools === 'object' && combinedStudentData.schools !== null && 'Location' in combinedStudentData.schools) ?
                    (combinedStudentData.schools as any).Location : 
                    studentInfo.place)}</div>
                </div>
              </div>
              
              {/* Academic Assessment Results Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-base font-medium mb-4">Academic Assessment Results</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Chronological Age */}
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-500 mb-2">Chronological Age</div>
                    <div className="font-medium text-lg">
                      {combinedStudentData?.date_of_birth ? 
                        (() => {
                          const chrono = calculateChronologicalAge(combinedStudentData.date_of_birth, currentDate, 'months');
                          if (!chrono) return "N/A";
                          const parts = chrono.split('.');
                          if (parts.length !== 2) return chrono; // Or handle more gracefully
                          const years = parseInt(parts[0], 10);
                          const months = parseInt(parts[1], 10);
                          return `${years}y ${months}m`;
                        })() : 
                        "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Current age</div>
                  </div>

                  {/* Maths Age */}
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-500 mb-2">Maths Age</div>
                    {mathsAge.academicAge !== "N/A" ? (
                      <>
                        <div className="flex items-center">
                          <div className="font-medium text-lg mr-2">
                            {(() => {
                              if (mathsAge.academicAge === "N/A") return "N/A";
                              const parts = mathsAge.academicAge.split('.');
                              if (parts.length !== 2) return mathsAge.academicAge;
                              const years = parseInt(parts[0], 10);
                              const tenths = parseInt(parts[1], 10);
                              // Convert tenths to months (approximately)
                              const months = Math.round(tenths * 1.2);
                              return `${years}y ${months}m`;
                            })()}
                          </div>
                          {mathsAge.difference && (
                            <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              mathsAge.isDeficit 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {mathsAge.isDeficit ? (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              )}
                              {mathsAge.difference}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last assessment{mathsAge.lastAssessmentDate && mathsAge.lastAssessmentDate !== 'null' ? 
                            `: ${new Date(mathsAge.lastAssessmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                        </div>
                      </>
                    ) : (
                      <div className="font-medium text-gray-400">No data available</div>
                    )}
                  </div>

                  {/* Spelling Age */}
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-500 mb-2">Spelling Age</div>
                    {spellingAge.academicAge !== "N/A" ? (
                      <>
                        <div className="flex items-center">
                          <div className="font-medium text-lg mr-2">
                            {(() => {
                              if (spellingAge.academicAge === "N/A") return "N/A";
                              const parts = spellingAge.academicAge.split('.');
                              if (parts.length !== 2) return spellingAge.academicAge;
                              const years = parseInt(parts[0], 10);
                              const months = parseInt(parts[1], 10);
                              return `${years}y ${months}m`;
                            })()}
                          </div>
                          {spellingAge.difference && (
                            <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              spellingAge.isDeficit 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {spellingAge.isDeficit ? (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              )}
                              {spellingAge.difference}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last assessment{spellingAge.lastAssessmentDate && spellingAge.lastAssessmentDate !== 'null' ? 
                            `: ${new Date(spellingAge.lastAssessmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                        </div>
                      </>
                    ) : (
                      <div className="font-medium text-gray-400">No data available</div>
                    )}
                  </div>

                  {/* Reading Age */}
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-500 mb-2">Reading Age</div>
                    {readingAge.academicAge !== "N/A" ? (
                      <>
                        <div className="flex items-center">
                          <div className="font-medium text-lg mr-2">
                            {(() => {
                              if (readingAge.academicAge === "N/A") return "N/A";
                              const parts = readingAge.academicAge.split('.');
                              if (parts.length !== 2) return readingAge.academicAge;
                              const years = parseInt(parts[0], 10);
                              const tenths = parseInt(parts[1], 10);
                              return `${years}y ${tenths}m`;
                            })()}
                          </div>
                          {readingAge.difference && (
                            <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              readingAge.isDeficit 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {readingAge.isDeficit ? (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              )}
                              {readingAge.difference}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last assessment{readingAge.lastAssessmentDate && readingAge.lastAssessmentDate !== 'null' ? 
                            `: ${new Date(readingAge.lastAssessmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                        </div>
                      </>
                    ) : (
                      <div className="font-medium text-gray-400">No data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Needs Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-base font-medium mb-4">Special Needs/Concerns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Special Needs/Notes */}
                  {(() => {
                    const notes = (combinedStudentData as any)?.notes || studentInfo.notes || "";
                    
                    return (
                      <div className="md:col-span-2 lg:col-span-4 p-3 rounded bg-blue-50">
                        <div className="text-sm text-gray-500 mb-1">Special Needs/Notes</div>
                        <div className="font-medium">{notes || "None"}</div>
                      </div>
                    );
                  })()}
                  
                  {/* Occupational */}
                  {(() => {
                    const value = combinedStudentData?.occupational_therapy || studentInfo.specialNeeds.occupationalTherapy;
                    const displayValue = value === "none" ? "None" : 
                                        value === "recommended" ? "Recommended" : 
                                        value === "attending" ? "Attending" : 
                                        value === "discharged" ? "Discharged" :
                                        value.charAt(0).toUpperCase() + value.slice(1);
                    
                    const bgColor = value === "none" ? "bg-gray-50" : 
                                  value === "recommended" ? "bg-orange-50" : 
                                  value === "attending" ? "bg-green-50" : 
                                  value === "discharged" ? "bg-red-50" :
                                  "bg-gray-50";
                    
                    return (
                      <div className={`p-3 rounded ${bgColor}`}>
                        <div className="text-sm text-gray-500 mb-1">Occupational</div>
                        <div className="font-medium">{displayValue}</div>
                      </div>
                    );
                  })()}
                  
                  {/* Speech */}
                  {(() => {
                    const value = combinedStudentData?.speech_language_therapy || studentInfo.specialNeeds.speechTherapy;
                    const displayValue = value === "none" ? "None" : 
                                        value === "recommended" ? "Recommended" : 
                                        value === "attending" ? "Attending" : 
                                        value === "discharged" ? "Discharged" :
                                        value.charAt(0).toUpperCase() + value.slice(1);
                    
                    const bgColor = value === "none" ? "bg-gray-50" : 
                                  value === "recommended" ? "bg-orange-50" : 
                                  value === "attending" ? "bg-green-50" : 
                                  value === "discharged" ? "bg-red-50" :
                                  "bg-gray-50";
                    
                    return (
                      <div className={`p-3 rounded ${bgColor}`}>
                        <div className="text-sm text-gray-500 mb-1">Speech</div>
                        <div className="font-medium">{displayValue}</div>
                      </div>
                    );
                  })()}
                  
                  {/* Medication */}
                  {(() => {
                    const value = combinedStudentData?.medication || studentInfo.specialNeeds.medication;
                    const displayValue = value === "no_medication" ? "No medication" : 
                                        value === "on_prescribed_medication" ? "On Prescribed Medication" : 
                                        value === "natural_homeopathic_support" ? "Natural / Homeopathic Support" : 
                                        value === "not_disclosed" ? "Not Disclosed" :
                                        value === "other" ? "Other" :
                                        // Handle old values for backward compatibility
                                        value === "none" ? "No medication" : 
                                        value === "recommended" ? "On Prescribed Medication" : 
                                        value === "attending" ? "On Prescribed Medication" : 
                                        value === "discharged" ? "No medication" :
                                        value.charAt(0).toUpperCase() + value.slice(1);
                    
                    const bgColor = value === "no_medication" || value === "none" || value === "discharged" ? "bg-gray-50" : 
                                  value === "on_prescribed_medication" || value === "recommended" || value === "attending" ? "bg-blue-50" : 
                                  value === "natural_homeopathic_support" ? "bg-green-50" : 
                                  value === "not_disclosed" ? "bg-yellow-50" :
                                  value === "other" ? "bg-purple-50" :
                                  "bg-gray-50";
                    
                    return (
                      <div className={`p-3 rounded ${bgColor}`}>
                        <div className="text-sm text-gray-500 mb-1">Medication</div>
                        <div className="font-medium">{displayValue}</div>
                      </div>
                    );
                  })()}
                  
                  {/* Counselling */}
                  {(() => {
                    const value = combinedStudentData?.counselling || studentInfo.specialNeeds.counselling;
                    const displayValue = value === "none" ? "None" : 
                                        value === "recommended" ? "Recommended" : 
                                        value === "attending" ? "Attending" : 
                                        value === "discharged" ? "Discharged" :
                                        value.charAt(0).toUpperCase() + value.slice(1);
                    
                    const bgColor = value === "none" ? "bg-gray-50" : 
                                  value === "recommended" ? "bg-orange-50" : 
                                  value === "attending" ? "bg-green-50" : 
                                  value === "discharged" ? "bg-red-50" :
                                  "bg-gray-50";
                    
                    return (
                      <div className={`p-3 rounded ${bgColor}`}>
                        <div className="text-sm text-gray-500 mb-1">Counselling</div>
                        <div className="font-medium">{displayValue}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Health Information Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-base font-medium mb-4">Health Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Eyesight */}
                  {(() => {
                    const value = combinedStudentData?.eyesight || studentInfo.healthInfo?.eyesight || "none";
                    const displayValue = value === "none" ? "None" : 
                                        value === "glasses" ? "Glasses" : 
                                        value === "squint" ? "Squint" : 
                                        value.charAt(0).toUpperCase() + value.slice(1);
                    
                    const bgColor = value === "none" ? "bg-gray-50" : "bg-blue-50";
                    
                    return (
                      <div className={`p-3 rounded ${bgColor}`}>
                        <div className="text-sm text-gray-500 mb-1">Eyesight</div>
                        <div className="font-medium">{displayValue}</div>
                      </div>
                    );
                  })()}
                  
                  {/* Speech */}
                  {(() => {
                    const value = combinedStudentData?.speech || studentInfo.healthInfo?.speech || "none";
                    const displayValue = value === "none" ? "None" : 
                                        value === "stutter" ? "Stutter" : 
                                        value.charAt(0).toUpperCase() + value.slice(1);
                    
                    const bgColor = value === "none" ? "bg-gray-50" : "bg-blue-50";
                    
                    return (
                      <div className={`p-3 rounded ${bgColor}`}>
                        <div className="text-sm text-gray-500 mb-1">Speech</div>
                        <div className="font-medium">{displayValue}</div>
                      </div>
                    );
                  })()}
                  
                  {/* Hearing */}
                  {(() => {
                    const value = combinedStudentData?.hearing || studentInfo.healthInfo?.hearing || "none";
                    const displayValue = value === "none" ? "None" : 
                                        value === "hard_of_hearing" ? "Hard of Hearing" : 
                                        value.charAt(0).toUpperCase() + value.slice(1);
                    
                    const bgColor = value === "none" ? "bg-gray-50" : "bg-blue-50";
                    
                    return (
                      <div className={`p-3 rounded ${bgColor}`}>
                        <div className="text-sm text-gray-500 mb-1">Hearing</div>
                        <div className="font-medium">{displayValue}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ASB Test Profile Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium">ASB Test Profile</h3>
                  {asbTestDate && (
                    <div className="text-sm text-gray-500">
                      Assessment Date: {new Date(asbTestDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {asbScores && asbScores.length > 0 ? (
                  <ASBProfileChart 
                    studentName={studentName}
                    scores={asbScores}
                    cognitiveReadinessScore={cognitiveReadinessScore}
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                    <p className="text-center text-gray-500">No ASB test data available for this student</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Progress Overview Tab */}
        <TabsContent value="progress" className="mt-6">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <h2 className="text-lg font-medium p-6 border-b border-gray-100">Progress Overview</h2>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Performance trends over time</p>
              {progressData && progressData.length > 0 ? (
                <ProgressOverviewChart 
                  studentName={studentName}
                  academicAgeData={progressData}
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                  <p className="text-center text-gray-500">No historical academic age data available for this student</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 