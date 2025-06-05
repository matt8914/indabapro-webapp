import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { calculateCognitiveReadinessScore } from "@/utils/assessment-utils";

// Updated typing to match Next.js 15 expectations
// type PageProps = {
//   params: { id: string };
//   searchParams: { [key: string]: string | string[] | undefined };
// }

// export default async function AssessmentDetailsPage({ params }: PageProps) {
export default async function AssessmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: assessmentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock assessment data
  const assessment = {
    id: assessmentId,
    name: "ASB Assessment",
    date: "2025-05-10",
    tester: "Demo Teacher",
    classId: "1", // We're assuming this assessment is for Grade 3A
    className: "Grade 3A"
  };

  // Mock student results data with calculated cognitive readiness
  const createStudentResult = (
    id: string, 
    name: string, 
    perception: number,
    spatial: number,
    reasoning: number,
    numerical: number,
    gestalt: number,
    coordination: number,
    memory: number,
    verbalComprehension: number
  ) => {
    // Calculate cognitive readiness score from reasoning, numerical, and gestalt
    const cognitive = calculateCognitiveReadinessScore(reasoning, numerical, gestalt);
    
    return {
      id,
      name,
      cognitive,
      perception,
      spatial,
      reasoning,
      numerical,
      gestalt,
      coordination,
      memory,
      verbalComprehension
    };
  };

  const studentResults = [
    createStudentResult("S20250001", "Emily Johnson", 5, 3, 3, 3, 3, 2, 1, 2),
    createStudentResult("S20250002", "Michael Smith", 1, 3, 2, 2, 2, 2, 2, 2),
    createStudentResult("S20250003", "Sophia Williams", 5, 5, 1, 5, 4, 4, 5, 3),
    createStudentResult("S20250004", "Daniel Brown", 1, 2, 2, 2, 1, 3, 3, 4),
    createStudentResult("S20250005", "Olivia Miller", 1, 5, 1, 5, 4, 4, 2, 3)
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">ASB Assessment Scores</h1>
        <Button variant="outline" asChild className="flex items-center gap-1">
          <Link href={`/protected/classes/${assessment.classId}?tab=assessments`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Assessments
          </Link>
        </Button>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Perception</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Spatial</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Reasoning</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Numerical</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Gestalt</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Co-<br />ordination</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Memory</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Verbal<br />Comprehension</th>
                <th className="text-center py-3 px-4 font-medium text-red-500">
                  Level of Cognitive<br />Readiness in<br />Language of Assessment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studentResults.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4 text-center">{student.perception}</td>
                  <td className="py-3 px-4 text-center">{student.spatial}</td>
                  <td className="py-3 px-4 text-center">{student.reasoning}</td>
                  <td className="py-3 px-4 text-center">{student.numerical}</td>
                  <td className="py-3 px-4 text-center">{student.gestalt}</td>
                  <td className="py-3 px-4 text-center">{student.coordination}</td>
                  <td className="py-3 px-4 text-center">{student.memory}</td>
                  <td className="py-3 px-4 text-center">{student.verbalComprehension}</td>
                  <td className="py-3 px-4 text-center text-red-500 font-medium">{student.cognitive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 