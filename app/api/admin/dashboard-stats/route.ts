import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminClient = createAdminClient()
    
    // Get total users count
    const { data: allUsers, error: usersError } = await adminClient
      .from('users')
      .select('id, role')
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get total students count
    const { data: allStudents, error: studentsError } = await adminClient
      .from('students')
      .select('id')
    
    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    // Get total classes count
    const { data: allClasses, error: classesError } = await adminClient
      .from('classes')
      .select('id')
    
    if (classesError) {
      console.error('Error fetching classes:', classesError)
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
    }

    // Get total assessments count
    const { data: allAssessments, error: assessmentsError } = await adminClient
      .from('assessment_sessions')
      .select('id')
    
    if (assessmentsError) {
      console.error('Error fetching assessments:', assessmentsError)
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 })
    }

    // Calculate role-based counts
    const totalUsers = allUsers?.length || 0
    const remedialTeachers = allUsers?.filter(user => user.role === 'teacher').length || 0
    const privateTherapists = allUsers?.filter(user => user.role === 'therapist').length || 0
    const totalStudents = allStudents?.length || 0
    const totalClasses = allClasses?.length || 0
    const totalAssessments = allAssessments?.length || 0

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        remedialTeachers,
        privateTherapists,
        totalStudents,
        totalClasses,
        totalAssessments
      }
    })
  } catch (error) {
    console.error('Admin dashboard stats error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 