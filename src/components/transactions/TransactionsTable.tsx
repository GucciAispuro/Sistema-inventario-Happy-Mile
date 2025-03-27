
import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { 
  ArrowDown, 
  ArrowUp,
  Clock,
  User,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Transaction = {
  id: string;
  item: string;
  category: string;
  location: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  user_name: string;
  notes: string | null;
  has_proof: boolean | null;
  proof_url?: string | null;
  created_at?: string;
  user_id?: string;
};

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, isLoading }) => {
  return (
    <DataTable 
      data={transactions}
      columns={[
        { key: 'item', header: 'Artículo' },
        { key: 'location', header: 'Ubicación' },
        { 
          key: 'type', 
          header: 'Tipo',
          cell: (transaction: Transaction) => (
            <div className="flex items-center">
              {transaction.type === 'IN' ? (
                <>
                  <ArrowDown className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">ENTRADA</span>
                </>
              ) : (
                <>
                  <ArrowUp className="h-3 w-3 text-blue-600 mr-1" />
                  <span className="text-blue-600 font-medium">SALIDA</span>
                </>
              )}
            </div>
          )
        },
        { 
          key: 'quantity', 
          header: 'Cant.',
          cell: (transaction: Transaction) => (
            <div className="font-medium">{transaction.quantity}</div>
          )
        },
        { 
          key: 'date', 
          header: 'Fecha',
          cell: (transaction: Transaction) => (
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {transaction.date}
            </div>
          )
        },
        { 
          key: 'user_name', 
          header: 'Usuario',
          cell: (transaction: Transaction) => (
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1 text-muted-foreground" />
              {transaction.user_name}
            </div>
          )
        },
        { 
          key: 'proof', 
          header: 'Comprobante',
          cell: (transaction: Transaction) => (
            transaction.has_proof ? (
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <FileText className="h-3 w-3 mr-1" />
                Ver
              </Button>
            ) : (
              <span className="text-muted-foreground text-xs">Ninguno</span>
            )
          )
        },
        { 
          key: 'notes', 
          header: 'Notas',
          cell: (transaction: Transaction) => (
            <div className="max-w-[200px] truncate text-muted-foreground">
              {transaction.notes || 'Sin notas'}
            </div>
          )
        },
      ]}
      loading={isLoading}
      emptyState="No hay transacciones encontradas"
    />
  );
};

export default TransactionsTable;
