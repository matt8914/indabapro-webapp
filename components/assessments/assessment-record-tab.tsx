"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { convertToStandardizedScore } from "@/utils/assessment-utils";

interface Student {
  id: string;
  name: string;
  student_id?: string;
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
  
  // Fetch students for the selected class when class changes
  useEffect(() => {
    const fetchClassStudents = async () => {
      if (!selectedClass) {
        setClassStudents([]);
        return;
      }
      
      try {
        const supabase = createClient();
        
        // Get student IDs enrolled in the selected class
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('class_enrollments')
          .select('student_id')
          .eq('class_id', selectedClass);
          
        if (enrollmentsError) throw enrollmentsError;
        
        if (enrollments && enrollments.length > 0) {
          // Filter students based on enrollments
          const enrolledStudentIds = enrollments.map(enrollment => enrollment.student_id);
          const filteredStudents = students.filter(student => 
            enrolledStudentIds.includes(student.id)
          );
          
          setClassStudents(filteredStudents);
        } else {
          setClassStudents([]);
        }
      } catch (err) {
        console.error('Error fetching class students:', err);
        setError('Failed to load students for this class');
      }
    };
    
    fetchClassStudents();
  }, [selectedClass, students]);

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
  const handleContinue = () => {
    resetScores();
    setShowScoreForm(true);
  };
  
  // Handle back button click
  const handleBack = () => {
    setShowScoreForm(false);
  };
  
  // Handle save scores
  const handleSaveScores = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const supabase = createClient();
      
      // Create assessment session
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
        
      if (sessionError) throw new Error(sessionError.message);
      
      // Prepare scores for insertion
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
              session_id: session.id,
              student_id: student.id,
              component_id: component.id,
              raw_score: rawScoreNumber,
              standardized_score: standardizedScore
            });
          }
        }
      }
      
      // Insert scores
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
        <Card className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
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
                      selectedCategory ? "Select type..." : "Select category first..."}
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
                disabled={!selectedClass || !selectedCategory || !selectedType || !testDate}
              >
                Continue
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {getCurrentAssessmentType()?.name} - Raw Scores
                </h2>
                <div className="group relative">
                  <Info size={16} className="text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded p-2 w-64 z-50">
                    Scores are standardized on a scale of 1-5 based on the ASB norm table. Each component has specific score ranges that map to standardized scores.
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Enter the raw scores for each student. The system will automatically calculate standardized scores (1-5) based on the ASB norm table.
              </p>
            </div>
            
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
                  </tr>
                </thead>
                <tbody>
                  {classStudents.length > 0 ? (
                    classStudents.map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="py-4 px-2">{student.name}</td>
                        {getOrderedComponents(getCurrentComponents()).map((component) => (
                          <td key={`${student.id}-${component.id}`} className="py-2 px-2">
                            <Input
                              type="number"
                              className="w-full"
                              min={component.min_score}
                              max={component.max_score}
                              value={scores[student.id]?.[component.id] || ""}
                              onChange={(e) => handleScoreChange(student.id, component.id, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={getCurrentComponents().length + 1} className="py-4 px-2 text-center text-gray-500">
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
  );
} 