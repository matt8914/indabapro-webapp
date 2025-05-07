import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  
  // Sign out from all devices
  await supabase.auth.signOut({ scope: 'global' });
  
  // Redirect to sign-in page
  return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_BASE_URL));
} 