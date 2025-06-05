"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { convertToStandardizedScore, calculateCognitiveReadinessFromRawScores } from "@/utils/assessment-utils";
import { AcademicAgeAssessment } from "./academic-age-assessment";

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
    rawScore: string;
    academicAge: string;
    chronologicalAge: string;
    chronologicalAgeMonths: string;
    ageDifference: string;
    ageDifferenceMonths: string;
    isDeficit: boolean;
  };
}

interface AssessmentRecordTabProps {
  classes: Class[];
  assessmentCategories: AssessmentCategory[];
  students: Student[];
  userId: string;
}

export function AssessmentRecordTab({ 
  classes, 
  assessmentCategories, 
  students,
  userId
}: AssessmentRecordTabProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [testDate, setTestDate] = useState<string>("");
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [classSearchQuery, setClassSearchQuery] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [typeSearchQuery, setTypeSearchQuery] = useState("");
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  
  // Define academic age assessment types
  const academicAgeTypes = [
    "YOUNG Maths A Assessment",
    "YOUNG Maths B Assessment",
    "SPAR Reading Assessment A",
    "SPAR Reading Assessment B",
    "Schonell Spelling A",
    "Schonell Spelling B",
    "Basic Number Screening Test 5th Edition Test A",
    "Basic Number Screening Test 5th Edition Test B",
    "Burt Word Reading Test",
    "Daniels & Daick Graded Test of Reading Experience",
    "Daniels & Daick Graded Spelling Test",
    "Vernon Graded Arithmetic Mathematics Test",
    "Schonell Reading Test",
    "One-Minute Reading Test",
    "Young's Group Reading Test A",
    "Young's Group Reading Test B"
  ];
  
  // Check if current assessment is an academic age type
  const isAcademicAgeAssessment = (): boolean => {
    const currentType = getCurrentAssessmentType();
    return currentType ? academicAgeTypes.includes(currentType.name) : false;
  };
  
  // Get academic age test type
  const getAcademicAgeType = (): 'maths' | 'reading' | 'spelling' | null => {
    const currentType = getCurrentAssessmentType();
    if (!currentType) return null;
    
    if (currentType.name === "YOUNG Maths A Assessment") return 'maths';
    if (currentType.name === "YOUNG Maths B Assessment") return 'maths';
    if (currentType.name === "Basic Number Screening Test 5th Edition Test A") return 'maths';
    if (currentType.name === "Basic Number Screening Test 5th Edition Test B") return 'maths';
    if (currentType.name === "Vernon Graded Arithmetic Mathematics Test") return 'maths';
    if (currentType.name === "SPAR Reading Assessment A") return 'reading';
    if (currentType.name === "SPAR Reading Assessment B") return 'reading';
    if (currentType.name === "Burt Word Reading Test") return 'reading';
    if (currentType.name === "Daniels & Daick Graded Test of Reading Experience") return 'reading';
    if (currentType.name === "Schonell Reading Test") return 'reading';
    if (currentType.name === "One-Minute Reading Test") return 'reading';
    if (currentType.name === "Young's Group Reading Test A") return 'reading';
    if (currentType.name === "Young's Group Reading Test B") return 'reading';
    if (currentType.name === "Schonell Spelling A") return 'spelling';
    if (currentType.name === "Schonell Spelling B") return 'spelling';
    if (currentType.name === "Daniels & Daick Graded Spelling Test") return 'spelling';
    
    return null;
  };
  
  // Fetch students for the selected class when class changes
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2;
    
    const fetchClassStudents = async () => {
      if (!selectedClass) {
        setClassStudents([]);
        return;
      }
      
      setError(null);
      
      try {
        const supabase = createClient();
        
        // Simplified fetch without abort controller
        console.log(`Fetching enrollments for class ID: ${selectedClass}`);
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('class_enrollments')
          .select('student_id')
          .eq('class_id', selectedClass);
          
        // Handle enrollment fetch error
        if (enrollmentsError) {
          console.error('Error fetching class enrollments:', enrollmentsError);
          
          if (!isMounted) return;
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying fetch (${retryCount}/${maxRetries})...`);
            setTimeout(fetchClassStudents, 1000);
            return;
          }
          
          setError('Failed to load enrollments for this class');
          return;
        }
        
        // Check if we have enrollments
        if (enrollments && enrollments.length > 0) {
          // Extract student IDs
          const enrolledStudentIds = enrollments.map(enrollment => enrollment.student_id);
          console.log(`Found ${enrolledStudentIds.length} enrolled students`);
          
          // Fetch student details
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('id, first_name, last_name, student_id, date_of_birth')
            .in('id', enrolledStudentIds);
            
          if (studentError) {
            console.error('Error fetching students:', studentError);
            
            if (!isMounted) return;
            
            setError('Failed to load students for this class');
            return;
          }
          
          if (!isMounted) return;
          
          const formattedStudents = studentData.map(student => ({
            id: student.id,
            name: `${student.first_name} ${student.last_name}`,
            student_id: student.student_id,
            date_of_birth: student.date_of_birth
          }));
          
          // Safely set class students
          setClassStudents(formattedStudents as Student[]);
        } else {
          if (!isMounted) return;
          setClassStudents([]);
          // Optional: You can display a message that no students are enrolled
          console.log("No students enrolled in this class");
        }
      } catch (err) {
        console.error('Error fetching class students:', err);
        
        if (!isMounted) return;
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying fetch after error (${retryCount}/${maxRetries})...`);
          setTimeout(fetchClassStudents, 1000);
          return;
        }
        
        setError('Failed to load students for this class');
      }
    };
    
    fetchClassStudents();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [selectedClass]);

  // Get the current assessment type based on selection
  const getCurrentAssessmentType = () => {
    if (!selectedCategory || !selectedType) return null;
    
    const category = assessmentCategories.find(cat => cat.id === selectedCategory);
    if (!category) return null;
    
    return category.types.find(type => type.id === selectedType) || null;
  };

  // Get current assessment components for the form
  const getCurrentComponents = () => {
    const currentType = getCurrentAssessmentType();
    return currentType?.components || [];
  };

  // Get components in correct order based on ASB norm table
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
  
  // Initialize scores state
  const [scores, setScores] = useState<ScoresState>({});

  // Reset scores when assessment type changes
  const resetScores = () => {
    const components = getCurrentComponents();
    const initialScores: ScoresState = {};
    classStudents.forEach(student => {
      initialScores[student.id] = {};
      components.forEach(component => {
        initialScores[student.id][component.id] = "";
      });
    });
    setScores(initialScores);
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
  
  // Handle score changes
  const handleScoreChange = (studentId: string, componentId: string, value: string) => {
    setScores(prevScores => ({
      ...prevScores,
      [studentId]: {
        ...prevScores[studentId],
        [componentId]: value
      }
    }));
  };

  // Handle keyboard navigation between input fields
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, studentId: string, componentId: string, studentIndex: number, componentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const components = getOrderedComponents(getCurrentComponents());
      const nextComponentIndex = componentIndex + 1;
      
      // If there's a next component in the same row
      if (nextComponentIndex < components.length) {
        const nextComponentId = components[nextComponentIndex].id;
        const nextInput = document.querySelector(`input[data-student-id="${studentId}"][data-component-id="${nextComponentId}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      } 
      // Otherwise, move to the first component of the next student
      else if (studentIndex + 1 < classStudents.length) {
        const nextStudentId = classStudents[studentIndex + 1].id;
        const firstComponentId = components[0].id;
        const nextInput = document.querySelector(`input[data-student-id="${nextStudentId}"][data-component-id="${firstComponentId}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Filter classes based on search query
  const filteredClasses = classes.filter(cls => 
    cls.class_name.toLowerCase().includes(classSearchQuery.toLowerCase())
  );

  // Filter assessment categories based on search query
  const filteredCategories = assessmentCategories.filter(category => 
    category.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  // Filter assessment types based on selected category and search query
  const filteredTypes = selectedCategory 
    ? assessmentCategories
        .find(category => category.id === selectedCategory)
        ?.types.filter(type => 
          type.name.toLowerCase().includes(typeSearchQuery.toLowerCase())
        ) || []
    : [];
  
  // Handle continue button click
  const handleContinue = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate inputs - but don't create a database record yet
      if (!selectedClass || !selectedCategory || !selectedType || !testDate) {
        setError('Please complete all fields before continuing');
        setSubmitting(false);
        return;
      }

      // Reset scores if not academic age assessment
      if (!isAcademicAgeAssessment()) {
        resetScores();
      }
      
      // Just show the score form - we'll create the record when saving
      setShowScoreForm(true);
      
    } catch (err) {
      console.error('Error in continue process:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    setShowScoreForm(false);
  };

  // Handle academic age assessment completion
  const handleAcademicAgeComplete = async (academicAgeScores: AcademicAgeScoresState, assessmentRemarks: string) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const supabase = createClient();
      
      // 1. First, create the assessment session
      const { data: session, error: sessionError } = await supabase
        .from('assessment_sessions')
        .insert({
          assessment_type_id: selectedType,
          class_id: selectedClass,
          tester_id: userId,
          test_date: testDate,
          remarks: assessmentRemarks
        })
        .select('id')
        .single();
        
      if (sessionError) {
        console.error('Error creating assessment session:', sessionError);
        setError(sessionError.message || 'Failed to create assessment session');
        setSubmitting(false);
        return;
      }
      
      if (!session || !session.id) {
        setError('Failed to create assessment session - no session ID returned');
        setSubmitting(false);
        return;
      }
      
      // 2. Get the session ID
      const sessionId = session.id;
      
      // 3. Determine academic age test type using existing function
      const academicAgeType = getAcademicAgeType();
      
      if (!academicAgeType) {
        throw new Error('Invalid academic age assessment type');
      }
      
      // 4. Save academic age scores
      const scoresToInsert: Array<{
        session_id: string;
        student_id: string;
        test_type: 'maths' | 'reading' | 'spelling';
        raw_score: number;
        academic_age: string;
        chronological_age: string;
        age_difference: string;
        is_deficit: boolean;
      }> = [];
      
      Object.entries(academicAgeScores).forEach(([studentId, data]) => {
        if (data.rawScore) {
          scoresToInsert.push({
            session_id: sessionId,
            student_id: studentId,
            test_type: academicAgeType as 'maths' | 'reading' | 'spelling',
            raw_score: parseInt(data.rawScore, 10),
            academic_age: data.academicAge,
            chronological_age: data.chronologicalAge,
            age_difference: data.ageDifference,
            is_deficit: data.isDeficit
          });
        }
      });
      
      // Insert academic age scores
      if (scoresToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('student_academic_ages')
          .insert(scoresToInsert);
          
        if (insertError) throw new Error(insertError.message);
      }
      
      setSuccess('Assessment scores saved successfully!');
      
      // Reset form
      setSelectedClass("");
      setSelectedCategory("");
      setSelectedType("");
      setTestDate("");
      setRemarks("");
      setScores({});
      setShowScoreForm(false);
      
      // Add small delay before reload to ensure UI feedback is shown
      setTimeout(() => {
        window.location.reload();
      }, 800);
      
    } catch (err) {
      console.error('Error saving academic age assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to save assessment');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle save scores for regular assessments
  const handleSaveScores = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const supabase = createClient();
      
      // 1. First, create the assessment session
      const { data: session, error: sessionError } = await supabase
        .from('assessment_sessions')
        .insert({
          assessment_type_id: selectedType,
          class_id: selectedClass,
          tester_id: userId,
          test_date: testDate,
          remarks: remarks
        })
        .select('id')
        .single();
        
      if (sessionError) {
        console.error('Error creating assessment session:', sessionError);
        setError(sessionError.message || 'Failed to create assessment session');
        setSubmitting(false);
        return;
      }
      
      if (!session || !session.id) {
        setError('Failed to create assessment session - no session ID returned');
        setSubmitting(false);
        return;
      }
      
      // 2. Get the session ID
      const sessionId = session.id;
      
      // 3. Prepare scores for insertion
      const scoresToInsert = [];
      const components = getCurrentComponents();
      
      for (const student of classStudents) {
        for (const component of components) {
          const rawScore = scores[student.id]?.[component.id];
          if (rawScore) {
            // Calculate standardized score
            const rawScoreNumber = parseFloat(rawScore);
            const standardizedScore = convertToStandardizedScore(component.name, rawScoreNumber);
            
            scoresToInsert.push({
              session_id: sessionId,
              student_id: student.id,
              component_id: component.id,
              raw_score: rawScoreNumber,
              standardized_score: standardizedScore
            });
          }
        }
      }
      
      // 4. Insert scores
      if (scoresToInsert.length > 0) {
        const { error: scoresError } = await supabase
          .from('student_assessment_scores')
          .insert(scoresToInsert);
          
        if (scoresError) throw new Error(scoresError.message);
      }
      
      setSuccess('Assessment scores saved successfully!');
      
      // Reset form
      setSelectedClass("");
      setSelectedCategory("");
      setSelectedType("");
      setTestDate("");
      setRemarks("");
      setScores({});
      setShowScoreForm(false);
      
      // Add small delay before reload to ensure UI feedback is shown
      setTimeout(() => {
        window.location.reload();
      }, 800);
      
    } catch (err) {
      console.error('Error saving assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to save assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClassObj = classes.find(c => c.id === selectedClass);
  const selectedCategoryObj = assessmentCategories.find(c => c.id === selectedCategory);
  
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
    
      {!showScoreForm ? (
        <Card className="bg-white overflow-hidden shadow-sm rounded-lg px-6 pt-6 pb-16">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Assessment Details</h2>
              <p className="text-gray-500 text-sm mt-1">Select a class, assessment category, type, and date to begin.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <div className="relative">
                  <button
                    onClick={() => setShowClassDropdown(!showClassDropdown)}
                    className={`relative w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ${selectedClass ? "" : "text-muted-foreground"}`}
                  >
                    {selectedClassObj?.class_name || "Select class..."}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 opacity-50"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  
                  {showClassDropdown && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="p-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search classes..."
                            className="pl-8"
                            value={classSearchQuery}
                            onChange={(e) => setClassSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        <ul>
                          {filteredClasses.map((cls) => (
                            <li
                              key={cls.id}
                              className={`px-2 py-2 cursor-pointer hover:bg-gray-100 ${cls.id === selectedClass ? "bg-orange-50 text-[#f6822d]" : ""}`}
                              onClick={() => {
                                setSelectedClass(cls.id);
                                setShowClassDropdown(false);
                              }}
                            >
                              {cls.class_name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Assessment Category</label>
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className={`relative w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ${selectedCategory ? "" : "text-muted-foreground"}`}
                  >
                    {selectedCategoryObj?.name || "Select category..."}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 opacity-50"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  
                  {showCategoryDropdown && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="p-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search assessment categories..."
                            className="pl-8"
                            value={categorySearchQuery}
                            onChange={(e) => setCategorySearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        <ul>
                          {filteredCategories.map((category) => (
                            <li
                              key={category.id}
                              className={`px-2 py-2 cursor-pointer hover:bg-gray-100 ${category.id === selectedCategory ? "bg-orange-50 text-[#f6822d]" : ""}`}
                              onClick={() => {
                                setSelectedCategory(category.id);
                                setSelectedType(""); // Reset selected type when category changes
                                setShowCategoryDropdown(false);
                              }}
                            >
                              {category.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Assessment Type</label>
                <div className="relative">
                  <button
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    disabled={!selectedCategory}
                    className={`relative w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ${selectedType ? "" : "text-muted-foreground"} ${!selectedCategory ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {selectedType ? 
                      getCurrentAssessmentType()?.name || "" : 
                      (selectedCategory ? "Select type..." : "Select category first...")}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 opacity-50"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  
                  {showTypeDropdown && selectedCategory && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="p-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search assessment types..."
                            className="pl-8"
                            value={typeSearchQuery}
                            onChange={(e) => setTypeSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        <ul>
                          {filteredTypes.map((type) => (
                            <li
                              key={type.id}
                              className={`px-2 py-2 cursor-pointer hover:bg-gray-100 ${type.id === selectedType ? "bg-orange-50 text-[#f6822d]" : ""}`}
                              onClick={() => {
                                setSelectedType(type.id);
                                setShowTypeDropdown(false);
                              }}
                            >
                              {type.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Date</label>
                <Input 
                  type="date" 
                  placeholder="Select date..." 
                  className="w-full"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                className="bg-[#f6822d] hover:bg-orange-600"
                onClick={handleContinue}
                disabled={!selectedClass || !selectedCategory || !selectedType || !testDate || submitting}
              >
                {submitting ? 'Please wait...' : 'Continue'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {isAcademicAgeAssessment() && showScoreForm ? (
            <AcademicAgeAssessment
              students={classStudents}
              testType={getAcademicAgeType() as 'maths' | 'reading' | 'spelling'}
              testTypeName={getCurrentAssessmentType()?.name || ""}
              testDate={testDate}
              onSaveComplete={handleAcademicAgeComplete}
              onCancel={handleBack}
            />
          ) : (
            <Card className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Record Assessment Scores</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Enter raw scores for each student and component
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                </div>
                
                {/* Class and assessment details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Class</p>
                    <p className="text-sm">{selectedClassObj?.class_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assessment Type</p>
                    <p className="text-sm">{getCurrentAssessmentType()?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Test Date</p>
                    <p className="text-sm">{testDate}</p>
                  </div>
                </div>
                
                {/* Rest of the regular assessment form */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-4 px-2 text-left font-medium w-36">Student</th>
                        {getOrderedComponents(getCurrentComponents()).map((component) => (
                          <th key={component.id} className="py-4 px-2 text-center font-medium">
                            <div className="text-sm">{component.name}</div>
                            <div className="text-xs text-gray-500">
                              {component.name === 'Visual Perception' && '(0-10)'}
                              {component.name === 'Spatial' && '(0-10)'}
                              {component.name === 'Reasoning' && '(0-10)'}
                              {component.name === 'Numerical' && '(0-10)'}
                              {component.name === 'Gestalt' && '(0-100)'}
                              {component.name === 'Co-ordination' && '(0-30)'}
                              {component.name === 'Memory' && '(0-10)'}
                              {component.name === 'Verbal Comprehension' && '(0-20)'}
                            </div>
                          </th>
                        ))}
                        <th className="py-4 px-2 text-center font-medium text-red-500">
                          <div className="text-sm">Level of Cognitive<br />Readiness in<br />Language of Assessment</div>
                          <div className="text-xs text-red-400">(Calculated)</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.length > 0 ? (
                        classStudents.map((student, studentIndex) => (
                          <tr key={student.id} className="border-b">
                            <td className="py-4 px-2">{student.name}</td>
                            {getOrderedComponents(getCurrentComponents()).map((component, componentIndex) => (
                              <td key={`${student.id}-${component.id}`} className="py-2 px-2">
                                <Input
                                  type="number"
                                  className="w-full"
                                  min={component.min_score}
                                  max={component.max_score}
                                  value={scores[student.id]?.[component.id] || ""}
                                  onChange={(e) => handleScoreChange(student.id, component.id, e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, student.id, component.id, studentIndex, componentIndex)}
                                  data-student-id={student.id}
                                  data-component-id={component.id}
                                />
                              </td>
                            ))}
                            <td className="py-2 px-2 text-center">
                              <div className="w-full h-10 flex items-center justify-center bg-gray-50 rounded-md border">
                                <span className={`text-sm font-medium ${
                                  getCognitiveReadinessScore(student.id) > 0 ? 'text-red-600' : 'text-gray-400'
                                }`}>
                                  {getCognitiveReadinessScore(student.id) > 0 ? getCognitiveReadinessScore(student.id) : '-'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={getCurrentComponents().length + 2} className="py-4 px-2 text-center text-gray-500">
                            No students enrolled in this class.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Remarks/Notes</label>
                  <Textarea 
                    placeholder="Enter any remarks or notes about this assessment" 
                    className="min-h-[100px] w-full"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline"
                    onClick={handleBack}
                    className="border-gray-300"
                    disabled={submitting}
                  >
                    Back
                  </Button>
                  <Button 
                    className="bg-[#f6822d] hover:bg-orange-600"
                    onClick={handleSaveScores}
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Assessment Results'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </>
  );
} 