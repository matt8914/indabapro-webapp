import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminClient = createAdminClient()
    
    // Test 1: Count all users (should bypass RLS)
    const { data: allUsers, error: usersError } = await adminClient
      .from('users')
      .select('id, first_name, last_name, email, role')
    
    if (usersError) {
      console.error('Error fetching users with admin client:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Test 2: Count all students (should bypass RLS)
    const { data: allStudents, error: studentsError } = await adminClient
      .from('students')
      .select('id')
    
    if (studentsError) {
      console.error('Error fetching students with admin client:', studentsError)
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin client working correctly',
      data: {
        totalUsers: allUsers?.length || 0,
        totalStudents: allStudents?.length || 0,
        users: allUsers || []
      }
    })
  } catch (error) {
    console.error('Admin test error:', error)
    return NextResponse.json({ 
      error: 'Admin client test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 