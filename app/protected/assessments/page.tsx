import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssessmentRecordTab } from "@/components/assessments/assessment-record-tab";
import { AssessmentViewTab } from "@/components/assessments/assessment-view-tab";

export default async function AssessmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch teacher classes
  const { data: classes } = await supabase
    .from('classes')
    .select('id, class_name')
    .eq('teacher_id', user.id);

  // Fetch assessment categories
  const { data: categories } = await supabase
    .from('assessment_categories')
    .select('id, name, description');

  // Fetch assessment types with their categories
  const { data: types } = await supabase
    .from('assessment_types')
    .select(`
      id, 
      name, 
      description,
      category_id,
      assessment_categories(name)
    `);

  // Fetch assessment components
  const { data: components } = await supabase
    .from('assessment_components')
    .select(`
      id,
      name,
      description,
      type_id,
      min_score,
      max_score,
      assessment_types(name)
    `);

  // Structure assessment data for the UI
  const structuredCategories = categories?.map(category => {
    const categoryTypes = types?.filter(type => type.category_id === category.id) || [];
    
    return {
      id: category.id,
      name: category.name,
      types: categoryTypes.map(type => {
        const typeComponents = components?.filter(component => component.type_id === type.id) || [];
        
        return {
          id: type.id,
          name: type.name,
          description: type.description,
          components: typeComponents.map(component => ({
            id: component.id,
            name: component.name,
            description: component.description,
            min_score: component.min_score,
            max_score: component.max_score
          }))
        };
      })
    };
  }) || [];

  // Fetch students from the teacher's classes
  const classIds = classes?.map(c => c.id) || [];
  
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('student_id')
    .in('class_id', classIds.length > 0 ? classIds : ['no-classes']);

  // Get unique student IDs
  const studentIdsArray: string[] = [];
  enrollments?.forEach(enrollment => {
    if (!studentIdsArray.includes(enrollment.student_id)) {
      studentIdsArray.push(enrollment.student_id);
    }
  });

  const { data: students } = await supabase
    .from('students')
    .select('id, first_name, last_name, student_id')
    .in('id', studentIdsArray.length > 0 ? studentIdsArray : ['no-students']);

  const formattedStudents = students?.map(student => ({
    id: student.id,
    name: `${student.first_name} ${student.last_name}`,
    student_id: student.student_id
  })) || [];

  // Get previous assessment sessions
  const { data: sessions } = await supabase
    .from('assessment_sessions')
    .select(`
      id,
      test_date,
      remarks,
      assessment_types(name, id),
      classes(class_name, id),
      users(first_name, last_name)
    `)
    .eq('tester_id', user.id)
    .order('test_date', { ascending: false });

  const formattedSessions = sessions?.map(session => ({
    id: session.id,
    date: session.test_date,
    className: session.classes?.class_name || 'Unknown',
    classId: session.classes?.id,
    assessmentType: session.assessment_types?.name || 'Unknown',
    assessmentTypeId: session.assessment_types?.id,
    tester: session.users ? `${session.users.first_name} ${session.users.last_name}` : 'Unknown',
    remarks: session.remarks || ''
  })) || [];

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assessments</h1>
        <p className="text-gray-500 mt-1">
          Record and manage student assessment scores.
        </p>
      </div>
      
      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="record">Record Assessment</TabsTrigger>
          <TabsTrigger value="view">View Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="mt-6">
          <AssessmentRecordTab 
            classes={classes || []} 
            assessmentCategories={structuredCategories} 
            students={formattedStudents} 
            userId={user.id}
          />
        </TabsContent>
        
        <TabsContent value="view" className="mt-6">
          <AssessmentViewTab 
            sessions={formattedSessions}
            classes={classes || []}
            assessmentCategories={structuredCategories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 