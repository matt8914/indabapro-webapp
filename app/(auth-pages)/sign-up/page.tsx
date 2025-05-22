"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { SmtpMessage } from "../smtp-message";

// Create a client component that uses useSearchParams
function SignupForm() {
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create a message object from searchParams
  const message: Message | null = (() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const info = searchParams.get("info");
    const warning = searchParams.get("warning");
    const messageText = searchParams.get("message");
    
    if (success) return { success };
    if (error) return { error };
    if (info) return { info };
    if (warning) return { warning };
    if (messageText) return { message: messageText };
    return null;
  })();

  if (message) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 p-4">
        <FormMessage message={message} />
        {message.success && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Please check your email for a verification link.
            </p>
            <Link 
              className="text-[#f6822d] hover:text-orange-600 font-medium"
              href="/sign-in"
            >
              Return to Sign In
            </Link>
          </div>
        )}
        {message.info && message.info.includes("already registered") && (
          <div className="text-center">
            <Link 
              className="text-[#f6822d] hover:text-orange-600 font-medium"
              href="/sign-in"
            >
              Go to Sign In
            </Link>
          </div>
        )}
        {message.error && (
          <Link 
            className="text-[#f6822d] hover:text-orange-600 font-medium"
            href="/sign-up"
          >
            Try Again
          </Link>
        )}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      
      // Submit the form using the server action
      await signUpAction(formData);
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="therapist" id="therapist" />
              <Label htmlFor="therapist" className="cursor-pointer">Private Therapist</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="mt-2">
          <SubmitButton 
            className="w-full bg-[#f6822d] hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6822d] focus:ring-opacity-50 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
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
