"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success" | "info"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error("Password update error:", error);
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ 
          type: "success", 
          text: "Password updated successfully! You will be redirected to the dashboard." 
        });
        
        // Redirect after a brief delay to allow the user to read the success message
        setTimeout(() => {
          router.push("/protected");
        }, 3000);
      }
    } catch (error) {
      console.error("Password update exception:", error);
      setMessage({ 
        type: "error", 
        text: "An error occurred while resetting your password." 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-center mb-6">
        <div className="text-[#f6822d] text-4xl font-bold">indabapro</div>
      </div>
      
      <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
        <h1 className="text-2xl font-semibold text-center">Reset Password</h1>
        <p className="text-sm text-foreground/60 text-center mb-4">
          Please enter your new password below.
        </p>
        
        {message && (
          <div className="mb-4">
            <FormMessage message={{ [message.type]: message.text }} />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            required
            disabled={isLoading}
            className="rounded-md border-gray-300 focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
            disabled={isLoading}
            className="rounded-md border-gray-300 focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
          />
        </div>
        
        <div className="mt-2">
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#f6822d] hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6822d] focus:ring-opacity-50 transition"
          >
            {isLoading ? "Processing..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
