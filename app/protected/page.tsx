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

  // Fetch user data from the database
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  if (userError) {
    console.error('Error fetching user data:', userError);
  }

  // Fetch count of classes for this user (if teacher)
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('id')
    .eq('teacher_id', user.id);

  // Fetch count of students in teacher's classes
  const { data: students, error: studentsError } = await supabase
    .from('class_enrollments')
    .select('id, class_id, classes!inner(teacher_id)')
    .eq('classes.teacher_id', user.id);

  // Fetch count of assessment sessions
  const { data: assessments, error: assessmentsError } = await supabase
    .from('assessment_sessions')
    .select('id')
    .eq('tester_id', user.id);

  // Fetch recent activity (latest 5 assessment sessions)
  const { data: recentActivity, error: activityError } = await supabase
    .from('assessment_sessions')
    .select(`
      id, 
      test_date,
      assessment_types(name),
      classes(class_name)
    `)
    .eq('tester_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const userName = userData ? `${userData.first_name}` : 'User';

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {userName}. Here&apos;s an overview of your teaching data.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Classes"
          description={`${classes?.length || 0} classes under your instruction`}
          actionLabel="View all classes"
          actionLink="/protected/classes"
          icon={<BookOpen className="h-6 w-6" />}
        />
        <StatCard
          title="Students"
          description={`${students?.length || 0} students in your classes`}
          actionLabel="View all students"
          actionLink="/protected/students"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Assessments"
          description={`${assessments?.length || 0} assessments recorded`}
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
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 text-sm">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <BarChart2 className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.assessment_types?.name}</p>
                      <p className="text-gray-500">
                        {activity.classes?.class_name} - {new Date(activity.test_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activities</p>
            )}
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
