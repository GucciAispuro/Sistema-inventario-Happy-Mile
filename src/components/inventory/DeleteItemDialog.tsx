
import React from 'react';
import { useToast } from '@/hooks/use-toast';
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

// Update the interface to allow for a more complete item object
interface DeleteItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: string; name: string; [key: string]: any } | null;
  onDeleteItem: (id: string) => Promise<void>;
}

const DeleteItemDialog: React.FC<DeleteItemDialogProps> = ({ 
  open, 
  onOpenChange, 
  item,
  onDeleteItem
}) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  const handleDelete = async () => {
    if (!item) return;
    
    setIsDeleting(true);
    try {
      await onDeleteItem(item.id);
      toast({
        title: "Artículo eliminado",
        description: `${item.name} ha sido eliminado del inventario`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error al eliminar artículo",
        description: "No se pudo eliminar el artículo del inventario",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
          <AlertDialogDescription>
            {item && (
              <>
                Esta acción eliminará permanentemente <strong>{item.name}</strong> del inventario.
                <br /><br />
                Esta acción no se puede deshacer.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteItemDialog;
