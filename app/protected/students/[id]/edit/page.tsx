"use client"

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { redirect, useRouter, useSearchParams } from "next/navigation";
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

// Define types
interface StudentDetails {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  currentClassId: string; 
  dateOfBirth: string;
  location: string;
  homeLanguage: string;
  notes: string;
  specialNeeds: {
    occupationalTherapy: string;
    speechTherapy: string;
    medication: string;
    counselling: string;
  };
  healthInfo: {
    eyesight: string;
    speech: string;
    hearing: string;
  };
}

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params promise using React.use()
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const [isTherapist, setIsTherapist] = useState(false);
  
  // School search state
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schools, setSchools] = useState<ComboboxOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Form fields
  const [studentInfo, setStudentInfo] = useState<StudentDetails>({
    id: "",
    firstName: "",
    lastName: "",
    gender: "",
    currentClassId: "",
    dateOfBirth: "",
    location: "",
    homeLanguage: "english",
    notes: "",
    specialNeeds: {
      occupationalTherapy: "none",
      speechTherapy: "none",
      medication: "none",
      counselling: "none"
    },
    healthInfo: {
      eyesight: "none",
      speech: "none",
      hearing: "none"
    }
  });
  
  // Get class ID from search params if available
  const classId = searchParams.get('classId');
  
  // Get back link
  const backLink = `/protected/students/${id}${classId ? `?classId=${classId}` : ''}`;

  // Initialize page data
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
        
        // Get user role and school info
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
          if (userData.schools && !isTherapist) {
            setSchoolName(userData.schools.name);
          }
        }
        
        // Fetch all classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, class_name, academic_year')
          .order('created_at', { ascending: false });

        if (classesError) {
          console.error("Error fetching classes:", classesError);
        } else if (classesData) {
          setClasses(classesData);
        }
        
        // Fetch the actual student data
        const { data: studentResult, error: studentError } = await supabase
          .from('students')
          .select(`
            id,
            student_id,
            first_name,
            last_name,
            gender,
            date_of_birth,
            home_language,
            school_id,
            location,
            occupational_therapy,
            speech_language_therapy,
            medication,
            counselling,
            notes,
            schools (
              id,
              name,
              Location
            ),
            class_enrollments (
              class_id,
              classes (
                id,
                class_name,
                grade_level,
                academic_year
              )
            )
          `)
          .eq('id', id)
          .single();

        if (studentError) {
          console.error("Error fetching student data:", studentError);
          router.push("/protected/students");
          return;
        }
        
        if (studentResult) {
          setStudentData(studentResult);
          
          // Set initial school state
          if (studentResult.schools) {
            setSchoolId(studentResult.school_id || "");
            setSchoolName(studentResult.schools.name || "");
          }
          
          // Set form fields
          setStudentInfo({
            id: studentResult.student_id || "",
            firstName: studentResult.first_name || "",
            lastName: studentResult.last_name || "",
            gender: studentResult.gender || "",
            currentClassId: studentResult.class_enrollments?.length > 0 ? 
                        studentResult.class_enrollments[0].class_id : "",
            dateOfBirth: studentResult.date_of_birth || "",
            location: studentResult.location || studentResult.schools?.Location || "",
            homeLanguage: studentResult.home_language || "english",
            notes: studentResult.notes || "",
            specialNeeds: {
              occupationalTherapy: studentResult.occupational_therapy || "none",
              speechTherapy: studentResult.speech_language_therapy || "none",
              medication: studentResult.medication || "none",
              counselling: studentResult.counselling || "none"
            },
            healthInfo: {
              eyesight: studentResult.healthInfo?.eyesight || "none",
              speech: studentResult.healthInfo?.speech || "none",
              hearing: studentResult.healthInfo?.hearing || "none"
            }
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing page:", error);
        setLoading(false);
      }
    };
    
    initPage();
  }, [id, router, isTherapist]);
  
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
    setMessage(null);
    
    try {
      const formData = new FormData();
      
      // Add all student info to form data
      formData.append('studentId', id);
      formData.append('firstName', studentInfo.firstName);
      formData.append('lastName', studentInfo.lastName);
      formData.append('gender', studentInfo.gender);
      formData.append('classId', studentInfo.currentClassId);
      formData.append('student_id', studentInfo.id);
      
      // For therapists, use the selected school ID from combobox
      if (isTherapist && schoolId) {
        formData.append('schoolId', schoolId);
      } else if (studentData?.school_id) {
        // For teachers, use the current school ID
        formData.append('schoolId', studentData.school_id);
      }
      
      formData.append('location', studentInfo.location);
      formData.append('dateOfBirth', studentInfo.dateOfBirth);
      formData.append('homeLanguage', studentInfo.homeLanguage);
      formData.append('occupationalTherapy', studentInfo.specialNeeds.occupationalTherapy);
      formData.append('speechTherapy', studentInfo.specialNeeds.speechTherapy);
      formData.append('medication', studentInfo.specialNeeds.medication);
      formData.append('counselling', studentInfo.specialNeeds.counselling);
      formData.append('eyesight', studentInfo.healthInfo.eyesight);
      formData.append('speech', studentInfo.healthInfo.speech);
      formData.append('hearing', studentInfo.healthInfo.hearing);
      
      // Submit the form
      const response = await fetch("/api/actions/updateStudent", {
        method: "POST",
        body: formData,
        credentials: 'include', // Include credentials (cookies)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to update student");
      }
      
      setMessage("Student information updated successfully");
      setMessageType("success");
      
      // Redirect back to student view after short delay
      setTimeout(() => {
        router.push(backLink);
      }, 1500);
      
    } catch (error) {
      console.error("Error updating student:", error);
      setMessage(error instanceof Error ? error.message : "An unexpected error occurred");
      setMessageType("error");
      setLoading(false);
    }
  };

  if (loading && !studentData) {
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
          href={backLink}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Student Information</h1>
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
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input 
              id="studentId" 
              value={studentInfo.id}
              onChange={(e) => setStudentInfo({...studentInfo, id: e.target.value})}
              className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                name="firstName"
                placeholder="First Name" 
                value={studentInfo.firstName}
                onChange={(e) => setStudentInfo({...studentInfo, firstName: e.target.value})}
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                name="lastName"
                placeholder="Last Name" 
                value={studentInfo.lastName}
                onChange={(e) => setStudentInfo({...studentInfo, lastName: e.target.value})}
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                name="gender"
                value={studentInfo.gender}
                onValueChange={(value) => setStudentInfo({...studentInfo, gender: value})}
              >
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
              <Select 
                name="classId"
                value={studentInfo.currentClassId}
                onValueChange={(value) => setStudentInfo({...studentInfo, currentClassId: value})}
              >
                <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.class_name} ({classItem.academic_year})
                    </SelectItem>
                  ))}
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
                  onChange={(value) => {
                    setSchoolId(value);
                    const selectedSchool = schools.find(s => s.value === value);
                    if (selectedSchool) {
                      setSchoolName(selectedSchool.label);
                    }
                  }}
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
                                                         <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                name="location"
                placeholder="City/Town"
                value={studentInfo.location}
                onChange={(e) => setStudentInfo({...studentInfo, location: e.target.value})}
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
                value={studentInfo.dateOfBirth}
                onChange={(e) => setStudentInfo({...studentInfo, dateOfBirth: e.target.value})}
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="homeLanguage">Home Language</Label>
              <Select 
                name="homeLanguage"
                value={studentInfo.homeLanguage}
                onValueChange={(value) => setStudentInfo({...studentInfo, homeLanguage: value})}
              >
                <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="afrikaans">Afrikaans</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
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
                <Select 
                  name="occupationalTherapy"
                  value={studentInfo.specialNeeds.occupationalTherapy}
                  onValueChange={(value) => setStudentInfo({
                    ...studentInfo, 
                    specialNeeds: {...studentInfo.specialNeeds, occupationalTherapy: value}
                  })}
                >
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="attending">Attending</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="speechTherapy">Speech and Language Therapy</Label>
                <Select 
                  name="speechTherapy"
                  value={studentInfo.specialNeeds.speechTherapy}
                  onValueChange={(value) => setStudentInfo({
                    ...studentInfo, 
                    specialNeeds: {...studentInfo.specialNeeds, speechTherapy: value}
                  })}
                >
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="attending">Attending</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <Select 
                  name="medication"
                  value={studentInfo.specialNeeds.medication}
                  onValueChange={(value) => setStudentInfo({
                    ...studentInfo, 
                    specialNeeds: {...studentInfo.specialNeeds, medication: value}
                  })}
                >
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="attending">Attending</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="counselling">Counselling</Label>
                <Select 
                  name="counselling"
                  value={studentInfo.specialNeeds.counselling}
                  onValueChange={(value) => setStudentInfo({
                    ...studentInfo, 
                    specialNeeds: {...studentInfo.specialNeeds, counselling: value}
                  })}
                >
                  <SelectTrigger className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="attending">Attending</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
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
                <Select 
                  name="eyesight"
                  value={studentInfo.healthInfo.eyesight}
                  onValueChange={(value) => setStudentInfo({
                    ...studentInfo, 
                    healthInfo: {...studentInfo.healthInfo, eyesight: value}
                  })}
                >
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
                <Select 
                  name="speech"
                  value={studentInfo.healthInfo.speech}
                  onValueChange={(value) => setStudentInfo({
                    ...studentInfo, 
                    healthInfo: {...studentInfo.healthInfo, speech: value}
                  })}
                >
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
                <Select 
                  name="hearing"
                  value={studentInfo.healthInfo.hearing}
                  onValueChange={(value) => setStudentInfo({
                    ...studentInfo, 
                    healthInfo: {...studentInfo.healthInfo, hearing: value}
                  })}
                >
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
              <Link href={backLink}>
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
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 