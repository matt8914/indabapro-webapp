"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, BookOpen, ChevronDown, ChevronRight, FileText, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { convertTenthsToYearsMonths } from "@/utils/academic-age-utils";

interface AssessmentSession {
  id: string;
  date: string;
  className: string;
  classId: string;
  assessmentType: string;
  assessmentTypeId: string;
  tester: string;
  remarks: string;
}

interface Class {
  id: string;
  class_name: string;
}

interface AssessmentType {
  id: string;
  name: string;
}

interface AssessmentCategory {
  id: string;
  name: string;
  types: AssessmentType[];
}

interface StudentScore {
  componentName: string;
  rawScore: number | null;
  standardizedScore: number | null;
  percentile: number | null;
}

interface AcademicAgeData {
  rawScore: number;
  academicAge: string;
  chronologicalAge: string;
  ageDifference: string;
  isDeficit: boolean;
}

interface StudentData {
  name: string;
  scores: Record<string, StudentScore>;
  academicAges?: AcademicAgeData;
}

interface SessionDetails {
  students: Record<string, StudentData>;
  isAcademicAgeAssessment: boolean;
  academicAgeType?: 'maths' | 'reading' | 'spelling';
}

interface AssessmentViewTabProps {
  sessions: AssessmentSession[];
  classes: Class[];
  assessmentCategories: AssessmentCategory[];
}

