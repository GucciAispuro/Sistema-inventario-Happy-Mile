import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FileText,
  PackageSearch,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TransactionsTableProps {
  transactions: any[];
  isLoading: boolean;
  onDeleteTransaction: (id: string) => void;
}

interface Transaction {
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
  voucher_number?: string | null;
}

export default function TransactionsTable({
  transactions,
  isLoading,
  onDeleteTransaction,
}: TransactionsTableProps) {

  return (
    <div className="w-full overflow-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
          <p className="text-muted-foreground">Cargando transacciones...</p>
        </div>
      ) : transactions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Artículo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Folio de Vale</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{format(new Date(transaction.date), 'd MMM yyyy', { locale: es })}</div>
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'IN' 
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {transaction.type === 'IN' ? (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        <span>Entrada</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3" />
                        <span>Salida</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>{transaction.item}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.location}</TableCell>
                <TableCell className="font-medium">{transaction.quantity}</TableCell>
                <TableCell>{transaction.user_name}</TableCell>
                <TableCell>
                  {transaction.voucher_number ? (
                    <div className="font-medium text-primary">{transaction.voucher_number}</div>
                  ) : (
                    <div className="text-muted-foreground text-sm">---</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-end">
                    {transaction.has_proof && transaction.proof_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={transaction.proof_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-1" />
                          Ver Comprobante
                        </a>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDeleteTransaction(transaction.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="font-medium text-lg mb-1">No hay transacciones</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            No se encontraron transacciones con los filtros actuales.
          </p>
        </div>
      )}
    </div>
  );
}
