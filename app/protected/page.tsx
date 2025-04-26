import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActionCard } from "@/components/dashboard/action-card";
import { BookOpen, Users, BarChart2, PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Demo data
  const userData = {
    name: "Demo",
    classes: [],
    students: [],
    assessments: [],
    recentActivity: []
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {userData.name}. Here&apos;s an overview of your teaching data.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Classes"
          description="Classes under your instruction"
          actionLabel="View all classes"
          actionLink="/protected/classes"
          icon={<BookOpen className="h-6 w-6" />}
        />
        <StatCard
          title="Students"
          description="Students in your classes"
          actionLabel="View all students"
          actionLink="/protected/students"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Assessments"
          description="Assessments recorded"
          actionLabel="Manage assessments"
          actionLink="/protected/assessments"
          icon={<BarChart2 className="h-6 w-6" />}
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Recent Activity */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your latest assessment entries and updates
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-500">No recent activities</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Common tasks you might want to perform
          </p>
          <div className="mt-6 space-y-4">
            <ActionCard
              label="Add a new class"
              href="/protected/classes/new"
              icon={<BookOpen className="h-5 w-5" />}
            />
            <ActionCard
              label="Register a new student"
              href="/protected/students/new"
              icon={<Users className="h-5 w-5" />}
            />
            <ActionCard
              label="Record new assessment"
              href="/protected/assessments?tab=record"
              icon={<BarChart2 className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
