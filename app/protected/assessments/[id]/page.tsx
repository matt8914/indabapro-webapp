import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Updated typing to match Next.js 15 expectations
// type PageProps = {
//   params: { id: string };
//   searchParams: { [key: string]: string | string[] | undefined };
// }

// export default async function AssessmentDetailsPage({ params }: PageProps) {
export default async function AssessmentDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock assessment data
  const assessment = {
    id: params.id,
    name: "ASB Assessment",
    date: "2025-05-10",
    tester: "Demo Teacher",
    classId: "1", // We're assuming this assessment is for Grade 3A
    className: "Grade 3A"
  };

  // Mock student results data
  const studentResults = [
    { 
      id: "S20250001", 
      name: "Emily Johnson", 
      cognitive: 3,
      perception: 5,
      spatial: 3,
      reasoning: 3,
      numerical: 3,
      gestalt: 3,
      coordination: 2,
      memory: 1,
      verbalComprehension: 2
    },
    { 
      id: "S20250002", 
      name: "Michael Smith", 
      cognitive: 2,
      perception: 1,
      spatial: 3,
      reasoning: 2,
      numerical: 2,
      gestalt: 2,
      coordination: 2,
      memory: 2,
      verbalComprehension: 2
    },
    { 
      id: "S20250003", 
      name: "Sophia Williams", 
      cognitive: 3,
      perception: 5,
      spatial: 5,
      reasoning: 1,
      numerical: 5,
      gestalt: 4,
      coordination: 4,
      memory: 5,
      verbalComprehension: 3
    },
    { 
      id: "S20250004", 
      name: "Daniel Brown", 
      cognitive: 1,
      perception: 1,
      spatial: 2,
      reasoning: 2,
      numerical: 2,
      gestalt: 1,
      coordination: 3,
      memory: 3,
      verbalComprehension: 4
    },
    { 
      id: "S20250005", 
      name: "Olivia Miller", 
      cognitive: 3,
      perception: 1,
      spatial: 5,
      reasoning: 1,
      numerical: 5,
      gestalt: 4,
      coordination: 4,
      memory: 2,
      verbalComprehension: 3
    }
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
                <th className="text-center py-3 px-4 font-medium text-red-500">
                  Level of Cognitive<br />Readiness in<br />Language of Assessment
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Perception</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Spatial</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Reasoning</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Numerical</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Gestalt</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Co-<br />ordination</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Memory</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Verbal<br />Comprehension</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studentResults.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4 text-center text-red-500 font-medium">{student.cognitive}</td>
                  <td className="py-3 px-4 text-center">{student.perception}</td>
                  <td className="py-3 px-4 text-center">{student.spatial}</td>
                  <td className="py-3 px-4 text-center">{student.reasoning}</td>
                  <td className="py-3 px-4 text-center">{student.numerical}</td>
                  <td className="py-3 px-4 text-center">{student.gestalt}</td>
                  <td className="py-3 px-4 text-center">{student.coordination}</td>
                  <td className="py-3 px-4 text-center">{student.memory}</td>
                  <td className="py-3 px-4 text-center">{student.verbalComprehension}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 