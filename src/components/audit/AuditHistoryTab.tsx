
import React, { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
import AuditDetailsDialog from './AuditDetailsDialog';
import { AuditHistory } from './types';

interface AuditHistoryTabProps {
  auditHistory: AuditHistory[];
  loading: boolean;
  onDeleteAudit: () => void;
}

const AuditHistoryTab: React.FC<AuditHistoryTabProps> = ({ 
  auditHistory, 
  loading,
  onDeleteAudit
}) => {
  const { toast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditHistory | null>(null);
  const [deletingAudit, setDeletingAudit] = useState<AuditHistory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const handleViewDetails = async (audit: AuditHistory) => {
    setIsLoadingDetails(true);
    try {
      if (audit.items && audit.items.length > 0) {
        setSelectedAudit(audit);
        setDetailsOpen(true);
        return;
      }
      
      const { data, error } = await supabase
        .from('audit_items')
        .select('*')
        .eq('audit_id', audit.id);
      
      if (error) {
        console.error('Error loading audit items:', error);
        throw error;
      }
      
      const auditWithItems = { ...audit, items: data || [] };
      setSelectedAudit(auditWithItems);
      setDetailsOpen(true);
      
    } catch (err) {
      console.error('Error loading audit details:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la auditoría",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleDeleteAudit = async () => {
    if (!deletingAudit) return;
    
    setIsDeleting(true);
    try {
      let auditItemsToRevert = deletingAudit.items;
      
      if (!auditItemsToRevert || auditItemsToRevert.length === 0) {
        const { data, error } = await supabase
          .from('audit_items')
          .select('*')
          .eq('audit_id', deletingAudit.id);
        
        if (error) {
          console.error('Error loading audit items for deletion:', error);
          throw error;
        }
        
        auditItemsToRevert = data;
      }
      
      if (auditItemsToRevert && auditItemsToRevert.length > 0) {
        for (const item of auditItemsToRevert) {
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventory')
            .select('*')
            .eq('name', item.name)
            .eq('location', item.location)
            .single();
          
          if (inventoryError && inventoryError.code !== 'PGRST116') {
            console.error('Error checking inventory for item:', inventoryError);
            continue;
          }
          
          if (inventoryData) {
            const originalQuantity = item.actual_quantity - (item.difference || 0);
            
            const { error: updateError } = await supabase
              .from('inventory')
              .update({ quantity: originalQuantity })
              .eq('id', inventoryData.id);
            
            if (updateError) {
              console.error('Error reverting inventory quantity:', updateError);
            }
          }
        }
      }
      
      const { error: deleteItemsError } = await supabase
        .from('audit_items')
        .delete()
        .eq('audit_id', deletingAudit.id);
      
      if (deleteItemsError) {
        console.error('Error deleting audit items:', deleteItemsError);
        throw deleteItemsError;
      }
      
      const { error: deleteAuditError } = await supabase
        .from('audits')
        .delete()
        .eq('id', deletingAudit.id);
      
      if (deleteAuditError) {
        console.error('Error deleting audit:', deleteAuditError);
        throw deleteAuditError;
      }
      
      toast({
        title: 'Auditoría eliminada',
        description: 'La auditoría y sus cambios en el inventario han sido revertidos',
      });
      
      onDeleteAudit();
      setDeletingAudit(null);
      
    } catch (err) {
      console.error('Error in delete audit:', err);
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar la auditoría. Intente nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <MotionContainer>
        <DataTable 
          data={auditHistory}
          loading={loading}
          columns={[
            { key: 'location', header: 'Ubicación' },
            { key: 'date', header: 'Fecha' },
            { key: 'user_name', header: 'Realizada por' },
            { key: 'items_count', header: 'Artículos Auditados' },
            { 
              key: 'discrepancies', 
              header: 'Discrepancias',
              cell: (item) => (
                <div className={item.discrepancies > 0 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
                  {item.discrepancies}
                </div>
              )
            },
            {
              key: 'actions',
              header: 'Acciones',
              cell: (item) => (
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewDetails(item)}
                    disabled={loading || isDeleting || isLoadingDetails}
                  >
                    Ver Detalles
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    onClick={() => setDeletingAudit(item)}
                    disabled={loading || isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              )
            }
          ]}
          emptyState="No hay registros de auditorías previas"
        />
      </MotionContainer>

      <AuditDetailsDialog 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
        selectedAudit={selectedAudit} 
      />

      <AlertDialog 
        open={!!deletingAudit} 
        onOpenChange={(open) => !open && setDeletingAudit(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta auditoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará permanentemente la auditoría y 
              revertirá los cambios realizados en el inventario durante esta auditoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAudit}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AuditHistoryTab;
