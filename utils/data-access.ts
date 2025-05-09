import { createClient } from "./supabase/server";
import { Database } from "./supabase/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { PostgrestQueryBuilder, PostgrestError } from "@supabase/postgrest-js";

// Generic error with HTTP status code
export class DataAccessError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "DataAccessError";
    this.statusCode = statusCode;
  }
}

// Safely execute a database query with standardized error handling
export async function executeQuery<T>(
  queryFn: (supabase: SupabaseClient<Database>) => Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const supabase = await createClient();
    const { data, error } = await queryFn(supabase);
    
    if (error) {
      console.error("Database query error:", error);
      
      // Determine appropriate status code based on error
      let statusCode = 500;
      if (error.code === "PGRST116") statusCode = 404; // Resource not found
      if (error.code === "PGRST109") statusCode = 403; // Forbidden by RLS policy
      if (error.code === "42501") statusCode = 403;    // Insufficient privileges
      
      throw new DataAccessError(error.message || "Database query failed", statusCode);
    }
    
    if (data === null) {
      throw new DataAccessError("No data found", 404);
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    
    console.error("Unexpected error during query execution:", error);
    throw new DataAccessError("Failed to execute database query", 500);
  }
}

// Type-safe table names from our database schema
type TableNames = keyof Database['public']['Tables'];

// Helper to fetch data with pagination
export async function fetchPaginatedData<T>(
  tableName: TableNames,
  options: {
    page?: number;
    pageSize?: number;
    select?: string;
    filters?: Record<string, any>;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}
): Promise<{ data: T[]; count: number }> {
  const {
    page = 1,
    pageSize = 10,
    select = '*',
    filters = {},
    orderBy = 'created_at',
    orderDirection = 'desc'
  } = options;
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  
  return executeQuery<{ data: T[]; count: number }>(async (supabase) => {
    let query = supabase
      .from(tableName)
      .select(select, { count: 'exact' });
    
    // Apply filters
    Object.entries(filters).forEach(([column, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(column, value);
        } else {
          query = query.eq(column, value);
        }
      }
    });
    
    // Apply pagination and ordering
    const { data, error, count } = await query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(start, end);
    
    return { 
      data: { 
        data: (data as T[]) || [], 
        count: count || 0 
      }, 
      error 
    };
  });
} 