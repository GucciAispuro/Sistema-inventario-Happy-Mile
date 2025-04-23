
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
    cost: 0,
    description: '',
    asset_type: 'Insumo',
    assigned_to: ''
  });
  
  const defaultCategories = [
    'Mobiliario', 
    'Material de Oficina', 
    'Electrónicos', 
    'Piezas de Vehículo', 
    'Equipo de Seguridad'
  ];
  
  const [categories, setCategories] = useState(defaultCategories);
  
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
    
    const validation = validateItemForm(newItem);
    
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.errors[0],
        variant: "destructive"
      });
      return;
    }

    if (newItem.asset_type === 'Activo' && !newItem.assigned_to) {
      toast({
        title: "Error",
        description: "Los activos requieren un responsable asignado",
        variant: "destructive"
      });
      return;
    }

    try {
      const itemForDb = {
        name: newItem.name,
        category: newItem.category,
        location: newItem.location,
        quantity: newItem.quantity,
        min_stock: newItem.min_stock,
        lead_time: newItem.lead_time,
        cost: newItem.cost,
        description: newItem.description,
        asset_type: newItem.asset_type
      };
      
      const { data: itemData, error: itemError } = await supabase
        .from('inventory')
        .insert([itemForDb])
        .select()
        .single();
      
      if (itemError) throw itemError;
      
      if (newItem.asset_type === 'Activo' && itemData) {
        const assignmentData = {
          inventory_id: itemData.id,
          assigned_to: newItem.assigned_to,
          notes: `Initial assignment for ${newItem.name}`
        };
        
        const { error: assignmentError } = await supabase
          .from('asset_assignments')
          .insert([assignmentData]);
        
        if (assignmentError) throw assignmentError;
      }
      
      const newItemWithDetails = {
        ...itemData,
        status: calculateItemStatus(newItem.quantity, newItem.min_stock),
        total_value: newItem.quantity * newItem.cost
      };
      
      onAddItem(newItemWithDetails);
      
      setNewItem({
        name: '',
        category: '',
        location: '',
        quantity: 0,
        min_stock: 0,
        lead_time: 7,
        cost: 0,
        description: '',
        asset_type: 'Insumo',
        assigned_to: ''
      });
      
      onOpenChange(false);
      
      toast({
        title: "Éxito",
        description: `${newItem.name} ha sido añadido al inventario`,
      });
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Añadir Nuevo Artículo</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <ItemForm 
              item={newItem}
              onChange={handleFieldChange}
              locations={locations}
              categories={categories}
              onAddCategory={handleAddCategory}
            />
          </form>
        </ScrollArea>
        
        <DialogFooter className="p-6 mt-auto border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit}>Guardar Artículo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
