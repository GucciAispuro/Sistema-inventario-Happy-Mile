
import React, { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { 
  ArrowDown, 
  ArrowUp,
  Clock,
  User,
  FileText,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

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
  const [selectedProof, setSelectedProof] = useState<Transaction | null>(null);
  
  const handleViewProof = (transaction: Transaction) => {
    console.log("Viewing proof for transaction:", transaction);
    setSelectedProof(transaction);
  };
  
  console.log("Rendering TransactionsTable with", transactions.length, "transactions");
  return (
    <>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2"
                  onClick={() => handleViewProof(transaction)}
                >
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
      
      {/* Proof Dialog */}
      <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comprobante de Transacción</DialogTitle>
            <DialogDescription>
              Detalles del comprobante para la transacción {selectedProof?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedProof?.proof_url ? (
              <div className="border rounded-md p-4">
                <img 
                  src={selectedProof.proof_url} 
                  alt="Comprobante" 
                  className="max-w-full h-auto rounded-md"
                />
              </div>
            ) : (
              <div className="text-center p-6 border rounded-md bg-muted/30">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  El comprobante se ha marcado como existente pero no se encuentra disponible para visualización en esta versión.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Información de la transacción:</h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span className="text-muted-foreground">Artículo:</span>
                <span>{selectedProof?.item}</span>
                
                <span className="text-muted-foreground">Cantidad:</span>
                <span>{selectedProof?.quantity}</span>
                
                <span className="text-muted-foreground">Fecha:</span>
                <span>{selectedProof?.date}</span>
                
                <span className="text-muted-foreground">Usuario:</span>
                <span>{selectedProof?.user_name}</span>
              </div>
            </div>
          </div>
          
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionsTable;
