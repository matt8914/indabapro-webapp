"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { convertToStandardizedScore, calculateCognitiveReadinessFromRawScores } from "@/utils/assessment-utils";
import { createClient } from "@/utils/supabase/client";
import { 
  convertToMathsAge,
  convertToReadingAge,
  convertToSpellingAge,
  convertToBNSTAge,
  convertToBurtReadingLevel,
  convertToDanielsAndDaickAge,
  convertToDanielsAndDaickSpellingAge,
  convertToVernonMathsAge,
  convertToSchonellReadingAge,
  convertToOneMinuteReadingAge,
  convertToYoungsGroupReadingAge,
  convertTenthsToYearsMonths,
  calculateChronologicalAge,
  calculateAgeDifference,
  isDeficit
} from "@/utils/academic-age-utils";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";

interface Student {
  id: string;
  name: string;
  student_id?: string;
  date_of_birth?: string | null;
}

interface Component {
  id: string;
  name: string;
  description?: string;
  min_score?: number;
  max_score?: number;
}

interface AssessmentType {
  id: string;
  name: string;
  description?: string;
  components: Component[];
}

interface AssessmentCategory {
  id: string;
  name: string;
  types: AssessmentType[];
}

interface Class {
  id: string;
  class_name: string;
}

interface ScoresState {
  [studentId: string]: {
    [componentId: string]: string;
  };
}

interface AcademicAgeScoresState {
  [studentId: string]: {
    id?: string; // For tracking existing records
    rawScore: string;
    academicAge: string;
    chronologicalAge: string;
    ageDifference: string;
    isDeficit: boolean;
  };
}

interface AssessmentSession {
  id: string;
  assessment_type_id: string;
  class_id: string;
  tester_id: string;
  test_date: string;
  remarks: string | null;
  assessment_types: {
    id: string;
    name: string;
    category_id: string;
  };
  classes: {
    id: string;
    class_name: string;
  };
}

interface RegularScore {
  id: string;
  student_id: string;
  component_id: string;
  raw_score: number;
  standardized_score?: number;
  percentile?: number;
}

interface AcademicAgeScore {
  id: string;
  student_id: string;
  raw_score: number;
  academic_age: string;
  chronological_age: string;
  age_difference: string;
  is_deficit: boolean;
}

interface EditAssessmentFormProps {
  session: AssessmentSession;
  classes: Class[];
  students: Student[];
  assessmentCategories: AssessmentCategory[];
  existingScores: RegularScore[] | AcademicAgeScore[];
  userId: string;
  isAcademicAgeAssessment: boolean;
}

