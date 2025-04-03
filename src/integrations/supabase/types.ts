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
