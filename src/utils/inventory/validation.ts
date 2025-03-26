
import { ItemFormData } from '@/components/inventory/ItemForm';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateItemForm = (item: ItemFormData): ValidationResult => {
  const errors: string[] = [];
  
  if (!item.name.trim()) {
    errors.push("El nombre del artículo es requerido");
  }

  if (!item.category) {
    errors.push("La categoría es requerida");
  }

  if (!item.location) {
    errors.push("La ubicación es requerida");
  }

  if (item.quantity < 0) {
    errors.push("La cantidad no puede ser negativa");
  }

  if (item.min_stock < 0) {
    errors.push("El stock mínimo no puede ser negativo");
  }

  if (item.cost <= 0) {
    errors.push("El costo debe ser mayor que cero");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const calculateItemStatus = (quantity: number, min_stock: number): 'Normal' | 'Bajo' | 'Crítico' => {
  if (quantity === 0) return 'Crítico';
  if (quantity < min_stock) return 'Bajo';
  return 'Normal';
};
