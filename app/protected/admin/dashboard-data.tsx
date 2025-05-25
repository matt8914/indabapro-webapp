import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export interface DashboardStats {
  userStats: {
    totalUsers: number;
    remedialTeachers: number;
    privateTherapists: number;
  };
  schoolStats: {
    totalSchools: number;
    schoolsWithUsers: number;
    schools: Array<{
      id: string;
      name: string;
      totalUsers: number;
      teachers: number;
    }>;
  };
  activityStats: {
    totalClasses: number;
    totalStudents: number;
    totalAssessments: number;
    userActivity: Array<{
      userId: string;
      firstName: string;
      lastName: string;
      role: string;
      schoolName: string | null;
      totalClasses: number;
      totalStudents: number;
      totalAssessments: number;
    }>;
  };
}

export async function getDashboardData(): Promise<DashboardStats> {
  // Use admin client to bypass RLS policies
  const adminClient = createAdminClient();

  // Get user statistics using admin client
  const { data: userStatsData } = await adminClient
    .from('users')
    .select('role')
    .neq('role', 'super_admin');

  const userStats = {
    totalUsers: userStatsData?.length || 0,
    remedialTeachers: userStatsData?.filter(u => u.role === 'teacher').length || 0,
    privateTherapists: userStatsData?.filter(u => u.role === 'therapist').length || 0,
  };

  // Get school statistics using admin client
  const { data: schoolData } = await adminClient
    .from('schools')
    .select('id, name');

  const { data: schoolUserData } = await adminClient
    .from('users')
    .select('school_id, role')
    .neq('role', 'super_admin')
    .not('school_id', 'is', null);

  const schoolUserMap = new Map<string, { teachers: number; total: number }>();
  
  schoolUserData?.forEach(user => {
    if (!user.school_id) return;
    
    const current = schoolUserMap.get(user.school_id) || { teachers: 0, total: 0 };
    current.total++;
    if (user.role === 'teacher') current.teachers++;
    schoolUserMap.set(user.school_id, current);
  });

  const schools = schoolData?.map(school => ({
    id: school.id,
    name: school.name,
    totalUsers: schoolUserMap.get(school.id)?.total || 0,
    teachers: schoolUserMap.get(school.id)?.teachers || 0,
  })) || [];

  const totalSchools = schools.length;
  const schoolsWithUsers = schools.filter(s => s.totalUsers > 0).length;

  // Get activity statistics using admin client
  const { data: userData } = await adminClient
    .from('users')
    .select(`
      id,
      first_name,
      last_name,
      role,
      school_id,
      schools(name)
    `)
    .neq('role', 'super_admin');

  // Get classes data using admin client
  const { data: classData } = await adminClient
    .from('classes')
    .select('id, teacher_id');

  // Get class enrollments using admin client
  const { data: enrollmentData } = await adminClient
    .from('class_enrollments')
    .select('class_id, student_id');

  // Get assessment sessions using admin client
  const { data: assessmentData } = await adminClient
    .from('assessment_sessions')
    .select('id, class_id');

  // Build maps for efficient lookups
  const classMap = new Map<string, { teacherId?: string }>();
  classData?.forEach(cls => {
    classMap.set(cls.id, {
      teacherId: cls.teacher_id || undefined,
    });
  });

  const enrollmentMap = new Map<string, Set<string>>();
  enrollmentData?.forEach(enrollment => {
    if (!enrollmentMap.has(enrollment.class_id)) {
      enrollmentMap.set(enrollment.class_id, new Set());
    }
    enrollmentMap.get(enrollment.class_id)?.add(enrollment.student_id);
  });

  const assessmentMap = new Map<string, number>();
  assessmentData?.forEach(assessment => {
    const classInfo = classMap.get(assessment.class_id);
    if (classInfo?.teacherId) {
      assessmentMap.set(classInfo.teacherId, (assessmentMap.get(classInfo.teacherId) || 0) + 1);
    }
  });

  const userActivity = userData?.map(user => {
    const userClasses = classData?.filter(cls => 
      cls.teacher_id === user.id
    ) || [];

    const allStudents = new Set<string>();
    userClasses.forEach(cls => {
      const students = enrollmentMap.get(cls.id);
      if (students) {
        students.forEach(studentId => allStudents.add(studentId));
      }
    });

    return {
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      schoolName: (user.schools as any)?.name || null,
      totalClasses: userClasses.length,
      totalStudents: allStudents.size,
      totalAssessments: assessmentMap.get(user.id) || 0,
    };
  }) || [];

  const totalClasses = userActivity.reduce((sum, user) => sum + user.totalClasses, 0);
  const totalStudents = userActivity.reduce((sum, user) => sum + user.totalStudents, 0);
  const totalAssessments = userActivity.reduce((sum, user) => sum + user.totalAssessments, 0);

  return {
    userStats,
    schoolStats: {
      totalSchools,
      schoolsWithUsers,
      schools,
    },
    activityStats: {
      totalClasses,
      totalStudents,
      totalAssessments,
      userActivity,
    },
  };
} 