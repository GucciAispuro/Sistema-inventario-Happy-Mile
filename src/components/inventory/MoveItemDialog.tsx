
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { checkAndAlertForTransaction } from '@/utils/inventory/lowStockAlert';

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    name: string;
    location: string;
    quantity: number;
    min_stock?: number;
    cost?: number;
    category?: string;
  } | null;
  locations: string[];
  onMoveComplete: () => void;
}

const MoveItemDialog: React.FC<MoveItemDialogProps> = ({
  open,
  onOpenChange,
  item,
  locations,
  onMoveComplete
}) => {
  const { toast } = useToast();
  const [targetLocation, setTargetLocation] = useState<string>('');
  const [moveQuantity, setMoveQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filter out the current location from available locations
  const availableLocations = locations.filter(loc => loc !== item?.location);

  // Reset the form when the dialog opens or the item changes
  React.useEffect(() => {
    if (open && item) {
      setTargetLocation('');
      setMoveQuantity(1);
    }
  }, [open, item]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && item && value <= item.quantity) {
      setMoveQuantity(value);
    }
  };

  const handleMove = async () => {
    if (!item || !targetLocation || moveQuantity <= 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona una ubicación destino y una cantidad válida",
        variant: "destructive"
      });
      return;
    }

    if (moveQuantity > item.quantity) {
      toast({
        title: "Error",
        description: `No puedes mover más de ${item.quantity} unidades`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log(`Moving ${moveQuantity} units of ${item.name} from ${item.location} to ${targetLocation}`);
      
      // 1. Check if item exists in target location
      const { data: existingItems, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('name', item.name)
        .eq('category', item.category)
        .eq('location', targetLocation);

      if (fetchError) {
        console.error("Error checking target location inventory:", fetchError);
        throw fetchError;
      }
      
      console.log("Target location inventory check result:", existingItems);
      
      // Begin transaction - try to add item to target location
      let targetItemId: string | null = null;
      
      if (existingItems && existingItems.length > 0) {
        // Update existing item in target location
        const targetItem = existingItems[0];
        targetItemId = targetItem.id;
        
        console.log(`Updating existing item in ${targetLocation}. Current quantity: ${targetItem.quantity}, Adding: ${moveQuantity}`);
        
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ 
            quantity: targetItem.quantity + moveQuantity 
          })
          .eq('id', targetItem.id);
          
        if (updateError) {
          console.error("Error updating target location inventory:", updateError);
          throw updateError;
        }
      } else {
        // Create new item in target location
        console.log(`Creating new inventory item in ${targetLocation} with quantity ${moveQuantity}`);
        
        const { data: newItem, error: insertError } = await supabase
          .from('inventory')
          .insert([{
            name: item.name,
            category: item.category,
            location: targetLocation,
            quantity: moveQuantity,
            min_stock: item.min_stock,
            cost: item.cost
          }])
          .select();
          
        if (insertError) {
          console.error("Error creating inventory in target location:", insertError);
          throw insertError;
        }
        
        if (newItem && newItem.length > 0) {
          targetItemId = newItem[0].id;
          console.log(`Created new inventory item with ID: ${targetItemId}`);
        }
      }
      
      // Update source item quantity
      const newSourceQuantity = item.quantity - moveQuantity;
      console.log(`Updating source location. Current: ${item.quantity}, New: ${newSourceQuantity}`);
      
      if (newSourceQuantity === 0) {
        // Delete the item if quantity becomes zero
        console.log(`Deleting source item (${item.id}) as quantity is now zero`);
        
        const { error: deleteError } = await supabase
          .from('inventory')
          .delete()
          .eq('id', item.id);
          
        if (deleteError) {
          console.error("Error deleting source inventory item:", deleteError);
          throw deleteError;
        }
      } else {
        // Update the item with reduced quantity
        console.log(`Updating source item (${item.id}) quantity to ${newSourceQuantity}`);
        
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ quantity: newSourceQuantity })
          .eq('id', item.id);
          
        if (updateError) {
          console.error("Error updating source inventory quantity:", updateError);
          throw updateError;
        }
      }
      
      // Create transaction record for the movement
      console.log("Creating transaction record for the movement");
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          type: 'Traslado',
          item: item.name,
          category: item.category,
          quantity: moveQuantity,
          location: item.location,
          user_id: 'system',
          user_name: 'Sistema',
          notes: `Traslado de ${item.location} a ${targetLocation}`
        }]);
        
      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        throw transactionError;
      }
      
      // Check if the source item needs to trigger a low stock alert
      if (newSourceQuantity > 0 && item.min_stock && newSourceQuantity < item.min_stock) {
        console.log("Checking for low stock alerts");
        
        const updatedSourceItem = {
          ...item,
          quantity: newSourceQuantity
        };
        await checkAndAlertForTransaction(updatedSourceItem);
      }
      
      // Close dialog and notify success
      toast({
        title: "Traslado exitoso",
        description: `${moveQuantity} unidades de ${item.name} trasladadas a ${targetLocation}`,
      });
      
      onMoveComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error moving item:', error);
      toast({
        title: "Error al trasladar",
        description: error.message || "No se pudo completar el traslado del artículo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Trasladar Artículo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Artículo: {item?.name}</h3>
            <p className="text-sm text-muted-foreground">
              Ubicación actual: {item?.location}
            </p>
            <p className="text-sm text-muted-foreground">
              Cantidad disponible: {item?.quantity}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target-location">Ubicación destino</Label>
            <Select 
              value={targetLocation} 
              onValueChange={setTargetLocation}
            >
              <SelectTrigger id="target-location">
                <SelectValue placeholder="Selecciona ubicación destino" />
              </SelectTrigger>
              <SelectContent>
                {availableLocations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad a trasladar</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={item?.quantity || 1}
              value={moveQuantity}
              onChange={handleQuantityChange}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleMove}
            disabled={isLoading || !targetLocation || moveQuantity <= 0}
          >
            {isLoading ? 'Trasladando...' : 'Trasladar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveItemDialog;
