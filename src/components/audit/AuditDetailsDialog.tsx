
import React, { useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AuditHistory } from './types';

interface AuditDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAudit: AuditHistory | null;
}

const AuditDetailsDialog: React.FC<AuditDetailsDialogProps> = ({ 
  open, 
  onOpenChange, 
  selectedAudit 
}) => {
  // Calculate total value discrepancy
  const totalValueDiscrepancy = useMemo(() => {
    if (!selectedAudit?.items?.length) return 0;
    
    return selectedAudit.items.reduce((total, item) => {
      if (item.difference && item.cost) {
        return total + (item.difference * (item.cost || 0));
      }
      return total;
    }, 0);
  }, [selectedAudit]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Auditoría</DialogTitle>
          <DialogDescription>
            {selectedAudit && (
              <div className="flex flex-wrap gap-4 text-sm mt-2">
                <div>
                  <span className="font-medium">Ubicación:</span> {selectedAudit.location}
                </div>
                <div>
                  <span className="font-medium">Fecha:</span> {selectedAudit.date}
                </div>
                <div>
                  <span className="font-medium">Auditor:</span> {selectedAudit.user_name}
                </div>
                {totalValueDiscrepancy !== 0 && (
                  <div>
                    <span className="font-medium">Valor de discrepancia:</span> 
                    <span className={totalValueDiscrepancy > 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                      {formatCurrency(totalValueDiscrepancy)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artículo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Cant. Sistema</TableHead>
                <TableHead>Cant. Real</TableHead>
                <TableHead>Diferencia</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedAudit?.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.system_quantity}</TableCell>
                  <TableCell>{item.actual_quantity}</TableCell>
                  <TableCell className={
                    item.difference === 0 ? 'text-gray-600' : 
                    item.difference && item.difference > 0 ? 'text-green-600' : 
                    'text-red-600'
                  }>
                    {item.difference !== null && item.difference > 0 ? `+${item.difference}` : item.difference}
                  </TableCell>
                  <TableCell className={
                    !item.difference || item.difference === 0 ? 'text-gray-600' : 
                    item.difference > 0 ? 'text-green-600' : 
                    'text-red-600'
                  }>
                    {item.difference && item.cost 
                      ? formatCurrency(item.difference * (item.cost || 0))
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {!selectedAudit?.items?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No hay detalles disponibles para esta auditoría
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditDetailsDialog;
