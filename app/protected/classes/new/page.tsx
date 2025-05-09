import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { createClassAction } from "@/app/actions";

export default async function NewClassPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get error and message from search params
  const error = resolvedSearchParams?.error?.toString();
  const message = resolvedSearchParams?.message?.toString(); 
  const success = resolvedSearchParams?.success?.toString();

  // Determine if there's any message to show
  const showMessage = error || message || success;
  const messageType = error ? 'error' : (success ? 'success' : 'info');
  const messageContent = error || success || message || '';

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/protected/classes" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Add New Class</h1>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 max-w-2xl">
        {showMessage && (
          <div className={`mb-6 p-4 rounded-md flex items-start gap-3 ${
            messageType === 'error' 
              ? 'bg-red-50 text-red-700 border border-red-100' 
              : messageType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-100' 
                : 'bg-blue-50 text-blue-700 border border-blue-100'
          }`}>
            {messageType === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
            <div>{messageContent}</div>
          </div>
        )}
        
        <form action={createClassAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="className">Class Name</Label>
            <Input 
              id="className" 
              name="className"
              placeholder="e.g. Grade 3A" 
              className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Input 
                id="gradeLevel" 
                name="gradeLevel"
                placeholder="e.g. 3" 
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input 
                id="year" 
                name="year"
                placeholder="e.g. 2025" 
                defaultValue="2025"
                className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="teacherName">Class Teacher</Label>
            <Input 
              id="teacherName" 
              placeholder="Enter teacher's name" 
              className="focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/protected/classes">Cancel</Link>
            </Button>
            <Button type="submit" className="bg-[#f6822d] hover:bg-orange-600">
              Create Class
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 