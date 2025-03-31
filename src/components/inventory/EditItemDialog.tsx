
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ItemForm, { ItemFormData } from './ItemForm';
import { validateItemForm, calculateItemStatus } from '@/utils/inventory/validation';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: string[];
  item: {
    id: string;
    name: string;
    category: string;
    location: string;
    description?: string;
    quantity?: number;
    min_stock?: number;
    lead_time?: number;
    cost?: number;
  } | null;
  onUpdateItem: (id: string, item: any) => void;
}

const EditItemDialog: React.FC<EditItemDialogProps> = ({ 
  open, 
  onOpenChange, 
  locations,
  item,
  onUpdateItem
}) => {
  const { toast } = useToast();
  const [editedItem, setEditedItem] = useState<ItemFormData>({
    name: '',
    category: '',
    location: '',
    quantity: 0,
    min_stock: 0,
    lead_time: 7,
    cost: 0,
    description: ''
  });
  
  // Lista predefinida de categorías
  const defaultCategories = [
    'Mobiliario', 
    'Material de Oficina', 
    'Electrónicos', 
    'Piezas de Vehículo', 
    'Equipo de Seguridad'
  ];
  
  // Estado para categorías personalizadas
  const [categories, setCategories] = useState(defaultCategories);

  // Update form when item changes
  useEffect(() => {
    if (item) {
      setEditedItem({
        name: item.name,
        category: item.category,
        location: item.location,
        quantity: item.quantity || 0,
        min_stock: item.min_stock || 0,
        lead_time: item.lead_time || 7,
        cost: item.cost || 0,
        description: item.description || ''
      });
    }
  }, [item]);

  const handleFieldChange = (field: string, value: string | number) => {
    setEditedItem({
      ...editedItem,
      [field]: value
    });
  };

  const handleAddCategory = (category: string) => {
    setCategories([...categories, category]);
    setEditedItem({...editedItem, category});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;
    
    // Validación
    const validation = validateItemForm(editedItem);
    
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.errors[0],
        variant: "destructive"
      });
      return;
    }

    // Enviar al componente padre
    onUpdateItem(item.id, editedItem);
    
    // Cerrar el diálogo
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Artículo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <ItemForm 
            item={editedItem}
            onChange={handleFieldChange}
            locations={locations}
            categories={categories}
            onAddCategory={handleAddCategory}
          />
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
