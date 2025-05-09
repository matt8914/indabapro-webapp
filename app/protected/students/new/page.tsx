import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { createStudentAction } from "@/app/actions";

// Updated typing to match Next.js 15 expectations
// type PageProps = {
//   params: Record<string, string>;
//   searchParams: { [key: string]: string | string[] | undefined };
// }

export default async function NewStudentPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams; // Await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get message and type from search params (for error display)
  const message = resolvedSearchParams?.message?.toString();
  const type = resolvedSearchParams?.type?.toString();
  
  // Get class ID from search params
  const classId = typeof resolvedSearchParams?.class === 'string' ? resolvedSearchParams.class : undefined;
  
  // Get return_to path from search params for redirecting back after submission
  const returnTo = typeof resolvedSearchParams?.return_to === 'string' ? resolvedSearchParams.return_to : undefined;
  
  // Fetch classes taught by this teacher for dropdown
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select(`
      id,
      class_name,
      grade_level,
      academic_year
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });
  
  // If a class ID was provided, fetch that class to make sure it exists and belongs to this teacher
  let selectedClass = null;
  if (classId) {
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        id,
        class_name,
        grade_level,
        academic_year
      `)
      .eq('id', classId)
      .eq('teacher_id', user.id)
      .single();
      
    if (!classError && classData) {
      selectedClass = classData;
    }
  }

  // Generate a new student ID based on the year
  const newStudentId = `S${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Get the teacher's school
  const { data: userData } = await supabase
    .from('users')
    .select(`
      school_id,
      schools(
        id,
        name
      )
    `)
    .eq('id', user.id)
    .single();
  
  const schoolName = userData?.schools ? userData.schools.name : "Unknown School";

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-2 mb-4">
        <Link 
          href={returnTo || (classId ? `/protected/classes/${classId}` : "/protected/students")} 
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Add New Student</h1>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 max-w-2xl">
        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}
        
        <form action={createStudentAction} className="space-y-6">
          {/* Hidden input to store return path */}
          {returnTo && (
            <input type="hidden" name="returnTo" value={returnTo} />
          )}

          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input 
              id="studentId" 
              name="studentId"
              defaultValue={newStudentId}
              readOnly
              className="bg-gray-50"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                name="firstName"
                placeholder="First Name" 
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                name="lastName"
                placeholder="Last Name" 
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender">
                <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="classId">Class</Label>
              <Select name="classId" defaultValue={classId}>
                <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classesError ? (
                    <SelectItem value="">Error loading classes</SelectItem>
                  ) : classes && classes.length > 0 ? (
                    classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.class_name} ({classItem.academic_year})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="">No classes available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Input 
                id="school" 
                value={schoolName}
                readOnly
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="place">Place</Label>
              <Input 
                id="place" 
                placeholder="Location"
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input 
                id="dateOfBirth" 
                name="dateOfBirth"
                type="date"
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="homeLanguage">Home Language</Label>
              <Select name="homeLanguage">
                <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="afrikaans">Afrikaans</SelectItem>
                  <SelectItem value="xhosa">Xhosa</SelectItem>
                  <SelectItem value="zulu">Zulu</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="specialNeeds">Special Needs/Notes</Label>
            <Input 
              id="specialNeeds" 
              name="specialNeeds"
              placeholder="Any special needs or notes" 
              className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
            />
          </div>
          
          <div className="space-y-4">
            <Label>Support Services</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="occupationalTherapy">Occupational Therapy</Label>
                <Select name="occupationalTherapy" defaultValue="none">
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="attending">Attending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="speechTherapy">Speech and Language Therapy</Label>
                <Select name="speechTherapy" defaultValue="none">
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="attending">Attending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <Select name="medication" defaultValue="none">
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="attending">Attending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="counselling">Counselling</Label>
                <Select name="counselling" defaultValue="none">
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="attending">Attending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href={classId ? `/protected/classes/${classId}` : "/protected/students"}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" className="bg-[#f6822d] hover:bg-orange-600">
              Register Student
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 