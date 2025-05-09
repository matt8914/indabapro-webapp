import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { type CookieOptions } from "@supabase/ssr";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Get environment variables for Supabase
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Check if environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables in middleware');
      return response;
    }

    // Remove trailing slash if present to avoid URL formatting issues
    if (supabaseUrl.endsWith('/')) {
      supabaseUrl = supabaseUrl.slice(0, -1);
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
        global: {
          fetch: async (url, options = {}) => {
            try {
              // Set cache to no-store to prevent caching issues
              const fetchOptions = {
                ...options,
                cache: 'no-store' as RequestCache,
              };

              const res = await fetch(url, fetchOptions);
              
              // If the response is unauthorized (401), we might need to refresh the token
              if (res.status === 401) {
                console.log('Attempting to refresh token due to 401 response');
                try {
                  // Try to refresh the session
                  const { error } = await supabase.auth.refreshSession();
                  if (!error) {
                    // Retry the original request with the fresh token
                    return fetch(url, fetchOptions);
                  }
                } catch (refreshError) {
                  console.error('Error refreshing token:', refreshError);
                }
              }
              
              return res;
            } catch (error) {
              console.error('Fetch error in middleware:', error);
              throw error;
            }
          }
        }
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { session } } = await supabase.auth.getSession();

    // protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && !session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if ((request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/sign-in") && session) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
  } catch (e) {
    console.error('Middleware error:', e);
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
