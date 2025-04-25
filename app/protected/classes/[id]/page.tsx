import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, UserPlus, BarChart2, Download, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the page props to include the id parameter and search params
interface ClassDetailsPageProps {
  params: {
    id: string;
  };
  searchParams: {
    tab?: string;
  };
}

export default async function ClassDetailsPage({ params, searchParams }: ClassDetailsPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get the active tab from search params or default to "students"
  const activeTab = searchParams.tab === "assessments" || searchParams.tab === "reports" 
    ? searchParams.tab 
    : "students";

  // Mock data for the class
  const classData = {
    id: params.id,
    className: `Grade ${params.id === "1" ? "3A" : params.id === "2" ? "4B" : "3C"}`,
    gradeLevel: params.id === "2" ? "4" : "3",
    year: "2025",
    studentCount: params.id === "1" ? 28 : params.id === "2" ? 32 : 27
  };

  // Mock data for students
  const students = [
    { id: "S20250001", firstName: "Emily", lastName: "Johnson", gender: "Female" },
    { id: "S20250002", firstName: "Michael", lastName: "Smith", gender: "Male" },
    { id: "S20250003", firstName: "Sophia", lastName: "Williams", gender: "Female" },
    { id: "S20250004", firstName: "Daniel", lastName: "Brown", gender: "Male" },
    { id: "S20250005", firstName: "Olivia", lastName: "Miller", gender: "Female" }
  ];

  // Mock data for assessments
  const assessments = [
    { id: "1", name: "ASB Assessment", date: "2025-05-10", tester: "Demo Teacher" }
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/protected/classes" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{classData.className}</h1>
          </div>
          <p className="text-gray-500 mt-1 ml-7">
            Grade {classData.gradeLevel} • {classData.year}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="#">Manage Assessments</Link>
          </Button>
          <Button asChild className="bg-[#f6822d] hover:bg-orange-600 flex items-center gap-1">
            <Link href={`/protected/students/new?class=${params.id}`}>
              <UserPlus className="h-4 w-4" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-gray-100 rounded-lg p-1">
          <TabsTrigger 
            value="students" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md"
          >
            Students
          </TabsTrigger>
          <TabsTrigger 
            value="assessments" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md"
          >
            Assessments
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md"
          >
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Students Tab Content */}
        <TabsContent value="students" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Student List</h2>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex items-center gap-1">
                <Link href="#">
                  <Upload className="h-4 w-4" />
                  Import List
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex items-center gap-1">
                <Link href="#">
                  <Download className="h-4 w-4" />
                  Export
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Student ID</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">First Name</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Last Name</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Gender</th>
                    <th className="text-right py-3 px-6 font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="py-3 px-6">{student.id}</td>
                      <td className="py-3 px-6">{student.firstName}</td>
                      <td className="py-3 px-6">{student.lastName}</td>
                      <td className="py-3 px-6">{student.gender}</td>
                      <td className="py-3 px-6 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/protected/students/${student.id}`}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Assessments Tab Content */}
        <TabsContent value="assessments" className="mt-6">
          <h2 className="text-xl font-semibold mb-6">Class Assessments</h2>
          <div className="bg-white shadow-sm rounded-lg p-6">
            {assessments.length > 0 ? (
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <Link 
                    key={assessment.id} 
                    href={`/protected/assessments/${assessment.id}`}
                    className="block border border-gray-100 rounded-md p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{assessment.name}</h3>
                        <p className="text-sm text-gray-500">
                          Date: {assessment.date}
                          <br />
                          Tester: {assessment.tester}
                        </p>
                      </div>
                      <BarChart2 className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No assessments recorded yet.</p>
            )}
          </div>
        </TabsContent>

        {/* Reports Tab Content */}
        <TabsContent value="reports" className="mt-6">
          <h2 className="text-xl font-semibold mb-6">Class Reports</h2>
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-1">No reports available yet.</p>
            <p className="text-gray-500">Reports will be available once assessments are recorded.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 