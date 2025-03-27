
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AuditItemsTable, type InventoryItem } from './AuditItemsTable';

interface AuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationName: string;
  inventoryItems: InventoryItem[];
  onActualQuantityChange: (itemId: string, quantity: number) => void;
  onSaveAudit: () => void;
}

export const AuditDialog: React.FC<AuditDialogProps> = ({
  open,
  onOpenChange,
  locationName,
  inventoryItems,
  onActualQuantityChange,
  onSaveAudit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Auditoría de {locationName}</DialogTitle>
        </DialogHeader>
        
        <AuditItemsTable 
          items={inventoryItems} 
          onActualQuantityChange={onActualQuantityChange} 
        />
        
        <DialogFooter>
          <Button onClick={onSaveAudit}>Guardar Auditoría</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
