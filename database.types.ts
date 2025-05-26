export type Database = {
  public: {
    Tables: {
      classes: {
        Row: {
          id: string;
          class_name: string;
          grade_level: string;
          academic_year: string;
          school_id: string;
          teacher_id: string;
          is_therapist_class?: boolean;
          therapist_name?: string;
          users?: {
            first_name: string;
            last_name: string;
          } | null;
        };
      };
      students: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          gender: string;
          notes?: string | null;
          date_of_birth?: string | null;
        };
      };
      class_enrollments: {
        Row: {
          student_id: string;
          class_id: string;
          students?: {
            id: string;
            first_name: string;
            last_name: string;
            gender: string;
            notes?: string | null;
            date_of_birth?: string | null;
          } | null;
        };
      };
      student_academic_ages: {
        Row: {
          student_id: string;
          academic_age: string;
          age_difference: number;
          is_deficit: boolean;
          created_at: string;
          test_type: 'maths' | 'spelling' | 'reading';
        };
      };
      users: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role: 'teacher' | 'admin' | 'therapist' | 'super_admin';
          school_id?: string;
        };
      };
    };
  };
}; 