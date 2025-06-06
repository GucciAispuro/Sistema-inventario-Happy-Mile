
import { API_ENDPOINTS, getAuthHeaders } from "../api/config";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LocationAdmin {
  location: string;
  adminEmail: string;
  adminName?: string;
}

// Map of location to admin email
// In a real application, this would come from a database table
const locationAdmins: LocationAdmin[] = [
  { location: "Almacén Central", adminEmail: "admin@example.com", adminName: "Admin Central" },
  { location: "Sucursal Norte", adminEmail: "norte@example.com", adminName: "Admin Norte" },
  { location: "Sucursal Sur", adminEmail: "sur@example.com", adminName: "Admin Sur" },
  // Default fallback for any location not in the list
  { location: "default", adminEmail: "inventario@example.com", adminName: "Administrador" }
];

/**
 * Find the admin email for a specific location
 */
const getLocationAdmin = (location: string): LocationAdmin => {
  const admin = locationAdmins.find(admin => admin.location === location);
  if (admin) return admin;
  return locationAdmins.find(admin => admin.location === "default") || {
    location: "default",
    adminEmail: "inventario@example.com"
  };
};

/**
 * Send low stock alert email for a specific location
 */
export const sendLowStockAlert = async (location: string, items: any[]): Promise<boolean> => {
  try {
    if (!items || items.length === 0) {
      console.log(`No hay artículos con stock bajo en ${location}`);
      return false;
    }

    const admin = getLocationAdmin(location);
    
    console.log("Sending low stock alert email details:", {
      location,
      adminEmail: admin.adminEmail,
      adminName: admin.adminName,
      itemsCount: items.length
    });
    
    // Updated to use the new Node.js API endpoint instead of Supabase Function
    const response = await fetch(API_ENDPOINTS.SEND_LOW_STOCK_ALERT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        items,
        location,
        adminEmail: admin.adminEmail,
        adminName: admin.adminName,
        baseUrl: window.location.origin
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Detailed error sending low stock alert:", {
        status: response.status,
        statusText: response.statusText,
        error: data.error
      });
      
      toast({
        title: "Error al enviar alerta",
        description: `No se pudo enviar la alerta para ${location}. Detalles: ${data.error}`,
        variant: "destructive"
      });
      return false;
    }

    console.log("Alerta de stock bajo enviada con éxito:", data);
    toast({
      title: "Alerta enviada",
      description: `Notificación enviada al administrador de ${location}`,
    });
    return true;
  } catch (error) {
    console.error("Error al procesar alerta de stock bajo:", {
      errorMessage: error.message,
      errorStack: error.stack
    });
    toast({
      title: "Error en la notificación",
      description: `Ocurrió un error al procesar la alerta de stock bajo: ${error.message}`,
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Check for low stock items in the inventory and send alerts
 * This is the main function to be called from the Inventory component
 */
export const checkAndAlertLowStock = async (): Promise<void> => {
  try {
    // Get all unique locations from the inventory
    const { data: locationsData, error: locationsError } = await supabase
      .from('inventory')
      .select('location')
      .order('location');
    
    if (locationsError) {
      console.error("Error al obtener ubicaciones:", locationsError);
      return;
    }
    
    // Extract unique locations
    const locations = Array.from(new Set(locationsData.map(item => item.location)));
    console.log("Checking low stock for locations:", locations);
    
    // For each location, check for low stock items
    for (const location of locations) {
      // Using a proper query to find items with quantity less than min_stock
      const { data: lowStockItems, error: queryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('location', location)
        .not('min_stock', 'is', null)
        .lt('quantity', 'min_stock'); // Use a simple string comparison which works with Supabase
      
      if (queryError) {
        console.error(`Error al verificar stock bajo en ${location}:`, queryError);
        continue;
      }
      
      if (lowStockItems && lowStockItems.length > 0) {
        console.log(`Found ${lowStockItems.length} items with low stock in ${location}`);
        
        // Add calculated status to each item
        const processedItems = lowStockItems.map(item => ({
          ...item,
          status: item.quantity === 0 ? 'Agotado' : 
                  item.quantity < item.min_stock / 2 ? 'Crítico' : 'Bajo'
        }));
        
        // Send alert for this location
        await sendLowStockAlert(location, processedItems);
      } else {
        console.log(`No items with low stock found in ${location}`);
      }
    }
  } catch (error) {
    console.error("Error al verificar y enviar alertas de stock bajo:", error);
  }
};

/**
 * Send low stock alert for a specific transaction
 * This is used when a transaction reduces the stock below the minimum
 */
export const checkAndAlertForTransaction = async (item: any): Promise<void> => {
  if (item && item.quantity < item.min_stock) {
    const processedItem = {
      ...item,
      status: item.quantity === 0 ? 'Agotado' : 
              item.quantity < item.min_stock / 2 ? 'Crítico' : 'Bajo'
    };
    
    await sendLowStockAlert(item.location, [processedItem]);
  }
};
