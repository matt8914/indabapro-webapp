export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assessment_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_components: {
        Row: {
          created_at: string
          description: string | null
          id: string
          max_score: number | null
          min_score: number | null
          name: string
          type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number | null
          min_score?: number | null
          name: string
          type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number | null
          min_score?: number | null
          name?: string
          type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_components_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_sessions: {
        Row: {
          assessment_type_id: string
          class_id: string
          created_at: string
          id: string
          remarks: string | null
          test_date: string
          tester_id: string
          updated_at: string
        }
        Insert: {
          assessment_type_id: string
          class_id: string
          created_at?: string
          id?: string
          remarks?: string | null
          test_date: string
          tester_id: string
          updated_at?: string
        }
        Update: {
          assessment_type_id?: string
          class_id?: string
          created_at?: string
          id?: string
          remarks?: string | null
          test_date?: string
          tester_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sessions_assessment_type_id_fkey"
            columns: ["assessment_type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sessions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sessions_tester_id_fkey"
            columns: ["tester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_types: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "assessment_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          class_id: string
          created_at: string
          id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string
          class_name: string
          created_at: string
          grade_level: string
          id: string
          school_id: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          class_name: string
          created_at?: string
          grade_level: string
          id?: string
          school_id: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_name?: string
          created_at?: string
          grade_level?: string
          id?: string
          school_id?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          contact_number: string | null
          created_at: string
          id: string
          name: string
          principal_name: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          created_at?: string
          id?: string
          name: string
          principal_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          created_at?: string
          id?: string
          name?: string
          principal_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_assessment_scores: {
        Row: {
          component_id: string
          created_at: string
          id: string
          percentile: number | null
          raw_score: number
          session_id: string
          standardized_score: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          component_id: string
          created_at?: string
          id?: string
          percentile?: number | null
          raw_score: number
          session_id: string
          standardized_score?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          component_id?: string
          created_at?: string
          id?: string
          percentile?: number | null
          raw_score?: number
          session_id?: string
          standardized_score?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_assessment_scores_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "assessment_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assessment_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assessment_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_academic_ages: {
        Row: {
          id: string
          student_id: string
          session_id: string
          test_type: string
          raw_score: number
          academic_age: string
          chronological_age: string
          age_difference: string
          is_deficit: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          session_id: string
          test_type: string
          raw_score: number
          academic_age: string
          chronological_age: string
          age_difference: string
          is_deficit: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          session_id?: string
          test_type?: string
          raw_score?: number
          academic_age?: string
          chronological_age?: string
          age_difference?: string
          is_deficit?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_academic_ages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_academic_ages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          assessment_type_id: string
          created_at: string
          id: string
          last_assessment_date: string
          notes: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          assessment_type_id: string
          created_at?: string
          id?: string
          last_assessment_date: string
          notes?: string | null
          status: string
          student_id: string
          updated_at?: string
        }
        Update: {
          assessment_type_id?: string
          created_at?: string
          id?: string
          last_assessment_date?: string
          notes?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_assessment_type_id_fkey"
            columns: ["assessment_type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          counselling: boolean | null
          created_at: string
          date_of_birth: string | null
          first_name: string
          gender: string
          home_language: string
          id: string
          last_name: string
          medication: string | null
          occupational_therapy: boolean | null
          school_id: string
          speech_language_therapy: boolean | null
          student_id: string
          updated_at: string
        }
        Insert: {
          counselling?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          first_name: string
          gender: string
          home_language: string
          id?: string
          last_name: string
          medication?: string | null
          occupational_therapy?: boolean | null
          school_id: string
          speech_language_therapy?: boolean | null
          student_id: string
          updated_at?: string
        }
        Update: {
          counselling?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string
          gender?: string
          home_language?: string
          id?: string
          last_name?: string
          medication?: string | null
          occupational_therapy?: boolean | null
          school_id?: string
          speech_language_therapy?: boolean | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          role: string
          school_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          role: string
          school_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          role?: string
          school_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases for common tables
export type School = Database['public']['Tables']['schools']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Class = Database['public']['Tables']['classes']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type AssessmentCategory = Database['public']['Tables']['assessment_categories']['Row']
export type AssessmentType = Database['public']['Tables']['assessment_types']['Row']
export type AssessmentComponent = Database['public']['Tables']['assessment_components']['Row']
export type AssessmentSession = Database['public']['Tables']['assessment_sessions']['Row']
export type StudentAssessmentScore = Database['public']['Tables']['student_assessment_scores']['Row']
export type StudentAcademicAge = Database['public']['Tables']['student_academic_ages']['Row']
export type StudentProgress = Database['public']['Tables']['student_progress']['Row']
export type ClassEnrollment = Database['public']['Tables']['class_enrollments']['Row'] 