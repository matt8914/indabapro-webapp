"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
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
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { useRouter, useSearchParams } from "next/navigation";

// Updated typing to match Next.js 15 expectations
// type PageProps = {
//   params: Record<string, string>;
//   searchParams: { [key: string]: string | string[] | undefined };
// }

export default function NewStudentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [isTherapist, setIsTherapist] = useState(false);
  const [schoolName, setSchoolName] = useState("Unknown School");
  const [schools, setSchools] = useState<ComboboxOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [newStudentId, setNewStudentId] = useState("");
  
  // Get query parameters
  const classId = searchParams.get("class");
  const returnTo = searchParams.get("return_to");
  
  // Initialize
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push("/sign-in");
          return;
        }
        
        // Get message and type from search params
        if (searchParams.get("message")) {
          setMessage(searchParams.get("message"));
          setMessageType(searchParams.get("type") || "info");
        }
        
        // Generate a new student ID
        setNewStudentId(`S${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`);
        
        // Fetch classes taught by this teacher
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select(`
            id,
            class_name,
            grade_level,
            academic_year
          `)
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });
        
        if (classesError) {
          console.error("Error fetching classes:", classesError);
        } else if (!classesData || classesData.length === 0) {
          // Redirect if no classes
          router.push("/protected/classes/new?error=You+need+to+create+a+class+before+adding+students");
          return;
        } else {
          setClasses(classesData);
        }
        
        // Get user role and school
        const { data: userData } = await supabase
          .from('users')
          .select(`
            school_id,
            role,
            schools(
              id,
              name
            )
          `)
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setIsTherapist(userData.role === 'therapist');
          if (userData.schools) {
            setSchoolName(userData.schools.name);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing page:", error);
        setLoading(false);
      }
    };
    
    initPage();
  }, [router, searchParams]);
  
  // Search schools function for therapists
  const searchSchools = async (term: string) => {
    if (!term || term.length < 2) {
      setSchools([]);
      return;
    }
    
    setSearchError(null);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("schools")
        .select("id, name")
        .ilike("name", `%${term}%`)
        .order("name")
        .limit(50);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const options = data.map((school) => ({
          value: school.id,
          label: school.name,
        }));
        setSchools(options);
      } else {
        setSchools([]);
      }
    } catch (error) {
      console.error("Error searching schools:", error);
      setSearchError("Failed to search schools. Please try again.");
    }
  };
  
  // Handle search input changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
    if (value.length === 0) {
      setSchools([]);
    }
  };
  
  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchSchools(searchTerm);
      }
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // For therapists, add the school ID from the combobox state
    if (isTherapist && schoolId) {
      formData.set("schoolId", schoolId);
    }
    
    // Make sure student ID is included
    const studentId = formData.get('studentId') as string;
    if (!studentId || studentId.trim() === '') {
      formData.set('studentId', newStudentId); // Use default if not provided
    }
    
    try {
      const response = await fetch("/api/actions/createStudent", {
        method: "POST",
        body: formData,
        credentials: 'include', // Include credentials (cookies)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create student");
      }
      
      // Redirect based on returnTo or to the class page
      if (returnTo) {
        router.push(returnTo);
      } else if (classId) {
        router.push(`/protected/classes/${classId}`);
      } else {
        router.push("/protected/students");
      }
    } catch (error) {
      console.error("Error creating student:", error);
      setMessage(error instanceof Error ? error.message : "An error occurred");
      setMessageType("error");
      setLoading(false);
    }
  };
  
  if (loading && !classes.length) {
    return (
      <div className="flex-1 w-full flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

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
            messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter student ID"
              className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
            />
            <p className="text-xs text-gray-500">
              A suggested ID is provided, but you can change it if needed
            </p>
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
              <Select name="classId" defaultValue={classId || ""}>
                <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.length > 0 ? (
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
              {isTherapist ? (
                // For therapists: Show combobox to search for a school
                <Combobox
                  options={schools}
                  value={schoolId}
                  onChange={setSchoolId}
                  placeholder={loading ? "Searching schools..." : "Type to search for a school..."}
                  disabled={loading}
                  emptyMessage={searchTerm.length < 2 
                    ? "Type at least 2 characters to search" 
                    : searchError || "No schools found with that name. Try a different search term."}
                  onSearch={handleSearchInput}
                />
              ) : (
                // For teachers: Show readonly school name
                <Input 
                  id="school" 
                  value={schoolName}
                  readOnly
                  className="bg-gray-50"
                />
              )}
              {isTherapist && (
                <p className="text-xs text-gray-500">
                  Type at least 2 characters to search for a school
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="place">Place</Label>
              <Input 
                id="place" 
                name="place"
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
          
          <div className="space-y-4">
            <Label>Health Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="eyesight">Eyesight</Label>
                <Select name="eyesight" defaultValue="none">
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Eyesight Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="glasses">Glasses</SelectItem>
                    <SelectItem value="squint">Squint</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="speech">Speech</Label>
                <Select name="speech" defaultValue="none">
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Speech Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="stutter">Stutter</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hearing">Hearing</Label>
                <Select name="hearing" defaultValue="none">
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Hearing Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="hard_of_hearing">Hard of Hearing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
            <Button type="submit" className="bg-[#f6822d] hover:bg-orange-600" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : (
                "Register Student"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 