import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./types";

// Create a singleton instance to avoid multiple instances
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Function to check if the network is online
const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

export const createClient = () => {
  if (supabaseClient) return supabaseClient;
  
  // Get Supabase URL and anon key from environment variables
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yeoqphvpbqwrulsdhpvq.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllb3FwaHZwYnF3cnVsc2RocHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1OTc2NzcsImV4cCI6MjA2MTE3MzY3N30.eE0sWO4ONA6mtYkcB1IWz7yzYfMrdR7qhZo2tK5AuN8";
  
  // Remove trailing slash if present to avoid URL formatting issues
  if (supabaseUrl.endsWith('/')) {
    supabaseUrl = supabaseUrl.slice(0, -1);
  }
  
  // Check if we're online before attempting to create the client
  if (!isOnline()) {
    console.warn('Network appears to be offline. Supabase operations will fail.');
  }
  
  // Create a new client if one doesn't exist
  try {
    // Create the Supabase client with minimal custom options to avoid issues
    supabaseClient = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
    
    return supabaseClient;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw new Error('Failed to initialize Supabase client. Please check your configuration.');
  }
};

// Helper to handle common auth-related operations with error handling
export const supabaseAuthHelper = {
  async getCurrentSession() {
    try {
      const client = createClient();
      const { data, error } = await client.auth.getSession();
      if (error) {
        console.error('Error getting session:', error.message);
        return null;
      }
      return data.session;
    } catch (err) {
      console.error('Unexpected error getting session:', err);
      return null;
    }
  },

  async refreshSession() {
    try {
      const client = createClient();
      const { data, error } = await client.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error.message);
        return false;
      }
      return !!data.session;
    } catch (err) {
      console.error('Unexpected error refreshing session:', err);
      return false;
    }
  }
};
