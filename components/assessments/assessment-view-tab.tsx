"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, BookOpen, ChevronDown, ChevronRight, FileText, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

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

interface StudentData {
  name: string;
  scores: Record<string, StudentScore>;
}

interface SessionDetails {
  students: Record<string, StudentData>;
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
  const toggleSession = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      setSessionDetails(null);
      return;
    }
    
    setExpandedSession(sessionId);
    setLoading(true);
    
    try {
      const supabase = createClient();
      
      // Fetch student scores for this session
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
        students: scoresByStudent
      });
      
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
                onClick={() => toggleSession(session.id)}
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
              
              {/* Expanded View */}
              {expandedSession === session.id && (
                <div className="border-t border-gray-200 p-4">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f6822d]"></div>
                    </div>
                  ) : sessionDetails ? (
                    <div>
                      {session.remarks && (
                        <div className="mb-4 bg-orange-50 p-3 rounded-md flex items-start">
                          <FileText className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm text-orange-700">Remarks</div>
                            <p className="text-sm text-gray-700">{session.remarks}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center mb-3">
                        <h4 className="font-medium">Student Results</h4>
                        <div className="group relative ml-2">
                          <Info size={16} className="text-gray-400 cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded p-2 w-64 z-50">
                            Raw scores are converted to standardized scores (1-5) based on the ASB norm table. Each component has specific score ranges for standardization.
                          </div>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student
                              </th>
                              {sessionDetails && Object.values(sessionDetails.students)[0] && 
                                getOrderedComponents(Object.values(sessionDetails.students)[0].scores).map(([compId, compData]) => (
                                  <th key={compId} scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div>{compData.componentName}</div>
                                    <div className="text-xs text-gray-400 normal-case font-normal">
                                      {compData.componentName === 'Visual Perception' && '(0-10)'}
                                      {compData.componentName === 'Spatial' && '(0-10)'}
                                      {compData.componentName === 'Reasoning' && '(0-10)'}
                                      {compData.componentName === 'Numerical' && '(0-10)'}
                                      {compData.componentName === 'Gestalt' && '(0-100)'}
                                      {compData.componentName === 'Co-ordination' && '(0-30)'}
                                      {compData.componentName === 'Memory' && '(0-10)'}
                                      {compData.componentName === 'Verbal Comprehension' && '(0-20)'}
                                    </div>
                                  </th>
                                ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sessionDetails && Object.entries(sessionDetails.students).map(([studentId, data]) => (
                              <tr key={studentId}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {data.name}
                                </td>
                                {/* Dynamic score cells */}
                                {getOrderedComponents(data.scores).map(([compId, score]) => (
                                  <td key={compId} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <span className="font-medium">Raw: {score.rawScore}</span>
                                      {score.standardizedScore && (
                                        <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                                          Std: {score.standardizedScore}
                                        </span>
                                      )}
                                    </div>
                                    {score.percentile && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        Percentile: {score.percentile}%
                                      </div>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No student data available for this assessment.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="bg-white p-6">
          <p className="text-gray-500">No assessment results match your filters. Try adjusting the search criteria or add new assessments.</p>
        </Card>
      )}
    </div>
  );
} 