
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
import { supabase } from '@/integrations/supabase/client';

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
    lead_time: 7,
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
  
  // Set the first location as default if locations are available
  useEffect(() => {
    if (locations && locations.length > 0 && !newItem.location) {
      setNewItem(prev => ({
        ...prev,
        location: locations[0]
      }));
    }
  }, [locations]);

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

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      // Prepare the item data for database insertion
      const itemForDb = {
        name: newItem.name,
        category: newItem.category,
        location: newItem.location,
        quantity: newItem.quantity,
        min_stock: newItem.min_stock,
        lead_time: newItem.lead_time,
        cost: newItem.cost
      };
      
      // Insert the item into the database
      const { data, error } = await supabase
        .from('inventory')
        .insert([itemForDb])
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Create the new item with values calculated
        const newItemWithDetails = {
          ...data[0],
          status: calculateItemStatus(newItem.quantity, newItem.min_stock),
          total_value: newItem.quantity * newItem.cost
        };
        
        // Send to parent component
        onAddItem(newItemWithDetails);
        
        // Reset the form
        setNewItem({
          name: '',
          category: '',
          location: '',
          quantity: 0,
          min_stock: 0,
          lead_time: 7,
          cost: 0
        });
        
        // Close the dialog
        onOpenChange(false);
        
        toast({
          title: "Éxito",
          description: `${newItem.name} ha sido añadido al inventario`,
        });
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error al añadir artículo",
        description: "No se pudo agregar el artículo al inventario",
        variant: "destructive"
      });
    }
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
