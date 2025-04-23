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
    asset_type?: string;
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
    description: '',
    asset_type: 'Insumo',
    assigned_to: ''
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

  // Fetch current assignment if it's an asset
  useEffect(() => {
    if (item && editedItem.asset_type === 'Activo') {
      const fetchAssignment = async () => {
        const { data } = await supabase
          .from('asset_assignments')
          .select('assigned_to')
          .eq('inventory_id', item.id)
          .eq('is_active', true)
          .single();
        
        if (data) {
          setEditedItem(prev => ({
            ...prev,
            assigned_to: data.assigned_to
          }));
        }
      };
      fetchAssignment();
    }
  }, [item, editedItem.asset_type]);

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
        description: item.description || '',
        asset_type: item.asset_type || 'Insumo',
        assigned_to: ''  // Will be populated by the other useEffect if needed
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (editedItem.asset_type === 'Activo' && !editedItem.assigned_to) {
      toast({
        title: "Error",
        description: "Los activos requieren un responsable asignado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update inventory item
      const { error: itemError } = await supabase
        .from('inventory')
        .update({
          name: editedItem.name,
          category: editedItem.category,
          location: editedItem.location,
          quantity: editedItem.quantity,
          min_stock: editedItem.min_stock,
          lead_time: editedItem.lead_time,
          cost: editedItem.cost,
          description: editedItem.description,
          asset_type: editedItem.asset_type
        })
        .eq('id', item.id);

      if (itemError) throw itemError;

      // Handle asset assignment if needed
      if (editedItem.asset_type === 'Activo') {
        // Deactivate current assignment if exists
        await supabase
          .from('asset_assignments')
          .update({ is_active: false })
          .eq('inventory_id', item.id)
          .eq('is_active', true);

        // Create new assignment
        const { error: assignmentError } = await supabase
          .from('asset_assignments')
          .insert({
            inventory_id: item.id,
            assigned_to: editedItem.assigned_to,
            notes: `Updated assignment for ${editedItem.name}`
          });

        if (assignmentError) throw assignmentError;
      }

      onUpdateItem(item.id, editedItem);
      onOpenChange(false);
      
      toast({
        title: "Artículo actualizado",
        description: `${editedItem.name} ha sido actualizado correctamente`,
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error al actualizar artículo",
        description: "No se pudo actualizar el artículo en el inventario",
        variant: "destructive"
      });
    }
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
