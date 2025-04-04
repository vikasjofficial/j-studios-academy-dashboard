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
      admin_credentials: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          password: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          password: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          password?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      classes: {
        Row: {
          content: string | null
          created_at: string | null
          folder_id: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "classes_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      classes_assignments: {
        Row: {
          created_at: string | null
          id: string
          lecture_id: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lecture_id?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lecture_id?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_assignments_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string
          id: string
          lecture_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_type: string
          id?: string
          lecture_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          lecture_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_files_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes_folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      classes_topics: {
        Row: {
          created_at: string | null
          id: string
          lecture_id: string | null
          name: string
          order_position: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lecture_id?: string | null
          name: string
          order_position?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lecture_id?: string | null
          name?: string
          order_position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_topics_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "classes"
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
      exam_assignments: {
        Row: {
          assigned_at: string
          due_date: string | null
          exam_id: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          assigned_at?: string
          due_date?: string | null
          exam_id: string
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          assigned_at?: string
          due_date?: string | null
          exam_id?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_assignments_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_folders: {
        Row: {
          created_at: string
          exam_type: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_type: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_type?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_question_responses: {
        Row: {
          created_at: string
          id: string
          question_id: string
          response_text: string | null
          result_id: string
          score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          response_text?: string | null
          result_id: string
          score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          response_text?: string | null
          result_id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "exam_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_question_responses_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "exam_results"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          order_position: number
          points: number
          question_text: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          order_position: number
          points?: number
          question_text: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          order_position?: number
          points?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          assignment_id: string
          completed_at: string | null
          created_at: string
          id: string
          started_at: string | null
          teacher_notes: string | null
          total_score: number | null
          view_results: boolean
        }
        Insert: {
          assignment_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string | null
          teacher_notes?: string | null
          total_score?: number | null
          view_results?: boolean
        }
        Update: {
          assignment_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string | null
          teacher_notes?: string | null
          total_score?: number | null
          view_results?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "exam_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          exam_type: string
          folder_id: string | null
          id: string
          is_active: boolean
          name: string
          total_time_minutes: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          exam_type: string
          folder_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          total_time_minutes: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          exam_type?: string
          folder_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          total_time_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "exams_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "exam_folders"
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
      student_tasks: {
        Row: {
          assigned_at: string
          completed_at: string | null
          due_date: string
          id: string
          notes: string | null
          status: string
          student_id: string
          task_id: string
        }
        Insert: {
          assigned_at?: string
          completed_at?: string | null
          due_date: string
          id?: string
          notes?: string | null
          status?: string
          student_id: string
          task_id: string
        }
        Update: {
          assigned_at?: string
          completed_at?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          status?: string
          student_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_tasks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
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
      tasks: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
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
      create_class: {
        Args: {
          title_input: string
          content_input: string
          folder_id_input: string
        }
        Returns: string
      }
      create_class_folder: {
        Args: {
          folder_name: string
        }
        Returns: string
      }
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
