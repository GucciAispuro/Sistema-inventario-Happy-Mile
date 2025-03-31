
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

export const calculateItemStatus = (quantity: number, min_stock: number): 'Normal' | 'Bajo' | 'Crítico' | 'Exceso' => {
  if (quantity === 0) return 'Crítico';
  if (quantity < min_stock) return 'Bajo';
  if (quantity >= min_stock * 3) return 'Exceso';
  return 'Normal';
};

export const validateInventoryTransaction = (
  transactionType: 'IN' | 'OUT', 
  requestedQuantity: number,
  availableQuantity: number
): ValidationResult => {
  const errors: string[] = [];
  
  if (requestedQuantity <= 0) {
    errors.push("La cantidad debe ser mayor que cero");
  }
  
  if (transactionType === 'OUT' && requestedQuantity > availableQuantity) {
    errors.push(`No hay suficientes unidades disponibles. Disponible: ${availableQuantity}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const calculateDiscrepancyValue = (difference: number, costPerUnit: number): number => {
  return difference * costPerUnit;
};

export const validateLocation = async (location: string, supabaseClient: any): Promise<ValidationResult> => {
  const errors: string[] = [];
  
  if (!location || location.trim() === '') {
    errors.push("Debe seleccionar una ubicación");
    return {
      isValid: false,
      errors
    };
  }
  
  try {
    console.log('Validating location:', location);
    // Check if location exists in database
    const { data, error } = await supabaseClient
      .from('locations')
      .select('name')
      .eq('name', location)
      .single();
    
    if (error) {
      console.error('Error al validar ubicación:', error);
      
      // Check if the error is just that no rows were found
      if (error.code === 'PGRST116') {
        console.log('Location not found in database, but will continue with validation');
        errors.push(`La ubicación "${location}" no está registrada en el sistema.`);
        return {
          isValid: false,
          errors
        };
      }
      
      // For other errors
      errors.push('Error al validar la ubicación. Por favor intente nuevamente.');
      return {
        isValid: false,
        errors
      };
    }
    
    // If we got here, the location was found
    console.log('Location validated successfully:', data);
    return {
      isValid: true,
      errors: []
    };
  } catch (err) {
    console.error('Exception in validateLocation:', err);
    errors.push('Error al validar la ubicación. Por favor intente nuevamente.');
    return {
      isValid: false,
      errors
    };
  }
};
