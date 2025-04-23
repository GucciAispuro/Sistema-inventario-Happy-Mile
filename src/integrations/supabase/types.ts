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
      asset_assignments: {
        Row: {
          assigned_date: string
          assigned_to: string
          created_at: string | null
          id: string
          inventory_id: string
          is_active: boolean
          notes: string | null
        }
        Insert: {
          assigned_date?: string
          assigned_to: string
          created_at?: string | null
          id?: string
          inventory_id: string
          is_active?: boolean
          notes?: string | null
        }
        Update: {
          assigned_date?: string
          assigned_to?: string
          created_at?: string | null
          id?: string
          inventory_id?: string
          is_active?: boolean
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_assignments_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_items: {
        Row: {
          actual_quantity: number
          audit_id: string
          category: string
          cost: number | null
          created_at: string | null
          difference: number
          id: string
          location: string
          name: string
          system_quantity: number
        }
        Insert: {
          actual_quantity: number
          audit_id: string
          category: string
          cost?: number | null
          created_at?: string | null
          difference: number
          id?: string
          location: string
          name: string
          system_quantity: number
        }
        Update: {
          actual_quantity?: number
          audit_id?: string
          category?: string
          cost?: number | null
          created_at?: string | null
          difference?: number
          id?: string
          location?: string
          name?: string
          system_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_items_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          created_at: string | null
          date: string
          discrepancies: number
          id: string
          items_count: number
          location: string
          user_name: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          discrepancies: number
          id?: string
          items_count: number
          location: string
          user_name: string
        }
        Update: {
          created_at?: string | null
          date?: string
          discrepancies?: number
          id?: string
          items_count?: number
          location?: string
          user_name?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          asset_type: string | null
          category: string
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          lead_time: number | null
          location: string
          min_stock: number | null
          name: string
          part_type_id: string | null
          quantity: number
        }
        Insert: {
          asset_type?: string | null
          category: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_time?: number | null
          location: string
          min_stock?: number | null
          name: string
          part_type_id?: string | null
          quantity?: number
        }
        Update: {
          asset_type?: string | null
          category?: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_time?: number | null
          location?: string
          min_stock?: number | null
          name?: string
          part_type_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_part_type_id_fkey"
            columns: ["part_type_id"]
            isOneToOne: false
            referencedRelation: "part_types"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          manager: string | null
          name: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          manager?: string | null
          name: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          manager?: string | null
          name?: string
        }
        Relationships: []
      }
      part_receipts: {
        Row: {
          cost: number | null
          created_at: string | null
          id: string
          invoice_number: string
          item_id: string
          notes: string | null
          quantity: number
          receipt_date: string
          supplier_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          id?: string
          invoice_number: string
          item_id: string
          notes?: string | null
          quantity: number
          receipt_date?: string
          supplier_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          id?: string
          invoice_number?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          receipt_date?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "part_receipts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_receipts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      part_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          category: string
          created_at: string
          date: string
          has_proof: boolean | null
          id: string
          item: string
          location: string
          notes: string | null
          proof_url: string | null
          quantity: number
          type: string
          user_id: string
          user_name: string
          voucher_number: string | null
        }
        Insert: {
          category: string
          created_at?: string
          date?: string
          has_proof?: boolean | null
          id?: string
          item: string
          location: string
          notes?: string | null
          proof_url?: string | null
          quantity: number
          type: string
          user_id: string
          user_name: string
          voucher_number?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          has_proof?: boolean | null
          id?: string
          item?: string
          location?: string
          notes?: string | null
          proof_url?: string | null
          quantity?: number
          type?: string
          user_id?: string
          user_name?: string
          voucher_number?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          location: string
          name: string
          receive_alerts: boolean | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          location: string
          name: string
          receive_alerts?: boolean | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          location?: string
          name?: string
          receive_alerts?: boolean | null
          role?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