export function EditAssessmentForm({
  session,
  classes,
  students,
  assessmentCategories,
  existingScores,
  userId,
  isAcademicAgeAssessment
}: EditAssessmentFormProps) {
  const [scores, setScores] = useState<ScoresState>({});
  const [academicAgeScores, setAcademicAgeScores] = useState<AcademicAgeScoresState>({});
  const [remarks, setRemarks] = useState(session.remarks || "");
  const [testDate, setTestDate] = useState(session.test_date);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Initialize scores from existing data
  useEffect(() => {
    if (isAcademicAgeAssessment) {
      // Initialize academic age scores
      const initialScores: AcademicAgeScoresState = {};
      
      students.forEach(student => {
        const existingScore = existingScores.find(score => 
          (score as AcademicAgeScore).student_id === student.id
        ) as AcademicAgeScore | undefined;
        
        initialScores[student.id] = {
          id: existingScore?.id,
          rawScore: existingScore ? String(existingScore.raw_score) : "",
          academicAge: existingScore ? existingScore.academic_age : "",
          chronologicalAge: existingScore ? existingScore.chronological_age : 
            (student.date_of_birth ? calculateChronologicalAge(student.date_of_birth, testDate) : ""),
          ageDifference: existingScore ? existingScore.age_difference : "",
          isDeficit: existingScore ? existingScore.is_deficit : false
        };
      });
      
      setAcademicAgeScores(initialScores);
    } else {
      // Initialize regular scores
      const initialScores: ScoresState = {};
      
      students.forEach(student => {
        initialScores[student.id] = {};
        
        const studentScores = existingScores.filter(score => 
          (score as RegularScore).student_id === student.id
        ) as RegularScore[];
        
        studentScores.forEach(score => {
          if (initialScores[student.id]) {
            initialScores[student.id][score.component_id] = String(score.raw_score);
          }
        });
      });
      
      setScores(initialScores);
    }
  }, [students, existingScores, isAcademicAgeAssessment, testDate]);

  // Get current assessment type
  const getCurrentAssessmentType = () => {
    const category = assessmentCategories.find(cat => 
      cat.types.some(type => type.id === session.assessment_type_id)
    );
    
    if (!category) return null;
    
    return category.types.find(type => type.id === session.assessment_type_id) || null;
  };

  // Get components for current assessment type
  const getCurrentComponents = () => {
    const assessmentType = getCurrentAssessmentType();
    return assessmentType ? assessmentType.components : [];
  };

  // Helper function to calculate cognitive readiness score for a student
  const getCognitiveReadinessScore = (studentId: string): number => {
    const components = getCurrentComponents();
    
    // Find the component IDs for Reasoning, Numerical, and Gestalt
    const reasoningComponent = components.find(c => c.name === "Reasoning");
    const numericalComponent = components.find(c => c.name === "Numerical");
    const gestaltComponent = components.find(c => c.name === "Gestalt");
    
    if (!reasoningComponent || !numericalComponent || !gestaltComponent) {
      return 0; // Return 0 if any required component is missing
    }
    
    // Get raw scores for these components
    const reasoningRaw = scores[studentId]?.[reasoningComponent.id];
    const numericalRaw = scores[studentId]?.[numericalComponent.id];
    const gestaltRaw = scores[studentId]?.[gestaltComponent.id];
    
    // Check if all scores are available
    if (!reasoningRaw || !numericalRaw || !gestaltRaw) {
      return 0; // Return 0 if any score is missing
    }
    
    // Convert to numbers and calculate
    return calculateCognitiveReadinessFromRawScores(
      parseInt(reasoningRaw, 10),
      parseInt(numericalRaw, 10),
      parseInt(gestaltRaw, 10)
    );
  };

  // Order components
  const getOrderedComponents = (components: Component[]): Component[] => {
    const componentOrder = [
      "Visual Perception", // 1. Perception
      "Spatial",           // 2. Spatial
      "Reasoning",         // 3. Reasoning
      "Numerical",         // 4. Numerical
      "Gestalt",           // 5. Gestalt
      "Co-ordination",     // 6. Co-ordination
      "Memory",            // 7. Memory
      "Verbal Comprehension" // 8. English Verbal comprehension
    ];
    
    return [...components].sort((a, b) => {
      const indexA = componentOrder.indexOf(a.name);
      const indexB = componentOrder.indexOf(b.name);
      return indexA - indexB;
    });
  };

  // Handle score change for regular assessments
  const handleScoreChange = (studentId: string, componentId: string, value: string) => {
    setScores(prevScores => ({
      ...prevScores,
      [studentId]: {
        ...(prevScores[studentId] || {}),
        [componentId]: value
      }
    }));
  };

  // Handle raw score changes for academic age assessments
  const handleAcademicAgeScoreChange = (studentId: string, value: string) => {
    const rawScore = value === "" ? "" : parseInt(value, 10);
    
    // Get student
    const student = students.find(s => s.id === studentId);
    if (!student || !student.date_of_birth) return;
    
    // Calculate chronological age
    const chronologicalAge = calculateChronologicalAge(student.date_of_birth, testDate);
    
    // Calculate academic age based on assessment type
    let academicAge = "";
    if ((session.assessment_types.name === "YOUNG Maths A Assessment" || session.assessment_types.name === "YOUNG Maths B Assessment") && rawScore !== "") {
      academicAge = convertToMathsAge(rawScore as number);
    } else if ((session.assessment_types.name === "Schonell Spelling A" || session.assessment_types.name === "Schonell Spelling B") && rawScore !== "") {
      academicAge = convertToSpellingAge(rawScore as number);
    } else if ((session.assessment_types.name === "SPAR Reading Assessment A" || session.assessment_types.name === "SPAR Reading Assessment B") && rawScore !== "") {
      academicAge = convertToReadingAge(rawScore as number);
    } else if ((session.assessment_types.name === "Basic Number Screening Test 5th Edition Test A" || session.assessment_types.name === "Basic Number Screening Test 5th Edition Test B") && rawScore !== "") {
      academicAge = convertToBNSTAge(rawScore as number);
    } else if (session.assessment_types.name === "Burt Word Reading Test" && rawScore !== "") {
      academicAge = convertToBurtReadingLevel(rawScore as number);
    } else if (session.assessment_types.name === "Daniels & Daick Graded Test of Reading Experience" && rawScore !== "") {
      academicAge = convertToDanielsAndDaickAge(rawScore as number);
    } else if (session.assessment_types.name === "Daniels & Daick Graded Spelling Test" && rawScore !== "") {
      academicAge = convertToDanielsAndDaickSpellingAge(rawScore as number);
    } else if (session.assessment_types.name === "Vernon Graded Arithmetic Mathematics Test" && rawScore !== "") {
      academicAge = convertToVernonMathsAge(rawScore as number);
    } else if (session.assessment_types.name === "Schonell Reading Test" && rawScore !== "") {
      academicAge = convertToSchonellReadingAge(rawScore as number);
    } else if (session.assessment_types.name === "One-Minute Reading Test" && rawScore !== "") {
      academicAge = convertToOneMinuteReadingAge(rawScore as number);
    } else if ((session.assessment_types.name === "Young's Group Reading Test A" || session.assessment_types.name === "Young's Group Reading Test B") && rawScore !== "") {
      academicAge = convertToYoungsGroupReadingAge(rawScore as number);
    }
    
    // Calculate difference and deficit
    const ageDifference = academicAge && chronologicalAge 
      ? calculateAgeDifference(academicAge, chronologicalAge)
      : "";
    
    const isDeficitValue = academicAge && chronologicalAge
      ? isDeficit(academicAge, chronologicalAge)
      : false;
    
    setAcademicAgeScores(prevScores => {
      const existingScore = prevScores[studentId] || {};
      
      return {
        ...prevScores,
        [studentId]: {
          ...existingScore,
          rawScore: value,
          academicAge,
          chronologicalAge,
          ageDifference,
          isDeficit: isDeficitValue
        }
      };
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, studentId: string, componentId: string, studentIndex: number, componentIndex: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      // Get all components
      const components = getOrderedComponents(getCurrentComponents());
      
      // Try to move to the next student's input for the same component
      if (studentIndex < students.length - 1) {
        const nextStudentId = students[studentIndex + 1].id;
        const nextInput = document.querySelector(`input[data-student-id="${nextStudentId}"][data-component-id="${componentId}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          return;
        }
      }
      
      // If we're at the last student, try to move to the first student of the next component
      if (componentIndex < components.length - 1) {
        const nextComponentId = components[componentIndex + 1].id;
        const nextInput = document.querySelector(`input[data-student-id="${students[0].id}"][data-component-id="${nextComponentId}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          return;
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      // Try to move to the previous student's input for the same component
      if (studentIndex > 0) {
        const prevStudentId = students[studentIndex - 1].id;
        const prevInput = document.querySelector(`input[data-student-id="${prevStudentId}"][data-component-id="${componentId}"]`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          return;
        }
      }
      
      // If we're at the first student, try to move to the last student of the previous component
      const components = getOrderedComponents(getCurrentComponents());
      if (componentIndex > 0) {
        const prevComponentId = components[componentIndex - 1].id;
        const prevInput = document.querySelector(`input[data-student-id="${students[students.length - 1].id}"][data-component-id="${prevComponentId}"]`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          return;
        }
      }
    }
  };

  // Handle academic age keyboard navigation
  const handleAcademicAgeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, studentId: string, studentIndex: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      // Move to the next student's input
      if (studentIndex < students.length - 1) {
        const nextStudentId = students[studentIndex + 1].id;
        const nextInput = document.querySelector(`input[data-student-id="${nextStudentId}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      // Move to the previous student's input
      if (studentIndex > 0) {
        const prevStudentId = students[studentIndex - 1].id;
        const prevInput = document.querySelector(`input[data-student-id="${prevStudentId}"]`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  };

  // Add a function to handle test date changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTestDate(newDate);
    
    // If this is an academic age assessment, we need to recalculate all chronological ages
    if (isAcademicAgeAssessment) {
      // Create a new object to avoid mutating the original state
      const updatedScores: AcademicAgeScoresState = {};
      
      // Update each student's record
      Object.keys(academicAgeScores).forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        const currentScore = academicAgeScores[studentId];
        
        if (student?.date_of_birth && currentScore.rawScore) {
          // Recalculate chronological age with the new date
          const chronologicalAge = calculateChronologicalAge(student.date_of_birth, newDate);
          const academicAge = currentScore.academicAge;
          const ageDiff = calculateAgeDifference(academicAge, chronologicalAge);
          const deficit = isDeficit(academicAge, chronologicalAge);
          
          // Create updated record
          updatedScores[studentId] = {
            ...currentScore,
            chronologicalAge,
            ageDifference: ageDiff,
            isDeficit: deficit
          };
        } else {
          // Keep the original record
          updatedScores[studentId] = { ...currentScore };
        }
      });
      
      // Set the new state
      setAcademicAgeScores(updatedScores);
    }
  };

  // Handle update for regular assessment scores
  const handleUpdateRegularScores = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const supabase = createClient();
      
      console.log('Updating assessment with date:', testDate);
      
      // 1. First, update the assessment session to save the date and remarks
      const { error: sessionError } = await supabase
        .from('assessment_sessions')
        .update({ 
          remarks,
          test_date: testDate
        })
        .eq('id', session.id);
      
      if (sessionError) throw new Error(sessionError.message);
      
      // 2. Process and save student scores
      // Get existing score records to compare against
      const existingScoreRecords = existingScores as RegularScore[];
      
      // Prepare scores for update
      const scoresToUpdate = [];
      const scoresToInsert = [];
      const components = getCurrentComponents();
      
      for (const student of students) {
        for (const component of components) {
          const rawScore = scores[student.id]?.[component.id];
          
          if (rawScore) {
            // Calculate standardized score
            const rawScoreNumber = parseFloat(rawScore);
            const standardizedScore = convertToStandardizedScore(component.name, rawScoreNumber);
            
            // Check if this score already exists
            const existingScoreRecord = existingScoreRecords.find(
              s => s.student_id === student.id && s.component_id === component.id
            );
            
            if (existingScoreRecord) {
              // Update existing record - include all required fields for upsert
              scoresToUpdate.push({
                id: existingScoreRecord.id,
                student_id: student.id,
                component_id: component.id,
                session_id: session.id,
                raw_score: rawScoreNumber,
                standardized_score: standardizedScore,
                updated_at: new Date().toISOString()
              });
            } else {
              // Insert new record
              scoresToInsert.push({
                session_id: session.id,
                student_id: student.id,
                component_id: component.id,
                raw_score: rawScoreNumber,
                standardized_score: standardizedScore
              });
            }
          }
        }
      }
      
      // Update existing scores
      if (scoresToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('student_assessment_scores')
          .upsert(scoresToUpdate);
          
        if (updateError) throw new Error(updateError.message);
      }
      
      // Insert new scores
      if (scoresToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('student_assessment_scores')
          .insert(scoresToInsert);
          
        if (insertError) throw new Error(insertError.message);
      }
      
      setSuccess('Assessment scores updated successfully!');
      
      // Redirect back to assessments page after successful update
      setTimeout(() => {
        router.push('/protected/assessments');
        router.refresh();
      }, 1500);
      
    } catch (err) {
      console.error('Error updating assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update assessment');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update for academic age assessment scores
  const handleUpdateAcademicAgeScores = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const supabase = createClient();
      
      console.log('Updating academic age assessment with date:', testDate);
      
      // 1. First, update the assessment session with remarks and test date
      const { error: sessionError } = await supabase
        .from('assessment_sessions')
        .update({ 
          remarks,
          test_date: testDate
        })
        .eq('id', session.id);
      
      if (sessionError) throw new Error(sessionError.message);
      
      // 2. Update/Insert academic age scores
      // Determine test type
      let academicAgeType: 'maths' | 'reading' | 'spelling' | null = null;
      if (session.assessment_types.name === "YOUNG Maths A Assessment" || session.assessment_types.name === "YOUNG Maths B Assessment") academicAgeType = 'maths';
      if (session.assessment_types.name === "Basic Number Screening Test 5th Edition Test A" || session.assessment_types.name === "Basic Number Screening Test 5th Edition Test B") academicAgeType = 'maths';
      if (session.assessment_types.name === "Vernon Graded Arithmetic Mathematics Test") academicAgeType = 'maths';
      if (session.assessment_types.name === "SPAR Reading Assessment A" || session.assessment_types.name === "SPAR Reading Assessment B") academicAgeType = 'reading';
      if (session.assessment_types.name === "Burt Word Reading Test") academicAgeType = 'reading';
      if (session.assessment_types.name === "Daniels & Daick Graded Test of Reading Experience") academicAgeType = 'reading';
      if (session.assessment_types.name === "Schonell Reading Test") academicAgeType = 'reading';
      if (session.assessment_types.name === "One-Minute Reading Test") academicAgeType = 'reading';
      if (session.assessment_types.name === "Young's Group Reading Test A" || session.assessment_types.name === "Young's Group Reading Test B") academicAgeType = 'reading';
      if (session.assessment_types.name === "Schonell Spelling A" || session.assessment_types.name === "Schonell Spelling B") academicAgeType = 'spelling';
      if (session.assessment_types.name === "Daniels & Daick Graded Spelling Test") academicAgeType = 'spelling';
      
      if (!academicAgeType) {
        throw new Error('Invalid academic age assessment type');
      }
      
      // Get existing score records
      const existingScoreRecords = existingScores as AcademicAgeScore[];
      
      // Prepare scores for update
      const scoresToUpdate = [];
      const scoresToInsert = [];
      
      for (const student of students) {
        const scoreData = academicAgeScores[student.id];
        
        if (scoreData && scoreData.rawScore) {
          const rawScore = parseInt(scoreData.rawScore, 10);
          
          const scoreObject = {
            student_id: student.id,
            session_id: session.id,
            test_type: academicAgeType,
            raw_score: rawScore,
            academic_age: scoreData.academicAge,
            chronological_age: scoreData.chronologicalAge,
            age_difference: scoreData.ageDifference,
            is_deficit: scoreData.isDeficit,
            updated_at: new Date().toISOString()
          };
          
          // Check if score exists already
          const existingScore = existingScoreRecords.find(s => s.student_id === student.id);
          
          if (existingScore) {
            // Update existing record - preserve the ID
            scoresToUpdate.push({
              ...scoreObject,
              id: existingScore.id,
            });
          } else {
            // Insert new record
            scoresToInsert.push(scoreObject);
          }
        }
      }
      
      // Update existing scores
      if (scoresToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('student_academic_ages')
          .upsert(scoresToUpdate);
          
        if (updateError) throw new Error(updateError.message);
      }
      
      // Insert new scores
      if (scoresToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('student_academic_ages')
          .insert(scoresToInsert);
          
        if (insertError) throw new Error(insertError.message);
      }
      
      setSuccess('Academic age scores updated successfully!');
      
      // Redirect back to assessments page after successful update
      setTimeout(() => {
        router.push('/protected/assessments');
        router.refresh();
      }, 1500);
      
    } catch (err) {
      console.error('Error updating academic age scores:', err);
      setError(err instanceof Error ? err.message : 'Failed to update assessment');
    } finally {
      setSubmitting(false);
    }
  };

  // Format academic age display
  const getFormattedAcademicAge = (academicAge: string): string => {
    if (!academicAge) return "";
    
    // Most assessments use convertTenthsToYearsMonths, but some already return formatted strings
    if (session.assessment_types.name === "YOUNG Maths A Assessment" || session.assessment_types.name === "YOUNG Maths B Assessment") {
      return convertTenthsToYearsMonths(academicAge);
    } else if (session.assessment_types.name === "SPAR Reading Assessment A" || session.assessment_types.name === "SPAR Reading Assessment B") {
      return convertTenthsToYearsMonths(academicAge);
    } else if (session.assessment_types.name === "Schonell Spelling A" || session.assessment_types.name === "Schonell Spelling B") {
      return convertTenthsToYearsMonths(academicAge);
    } else {
      // For other assessments that already return formatted strings (like "7 years 3 months" or "7.03")
      // Return as is - they're already properly formatted
      return academicAge;
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4 text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 p-4 rounded-md mb-4 text-green-700">
          {success}
        </div>
      )}
    
      <Card className="bg-white overflow-hidden shadow-sm rounded-lg px-6 pt-6 pb-16">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Edit Assessment</h2>
            <p className="text-gray-500 text-sm mt-1">
              {isAcademicAgeAssessment ? 
                `Editing ${session.assessment_types.name} scores for ${session.classes.class_name}` : 
                `Editing ${session.assessment_types.name} scores for ${session.classes.class_name}`}
            </p>
          </div>
          
          {/* Assessment Test Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Date</label>
              <div className="relative">
                <input 
                  type="date"
                  value={testDate}
                  onChange={handleDateChange}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Score Form */}
          <div>
            <h3 className="text-lg font-medium mb-4">Student Scores</h3>
            
            {isAcademicAgeAssessment ? (
              // Academic Age Assessment Input Form
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Student</th>
                      <th className="py-2 px-4 text-center text-sm font-medium text-gray-500">
                        Raw Score
                        <div className="text-xs text-gray-400">
                          {(session.assessment_types.name === "YOUNG Maths A Assessment" || session.assessment_types.name === "YOUNG Maths B Assessment") && "(0-56)"}
                          {(session.assessment_types.name === "SPAR Reading Assessment A" || session.assessment_types.name === "SPAR Reading Assessment B") && "(0-42)"}
                          {(session.assessment_types.name === "Schonell Spelling A" || session.assessment_types.name === "Schonell Spelling B") && "(0-80)"}
                        </div>
                      </th>
                      <th className="py-2 px-4 text-center text-sm font-medium text-gray-500">Academic Age</th>
                      <th className="py-2 px-4 text-center text-sm font-medium text-gray-500">Chronological Age</th>
                      <th className="py-2 px-4 text-center text-sm font-medium text-gray-500">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, studentIndex) => (
                      <tr key={student.id} className="border-b">
                        <td className="py-3 px-4 text-sm">{student.name}</td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            value={academicAgeScores[student.id]?.rawScore || ""}
                            onChange={(e) => handleAcademicAgeScoreChange(student.id, e.target.value)}
                            onKeyDown={(e) => handleAcademicAgeKeyDown(e, student.id, studentIndex)}
                            min={0}
                            max={
                              (session.assessment_types.name === "YOUNG Maths A Assessment" || session.assessment_types.name === "YOUNG Maths B Assessment") ? 56 :
                              (session.assessment_types.name === "SPAR Reading Assessment A" || session.assessment_types.name === "SPAR Reading Assessment B") ? 42 :
                              80
                            }
                            className="w-20 text-center rounded-md border border-input px-3 py-1"
                            data-student-id={student.id}
                          />
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {academicAgeScores[student.id]?.academicAge ? 
                            getFormattedAcademicAge(academicAgeScores[student.id].academicAge) : ''}
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {academicAgeScores[student.id]?.chronologicalAge ? 
                            convertTenthsToYearsMonths(academicAgeScores[student.id].chronologicalAge) : ''}
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {academicAgeScores[student.id]?.ageDifference && (
                            <Badge
                              className={
                                academicAgeScores[student.id].isDeficit
                                  ? "bg-red-100 text-red-800 hover:bg-red-100"
                                  : "bg-green-100 text-green-800 hover:bg-green-100"
                              }
                            >
                              {academicAgeScores[student.id].isDeficit ? '-' : ''}
                              {convertTenthsToYearsMonths(academicAgeScores[student.id].ageDifference.replace('-', ''))}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Regular Assessment Input Form
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Student</th>
                      {getOrderedComponents(getCurrentComponents()).map((component) => (
                        <th key={component.id} className="py-2 px-4 text-center text-sm font-medium text-gray-500">
                          {component.name}
                          <div className="text-xs text-gray-400">
                            {component.name === "Visual Perception" && "(0-10)"}
                            {component.name === "Spatial" && "(0-10)"}
                            {component.name === "Reasoning" && "(0-10)"}
                            {component.name === "Numerical" && "(0-10)"}
                            {component.name === "Gestalt" && "(0-100)"}
                            {component.name === "Co-ordination" && "(0-30)"}
                            {component.name === "Memory" && "(0-10)"}
                            {component.name === "Verbal Comprehension" && "(0-20)"}
                          </div>
                        </th>
                      ))}
                      <th className="py-2 px-4 text-center text-sm font-medium text-red-500">
                        Level of Cognitive<br />Readiness in<br />Language of Assessment
                        <div className="text-xs text-red-400">(Calculated)</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, studentIndex) => (
                      <tr key={student.id} className="border-b">
                        <td className="py-3 px-4 text-sm">{student.name}</td>
                        {getOrderedComponents(getCurrentComponents()).map((component, componentIndex) => (
                          <td key={component.id} className="py-3 px-4 text-center">
                            <input
                              type="number"
                              value={scores[student.id]?.[component.id] || ""}
                              onChange={(e) => handleScoreChange(student.id, component.id, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(
                                e, 
                                student.id, 
                                component.id, 
                                studentIndex, 
                                componentIndex
                              )}
                              min={component.min_score || 0}
                              max={component.max_score}
                              className="w-20 text-center rounded-md border border-input px-3 py-1"
                              data-student-id={student.id}
                              data-component-id={component.id}
                            />
                          </td>
                        ))}
                        <td className="py-3 px-4 text-center">
                          <div className="w-20 h-8 flex items-center justify-center bg-gray-50 rounded-md border">
                            <span className={`text-sm font-medium ${
                              getCognitiveReadinessScore(student.id) > 0 ? 'text-red-600' : 'text-gray-400'
                            }`}>
                              {getCognitiveReadinessScore(student.id) > 0 ? getCognitiveReadinessScore(student.id) : '-'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Notes & Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Add any additional notes or observations..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="h-24"
            />
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/protected/assessments')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={isAcademicAgeAssessment ? handleUpdateAcademicAgeScores : handleUpdateRegularScores}
              disabled={submitting}
              className="bg-[#f6822d] hover:bg-orange-600 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Assessment'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
} 