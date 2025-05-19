"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { useRouter } from "next/navigation";

export default function CompleteProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch current user info when component loads
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Not authenticated");
        }

        // Prefill email from user metadata
        setEmail(user.email || "");
        
        // Try to get first and last name from user metadata
        if (user.user_metadata) {
          setFirstName(user.user_metadata.first_name || "");
          setLastName(user.user_metadata.last_name || "");
          if (user.user_metadata.role) {
            setRole(user.user_metadata.role);
          }
          if (user.user_metadata.school_id) {
            setSchoolId(user.user_metadata.school_id);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Please sign in to complete your profile");
        setLoading(false);
        // Redirect to sign-in after a short delay
        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      }
    };

    fetchUserInfo();
  }, [router]);

  // Search schools function
  const searchSchools = async (term: string) => {
    if (!term || term.length < 2) {
      setSchools([]);
      return;
    }
    
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
    if (value.length === 0) {
      setSchools([]);
    }
  };

  // Effect to handle role change
  useEffect(() => {
    // If role is therapist, explicitly set schoolId to null
    if (role === "therapist") {
      setSchoolId("");
    }
  }, [role]);

  // Submit the form to create user profile
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Not authenticated");
      }
      
      // Create user profile in the database
      const now = new Date().toISOString();
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: role,
          school_id: role === "therapist" ? null : (schoolId || null),
          created_at: now,
          updated_at: now
        });
        
      if (profileError) {
        console.error("Database error details:", JSON.stringify(profileError));
        throw new Error(`Database error: ${profileError.message || profileError.details || 'Unknown error'}`);
      }
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
          school_id: role === "therapist" ? null : (schoolId || null)
        }
      });
      
      // Redirect to dashboard
      router.push("/protected");
    } catch (error) {
      console.error("Error completing profile:", error);
      setError(`Failed to complete profile setup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search when user types
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchSchools(searchTerm);
      }
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchTerm]);

  if (loading && !firstName) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
          <Button 
            className="mt-4" 
            variant="default"
            onClick={() => router.push("/sign-in")}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600">
            Please provide the following information to complete your account setup.
          </p>
          <p className="mt-2 text-orange-600 text-sm">
            This step is required after verifying your email address.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup value={role} onValueChange={setRole} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher" className="cursor-pointer">Teacher</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="cursor-pointer">Administrator</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="therapist" id="therapist" />
                  <Label htmlFor="therapist" className="cursor-pointer">Private Therapist</Label>
                </div>
              </RadioGroup>
            </div>
            
            {role !== "therapist" && (
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Combobox
                  options={schools}
                  value={schoolId}
                  onChange={setSchoolId}
                  placeholder={loading ? "Searching schools..." : "Type to search for your school..."}
                  disabled={loading}
                  emptyMessage={searchTerm.length < 2 
                    ? "Type at least 2 characters to search" 
                    : searchError || "No schools found with that name. Try a different search term."}
                  onSearch={handleSearchInput}
                />
                <p className="text-xs text-gray-500">
                  Type at least 2 characters to search for your school
                </p>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#f6822d] hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              "Complete Profile"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
} 