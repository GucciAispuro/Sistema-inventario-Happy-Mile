
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CategoryManagement from './CategoryManagement';

export interface ItemFormData {
  name: string;
  category: string;
  location: string;
  quantity: number;
  min_stock: number;
  lead_time: number;
  cost: number;
  description?: string;
  asset_type: 'Activo' | 'Insumo';
  assigned_to?: string;
}

interface ItemFormProps {
  item: ItemFormData;
  onChange: (field: string, value: string | number) => void;
  locations: string[];
  categories: string[];
  onAddCategory: (category: string) => void;
}

const ItemForm: React.FC<ItemFormProps> = ({
  item,
  onChange,
  locations,
  categories,
  onAddCategory
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(
      name,
      name === 'quantity' || name === 'min_stock' || name === 'cost' || name === 'lead_time'
        ? parseFloat(value) || 0 
        : value
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Artículo *</Label>
        <Input
          id="name"
          name="name"
          value={item.name}
          onChange={handleInputChange}
          placeholder="Ej: Laptop Dell XPS"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="asset_type">Tipo de Artículo *</Label>
        <Select 
          value={item.asset_type} 
          onValueChange={(value) => onChange('asset_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Insumo">Insumo</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {item.asset_type === 'Activo' && (
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Asignado a *</Label>
          <Input
            id="assigned_to"
            name="assigned_to"
            value={item.assigned_to || ''}
            onChange={handleInputChange}
            placeholder="Nombre del responsable"
            required={item.asset_type === 'Activo'}
          />
        </div>
      )}
      
      <CategoryManagement
        categories={categories}
        selectedCategory={item.category}
        onCategoryChange={(value) => onChange('category', value)}
        onAddCategory={onAddCategory}
      />
      
      <div className="space-y-2">
        <Label htmlFor="location">Ubicación *</Label>
        <Select 
          value={item.location} 
          onValueChange={(value) => onChange('location', value)}
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
      
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={item.description || ''}
          onChange={handleInputChange}
          placeholder="Descripción detallada del artículo"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad *</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            value={item.quantity}
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
            value={item.min_stock}
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
            value={item.cost}
            onChange={handleInputChange}
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lead_time">Tiempo de Reabastecimiento (días) *</Label>
          <Input
            id="lead_time"
            name="lead_time"
            type="number"
            value={item.lead_time}
            onChange={handleInputChange}
            min="1"
          />
        </div>
      </div>
    </div>
  );
};

export default ItemForm;
