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

export default async function EditStudentPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get the class ID from search params if available
  const classId = typeof resolvedSearch.classId === 'string' ? resolvedSearch.classId : "";
  
  // Determine the back link based on whether we came from a class page
  const backLink = classId 
    ? `/protected/students/${id}?classId=${classId}`
    : `/protected/students/${id}`;

  // Dictionary of mock student data, keyed by ID
  const studentData: Record<string, any> = {
    "S20250001": {
      id: "S20250001",
      firstName: "Emily",
      lastName: "Johnson",
      class: "1", // Grade 3A
      school: "Springfield Elementary",
      place: "Cape Town",
      gender: "female",
      homeLanguage: "english",
      dateOfBirth: "2018-05-15",
      specialNeeds: {
        occupationalTherapy: "none",
        speechTherapy: "recommended",
        medication: "none",
        counselling: "none"
      }
    },
    // Add other students with similar data structure if needed
  };

  // Create default data for any student ID not in our dictionary
  const studentInfo = studentData[id] || {
    id: id,
    firstName: id === "S20250002" ? "Michael" : 
              id === "S20250003" ? "Sophia" : 
              id === "S20250004" ? "Daniel" : 
              id === "S20250005" ? "Olivia" :
              "Student",
    lastName: id === "S20250002" ? "Smith" : 
              id === "S20250003" ? "Williams" : 
              id === "S20250004" ? "Brown" : 
              id === "S20250005" ? "Miller" :
              id,
    class: "1", // Grade 3A
    school: "Springfield Elementary",
    place: "Cape Town",
    gender: id.endsWith("2") || id.endsWith("4") || id.endsWith("6") || id.endsWith("8") || id.endsWith("0") ? "male" : "female",
    homeLanguage: "english",
    dateOfBirth: "2018-07-22",
    specialNeeds: {
      occupationalTherapy: "none",
      speechTherapy: "none",
      medication: "none",
      counselling: "none"
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-2 mb-4">
        <Link 
          href={backLink}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Student Information</h1>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 max-w-2xl">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input 
              id="studentId" 
              defaultValue={studentInfo.id}
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
                defaultValue={studentInfo.firstName}
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Last Name" 
                defaultValue={studentInfo.lastName}
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select defaultValue={studentInfo.gender}>
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
              <Select defaultValue={studentInfo.class}>
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
                defaultValue={studentInfo.school}
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="place">Place</Label>
              <Input 
                id="place" 
                placeholder="City/Town" 
                defaultValue={studentInfo.place}
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
                defaultValue={studentInfo.dateOfBirth}
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="homeLanguage">Home Language</Label>
              <Select defaultValue={studentInfo.homeLanguage}>
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
            <Label>Special Needs/Concerns</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="occupationalTherapy">Occupational Therapy</Label>
                <Select defaultValue={studentInfo.specialNeeds.occupationalTherapy}>
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="receiving">Receiving Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="speechTherapy">Speech and Language Therapy</Label>
                <Select defaultValue={studentInfo.specialNeeds.speechTherapy}>
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="receiving">Receiving Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <Select defaultValue={studentInfo.specialNeeds.medication}>
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="receiving">Receiving Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="counselling">Counselling</Label>
                <Select defaultValue={studentInfo.specialNeeds.counselling}>
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="receiving">Receiving Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href={backLink}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" className="bg-[#f6822d] hover:bg-orange-600">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 