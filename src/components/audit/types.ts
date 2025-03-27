
export interface AuditItem {
  id: number;
  name: string;
  category: string;
  location: string;
  system_quantity: number;
  actual_quantity: number | null;
  difference: number | null;
  last_audit?: string;
}

export interface DatabaseAuditItem {
  id: string;
  audit_id: string;
  name: string;
  category: string;
  location: string;
  system_quantity: number;
  actual_quantity: number;
  difference: number;
  created_at: string | null;
}

export interface AuditHistory {
  id: string;
  location: string;
  date: string;
  user_name: string;
  items_count: number;
  discrepancies: number;
  items?: AuditItem[] | DatabaseAuditItem[];
  created_at?: string;
}
