
import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  actual_quantity?: number;
  difference?: number;
}

interface AuditItemsTableProps {
  items: InventoryItem[];
  onActualQuantityChange: (itemId: string, quantity: number) => void;
}

export const AuditItemsTable: React.FC<AuditItemsTableProps> = ({ 
  items, 
  onActualQuantityChange 
}) => {
  return (
    <DataTable 
      data={items}
      columns={[
        { key: 'name', header: 'Nombre del Artículo' },
        { 
          key: 'system_quantity', 
          header: 'Cantidad en Sistema',
          cell: (item) => <div>{item.quantity}</div>
        },
        { 
          key: 'actual_quantity', 
          header: 'Cantidad Real',
          cell: (item) => (
            <Input
              type="number"
              value={item.actual_quantity}
              onChange={(e) => onActualQuantityChange(item.id, Number(e.target.value))}
              min="0"
            />
          )
        },
        { 
          key: 'difference', 
          header: 'Diferencia',
          cell: (item) => (
            <div className={`
              font-medium 
              ${item.difference > 0 ? 'text-green-600' : 
                item.difference < 0 ? 'text-red-600' : 'text-gray-600'}
            `}>
              {item.difference}
            </div>
          )
        }
      ]}
    />
  );
};
