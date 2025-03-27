
import React, { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { 
  ArrowDown, 
  ArrowUp,
  Clock,
  User,
  FileText,
  X,
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';

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
  onDeleteTransaction?: (id: string) => Promise<void>;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ 
  transactions, 
  isLoading,
  onDeleteTransaction
}) => {
  const [selectedProof, setSelectedProof] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleViewProof = (transaction: Transaction) => {
    console.log("Viewing proof for transaction:", transaction);
    setSelectedProof(transaction);
  };

  const handleDownloadProof = async (transaction: Transaction) => {
    if (!transaction.proof_url) {
      toast({
        title: 'Error',
        description: 'No hay URL de comprobante disponible para descargar.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = transaction.proof_url;
      
      // Extract filename from URL or create a default one
      const filename = transaction.proof_url.split('/').pop() || 
                      `comprobante-${transaction.id}.pdf`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Descarga iniciada',
        description: 'El comprobante se está descargando.'
      });
    } catch (error) {
      console.error('Error downloading proof:', error);
      toast({
        title: 'Error de descarga',
        description: 'No se pudo descargar el comprobante.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction || !onDeleteTransaction) return;
    
    setIsDeleting(true);
    try {
      await onDeleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la transacción.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
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
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2"
                    onClick={() => handleViewProof(transaction)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2"
                    onClick={() => handleDownloadProof(transaction)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Descargar
                  </Button>
                </div>
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
          {
            key: 'actions',
            header: 'Acciones',
            cell: (transaction: Transaction) => (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-destructive hover:text-white hover:bg-destructive"
                onClick={() => setDeletingTransaction(transaction)}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Eliminar
              </Button>
            )
          }
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
          
          <div className="flex space-x-2">
            {selectedProof?.proof_url && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => selectedProof && handleDownloadProof(selectedProof)}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cerrar
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!deletingTransaction} 
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta transacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará permanentemente la transacción
              {deletingTransaction?.type === 'IN' 
                ? ' y ajustará el inventario reduciendo los artículos.' 
                : ' y ajustará el inventario aumentando los artículos.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTransaction(null)} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransactionsTable;
