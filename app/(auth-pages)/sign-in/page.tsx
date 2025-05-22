import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm({ searchParams }: { searchParams: Message | null }) {
  return (
    <form className="flex-1 flex flex-col w-full">
      <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">
        Don't have an account?{" "}
        <Link className="text-[#f6822d] hover:text-orange-600 font-medium" href="/sign-up">
          Sign up
        </Link>
      </p>
      
      {searchParams && (
        <div className="mb-4">
          <FormMessage message={searchParams} />
        </div>
      )}
      
      <div className="flex flex-col gap-4 mt-2">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">Email</Label>
          <Input 
            name="email" 
            placeholder="you@example.com" 
            required 
            className="rounded-md border-gray-300 focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Link
              className="text-xs text-[#f6822d] hover:text-orange-600"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
            className="rounded-md border-gray-300 focus:border-[#f6822d] focus:ring focus:ring-[#f6822d] focus:ring-opacity-20"
          />
        </div>
        
        <div className="mt-2">
          <SubmitButton 
            pendingText="Signing In..." 
            formAction={signInAction}
            className="w-full bg-[#f6822d] hover:bg-orange-600 text-white"
          >
            Sign in
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

// Loading fallback for the Suspense boundary
function LoginLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="p-4 max-w-md w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-full flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Login({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  // Convert the search params to a Message object
  const message: Message | null = (() => {
    const success = searchParams.success?.toString();
    const error = searchParams.error?.toString();
    const info = searchParams.info?.toString();
    const warning = searchParams.warning?.toString();
    const messageText = searchParams.message?.toString();
    
    if (success) return { success };
    if (error) return { error };
    if (info) return { info };
    if (warning) return { warning };
    if (messageText) return { message: messageText };
    return null;
  })();
  
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm searchParams={message} />
    </Suspense>
  );
}
