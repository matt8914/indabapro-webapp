import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    
    // After exchanging code for session, check if the user has a profile
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user record exists in the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      // If no user record found, redirect to profile completion
      if (!userData || userError) {
        console.log("No user profile found, redirecting to complete-profile");
        return NextResponse.redirect(`${origin}/auth/complete-profile`);
      }
    }
  }

  // If this is a password reset redirect, send to reset password page
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/auth/reset-password`);
  }

  // For other redirections specified in the URL
  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // Default redirect for sign up/sign in
  return NextResponse.redirect(`${origin}/protected`);
}
