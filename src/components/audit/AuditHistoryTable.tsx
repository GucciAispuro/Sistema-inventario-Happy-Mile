
import React from 'react';
import { DataTable } from '@/components/ui/DataTable';

export interface Audit {
  id: string;
  location: string;
  date: string;
  items_count: number;
  discrepancies: number;
  user_name: string;
  created_at: string;
}

interface AuditHistoryTableProps {
  audits: Audit[];
}

export const AuditHistoryTable: React.FC<AuditHistoryTableProps> = ({ audits }) => {
  return (
    <DataTable 
      data={audits}
      columns={[
        { key: 'location', header: 'Ubicación' },
        { key: 'date', header: 'Fecha' },
        { key: 'items_count', header: 'Total de Artículos' },
        { key: 'discrepancies', header: 'Discrepancias' },
        { key: 'user_name', header: 'Usuario' }
      ]}
    />
  );
};
