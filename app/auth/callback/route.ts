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

  console.log("Auth callback params:", { 
    hasCode: !!code,
    redirectTo,
    type,
  });

  if (code) {
    const supabase = await createClient();
    const exchangeResult = await supabase.auth.exchangeCodeForSession(code);
    console.log("Code exchange result:", { 
      success: !exchangeResult.error,
      hasSession: !!exchangeResult.data.session,
    });
    
    // After exchanging code for session, check if the user has a profile
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log("User found:", { 
        id: user.id,
        email: user.email,
        hasEmailConfirmed: !!user.email_confirmed_at,
      });
      
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
    console.log("Recovery flow detected, redirecting to reset-password page");
    return NextResponse.redirect(`${origin}/auth/reset-password`);
  }
  
  // Handle explicit redirect to reset password
  if (redirectTo === "/protected/reset-password") {
    console.log("Explicit reset password redirect detected");
    return NextResponse.redirect(`${origin}/auth/reset-password`);
  }

  // For other redirections specified in the URL
  if (redirectTo) {
    console.log(`Redirecting to: ${redirectTo}`);
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // Default redirect for sign up/sign in
  console.log("Default redirect to protected route");
  return NextResponse.redirect(`${origin}/protected`);
}
