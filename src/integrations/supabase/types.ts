export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      caregiver_permissions: {
        Row: {
          caregiver_link_id: string
          created_at: string
          enabled: boolean
          id: string
          permission: Database["public"]["Enums"]["caregiver_permission"]
        }
        Insert: {
          caregiver_link_id: string
          created_at?: string
          enabled?: boolean
          id?: string
          permission: Database["public"]["Enums"]["caregiver_permission"]
        }
        Update: {
          caregiver_link_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          permission?: Database["public"]["Enums"]["caregiver_permission"]
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_permissions_caregiver_link_id_fkey"
            columns: ["caregiver_link_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
        ]
      }
      caregivers: {
        Row: {
          caregiver_email: string
          caregiver_id: string | null
          caregiver_name: string | null
          created_at: string
          id: string
          patient_id: string
          status: Database["public"]["Enums"]["caregiver_status"]
          updated_at: string
        }
        Insert: {
          caregiver_email: string
          caregiver_id?: string | null
          caregiver_name?: string | null
          created_at?: string
          id?: string
          patient_id: string
          status?: Database["public"]["Enums"]["caregiver_status"]
          updated_at?: string
        }
        Update: {
          caregiver_email?: string
          caregiver_id?: string | null
          caregiver_name?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["caregiver_status"]
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string | null
          id: string
          image_url: string | null
          importance: Database["public"]["Enums"]["importance_level"]
          is_demo: boolean
          location: string | null
          memory_type: Database["public"]["Enums"]["memory_type"]
          owner_id: string
          place_id: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          importance?: Database["public"]["Enums"]["importance_level"]
          is_demo?: boolean
          location?: string | null
          memory_type?: Database["public"]["Enums"]["memory_type"]
          owner_id: string
          place_id?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          importance?: Database["public"]["Enums"]["importance_level"]
          is_demo?: boolean
          location?: string | null
          memory_type?: Database["public"]["Enums"]["memory_type"]
          owner_id?: string
          place_id?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_embeddings: {
        Row: {
          content: string
          created_at: string
          embedding: string
          id: string
          memory_id: string
          model_version: string
          owner_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding: string
          id?: string
          memory_id: string
          model_version?: string
          owner_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string
          id?: string
          memory_id?: string
          model_version?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_embeddings_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: true
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_people: {
        Row: {
          memory_id: string
          person_id: string
        }
        Insert: {
          memory_id: string
          person_id: string
        }
        Update: {
          memory_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_people_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_people_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_demo: boolean
          name: string
          owner_id: string
          updated_at: string
          usual_location: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          name: string
          owner_id: string
          updated_at?: string
          usual_location?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
          usual_location?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          important_info: string | null
          is_demo: boolean
          last_interaction: string | null
          name: string
          owner_id: string
          relationship: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          important_info?: string | null
          is_demo?: boolean
          last_interaction?: string | null
          name: string
          owner_id: string
          relationship?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          important_info?: string | null
          is_demo?: boolean
          last_interaction?: string | null
          name?: string
          owner_id?: string
          relationship?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_demo: boolean
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_demo?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accessibility_settings: Json
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          id: string
          name: string
          onboarding_completed: boolean
          preferences: Json
          updated_at: string
        }
        Insert: {
          accessibility_settings?: Json
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          id: string
          name?: string
          onboarding_completed?: boolean
          preferences?: Json
          updated_at?: string
        }
        Update: {
          accessibility_settings?: Json
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          name?: string
          onboarding_completed?: boolean
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      caregiver_can: {
        Args: {
          _patient_id: string
          _permission: Database["public"]["Enums"]["caregiver_permission"]
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_caregiver_of: { Args: { _patient_id: string }; Returns: boolean }
      match_memories: {
        Args: {
          _owner_id: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          content: string
          memory_id: string
          similarity: number
        }[]
      }
      seed_demo_data: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "user" | "caregiver" | "admin"
      caregiver_permission:
        | "VIEW_MEMORIES"
        | "ADD_MEMORIES"
        | "EDIT_MEMORIES"
        | "DELETE_MEMORIES"
        | "MANAGE_PEOPLE"
        | "VIEW_ACTIVITY"
      caregiver_status: "pending" | "accepted" | "revoked"
      importance_level: "low" | "medium" | "high" | "critical"
      memory_type:
        | "person"
        | "place"
        | "event"
        | "object"
        | "conversation"
        | "information"
        | "family"
        | "personal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "caregiver", "admin"],
      caregiver_permission: [
        "VIEW_MEMORIES",
        "ADD_MEMORIES",
        "EDIT_MEMORIES",
        "DELETE_MEMORIES",
        "MANAGE_PEOPLE",
        "VIEW_ACTIVITY",
      ],
      caregiver_status: ["pending", "accepted", "revoked"],
      importance_level: ["low", "medium", "high", "critical"],
      memory_type: [
        "person",
        "place",
        "event",
        "object",
        "conversation",
        "information",
        "family",
        "personal",
      ],
    },
  },
} as const
