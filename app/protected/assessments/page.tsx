import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssessmentRecordTab } from "@/components/assessments/assessment-record-tab";
import { AssessmentViewTab } from "@/components/assessments/assessment-view-tab";

// Interface types that match exactly what's in the component
interface Component {
  id: string;
  name: string;
  description?: string;
  min_score?: number;
  max_score?: number;
}

interface AssessmentType {
  id: string;
  name: string;
  description?: string;
  components: Component[];
}

interface AssessmentCategory {
  id: string;
  name: string;
  types: AssessmentType[];
}

export default async function AssessmentsPage() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return redirect("/sign-in");
    }

    // Fetch teacher classes
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, class_name')
      .eq('teacher_id', user.id);

    if (classesError) {
      console.error("Error fetching classes:", classesError);
      throw new Error(`Failed to fetch classes: ${classesError.message}`);
    }

    // Fetch assessment categories
    const { data: categories, error: categoriesError } = await supabase
      .from('assessment_categories')
      .select('id, name, description');

    if (categoriesError) {
      console.error("Error fetching assessment categories:", categoriesError);
      throw new Error(`Failed to fetch assessment categories: ${categoriesError.message}`);
    }

    // Fetch assessment types with their categories
    const { data: types, error: typesError } = await supabase
      .from('assessment_types')
      .select(`
        id, 
        name, 
        description,
        category_id,
        assessment_categories(name)
      `);

    if (typesError) {
      console.error("Error fetching assessment types:", typesError);
      throw new Error(`Failed to fetch assessment types: ${typesError.message}`);
    }

    // Fetch assessment components 
    const { data: components, error: componentsError } = await supabase
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

    if (componentsError) {
      console.error("Error fetching assessment components:", componentsError);
      throw new Error(`Failed to fetch assessment components: ${componentsError.message}`);
    }

    // Structure assessment data for the UI with proper typing
    const structuredCategories: AssessmentCategory[] = (categories || []).map(category => {
      const categoryTypes = (types || []).filter(type => type.category_id === category.id);
      
      return {
        id: category.id,
        name: category.name,
        types: categoryTypes.map(type => {
          const typeComponents = (components || []).filter(component => component.type_id === type.id);
          
          return {
            id: type.id,
            name: type.name,
            description: type.description || undefined,
            components: typeComponents.map(component => ({
              id: component.id,
              name: component.name,
              description: component.description || undefined,
              min_score: component.min_score || undefined,
              max_score: component.max_score || undefined
            }))
          };
        })
      };
    });

    // Fetch students from the teacher's classes
    let formattedStudents: { id: string; name: string; student_id?: string }[] = [];
    
    if (classes && classes.length > 0) {
      const classIds = classes.map(c => c.id);
      
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('class_enrollments')
        .select('student_id')
        .in('class_id', classIds);
  
      if (enrollmentsError) {
        console.error("Error fetching enrollments:", enrollmentsError);
      } else if (enrollments && enrollments.length > 0) {
        // Get unique student IDs
        const studentIdsArray = enrollments.map(e => e.student_id)
          .filter((id, index, self) => self.indexOf(id) === index);
  
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id, first_name, last_name, student_id')
          .in('id', studentIdsArray);
  
        if (studentsError) {
          console.error("Error fetching students:", studentsError);
        } else if (students) {
          formattedStudents = students.map(student => ({
            id: student.id,
            name: `${student.first_name} ${student.last_name}`,
            student_id: student.student_id
          }));
        }
      }
    }
    
    // Get previous assessment sessions
    const { data: sessions, error: sessionsError } = await supabase
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

    if (sessionsError) {
      console.error("Error fetching assessment sessions:", sessionsError);
    }

    const formattedSessions = (sessions || []).map(session => ({
      id: session.id,
      date: session.test_date,
      className: session.classes?.class_name || 'Unknown',
      classId: session.classes?.id,
      assessmentType: session.assessment_types?.name || 'Unknown',
      assessmentTypeId: session.assessment_types?.id,
      tester: session.users ? `${session.users.first_name} ${session.users.last_name}` : 'Unknown',
      remarks: session.remarks || ''
    }));

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
  } catch (error) {
    console.error("Error in assessments page:", error);
    // Return a basic error UI instead of crashing
    return (
      <div className="flex-1 w-full flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assessments</h1>
          <p className="text-red-500 mt-1">
            There was an error loading assessment data. Please try again later.
          </p>
        </div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium mb-2">Error connecting to database</p>
          <p className="text-gray-700 mb-4">We're having trouble retrieving your assessment data. This might be due to a temporary connectivity issue.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#f6822d] hover:bg-orange-600"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
} 