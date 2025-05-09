"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, Suspense } from "react";
import { SmtpMessage } from "../smtp-message";
import { createClient } from "@/utils/supabase/client";

// Create a client component that uses useSearchParams
function SignupForm() {
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Search schools directly from database with more flexible search
  const searchSchools = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setSchools([]);
      return;
    }
    
    setLoading(true);
    setSearchError(null);
    
    try {
      console.log("Searching for schools with term:", term);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("schools")
        .select("id, name")
        .ilike("name", `%${term}%`)
        .order("name")
        .limit(50);
      
      if (error) {
        console.error("Supabase error:", error);
        setSearchError("Error searching schools: " + error.message);
        throw error;
      }
      
      console.log("Search results:", data?.length || 0, "schools found");
      
      if (data && data.length > 0) {
        const options = data.map((school) => ({
          value: school.id,
          label: school.name,
        }));
        setSchools(options);
      } else {
        // If no exact matches, try a more flexible search
        const { data: fuzzyData, error: fuzzyError } = await supabase
          .from("schools")
          .select("id, name")
          .or(`name.ilike.%${term.split('').join('%')}%`)
          .order("name")
          .limit(50);
          
        if (fuzzyError) {
          console.error("Fuzzy search error:", fuzzyError);
        } else if (fuzzyData && fuzzyData.length > 0) {
          console.log("Fuzzy search results:", fuzzyData.length, "schools found");
          const options = fuzzyData.map((school) => ({
            value: school.id,
            label: school.name,
          }));
          setSchools(options);
        } else {
          setSchools([]);
        }
      }
    } catch (error) {
      console.error("Error searching schools:", error);
      setSearchError("Failed to search schools. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Handle direct search input changes
  const handleSearchInput = useCallback((value: string) => {
    setSearchTerm(value);
    if (value.length === 0) {
      setSchools([]);
    }
  }, []);
  
  // Debounced search when user types
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchSchools(searchTerm);
      }
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchTerm, searchSchools]);

  // Create a message object from searchParams
  const message: Message | null = (() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const messageText = searchParams.get("message");
    
    if (success) return { success };
    if (error) return { error };
    if (messageText) return { message: messageText };
    return null;
  })();

  if (message) {
    return (
      <div className="w-full flex-1 flex items-center justify-center gap-2 p-4">
        <FormMessage message={message} />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("schoolId", schoolId);
    
    // Submit the form using the server action
    await signUpAction(formData);
  };

  return (
    <form className="flex-1 flex flex-col w-full" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-gray-900">Sign up</h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">
        Already have an account?{" "}
        <Link className="text-[#f6822d] hover:text-orange-600 font-medium" href="/sign-in">
          Sign in
        </Link>
      </p>
      <div className="flex flex-col gap-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
            <Input 
              id="firstName"
              name="firstName" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John" 
              required 
              className="rounded-md border-gray-300 focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
            <Input 
              id="lastName"
              name="lastName" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe" 
              required 
              className="rounded-md border-gray-300 focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">Email</Label>
          <Input 
            id="email"
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" 
            type="email"
            required 
            className="rounded-md border-gray-300 focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            minLength={6}
            required
            className="rounded-md border-gray-300 focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-gray-700">Role</Label>
          <RadioGroup 
            value={role} 
            onValueChange={setRole}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="teacher" id="teacher" />
              <Label htmlFor="teacher" className="cursor-pointer">Teacher</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="admin" id="admin" />
              <Label htmlFor="admin" className="cursor-pointer">Administrator</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="school" className="text-gray-700">School</Label>
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
          <p className="text-xs text-gray-500 mt-1">
            Type at least 2 characters to search for your school
          </p>
        </div>
        
        <div className="mt-2">
          <SubmitButton className="w-full bg-[#f6822d] hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6822d] focus:ring-opacity-50 transition">
            Sign Up
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

// Loading fallback for the Suspense boundary
function SignupLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="p-4 max-w-md w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component that wraps the SignupForm with Suspense
export default function Signup() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupForm />
    </Suspense>
  );
}
