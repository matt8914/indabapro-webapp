"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, BookOpen, Users, BarChart2, Settings, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import { DataAccessError } from "@/utils/data-access";

type SidebarItem = {
  name: string;
  icon: React.ReactNode;
  href: string;
  current: boolean;
};

interface SidebarProps {
  currentPath: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const [userProfile, setUserProfile] = useState<{
    first_name: string;
    last_name: string;
    school_name?: string;
    initials: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we're viewing a student from a class page
  const isStudentFromClass = currentPath.includes("/protected/students/") && classId !== null;
  
  useEffect(() => {
    let isMounted = true;  // For cleanup in case component unmounts during async operation
    let retryCount = 0;
    const maxRetries = 2;
    
    async function fetchUserProfile() {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching user profile, attempt:', retryCount + 1);
        const supabase = createClient();
        
        // Add timeout for auth request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        // Get the authenticated user
        const { data: authData, error: authError } = await supabase.auth.getUser();
        clearTimeout(timeoutId);
        
        if (authError) throw new DataAccessError(authError.message, 401);
        if (!authData.user) throw new DataAccessError("No authenticated user found", 401);
        
        const user = authData.user;
        
        // Get the user profile from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('first_name, last_name, school_id')
          .eq('id', user.id)
          .single();
          
        if (userError) {
          // Check if it's a "no rows returned" error (which happens after signup before profile is created)
          if (userError.code === 'PGRST116') {
            // Redirect to sign-out and then sign-in to refresh the session
            await supabase.auth.signOut();
            window.location.href = "/sign-in?error=Please+sign+in+again+to+complete+your+profile+setup";
            return;
          }
          throw new DataAccessError(`Error fetching user data: ${userError.message}`, 500);
        }
        if (!userData) throw new DataAccessError("User profile not found", 404);
        
        let schoolName;
        // If user has a school_id, fetch the school name
        if (userData.school_id) {
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('name')
            .eq('id', userData.school_id)
            .single();
            
          if (!schoolError && schoolData) {
            schoolName = schoolData.name;
          }
        }
        
        // Create initials from first and last name
        const initials = `${userData.first_name.charAt(0)}${userData.last_name.charAt(0)}`;
        
        if (isMounted) {
          setUserProfile({
            first_name: userData.first_name,
            last_name: userData.last_name,
            school_name: schoolName,
            initials: initials.toUpperCase()
          });
          setError(null);
        }
      } catch (error) {
        console.error('Error in fetching user profile:', error);
        
        if (!isMounted) return;
        
        // Retry on network errors or timeouts
        if (retryCount < maxRetries && 
           ((error instanceof Error && 
             (error.message.includes('network') || 
              error.message.includes('Failed to fetch') ||
              error.message.includes('timed out'))) ||
            (error instanceof DOMException && error.name === 'AbortError'))) {
          retryCount++;
          console.log(`Retrying user profile fetch (${retryCount}/${maxRetries})...`);
          setTimeout(fetchUserProfile, 1000 * retryCount);
          return;
        }
        
        if (isMounted) {
          setError(error instanceof DataAccessError ? error.message : "Failed to load user profile");
          // Still set a placeholder profile with empty values
          setUserProfile({
            first_name: "User",
            last_name: "",
            initials: "U"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchUserProfile();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect even if there's an error
      window.location.href = "/";
    }
  };

  const handleRetryUserProfile = () => {
    setIsLoading(true);
    setError(null);
    
    // Force a re-render by updating state
    setUserProfile(null);
    
    // Add a small delay before retrying
    setTimeout(() => {
      const fetchProfile = async () => {
        try {
          const supabase = createClient();
          const { data: authData, error: authError } = await supabase.auth.getUser();
          
          if (authError) throw new DataAccessError(authError.message, 401);
          if (!authData.user) throw new DataAccessError("No authenticated user found", 401);
          
          const user = authData.user;
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('first_name, last_name, school_id')
            .eq('id', user.id)
            .single();
            
          if (userError) throw new DataAccessError(`Error fetching user data: ${userError.message}`, 500);
          
          let schoolName;
          if (userData.school_id) {
            const { data: schoolData } = await supabase
              .from('schools')
              .select('name')
              .eq('id', userData.school_id)
              .single();
              
            if (schoolData) {
              schoolName = schoolData.name;
            }
          }
          
          const initials = `${userData.first_name.charAt(0)}${userData.last_name.charAt(0)}`;
          
          setUserProfile({
            first_name: userData.first_name,
            last_name: userData.last_name,
            school_name: schoolName,
            initials: initials.toUpperCase()
          });
          setError(null);
        } catch (error) {
          console.error('Error retrying profile fetch:', error);
          setError(error instanceof DataAccessError ? error.message : "Failed to load user profile");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchProfile();
    }, 500);
  };

  const navigation: SidebarItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/protected",
      current: currentPath === "/protected" || currentPath === "/protected/",
    },
    {
      name: "My Classes",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/protected/classes",
      current: currentPath.includes("/protected/classes") || isStudentFromClass,
    },
    {
      name: "Students",
      icon: <Users className="h-5 w-5" />,
      href: "/protected/students",
      current: currentPath.includes("/protected/students") && !isStudentFromClass,
    },
    {
      name: "Assessments",
      icon: <BarChart2 className="h-5 w-5" />,
      href: "/protected/assessments",
      current: currentPath.includes("/protected/assessments"),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-6 flex justify-center">
        <Link href="/protected">
          <div className="flex items-center justify-center">
            <Image 
              src="/images/indabapro logo.png" 
              alt="IndabaPro Logo" 
              width={130}
              height={55}
              priority
            />
          </div>
        </Link>
      </div>
      <nav className="space-y-1 px-2 flex-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`
              flex items-center px-4 py-3 text-sm font-medium rounded-lg
              ${
                item.current
                  ? "bg-orange-50 text-[#f6822d]"
                  : "text-gray-600 hover:bg-gray-50"
              }
            `}
          >
            <div className={`${item.current ? "text-[#f6822d]" : "text-gray-400"} mr-3`}>
              {item.icon}
            </div>
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center cursor-pointer">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#f6822d] text-white">
                  {isLoading ? "..." : userProfile?.initials || "..."}
                </div>
              </div>
              <div className="ml-3 text-left">
                {isLoading ? (
                  <>
                    <p className="text-sm font-medium text-gray-700">Loading...</p>
                    <p className="text-xs font-medium text-gray-500">...</p>
                  </>
                ) : error ? (
                  <>
                    <p className="text-sm font-medium text-red-500">Error</p>
                    <p className="text-xs font-medium text-gray-500 hover:underline cursor-pointer" onClick={handleRetryUserProfile}>Click to retry</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700">
                      {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "User"}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      {userProfile?.school_name || "No School"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <Link href="/protected/settings">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center gap-2 text-red-500">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
        IndabaPro Teacher MVP
        <br />
        © 2025 IndabaPro
      </div>
    </div>
  );
} 