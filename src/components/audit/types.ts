
export interface AuditItem {
  id: number;
  name: string;
  category: string;
  location: string;
  system_quantity: number;
  actual_quantity: number | null;
  difference: number | null;
  last_audit: string;
  cost: number;
}

export interface AuditHistory {
  id: string;
  date: string;
  location: string;
  user_name: string;
  items_count: number;
  discrepancies: number;
  created_at?: string;
  items?: DatabaseAuditItem[]; // Add the items property as optional
  total_value_discrepancy?: number; // Add total value discrepancy property
}

export interface DatabaseAuditItem {
  id: string;
  name: string;
  category: string;
  location: string;
  system_quantity: number;
  actual_quantity: number;
  difference: number;
  audit_id: string;
  created_at?: string;
  cost: number;
}
