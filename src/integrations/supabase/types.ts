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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      booking_notification_recipients: {
        Row: {
          created_at: string
          email: string
          enabled: boolean
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          enabled?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          enabled?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          appointment_date: string
          appointment_time: string
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string
          customer_id: string | null
          discount_pennies: number
          email: string
          first_name: string
          id: string
          mobile: string
          status: string
          surname: string
          treatment_name: string
          treatment_price: string | null
          treatment_slug: string
          voucher_code: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string | null
          discount_pennies?: number
          email: string
          first_name: string
          id?: string
          mobile: string
          status?: string
          surname: string
          treatment_name: string
          treatment_price?: string | null
          treatment_slug: string
          voucher_code?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string | null
          discount_pennies?: number
          email?: string
          first_name?: string
          id?: string
          mobile?: string
          status?: string
          surname?: string
          treatment_name?: string
          treatment_price?: string | null
          treatment_slug?: string
          voucher_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          mobile: string
          notes: string
          surname: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string
          id?: string
          mobile?: string
          notes?: string
          surname?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          mobile?: string
          notes?: string
          surname?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_settings: {
        Row: {
          id: number
          signup_discount_pennies: number
          signup_enabled: boolean
          signup_expiry_hours: number
          signup_headline: string
          signup_subtext: string
          updated_at: string
        }
        Insert: {
          id?: number
          signup_discount_pennies?: number
          signup_enabled?: boolean
          signup_expiry_hours?: number
          signup_headline?: string
          signup_subtext?: string
          updated_at?: string
        }
        Update: {
          id?: number
          signup_discount_pennies?: number
          signup_enabled?: boolean
          signup_expiry_hours?: number
          signup_headline?: string
          signup_subtext?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          group_name: string
          key: string
          label: string
          updated_at: string
          value: Json
        }
        Insert: {
          group_name?: string
          key: string
          label?: string
          updated_at?: string
          value?: Json
        }
        Update: {
          group_name?: string
          key?: string
          label?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string
          created_at: string
          credentials: string
          icon: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          role: string
          sort_order: number
          tags: string[]
          updated_at: string
        }
        Insert: {
          bio?: string
          created_at?: string
          credentials?: string
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          role?: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          credentials?: string
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          role?: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          benefits: string[]
          category: string
          created_at: string
          description: string
          duration: string
          id: string
          image_url: string | null
          is_active: boolean
          long_description: string
          name: string
          price: string
          sessions: string
          slug: string
          sort_order: number
          updated_at: string
          what_to_expect: string
        }
        Insert: {
          benefits?: string[]
          category: string
          created_at?: string
          description?: string
          duration?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          long_description?: string
          name: string
          price?: string
          sessions?: string
          slug: string
          sort_order?: number
          updated_at?: string
          what_to_expect?: string
        }
        Update: {
          benefits?: string[]
          category?: string
          created_at?: string
          description?: string
          duration?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          long_description?: string
          name?: string
          price?: string
          sessions?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          what_to_expect?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      voucher_codes: {
        Row: {
          code: string
          created_at: string
          discount_pennies: number
          email: string | null
          expires_at: string | null
          first_name: string | null
          id: string
          is_active: boolean
          kind: string
          max_uses: number
          mobile: string | null
          notes: string
          surname: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_pennies?: number
          email?: string | null
          expires_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          kind: string
          max_uses?: number
          mobile?: string | null
          notes?: string
          surname?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_pennies?: number
          email?: string | null
          expires_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          max_uses?: number
          mobile?: string | null
          notes?: string
          surname?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_active_promos: {
        Args: never
        Returns: {
          code: string
          discount_pennies: number
          expires_at: string
        }[]
      }
      get_booked_times: {
        Args: { p_date: string }
        Returns: {
          appointment_time: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_customer_by_email: {
        Args: { p_email: string }
        Returns: {
          first_name: string
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      redeem_voucher: {
        Args: { p_code: string; p_email?: string }
        Returns: {
          code: string
          discount_pennies: number
          id: string
        }[]
      }
      signup_voucher_exists_for_email: {
        Args: { p_email: string }
        Returns: boolean
      }
      signup_voucher_exists_for_identity: {
        Args: { p_first: string; p_mobile: string; p_surname: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
