"use client";

import React, { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequireClassesModal } from "@/components/ui/require-classes-modal";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface AddStudentButtonProps {
  variant?: "button" | "link" | "card";
  children?: React.ReactNode;
  href?: string;
  className?: string;
}

export function AddStudentButton({ 
  variant = "button", 
  children, 
  href = "/protected/students/new",
  className = ""
}: AddStudentButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  const checkClassesExist = async () => {
    setIsChecking(true);
    try {
      const supabase = createClient();
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not logged in, redirect to login (should not happen)
        window.location.href = "/sign-in";
        return;
      }
      
      // Check if user has any classes
      const { data: classes, error } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user.id)
        .limit(1);
        
      if (error) {
        console.error("Error checking classes:", error);
        // If error, allow navigation but log the error
        window.location.href = href;
        return;
      }
      
      // If no classes found, show modal
      if (!classes || classes.length === 0) {
        setShowModal(true);
      } else {
        // If classes exist, navigate to the student registration page
        window.location.href = href;
      }
    } catch (error) {
      console.error("Error in class check:", error);
      // On error, still navigate to avoid blocking the user
      window.location.href = href;
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    checkClassesExist();
  };
  
  // Different rendering based on variant
  if (variant === "card") {
    return (
      <>
        <div 
          onClick={handleClick}
          className={`flex items-center rounded-lg p-4 border border-gray-200 bg-white hover:bg-gray-50 group cursor-pointer ${className}`}
        >
          <div className="flex items-center">
            <div className="text-gray-400 group-hover:text-[#f6822d] mr-3">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {children || "Register a new student"}
            </span>
          </div>
        </div>
        
        <RequireClassesModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      </>
    );
  }
  
  if (variant === "link") {
    return (
      <>
        <a 
          href={href}
          onClick={handleClick}
          className={`text-[#f6822d] hover:text-orange-600 font-medium ${className}`}
        >
          {children || "Add Student"}
        </a>
        
        <RequireClassesModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      </>
    );
  }
  
  // Default button variant
  return (
    <>
      <Button 
        onClick={handleClick}
        className={`bg-[#f6822d] hover:bg-orange-600 ${className}`}
        disabled={isChecking}
      >
        {isChecking ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Checking...
          </span>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            {children || "Add Student"}
          </>
        )}
      </Button>
      
      <RequireClassesModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
} 