"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { 
  convertToMathsAge,
  convertToReadingAge,
  convertToReadingAgeMonths,
  convertToSpellingAge,
  convertTenthsToYearsMonths,
  convertSpellingAgeToYearsMonths,
  convertReadingAgeToYearsMonths,
  calculateChronologicalAge,
  calculateAgeDifference,
  calculateAgeDifferenceInMonths,
  isDeficit
} from "@/utils/academic-age-utils";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Info } from "lucide-react";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";

interface Student {
  id: string;
  name: string;
  student_id?: string;
  date_of_birth?: string | null;
}

interface AcademicAgeScoresState {
  [studentId: string]: {
    rawScore: string;
    academicAge: string;
    chronologicalAge: string;
    chronologicalAgeMonths: string;
    ageDifference: string;
    ageDifferenceMonths: string;
    isDeficit: boolean;
  };
}

interface AcademicAgeAssessmentProps {
  students: Student[];
  testType: 'maths' | 'reading' | 'spelling';
  testTypeName: string;
  testDate: string;
  sessionId: string;
  onSaveComplete: () => void;
  onCancel: () => void;
}

export function AcademicAgeAssessment({
  students,
  testType,
  testTypeName,
  testDate,
  sessionId,
  onSaveComplete,
  onCancel
}: AcademicAgeAssessmentProps) {
  const [scores, setScores] = useState<AcademicAgeScoresState>({});
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize student scores
  useEffect(() => {
    const initialScores: AcademicAgeScoresState = {};
    
    students.forEach(student => {
      initialScores[student.id] = {
        rawScore: "",
        academicAge: "",
        chronologicalAge: student.date_of_birth 
          ? calculateChronologicalAge(student.date_of_birth, testDate)
          : "",
        chronologicalAgeMonths: student.date_of_birth 
          ? calculateChronologicalAge(student.date_of_birth, testDate, 'months')
          : "",
        ageDifference: "",
        ageDifferenceMonths: "",
        isDeficit: false
      };
    });
    
    setScores(initialScores);
  }, [students, testDate]);

  // Handle raw score changes
  const handleScoreChange = (studentId: string, value: string) => {
    const rawScore = value === "" ? "" : parseInt(value, 10);
    
    // Get student
    const student = students.find(s => s.id === studentId);
    if (!student || !student.date_of_birth) return;
    
    // Calculate chronological age in both formats
    const chronologicalAge = calculateChronologicalAge(student.date_of_birth, testDate);
    const chronologicalAgeMonths = calculateChronologicalAge(student.date_of_birth, testDate, 'months');
    
    // Calculate academic age based on assessment type
    let academicAge = "";
    if (testType === 'maths' && rawScore !== "") {
      academicAge = convertToMathsAge(rawScore as number);
    } else if (testType === 'spelling' && rawScore !== "") {
      academicAge = convertToSpellingAge(rawScore as number);
    } else if (testType === 'reading' && rawScore !== "") {
      // Use the years.tenths format for calculations
      academicAge = convertToReadingAge(rawScore as number);
    }
    
    // Calculate difference and deficit
    const ageDifference = academicAge && chronologicalAge 
      ? calculateAgeDifference(academicAge, chronologicalAge)
      : "";
    
    const ageDifferenceMonths = academicAge && chronologicalAgeMonths
      ? calculateAgeDifferenceInMonths(academicAge, chronologicalAgeMonths)
      : "";
    
    const isDeficitValue = academicAge && chronologicalAge
      ? isDeficit(academicAge, chronologicalAge)
      : false;
    
    setScores(prevScores => ({
      ...prevScores,
      [studentId]: {
        rawScore: value,
        academicAge,
        chronologicalAge,
        chronologicalAgeMonths,
        ageDifference,
        ageDifferenceMonths,
        isDeficit: isDeficitValue
      }
    }));
  };

  // Handle save scores
  const handleSaveScores = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // Prepare scores for insertion
      const scoresToInsert = [];
      
      for (const student of students) {
        const studentScore = scores[student.id];
        
        if (studentScore && studentScore.rawScore) {
          scoresToInsert.push({
            student_id: student.id,
            session_id: sessionId,
            test_type: testType,
            raw_score: parseInt(studentScore.rawScore, 10),
            academic_age: studentScore.academicAge,
            chronological_age: studentScore.chronologicalAgeMonths, // Save in months format
            age_difference: studentScore.ageDifferenceMonths, // Save difference in months format
            is_deficit: studentScore.isDeficit
          });
        }
      }
      
      // Insert academic ages
      if (scoresToInsert.length > 0) {
        // Insert into student_academic_ages table with proper typing
        const { error: agesError } = await supabase
          .from('student_academic_ages')
          .insert(scoresToInsert);
          
        if (agesError) throw new Error(agesError.message);
      }
      
      // Update session remarks if any
      if (remarks) {
        const { error: remarksError } = await supabase
          .from('assessment_sessions')
          .update({ remarks })
          .eq('id', sessionId);
          
        if (remarksError) throw new Error(remarksError.message);
      }
      
      // Notify parent of completion
      onSaveComplete();
      
    } catch (err) {
      console.error('Error saving assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to save assessment');
    } finally {
      setSubmitting(false);
    }
  };

  // Get max score hint based on test type
  const getMaxScoreHint = () => {
    if (testType === 'maths') {
      return '(0-56)';
    } else if (testType === 'reading') {
      return '(0-42)';
    } else if (testType === 'spelling') {
      return '(0-80)';
    }
    return '';
  };
  
  // Get test type specific help text
  const getTestTypeHelpText = () => {
    if (testType === 'maths') {
      return 'Raw scores are converted to academic ages in years.tenths format and compared with chronological age.';
    } else if (testType === 'spelling') {
      return 'Raw scores from the Schonell Spelling Assessment are directly converted to spelling ages in years.months format.';
    } else if (testType === 'reading') {
      return 'Raw scores from the SPAR Reading Assessment are converted to reading ages in years.tenths format.';
    }
    return 'Scores will be converted to academic ages and compared to chronological ages.';
  };
  
  // Get years and months representation for academic age
  const getFormattedAcademicAge = (academicAge: string, studentId: string) => {
    if (!academicAge) return "";
    
    if (testType === 'spelling') {
      return convertSpellingAgeToYearsMonths(academicAge);
    } else if (testType === 'reading') {
      return convertReadingAgeToYearsMonths(academicAge);
    } else {
      return convertTenthsToYearsMonths(academicAge);
    }
  };
  
  // Format chronological age for display
  const formatChronologicalAge = (chronologicalAgeMonths: string): string => {
    if (!chronologicalAgeMonths) return "";
    
    const parts = chronologicalAgeMonths.split('.');
    if (parts.length !== 2) return chronologicalAgeMonths;
    
    const years = parseInt(parts[0], 10);
    const months = parseInt(parts[1], 10);
    
    return `${years} years ${months} months`;
  };
  
  // Format age difference for display
  const formatAgeDifference = (ageDifferenceMonths: string): string => {
    if (!ageDifferenceMonths || ageDifferenceMonths === "Cannot calculate") return ageDifferenceMonths;
    
    const isNegative = ageDifferenceMonths.startsWith('-');
    const cleanValue = isNegative ? ageDifferenceMonths.substring(1) : ageDifferenceMonths;
    
    const parts = cleanValue.split('.');
    if (parts.length !== 2) return ageDifferenceMonths;
    
    const years = parseInt(parts[0], 10);
    const months = parseInt(parts[1], 10);
    
    if (years === 0 && months === 0) return "0";
    
    let result = "";
    if (years > 0) {
      result += `${years} year${years !== 1 ? 's' : ''}`;
    }
    
    if (months > 0) {
      if (result) result += ' ';
      result += `${months} month${months !== 1 ? 's' : ''}`;
    }
    
    return isNegative ? `-${result}` : result;
  };
  
  return (
    <Card className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {testTypeName} - Raw Scores
            </h2>
            <SimpleTooltip text="Enter the raw score for each student. The system will automatically calculate academic age and compare with chronological age.">
              <HelpCircle size={16} className="text-gray-400 cursor-help" />
            </SimpleTooltip>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {getTestTypeHelpText()}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-700">
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-4 px-2 text-left font-medium w-36">Student</th>
                <th className="py-4 px-2 text-center font-medium">
                  <div className="text-sm">Raw Score {getMaxScoreHint()}</div>
                </th>
                <th className="py-4 px-2 text-center font-medium">
                  <div className="text-sm">Academic Age</div>
                  <div className="text-xs text-gray-500">
                    {testType === 'spelling' ? '(Years.Months)' : testType === 'reading' ? '(Years.Tenths)' : '(Years.Tenths)'}
                  </div>
                </th>
                <th className="py-4 px-2 text-center font-medium">
                  <div className="text-sm">Academic Age</div>
                  <div className="text-xs text-gray-500">(Years & Months)</div>
                </th>
                <th className="py-4 px-2 text-center font-medium">
                  <div className="text-sm">Chronological Age</div>
                  <div className="text-xs text-gray-500">(Years & Months)</div>
                </th>
                <th className="py-4 px-2 text-center font-medium">
                  <div className="text-sm">Difference</div>
                  <div className="text-xs text-gray-500">(Years & Months)</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="py-4 px-2">{student.name}</td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        className="w-full"
                        min={0}
                        max={testType === 'maths' ? 56 : testType === 'reading' ? 42 : 80}
                        value={scores[student.id]?.rawScore || ""}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      {scores[student.id]?.academicAge || ""}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {scores[student.id]?.academicAge ? (
                        getFormattedAcademicAge(scores[student.id].academicAge, student.id)
                      ) : ""}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {scores[student.id]?.chronologicalAgeMonths ? 
                        formatChronologicalAge(scores[student.id].chronologicalAgeMonths) : ""}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {scores[student.id]?.ageDifferenceMonths ? (
                        <span className={`font-medium ${scores[student.id].isDeficit ? 'text-red-600' : 'text-green-600'}`}>
                          {formatAgeDifference(scores[student.id].ageDifferenceMonths)}
                        </span>
                      ) : ""}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No students found for this class
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4">
          <div className="mb-2">
            <label className="font-medium text-sm">Assessment Remarks</label>
            <p className="text-xs text-gray-500 mb-1">Optional notes about this assessment session</p>
          </div>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="min-h-32"
            placeholder="Add any notes or observations about this assessment session..."
          />
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Back
          </Button>
          <Button
            type="button"
            className="bg-[#f6822d] hover:bg-orange-600"
            onClick={handleSaveScores}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Assessment"}
          </Button>
        </div>
      </div>
    </Card>
  );
} 