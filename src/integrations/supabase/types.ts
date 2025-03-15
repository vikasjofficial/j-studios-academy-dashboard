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
      attendance: {
        Row: {
          course_id: string
          created_at: string | null
          date: string
          id: string
          note: string | null
          recorded_by: string | null
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          date: string
          id?: string
          note?: string | null
          recorded_by?: string | null
          status: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          recorded_by?: string | null
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          course_id: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          related_id: string | null
          time: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          related_id?: string | null
          time: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          related_id?: string | null
          time?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          id: string
          student_id: string
          teacher: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          id?: string
          student_id: string
          teacher: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          id?: string
          student_id?: string
          teacher?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          instructor: string
          name: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          instructor: string
          name: string
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          instructor?: string
          name?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string | null
          enrollment_date: string
          id: string
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          enrollment_date?: string
          id?: string
          status?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          enrollment_date?: string
          id?: string
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number
          student_id: string
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score: number
          student_id: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number
          student_id?: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          from_name: string
          id: string
          message_type: string | null
          sender_role: string
          status: string | null
          student_id: string
        }
        Insert: {
          content: string
          created_at?: string
          from_name: string
          id?: string
          message_type?: string | null
          sender_role: string
          status?: string | null
          student_id: string
        }
        Update: {
          content?: string
          created_at?: string
          from_name?: string
          id?: string
          message_type?: string | null
          sender_role?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      semesters: {
        Row: {
          course_id: string
          created_at: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semesters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_credentials: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_credentials_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fees: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          payment_date: string | null
          payment_status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          emergency_contact: string | null
          enrollment_date: string
          gender: string | null
          grade: string | null
          id: string
          medical_information: string | null
          name: string
          notes: string | null
          parent_contact: string | null
          parent_name: string | null
          phone: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          emergency_contact?: string | null
          enrollment_date?: string
          gender?: string | null
          grade?: string | null
          id?: string
          medical_information?: string | null
          name: string
          notes?: string | null
          parent_contact?: string | null
          parent_name?: string | null
          phone?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          emergency_contact?: string | null
          enrollment_date?: string
          gender?: string | null
          grade?: string | null
          id?: string
          medical_information?: string | null
          name?: string
          notes?: string | null
          parent_contact?: string | null
          parent_name?: string | null
          phone?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_id: number | null
          semester_id: string | null
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_id?: number | null
          semester_id?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_id?: number | null
          semester_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_lecture: {
        Args: {
          title_input: string
          content_input: string
          folder_id_input: string
        }
        Returns: string
      }
      create_lecture_folder: {
        Args: {
          folder_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
