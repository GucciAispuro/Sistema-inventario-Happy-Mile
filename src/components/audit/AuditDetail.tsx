
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { ArrowUp, ArrowDown, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface AuditItem {
  id: string;
  name: string;
  category: string;
  location: string;
  system_quantity: number;
  actual_quantity: number;
  difference: number;
}

export interface AuditDetail {
  id: string;
  location: string;
  date: string;
  user_name: string;
  items_count: number;
  discrepancies: number;
  created_at?: string;
  items: AuditItem[];
}

interface AuditDetailProps {
  audit: AuditDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuditDetail: React.FC<AuditDetailProps> = ({ audit, open, onOpenChange }) => {
  if (!audit) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalles de Auditoría</DialogTitle>
          <DialogDescription>
            Auditoría realizada el {audit.date} en {audit.location} por {audit.user_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div className="flex flex-col items-center p-4 bg-secondary/30 rounded-md">
            <span className="text-sm text-muted-foreground">Ubicación</span>
            <span className="text-xl font-medium">{audit.location}</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-secondary/30 rounded-md">
            <span className="text-sm text-muted-foreground">Artículos</span>
            <span className="text-xl font-medium">{audit.items_count}</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-secondary/30 rounded-md">
            <span className="text-sm text-muted-foreground">Discrepancias</span>
            <span className={`text-xl font-medium ${audit.discrepancies > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {audit.discrepancies}
            </span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="overflow-hidden">
          <h3 className="text-lg font-medium mb-2">Artículos Auditados</h3>
          <DataTable 
            data={audit.items}
            columns={[
              { key: 'name', header: 'Artículo' },
              { key: 'category', header: 'Categoría' },
              { 
                key: 'system_quantity', 
                header: 'Sistema',
                cell: (item: AuditItem) => (
                  <span className="font-medium">{item.system_quantity}</span>
                )
              },
              { 
                key: 'actual_quantity', 
                header: 'Real',
                cell: (item: AuditItem) => (
                  <span className="font-medium">{item.actual_quantity}</span>
                )
              },
              { 
                key: 'difference', 
                header: 'Diferencia',
                cell: (item: AuditItem) => (
                  <div className="flex items-center">
                    {item.difference > 0 && <ArrowUp className="h-3 w-3 text-destructive mr-1" />}
                    {item.difference < 0 && <ArrowDown className="h-3 w-3 text-blue-600 mr-1" />}
                    <span 
                      className={
                        item.difference > 0 
                          ? 'text-destructive font-medium' 
                          : item.difference < 0 
                            ? 'text-blue-600 font-medium' 
                            : 'text-green-600 font-medium'
                      }
                    >
                      {item.difference > 0 ? `+${item.difference}` : item.difference}
                    </span>
                  </div>
                )
              },
              {
                key: 'status',
                header: 'Estado',
                cell: (item: AuditItem) => (
                  <div className="flex items-center">
                    {item.difference === 0 ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600">Correcto</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-destructive mr-1" />
                        <span className="text-destructive">Discrepancia</span>
                      </>
                    )}
                  </div>
                )
              }
            ]}
            emptyState="No hay artículos auditados"
          />
        </div>
        
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditDetail;
