import { createServerClient } from "@supabase/ssr";
import { type CookieOptions } from "@supabase/ssr";
import { Database } from "./types";
import { hasEnvVars } from "./check-env-vars";

// Function to determine if we're in the Edge runtime
const isEdgeRuntime = () => {
  return process.env.NEXT_RUNTIME === 'edge';
};

// Function to determine if we're in a Server Component context
const isAppDirContext = () => {
  try {
    // This will throw an error if we're in the pages directory
    require('next/headers');
    return true;
  } catch (e) {
    return false;
  }
};

export const createClient = async (cookieHeader?: string) => {
  try {
    // Get the environment variables
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Check if environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Remove trailing slash if present to avoid URL formatting issues
    if (supabaseUrl.endsWith('/')) {
      supabaseUrl = supabaseUrl.slice(0, -1);
    }

    if (isAppDirContext()) {
      // App directory with Server Components - use next/headers
      // Import cookies directly from next/headers for async usage
      const nextCookies = await import('next/headers');
      
      return createServerClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            async get(name) {
              const cookieStore = await nextCookies.cookies();
              const cookie = await cookieStore.get(name);
              return cookie?.value;
            },
            async set(name, value, options) {
              try {
                const cookieStore = await nextCookies.cookies();
                await cookieStore.set(name, value, options);
              } catch (error) {
                // This can fail in middleware or other contexts
                console.error("Cookie set error:", error);
              }
            },
            async remove(name, options) {
              try {
                const cookieStore = await nextCookies.cookies();
                await cookieStore.set(name, "", { ...options, maxAge: 0 });
              } catch (error) {
                console.error("Cookie remove error:", error);
              }
            },
          },
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        }
      );
    } else {
      // Pages directory or API route - provide dummy cookie handling
      // In a real app, you'd pass request/response objects to handle cookies properly
      return createServerClient<Database>(
        supabaseUrl,
        supabaseAnonKey, 
        {
          cookies: {
            async get(name) {
              console.warn("Cookie get() called in pages directory without proper implementation");
              return undefined;
            },
            async set(name, value, options) {
              console.warn("Cookie set() called in pages directory without proper implementation");
            },
            async remove(name, options) {
              console.warn("Cookie remove() called in pages directory without proper implementation");
            },
          },
          auth: {
            persistSession: false, // Don't persist in pages directory without proper cookie handling
          }
        }
      );
    }
  } catch (error) {
    console.error('Error creating server client:', error);
    throw new Error('Failed to initialize Supabase server client');
  }
};

// Helper function to fetch authenticated user on the server
export async function getAuthenticatedUser(cookieHeader?: string) {
  try {
    const supabase = await createClient(cookieHeader);
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      console.error("Auth error getting user:", error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error("Unexpected error getting authenticated user:", error);
    return null;
  }
}
