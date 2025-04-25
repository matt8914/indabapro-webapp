import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";

// Updated typing to match Next.js 15 expectations
type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function StudentPage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Dictionary of mock student data, keyed by ID
  const studentData: Record<string, any> = {
    "S20250001": {
      id: "S20250001",
      fullName: "Emily Johnson",
      class: "Grade 3A",
      school: "Springfield Elementary",
      place: "Cape Town",
      gender: "Female",
      homeLanguage: "English",
      dateOfBirth: "2018-05-15",
      age: "6 years, 9 months",
      specialNeeds: {
        eyesight: "None",
        speech: "None",
        hearing: "None"
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

  // Create default data for any student ID not in our dictionary
  const studentInfo = studentData[params.id] || {
    id: params.id,
    fullName: params.id === "S20250002" ? "Michael Smith" : 
              params.id === "S20250003" ? "Sophia Williams" : 
              params.id === "S20250004" ? "Daniel Brown" : 
              params.id === "S20250005" ? "Olivia Miller" :
              "Student " + params.id,
    class: "Grade 3A",
    school: "Springfield Elementary",
    place: "Cape Town",
    gender: params.id.endsWith("2") || params.id.endsWith("4") || params.id.endsWith("6") || params.id.endsWith("8") || params.id.endsWith("0") ? "Male" : "Female",
    homeLanguage: "English",
    dateOfBirth: "2018-07-22",
    age: "6 years, 7 months",
    specialNeeds: {
      eyesight: "None",
      speech: "None",
      hearing: "None"
    },
    assessmentProfile: {
      perception: Math.floor(Math.random() * 5) + 1,
      spatial: Math.floor(Math.random() * 5) + 1,
      reasoning: Math.floor(Math.random() * 5) + 1,
      numerical: Math.floor(Math.random() * 5) + 1,
      gestalt: Math.floor(Math.random() * 5) + 1,
      coordination: Math.floor(Math.random() * 5) + 1,
      memory: Math.floor(Math.random() * 5) + 1,
      verbalComprehension: Math.floor(Math.random() * 5) + 1
    },
    progressData: [
      { date: "2024-02", score: Math.floor(Math.random() * 3) + 2, avgScore: Math.floor(Math.random() * 2) + 3 },
      { date: "2024-04", score: Math.floor(Math.random() * 3) + 3, avgScore: Math.floor(Math.random() * 2) + 4 },
      { date: "2024-06", score: Math.floor(Math.random() * 3) + 4, avgScore: Math.floor(Math.random() * 2) + 5 },
      { date: "2024-08", score: Math.floor(Math.random() * 3) + 5, avgScore: Math.floor(Math.random() * 2) + 6 },
    ]
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <Link href="/protected/students" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{studentInfo.fullName}</h1>
          <p className="text-gray-500 mt-1">
            {studentInfo.class} • Student ID: {studentInfo.id}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Information Card */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <h2 className="text-lg font-medium p-6 border-b border-gray-100">Student Information</h2>
          <div className="flex flex-col items-center py-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            
            <div className="w-full px-6 space-y-3">
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Full Name:</div>
                <div>{studentInfo.fullName}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Student ID:</div>
                <div>{studentInfo.id}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Class:</div>
                <div>{studentInfo.class}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">School:</div>
                <div>{studentInfo.school}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Place:</div>
                <div>{studentInfo.place}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Gender:</div>
                <div>{studentInfo.gender}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Home Language:</div>
                <div>{studentInfo.homeLanguage}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Date of Birth:</div>
                <div>{studentInfo.dateOfBirth}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2">
                <div className="font-medium">Age:</div>
                <div>{studentInfo.age}</div>
              </div>
              
              <div className="font-medium mt-4 border-b border-gray-100 py-2">Special Needs/Problems:</div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2 pl-4">
                <div className="font-medium">Eyesight:</div>
                <div>{studentInfo.specialNeeds.eyesight}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2 pl-4">
                <div className="font-medium">Speech:</div>
                <div>{studentInfo.specialNeeds.speech}</div>
              </div>
              
              <div className="grid grid-cols-2 border-b border-gray-100 py-2 pl-4">
                <div className="font-medium">Hearing:</div>
                <div>{studentInfo.specialNeeds.hearing}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ASB Test Profile Card */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <h2 className="text-lg font-medium p-6 border-b border-gray-100">ASB Test Profile</h2>
            <div className="p-6">
              {/* This would normally be a real chart - using a placeholder div for now */}
              <div className="w-full h-64 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                <p className="text-center text-gray-500">Student ASB test profile chart would be displayed here</p>
              </div>
              <div className="flex justify-center mt-4 space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Learner's Score</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div>
                  <span className="text-sm text-gray-600">Average Score</span>
                </div>
              </div>
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