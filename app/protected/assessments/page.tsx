"use client";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Student {
  id: string;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface ScoresState {
  [studentId: string]: {
    [categoryId: number]: string;
  };
}

export default function AssessmentsPage() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [testerName, setTesterName] = useState<string>("");
  const [testDate, setTestDate] = useState<string>("");
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [classSearchQuery, setClassSearchQuery] = useState("");
  const [typeSearchQuery, setTypeSearchQuery] = useState("");
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [remarks, setRemarks] = useState("");
  
  // Mock student data
  const students: Student[] = [
    { id: "S1", name: "Emily Johnson" },
    { id: "S2", name: "Michael Smith" },
    { id: "S3", name: "Sophia Williams" },
    { id: "S4", name: "Daniel Brown" },
    { id: "S5", name: "Olivia Miller" }
  ];
  
  // Mock assessment categories for ASB
  const asbCategories: Category[] = [
    { id: 1, name: "Visual Perception" },
    { id: 2, name: "Spatial" },
    { id: 3, name: "Reasoning" },
    { id: 4, name: "Numerical" },
    { id: 5, name: "Gestalt" },
    { id: 6, name: "Co-ordination" },
    { id: 7, name: "Memory" },
    { id: 8, name: "Verbal Comprehension" }
  ];
  
  // Initialize scores state
  const [scores, setScores] = useState<ScoresState>(() => {
    const initialScores: ScoresState = {};
    students.forEach(student => {
      initialScores[student.id] = {};
      asbCategories.forEach(category => {
        initialScores[student.id][category.id] = "";
      });
    });
    return initialScores;
  });
  
  // Handle score changes
  const handleScoreChange = (studentId: string, categoryId: number, value: string) => {
    setScores(prevScores => ({
      ...prevScores,
      [studentId]: {
        ...prevScores[studentId],
        [categoryId]: value
      }
    }));
  };

  // Mock class data
  const classes = [
    "Grade 3A",
    "Grade 3C", 
    "Grade 4B"
  ];

  // Mock assessment types
  const assessmentTypes = [
    "ASB (Aptitude Tests for School Beginners)",
    "Reading Assessment",
    "Mathematics Assessment",
    "Spelling Assessment"
  ];

  // Filter classes based on search query
  const filteredClasses = classes.filter(cls => 
    cls.toLowerCase().includes(classSearchQuery.toLowerCase())
  );

  // Filter assessment types based on search query
  const filteredTypes = assessmentTypes.filter(type => 
    type.toLowerCase().includes(typeSearchQuery.toLowerCase())
  );
  
  // Handle continue button click
  const handleContinue = () => {
    setShowScoreForm(true);
  };
  
  // Handle back button click
  const handleBack = () => {
    setShowScoreForm(false);
  };
  
  // Handle calculate standardized scores
  const handleCalculateScores = () => {
    // This would typically send data to the server for processing
    console.log("Calculating standardized scores...", { scores, remarks });
    alert("Scores calculated successfully!");
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assessments</h1>
        <p className="text-gray-500 mt-1">
          Record and manage student assessment scores.
        </p>
      </div>
      
      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="record">Record Assessment</TabsTrigger>
          <TabsTrigger value="view">View Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="mt-6">
          {!showScoreForm ? (
            <Card className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Assessment Details</h2>
                  <p className="text-gray-500 text-sm mt-1">Select a class, assessment type, and date to begin.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Class</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowClassDropdown(!showClassDropdown)}
                        className={`relative w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ${selectedClass ? "" : "text-muted-foreground"}`}
                      >
                        {selectedClass || "Select class..."}
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
                                  key={cls}
                                  className={`px-2 py-2 cursor-pointer hover:bg-gray-100 ${cls === selectedClass ? "bg-orange-50 text-[#f6822d]" : ""}`}
                                  onClick={() => {
                                    setSelectedClass(cls);
                                    setShowClassDropdown(false);
                                  }}
                                >
                                  {cls}
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
                        className={`relative w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ${selectedType ? "" : "text-muted-foreground"}`}
                      >
                        {selectedType || "Select type..."}
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
                      
                      {showTypeDropdown && (
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
                                  key={type}
                                  className={`px-2 py-2 cursor-pointer hover:bg-gray-100 ${type === selectedType ? "bg-orange-50 text-[#f6822d]" : ""}`}
                                  onClick={() => {
                                    setSelectedType(type);
                                    setShowTypeDropdown(false);
                                  }}
                                >
                                  {type}
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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tester</label>
                  <Input 
                    placeholder="Enter name of tester/examiner" 
                    className="w-full" 
                    value={testerName}
                    onChange={(e) => setTesterName(e.target.value)}
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    className="bg-[#f6822d] hover:bg-orange-600"
                    onClick={handleContinue}
                    disabled={!selectedClass || !selectedType || !testDate || !testerName}
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
                  <h2 className="text-xl font-semibold">ASB Assessment - Raw Scores</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Enter the raw scores for each student in {selectedClass}. The system will calculate the standardized scores.
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-4 px-2 text-left font-medium w-36">Student</th>
                        {asbCategories.map((category) => (
                          <th key={category.id} className="py-4 px-2 text-center font-medium">
                            <div className="text-sm">{category.id}. {category.name}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b">
                          <td className="py-4 px-2">{student.name}</td>
                          {asbCategories.map((category) => (
                            <td key={`${student.id}-${category.id}`} className="py-2 px-2">
                              <Input
                                type="number"
                                className="w-full"
                                value={scores[student.id][category.id]}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange(student.id, category.id, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Remarks/Notes</label>
                  <Textarea 
                    placeholder="Enter any remarks or notes about this assessment" 
                    className="min-h-[100px] w-full"
                    value={remarks}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemarks(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline"
                    onClick={handleBack}
                    className="border-gray-300"
                  >
                    Back
                  </Button>
                  <Button 
                    className="bg-[#f6822d] hover:bg-orange-600"
                    onClick={handleCalculateScores}
                  >
                    Calculate Standardized Scores
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="view" className="mt-6">
          <Card className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
            <p className="text-gray-500">No assessment results available yet.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 