export function AssessmentViewTab({ 
  sessions, 
  classes, 
  assessmentCategories 
}: AssessmentViewTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Define academic age assessment types
  const academicAgeTypes = [
    "YOUNG Maths A Assessment",
    "SPAR Reading Assessment",
    "Schonell Spelling A"
  ];

  // Get academic age test type
  const getAcademicAgeType = (assessmentType: string): 'maths' | 'reading' | 'spelling' | null => {
    if (assessmentType === "YOUNG Maths A Assessment") return 'maths';
    if (assessmentType === "SPAR Reading Assessment") return 'reading';
    if (assessmentType === "Schonell Spelling A") return 'spelling';
    return null;
  };

  // Filter sessions based on search and filters
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchQuery === "" || 
      session.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.assessmentType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = selectedClass === "all" || session.classId === selectedClass;
    const matchesType = selectedType === "all" || session.assessmentTypeId === selectedType;
    
    return matchesSearch && matchesClass && matchesType;
  });

  // Get all assessment types as a flat array
  const allAssessmentTypes = assessmentCategories.reduce((types, category) => {
    return [...types, ...category.types];
  }, [] as AssessmentType[]);

  // Function to toggle session expansion and load details
  const toggleSession = async (sessionId: string, assessmentTypeName: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      setSessionDetails(null);
      return;
    }
    
    setExpandedSession(sessionId);
    setLoading(true);
    
    try {
      const supabase = createClient();
      
      // Check if this is an academic age assessment
      const isAcademicAge = academicAgeTypes.includes(assessmentTypeName);
      const academicAgeType = getAcademicAgeType(assessmentTypeName);
      
      if (isAcademicAge && academicAgeType) {
        // Fetch academic age data with explicit type casting
        const { data: ageData, error: ageError } = await supabase
          .from('student_academic_ages')
          .select(`
            id,
            student_id,
            raw_score,
            academic_age,
            chronological_age,
            age_difference,
            is_deficit,
            students(id, first_name, last_name)
          `)
          .eq('session_id', sessionId)
          .eq('test_type', academicAgeType);
          
        if (ageError) throw ageError;
        
        // Organize academic age data by student
        const studentData: Record<string, StudentData> = {};
        
        if (ageData && Array.isArray(ageData)) {
          ageData.forEach((data: any) => {
            const studentId = data.student_id;
            const studentName = data.students ? `${data.students.first_name} ${data.students.last_name}` : 'Unknown';
            
            studentData[studentId] = {
              name: studentName,
              scores: {},
              academicAges: {
                rawScore: data.raw_score,
                academicAge: data.academic_age,
                chronologicalAge: data.chronological_age,
                ageDifference: data.age_difference,
                isDeficit: data.is_deficit
              }
            };
          });
        }
        
        setSessionDetails({
          students: studentData,
          isAcademicAgeAssessment: true,
          academicAgeType
        });
      } else {
        // Fetch regular assessment data
        const { data: scores, error } = await supabase
          .from('student_assessment_scores')
          .select(`
            id,
            raw_score,
            standardized_score,
            percentile,
            student_id,
            component_id,
            students(id, first_name, last_name),
            assessment_components(id, name)
          `)
          .eq('session_id', sessionId);
          
        if (error) throw error;
        
        // Organize scores by student
        const scoresByStudent: Record<string, StudentData> = {};
        
        scores?.forEach(score => {
          const studentId = score.student_id;
          const studentName = score.students ? `${score.students.first_name} ${score.students.last_name}` : 'Unknown';
          const componentName = score.assessment_components?.name || 'Unknown';
          
          if (!scoresByStudent[studentId]) {
            scoresByStudent[studentId] = {
              name: studentName,
              scores: {}
            };
          }
          
          scoresByStudent[studentId].scores[score.component_id] = {
            componentName,
            rawScore: score.raw_score,
            standardizedScore: score.standardized_score,
            percentile: score.percentile
          };
        });
        
        setSessionDetails({
          students: scoresByStudent,
          isAcademicAgeAssessment: false
        });
      }
      
    } catch (err) {
      console.error("Error loading session details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to get components in correct order
  const getOrderedComponents = (scores: Record<string, StudentScore>): [string, StudentScore][] => {
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
    
    // Convert to array and sort by the defined order
    const scoresArray = Object.entries(scores);
    
    return scoresArray.sort((a, b) => {
      const indexA = componentOrder.indexOf(a[1].componentName);
      const indexB = componentOrder.indexOf(b[1].componentName);
      return indexA - indexB;
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search assessments..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.class_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by assessment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assessment Types</SelectItem>
            {allAssessmentTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Assessment List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                onClick={() => toggleSession(session.id, session.assessmentType)}
              >
                <div className="flex items-center space-x-4">
                  {expandedSession === session.id ? 
                    <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  }
                  <div>
                    <h3 className="font-medium">{session.assessmentType}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {session.className}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Tester: {session.tester}
                </div>
              </div>
              
              {/* Expanded Session Details */}
              {expandedSession === session.id && (
                <div className="px-6 py-4 border-t">
                  {loading ? (
                    <div className="text-center py-4">Loading session details...</div>
                  ) : sessionDetails ? (
                    <div className="space-y-6">
                      {/* Remarks */}
                      {session.remarks && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex items-center text-gray-700 font-medium mb-2">
                            <FileText className="h-4 w-4 mr-2" />
                            Notes & Remarks
                          </div>
                          <p className="text-gray-600 text-sm">{session.remarks}</p>
                        </div>
                      )}
                      
                      {/* Academic Age Assessment Results */}
                      {sessionDetails.isAcademicAgeAssessment ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b">
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Student</th>
                                <th className="py-2 px-4 text-center text-sm font-medium text-gray-500">Raw Score</th>
                                <th className="py-2 px-4 text-center text-sm font-medium text-gray-500">Academic Age</th>
                                <th className="py-2 px-4 text-center text-sm font-medium text-gray-500">Academic Age (Y&M)</th>
                                <th className="py-2 px-4 text-center text-sm font-medium text-gray-500">Chronological Age</th>
                                <th className="py-2 px-4 text-center text-sm font-medium text-gray-500">Difference</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(sessionDetails.students).map(([studentId, student]) => (
                                <tr key={studentId} className="border-b">
                                  <td className="py-3 px-4 text-sm">{student.name}</td>
                                  <td className="py-3 px-4 text-center text-sm">{student.academicAges?.rawScore}</td>
                                  <td className="py-3 px-4 text-center text-sm">{student.academicAges?.academicAge}</td>
                                  <td className="py-3 px-4 text-center text-sm">
                                    {student.academicAges ? convertTenthsToYearsMonths(student.academicAges.academicAge) : ''}
                                  </td>
                                  <td className="py-3 px-4 text-center text-sm">{student.academicAges?.chronologicalAge}</td>
                                  <td className="py-3 px-4 text-center text-sm">
                                    {student.academicAges?.ageDifference && (
                                      <Badge
                                        className={
                                          student.academicAges.isDeficit
                                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                                            : "bg-green-100 text-green-800 hover:bg-green-100"
                                        }
                                      >
                                        {student.academicAges.ageDifference}
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        /* Regular Assessment Results */
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b">
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Student</th>
                                {/* Dynamic Headers for Assessment Components */}
                                {Object.keys(sessionDetails.students).length > 0 && 
                                  Object.values(sessionDetails.students)[0].scores && 
                                  getOrderedComponents(Object.values(sessionDetails.students)[0].scores).map(([componentId, score]) => (
                                    <th key={componentId} className="py-2 px-4 text-center text-sm font-medium text-gray-500">
                                      {score.componentName}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(sessionDetails.students).map(([studentId, student]) => (
                                <tr key={studentId} className="border-b">
                                  <td className="py-3 px-4 text-sm">{student.name}</td>
                                  {/* Scores for Each Component */}
                                  {getOrderedComponents(student.scores).map(([componentId, score]) => (
                                    <td key={componentId} className="py-3 px-4 text-center">
                                      <div className="flex flex-col items-center">
                                        <span className="text-sm font-medium">
                                          {score.rawScore}
                                        </span>
                                        {score.standardizedScore && (
                                          <span className="text-xs text-gray-500 mt-1">
                                            Std: {score.standardizedScore}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No data available for this session.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="bg-white p-6 text-center text-gray-500">
          No assessment sessions found matching your filters.
        </Card>
      )}
    </div>
  );
} 