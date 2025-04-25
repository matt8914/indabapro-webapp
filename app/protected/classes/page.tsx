import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ClassCard } from "@/components/classes/class-card";
import Link from "next/link";

export default async function ClassesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Mock data for demo purposes
  const classes = [
    {
      id: "1",
      className: "Grade 3A",
      gradeLevel: "3",
      year: "2025",
      studentCount: 28
    },
    {
      id: "2",
      className: "Grade 4B",
      gradeLevel: "4",
      year: "2025",
      studentCount: 32
    },
    {
      id: "3",
      className: "Grade 3C",
      gradeLevel: "3",
      year: "2025",
      studentCount: 27
    }
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Classes</h1>
          <p className="text-gray-500 mt-1">
            Manage and view all your assigned classes.
          </p>
        </div>
        <Button asChild className="bg-[#f6822d] hover:bg-orange-600">
          <Link href="/protected/classes/new">
            <PlusIcon className="h-5 w-5 mr-1" /> Add Class
          </Link>
        </Button>
      </div>
      
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              id={classItem.id}
              className={classItem.className}
              gradeLevel={classItem.gradeLevel}
              year={classItem.year}
              studentCount={classItem.studentCount}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <p className="text-gray-500">No classes added yet. Create your first class to get started.</p>
        </div>
      )}
    </div>
  );
} 