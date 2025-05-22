"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    // Log the state at the beginning of the function
    console.log("Starting password reset process", { passwordLength: password.length });
    
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
      console.log("Attempting to update user password");
      const { data, error } = await supabase.auth.updateUser({ password });
      console.log("Password update result:", { success: !error, userId: data?.user?.id });
      
      if (error) {
        console.error("Password update error:", error);
        setMessage({ type: "error", text: error.message });
      } else {
        console.log("Password updated successfully, redirecting to sign-in");
        setMessage({ 
          type: "success", 
          text: "Password updated successfully! You will be redirected to sign in." 
        });
        
        // Redirect after a brief delay to allow the user to read the success message
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <KeyRound className="h-10 w-10 text-orange-500" />
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Please enter a new password for your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            {message && (
              <div 
                className={`p-3 rounded-md ${
                  message.type === "success" 
                    ? "bg-green-50 text-green-800" 
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your new password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Confirm your new password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-[#f6822d] hover:bg-[#e67220] text-white" 
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 