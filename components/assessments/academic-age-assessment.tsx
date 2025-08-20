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
  convertToBNSTAge,
  convertToBurtReadingLevel,
  convertToDanielsAndDaickAge,
  convertToDanielsAndDaickSpellingAge,
  convertToVernonMathsAge,
  convertToSchonellReadingAge,
  convertToOneMinuteReadingAge,
  convertToYoungsGroupReadingAge,
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
  onSaveComplete: (academicAgeScores: AcademicAgeScoresState, remarks: string) => void;
  onCancel: () => void;
}

export function AcademicAgeAssessment({
  students,
  testType,
  testTypeName,
  testDate,
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
      // Check which mathematics test it is
      if (testTypeName.includes("Basic Number Screening Test")) {
        academicAge = convertToBNSTAge(rawScore as number);
      } else if (testTypeName.includes("Vernon Graded Arithmetic")) {
        academicAge = convertToVernonMathsAge(rawScore as number);
      } else {
        academicAge = convertToMathsAge(rawScore as number);
      }
    } else if (testType === 'spelling' && rawScore !== "") {
      // Check which spelling test it is
      if (testTypeName.includes("Daniels & Daick")) {
        academicAge = convertToDanielsAndDaickSpellingAge(rawScore as number);
      } else {
        academicAge = convertToSpellingAge(rawScore as number);
      }
    } else if (testType === 'reading' && rawScore !== "") {
      // Check which reading test it is
      if (testTypeName.includes("Burt Word Reading Test")) {
        academicAge = convertToBurtReadingLevel(rawScore as number);
      } else if (testTypeName.includes("Daniels & Daick")) {
        academicAge = convertToDanielsAndDaickAge(rawScore as number);
      } else if (testTypeName.includes("Schonell Reading Test")) {
        academicAge = convertToSchonellReadingAge(rawScore as number);
      } else if (testTypeName.includes("One-Minute Reading Test")) {
        academicAge = convertToOneMinuteReadingAge(rawScore as number);
      } else if (testTypeName.includes("Young's Group Reading Test")) {
        academicAge = convertToYoungsGroupReadingAge(rawScore as number);
      } else {
        // Use the years.tenths format for SPAR Reading tests
        academicAge = convertToReadingAge(rawScore as number);
      }
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

  // Handle keyboard navigation between input fields
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, studentId: string, studentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's a next student, focus on its input field
      if (studentIndex < students.length - 1) {
        const nextStudentId = students[studentIndex + 1].id;
        const nextInput = document.querySelector(`input[data-student-id="${nextStudentId}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Handle save scores
  const handleSaveScores = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Instead of saving to database, pass scores back to parent component
      onSaveComplete(scores, remarks);
    } catch (err) {
      console.error('Error handling academic age scores:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Get max score hint based on test type
  const getMaxScoreHint = () => {
    if (testType === 'maths') {
      if (testTypeName.includes("Basic Number Screening Test")) {
        return '(0-50)';
      } else if (testTypeName.includes("Vernon Graded Arithmetic")) {
        return '(3-53)';
      } else {
        return '(0-56)';
      }
    } else if (testType === 'reading') {
      if (testTypeName.includes("Burt Word Reading Test")) {
        return '(2-110)';
      } else if (testTypeName.includes("Daniels & Daick")) {
        return '(0-50+)';
      } else if (testTypeName.includes("Schonell Reading Test")) {
        return '(0-99)';
      } else if (testTypeName.includes("One-Minute Reading Test")) {
        return '(31-120)';
      } else if (testTypeName.includes("Young's Group Reading Test")) {
        return '(5-44)';
      } else {
        return '(0-42)';
      }
    } else if (testType === 'spelling') {
      if (testTypeName.includes("Daniels & Daick")) {
        return '(0-40)';
      } else {
        return '(0-80)';
      }
    }
    return '';
  };
  
  // Get test type specific help text
  const getTestTypeHelpText = () => {
    if (testType === 'maths') {
      if (testTypeName.includes("Basic Number Screening Test")) {
        return 'Raw scores from the Basic Number Screening Test are converted to number ages in years.months format and compared with chronological age.';
      } else if (testTypeName.includes("Vernon Graded Arithmetic")) {
        return 'Raw scores from the Vernon Graded Arithmetic Mathematics Test are converted to mathematics ages in years.months format using Canadian norms and compared with chronological age.';
      } else {
        return 'Raw scores are converted to academic ages in years.tenths format and compared with chronological age.';
      }
    } else if (testType === 'spelling') {
      if (testTypeName.includes("Daniels & Daick")) {
        return 'Raw scores from the Daniels & Daick Graded Spelling Test are converted to spelling ages in years.months format and compared with chronological age.';
      } else {
        return 'Raw scores from the Schonell Spelling Assessment are directly converted to spelling ages in years.months format.';
      }
    } else if (testType === 'reading') {
      if (testTypeName.includes("Burt Word Reading Test")) {
        return 'Raw scores from the Burt Word Reading Test are converted to reading levels in years.months format and compared with chronological age.';
      } else if (testTypeName.includes("Daniels & Daick")) {
        return 'Raw scores from the Daniels & Daick Graded Test of Reading Experience are converted to reading experience ages in years.months format and compared with chronological age.';
      } else if (testTypeName.includes("Schonell Reading Test")) {
        return 'Raw scores from the Schonell Reading Test are converted to reading ages in years.months format using a scoring matrix and compared with chronological age.';
      } else if (testTypeName.includes("One-Minute Reading Test")) {
        return 'Raw scores from the One-Minute Reading Test are converted to reading ages in years.months format and compared with chronological age.';
      } else if (testTypeName.includes("Young's Group Reading Test")) {
        return 'Raw scores from Young\'s Group Reading Test are converted to reading quotient ages in years.months format and compared with chronological age.';
      } else {
        return 'Raw scores from the SPAR Reading Assessment are converted to reading ages in years.tenths format.';
      }
    }
    return 'Scores will be converted to academic ages and compared to chronological ages.';
  };
  
  // Get years and months representation for academic age
  const getFormattedAcademicAge = (academicAge: string, studentId: string) => {
    if (!academicAge) return "";
    
    if (testType === 'spelling') {
      return convertSpellingAgeToYearsMonths(academicAge);
    } else if (testType === 'reading') {
      if (testTypeName.includes("Burt Word Reading Test")) {
        // Burt outputs years.months format like spelling
        return convertSpellingAgeToYearsMonths(academicAge);
      } else if (testTypeName.includes("Daniels & Daick")) {
        // Daniels & Daick outputs years.months format like spelling
        return convertSpellingAgeToYearsMonths(academicAge);
      } else if (testTypeName.includes("Schonell Reading Test")) {
        // Schonell outputs years.months format like spelling
        return convertSpellingAgeToYearsMonths(academicAge);
      } else if (testTypeName.includes("One-Minute Reading Test")) {
        // One-Minute Reading Test outputs years.months format like spelling
        return convertSpellingAgeToYearsMonths(academicAge);
      } else if (testTypeName.includes("Young's Group Reading Test")) {
        // Young's Group Reading Test outputs years.months format like spelling
        return convertSpellingAgeToYearsMonths(academicAge);
      } else {
        return convertReadingAgeToYearsMonths(academicAge);
      }
    } else if (testType === 'maths' && (testTypeName.includes("Basic Number Screening Test") || testTypeName.includes("Vernon Graded Arithmetic"))) {
      // BNST and Vernon output years.months format like spelling
      return convertSpellingAgeToYearsMonths(academicAge);
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
  
  // Format age difference for display (always show years and months)
  const formatAgeDifference = (ageDifferenceMonths: string): string => {
    if (!ageDifferenceMonths || ageDifferenceMonths === "Cannot calculate") return ageDifferenceMonths;
    
    const isNegative = ageDifferenceMonths.startsWith('-');
    const cleanValue = isNegative ? ageDifferenceMonths.substring(1) : ageDifferenceMonths;
    
    const parts = cleanValue.split('.');
    if (parts.length !== 2) return ageDifferenceMonths;
    
    const years = parseInt(parts[0], 10);
    const months = parseInt(parts[1], 10);
    
    if (years === 0 && months === 0) return "0 years 0 months";
    
    // Always show both years and months in consistent format
    const result = `${years} years ${months} months`;
    
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
            <SimpleTooltip content="Enter the raw score for each student. The system will automatically calculate academic age and compare with chronological age.">
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
                    {testType === 'spelling' || (testType === 'maths' && (testTypeName.includes("Basic Number Screening Test") || testTypeName.includes("Vernon Graded Arithmetic"))) || (testType === 'reading' && (testTypeName.includes("Burt Word Reading Test") || testTypeName.includes("Daniels & Daick") || testTypeName.includes("Schonell Reading Test") || testTypeName.includes("One-Minute Reading Test") || testTypeName.includes("Young's Group Reading Test"))) ? '(Years.Months)' : testType === 'reading' ? '(Years.Tenths)' : '(Years.Tenths)'}
                  </div>
                </th>
                <th className="py-4 px-2 text-center font-medium">
                  <div className="text-sm">Academic Age</div>
                  <div className="text-xs text-gray-500">(Years & Months)</div>
                </th>
                <th className="py-4 px-2 text-center font-medium">
                  <div className="text-sm">Chronological Age</div>
                  <div className="text-xs text-gray-500">(Years.Tenths)</div>
                </th>
                <th className="py-4 px-2 text-center font-medium">
                  <div className="text-sm">Chronological Age</div>
                  <div className="text-xs text-gray-500">(Years & Months)</div>
                </th>
                <th className="py-4 px-2 text-center font-medium">
                  <div className="text-sm">Difference</div>
                  <div className="text-xs text-gray-500">(Years.Tenths)</div>
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
                        min={
                          testType === 'maths' && testTypeName.includes("Vernon Graded Arithmetic") ? 3 :
                          testType === 'reading' && testTypeName.includes("One-Minute Reading Test") ? 31 :
                          testType === 'reading' && testTypeName.includes("Young's Group Reading Test") ? 5 : 0
                        }
                        max={testType === 'maths' ? (testTypeName.includes("Basic Number Screening Test") ? 50 : testTypeName.includes("Vernon Graded Arithmetic") ? 53 : 56) : testType === 'reading' ? (testTypeName.includes("Burt Word Reading Test") ? 110 : testTypeName.includes("Daniels & Daick") ? 100 : testTypeName.includes("Schonell Reading Test") ? 99 : testTypeName.includes("One-Minute Reading Test") ? 120 : testTypeName.includes("Young's Group Reading Test") ? 44 : 42) : testType === 'spelling' ? (testTypeName.includes("Daniels & Daick") ? 40 : 80) : 80}
                        value={scores[student.id]?.rawScore || ""}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, student.id, students.indexOf(student))}
                        data-student-id={student.id}
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
                      {scores[student.id]?.chronologicalAge || ""}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {scores[student.id]?.chronologicalAgeMonths ? 
                        formatChronologicalAge(scores[student.id].chronologicalAgeMonths) : ""}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {scores[student.id]?.ageDifference ? (
                        <span className={`font-medium ${scores[student.id].isDeficit ? 'text-red-600' : 'text-green-600'}`}>
                          {scores[student.id].ageDifference}
                        </span>
                      ) : ""}
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
                  <td colSpan={8} className="py-6 text-center text-gray-500">
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