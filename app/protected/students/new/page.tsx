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

// Updated typing to match Next.js 15 expectations
// type PageProps = {
//   params: Record<string, string>;
//   searchParams: { [key: string]: string | string[] | undefined };
// }

export default async function NewStudentPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearch = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const classId = typeof resolvedSearch.class === 'string' ? resolvedSearch.class : "";
  
  // Mock data for the class if coming from a class page
  const classData = classId ? {
    id: classId,
    className: `Grade ${classId === "1" ? "3A" : classId === "2" ? "4B" : "3C"}`,
    gradeLevel: classId === "2" ? "4" : "3"
  } : null;

  // Generate a new student ID based on the year
  const newStudentId = `S${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-2 mb-4">
        <Link 
          href={classId ? `/protected/classes/${classId}` : "/protected/students"} 
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Add New Student</h1>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 max-w-2xl">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input 
              id="studentId" 
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
                placeholder="First Name" 
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Last Name" 
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select>
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
              <Label htmlFor="class">Class</Label>
              <Select defaultValue={classId}>
                <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Grade 3A</SelectItem>
                  <SelectItem value="2">Grade 4B</SelectItem>
                  <SelectItem value="3">Grade 3C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Input 
                id="school" 
                placeholder="School Name" 
                defaultValue="Springfield Elementary"
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="place">Place</Label>
              <Input 
                id="place" 
                placeholder="City/Town" 
                defaultValue="Cape Town"
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input 
                id="dateOfBirth" 
                type="date"
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="homeLanguage">Home Language</Label>
              <Select>
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
            <Label>Special Needs/Problems</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="eyesight">Eyesight</Label>
                <Input 
                  id="eyesight" 
                  placeholder="Eyesight issues (if any)"
                  defaultValue="None" 
                  className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="speech">Speech</Label>
                <Input 
                  id="speech" 
                  placeholder="Speech issues (if any)"
                  defaultValue="None" 
                  className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hearing">Hearing</Label>
                <Input 
                  id="hearing" 
                  placeholder="Hearing issues (if any)"
                  defaultValue="None"
                  className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
                />
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