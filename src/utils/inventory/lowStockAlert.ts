
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
    
    const { data, error } = await supabase.functions.invoke('send-low-stock-alert', {
      body: {
        items,
        location,
        adminEmail: admin.adminEmail,
        adminName: admin.adminName,
        baseUrl: window.location.origin
      }
    });

    if (error) {
      console.error("Error al enviar alerta de stock bajo:", error);
      toast({
        title: "Error al enviar alerta",
        description: `No se pudo enviar la alerta para ${location}`,
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
    console.error("Error al procesar alerta de stock bajo:", error);
    toast({
      title: "Error en la notificación",
      description: "Ocurrió un error al procesar la alerta de stock bajo",
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
    
    // For each location, check for low stock items
    for (const location of locations) {
      const { data: items, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('location', location)
        .lt('quantity', supabase.raw('min_stock'));
      
      if (error) {
        console.error(`Error al verificar stock bajo en ${location}:`, error);
        continue;
      }
      
      if (items && items.length > 0) {
        // Add calculated status to each item
        const processedItems = items.map(item => ({
          ...item,
          status: item.quantity === 0 ? 'Agotado' : 
                  item.quantity < item.min_stock / 2 ? 'Crítico' : 'Bajo'
        }));
        
        // Send alert for this location
        await sendLowStockAlert(location, processedItems);
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
