
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';

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
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    location: '',
    quantity: 0,
    min_stock: 0,
    cost: 0,
    delivery_time: 0 // Nuevo campo para tiempo de entrega (en días)
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
  
  // Estado para mostrar/ocultar la entrada de nueva categoría
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'quantity' || name === 'min_stock' || name === 'cost' || name === 'delivery_time'
        ? parseFloat(value) || 0 
        : value
    });
  };

  // Función para añadir una nueva categoría
  const handleAddCategory = () => {
    if (newCategory.trim() === '') {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Error",
        description: "Esta categoría ya existe",
        variant: "destructive"
      });
      return;
    }

    setCategories([...categories, newCategory.trim()]);
    setNewItem({...newItem, category: newCategory.trim()});
    setNewCategory('');
    setShowNewCategoryInput(false);
    
    toast({
      title: "Categoría añadida",
      description: `La categoría "${newCategory.trim()}" ha sido añadida correctamente`
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!newItem.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del artículo es requerido",
        variant: "destructive"
      });
      return;
    }

    if (!newItem.category) {
      toast({
        title: "Error",
        description: "La categoría es requerida",
        variant: "destructive"
      });
      return;
    }

    if (!newItem.location) {
      toast({
        title: "Error",
        description: "La ubicación es requerida",
        variant: "destructive"
      });
      return;
    }

    if (newItem.quantity < 0) {
      toast({
        title: "Error",
        description: "La cantidad no puede ser negativa",
        variant: "destructive"
      });
      return;
    }

    if (newItem.min_stock < 0) {
      toast({
        title: "Error",
        description: "El stock mínimo no puede ser negativo",
        variant: "destructive"
      });
      return;
    }

    if (newItem.cost <= 0) {
      toast({
        title: "Error",
        description: "El costo debe ser mayor que cero",
        variant: "destructive"
      });
      return;
    }

    if (newItem.delivery_time < 0) {
      toast({
        title: "Error",
        description: "El tiempo de entrega no puede ser negativo",
        variant: "destructive"
      });
      return;
    }

    // Crear el nuevo artículo con valores calculados
    const newItemWithDetails = {
      ...newItem,
      id: Date.now(), // ID temporal
      status: newItem.quantity < newItem.min_stock ? (newItem.quantity === 0 ? 'Crítico' : 'Bajo') : 'Normal',
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
      cost: 0,
      delivery_time: 0
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
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Artículo *</Label>
              <Input
                id="name"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                placeholder="Ej: Laptop Dell XPS"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              {!showNewCategoryInput ? (
                <div className="flex items-center gap-2">
                  <Select 
                    value={newItem.category} 
                    onValueChange={(value) => setNewItem({...newItem, category: value})}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowNewCategoryInput(true)}
                    title="Añadir nueva categoría"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nueva categoría..."
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={handleAddCategory}
                  >
                    Añadir
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowNewCategoryInput(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Select 
                value={newItem.location} 
                onValueChange={(value) => setNewItem({...newItem, location: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min_stock">Stock Mínimo *</Label>
                <Input
                  id="min_stock"
                  name="min_stock"
                  type="number"
                  value={newItem.min_stock}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Costo Unitario (MXN) *</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  value={newItem.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delivery_time">Tiempo de Entrega (días) *</Label>
                <Input
                  id="delivery_time"
                  name="delivery_time"
                  type="number"
                  value={newItem.delivery_time}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
          </div>
          
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
