import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col w-full">
      <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">
        Don't have an account?{" "}
        <Link className="text-[#f6822d] hover:text-orange-600 font-medium" href="/sign-up">
          Sign up
        </Link>
      </p>
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
          <FormMessage message={searchParams} />
        </div>
      </div>
    </form>
  );
}
