import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import fs from 'fs';
import path from 'path';

// Helper function to log to a file (only in development)
function logToFile(message: string) {
  if (process.env.NODE_ENV === 'development') {
    try {
      const logPath = path.join(process.cwd(), 'middleware.log');
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}\n`;
      
      // Append to log file
      fs.appendFileSync(logPath, logMessage);
    } catch (error) {
      // Silent fail for logging
      console.error('Error writing to middleware log:', error);
    }
  }
}

export async function middleware(request: NextRequest) {
  try {
    const url = request.nextUrl.clone();
    logToFile(`Request: ${request.method} ${url.pathname}${url.search}`);
    
    // Add the current pathname to a cookie for layouts to access
    const response = await updateSession(request);
    
    // Log auth-related paths
    if (url.pathname.includes('/auth/') || 
        url.pathname.includes('/reset-password') || 
        url.pathname === '/sign-in' || 
        url.pathname === '/sign-up') {
      logToFile(`Auth path detected: ${url.pathname}`);
    }
    
    return response;
  } catch (error) {
    console.error("Error in middleware:", error);
    logToFile(`Middleware error: ${error instanceof Error ? error.message : String(error)}`);
    
    // Continue without updating the session in case of error
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
