
import React, { useState } from 'react';
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

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: string[];
  onAddItem: (item: any) => void;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({ 
  open, 
  onOpenChange, 
  locations,
  onAddItem
}) => {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState<ItemFormData>({
    name: '',
    category: '',
    location: '',
    quantity: 0,
    min_stock: 0,
    cost: 0
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

  const handleFieldChange = (field: string, value: string | number) => {
    setNewItem({
      ...newItem,
      [field]: value
    });
  };

  const handleAddCategory = (category: string) => {
    setCategories([...categories, category]);
    setNewItem({...newItem, category});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación
    const validation = validateItemForm(newItem);
    
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.errors[0],
        variant: "destructive"
      });
      return;
    }

    // Crear el nuevo artículo con valores calculados
    const newItemWithDetails = {
      ...newItem,
      id: Date.now(), // ID temporal
      status: calculateItemStatus(newItem.quantity, newItem.min_stock),
      total_value: newItem.quantity * newItem.cost
    };

    // Enviar al componente padre
    onAddItem(newItemWithDetails);
    
    // Resetear el formulario
    setNewItem({
      name: '',
      category: '',
      location: '',
      quantity: 0,
      min_stock: 0,
      cost: 0
    });
    
    // Cerrar el diálogo
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Artículo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <ItemForm 
            item={newItem}
            onChange={handleFieldChange}
            locations={locations}
            categories={categories}
            onAddCategory={handleAddCategory}
          />
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Artículo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
