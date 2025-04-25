import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ChevronRight } from "lucide-react";

export default async function StudentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock data for students
  const students = [
    {
      id: "S20250001",
      name: "Emily Johnson",
      class: "Grade 3A",
      school: "Springfield Elementary",
      gender: "Female",
      lastAssessment: "2024-08-15",
      progress: "Improving"
    },
    {
      id: "S20250002",
      name: "Michael Smith",
      class: "Grade 3A",
      school: "Springfield Elementary",
      gender: "Male",
      lastAssessment: "2024-08-14",
      progress: "Steady"
    },
    {
      id: "S20250003",
      name: "Sophia Williams",
      class: "Grade 3B",
      school: "Springfield Elementary",
      gender: "Female",
      lastAssessment: "2024-08-12",
      progress: "Struggling"
    },
    {
      id: "S20250004",
      name: "Daniel Brown",
      class: "Grade 3B",
      school: "Springfield Elementary",
      gender: "Male",
      lastAssessment: "2024-08-10",
      progress: "Improving"
    },
    {
      id: "S20250005",
      name: "Olivia Miller",
      class: "Grade 3C",
      school: "Springfield Elementary",
      gender: "Female",
      lastAssessment: "2024-08-08",
      progress: "Steady"
    }
  ];

  // Get unique classes for filter dropdown
  const classesSet = new Set(students.map(student => student.class));
  const classes = Array.from(classesSet);

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="text-gray-500 mt-1">
            View and manage all students in your classes.
          </p>
        </div>
        <Button asChild className="bg-[#f6822d] hover:bg-orange-600">
          <Link href="/protected/students/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search students by name or ID..." className="pl-10" />
          </div>
        </div>
        <div>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <option value="">All Classes</option>
            {classes.map(classItem => (
              <option key={classItem} value={classItem}>{classItem}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left font-medium text-sm p-4">Student ID</th>
                <th className="text-left font-medium text-sm p-4">Name</th>
                <th className="text-left font-medium text-sm p-4">Class</th>
                <th className="text-left font-medium text-sm p-4">School</th>
                <th className="text-left font-medium text-sm p-4">Gender</th>
                <th className="text-left font-medium text-sm p-4">Last Assessment</th>
                <th className="text-left font-medium text-sm p-4">Progress</th>
                <th className="text-left font-medium text-sm p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">{student.id}</td>
                  <td className="p-4 font-medium">{student.name}</td>
                  <td className="p-4">{student.class}</td>
                  <td className="p-4">{student.school}</td>
                  <td className="p-4">{student.gender}</td>
                  <td className="p-4">{student.lastAssessment}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.progress === 'Improving' ? 'bg-green-100 text-green-800' : 
                      student.progress === 'Steady' ? 'bg-blue-100 text-blue-800' : 
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {student.progress}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/protected/students/${student.id}`} className="text-[#f6822d] hover:text-orange-600">
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 