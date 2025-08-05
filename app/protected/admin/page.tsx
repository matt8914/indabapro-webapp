import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardData } from "./dashboard-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, School, BookOpen, ClipboardList, GraduationCap, UserCheck } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Double-check user role (middleware should have already handled this)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('first_name, last_name, role, email')
    .eq('id', user.id)
    .single();

  if (userError || !userData || userData.role !== 'super_admin') {
    return redirect("/protected");
  }

  const dashboardData = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userData.first_name}! Here's an overview of your platform.
          </p>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.userStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active platform users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remedial Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.userStats.remedialTeachers}</div>
              <p className="text-xs text-muted-foreground">
                Teachers at schools
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Private Therapists</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.userStats.privateTherapists}</div>
              <p className="text-xs text-muted-foreground">
                Independent therapists
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.activityStats.totalClasses}</div>
              <p className="text-xs text-muted-foreground">
                Classes created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.activityStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Students enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.activityStats.totalAssessments}</div>
              <p className="text-xs text-muted-foreground">
                Assessments completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Activity Details */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity Details</CardTitle>
            <CardDescription>
              Detailed breakdown of classes, students, and assessments by user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.activityStats.userActivity
                .sort((a, b) => (b.totalClasses + b.totalStudents + b.totalAssessments) - (a.totalClasses + a.totalStudents + a.totalAssessments))
                .map((user) => {
                  const isInactive = user.totalClasses === 0 && user.totalStudents === 0 && user.totalAssessments === 0;
                  
                  return (
                    <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-gray-500 mb-1">{user.email}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant={user.role === 'teacher' ? 'default' : user.role === 'therapist' ? 'secondary' : 'outline'}>
                            {user.role === 'teacher' ? 'Remedial Teacher' : 
                             user.role === 'therapist' ? 'Private Therapist' : 
                             'School Admin'}
                          </Badge>
                          {isInactive && (
                            <Badge variant="destructive">
                              Inactive
                            </Badge>
                          )}
                          {user.schoolName && (
                            <span>• {user.schoolName}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{user.totalClasses}</div>
                          <div className="text-gray-500">Classes</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{user.totalStudents}</div>
                          <div className="text-gray-500">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{user.totalAssessments}</div>
                          <div className="text-gray-500">Assessments</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 