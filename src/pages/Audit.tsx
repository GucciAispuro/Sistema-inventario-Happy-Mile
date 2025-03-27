
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/DataTable';

// Define types for our data
interface Location {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  actual_quantity?: number;
  difference?: number;
}

interface Audit {
  id: string;
  location: string;
  date: string;
  items_count: number;
  discrepancies: number;
  user_name: string;
  created_at: string;
}

const Audit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [auditItems, setAuditItems] = useState<any[]>([]);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [previousAudits, setPreviousAudits] = useState<Audit[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Using a more type-safe approach with explicit casting
        const { data, error } = await supabase
          .from('locations')
          .select('*');
        
        if (error) throw error;
        
        // Safely handling potential null data
        if (data) {
          setLocations(data.map((location: any) => location.name));
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las ubicaciones',
          variant: 'destructive'
        });
      }
    };

    const fetchPreviousAudits = async () => {
      try {
        const { data, error } = await supabase
          .from('audits')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setPreviousAudits(data as Audit[]);
        }
      } catch (error) {
        console.error('Error fetching previous audits:', error);
      }
    };

    fetchLocations();
    fetchPreviousAudits();
  }, []);

  const handleLocationSelect = async (location: string) => {
    setSelectedLocation(location);
    
    try {
      // Using a more type-safe approach with explicit casting
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('location', location);
      
      if (error) throw error;
      
      if (data) {
        const itemsWithActual = data.map((item: any) => ({
          ...item,
          actual_quantity: item.quantity,
          difference: 0
        }));
        
        setInventoryItems(itemsWithActual as InventoryItem[]);
        setIsAuditDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los artículos de la ubicación',
        variant: 'destructive'
      });
    }
  };

  const handleActualQuantityChange = (itemId: string, actualQuantity: number) => {
    const updatedItems = inventoryItems.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            actual_quantity: actualQuantity,
            difference: actualQuantity - item.quantity 
          }
        : item
    );
    setInventoryItems(updatedItems);
  };

  const saveAudit = async () => {
    try {
      const auditData = {
        location: selectedLocation,
        items_count: inventoryItems.length,
        discrepancies: inventoryItems.filter(item => item.difference !== 0).length,
        user_name: localStorage.getItem('userName') || 'Usuario'
      };

      const { data: auditResult, error: auditError } = await supabase
        .from('audits')
        .insert(auditData)
        .select('id')
        .single();

      if (auditError) throw auditError;

      const auditItemsData = inventoryItems.map(item => ({
        audit_id: auditResult.id,
        name: item.name,
        category: item.category,
        location: selectedLocation,
        system_quantity: item.quantity,
        actual_quantity: item.actual_quantity || 0,
        difference: item.difference || 0
      }));

      const { error: auditItemsError } = await supabase
        .from('audit_items')
        .insert(auditItemsData);

      if (auditItemsError) throw auditItemsError;

      toast({
        title: 'Auditoría Guardada',
        description: `Auditoría de ${selectedLocation} completada exitosamente`
      });

      setIsAuditDialogOpen(false);
      setSelectedLocation('');
      
      // Refresh the audit list
      const { data: freshAudits, error: refreshError } = await supabase
        .from('audits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!refreshError && freshAudits) {
        setPreviousAudits(freshAudits as Audit[]);
      }
      
    } catch (error) {
      console.error('Error saving audit:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la auditoría',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout title="Auditoría">
      <div className="space-y-6">
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Auditoría Pendiente</TabsTrigger>
            <TabsTrigger value="history">Historial de Auditorías</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <div className="flex items-center space-x-4">
              <Select onValueChange={handleLocationSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <DataTable 
              data={previousAudits}
              columns={[
                { key: 'location', header: 'Ubicación' },
                { key: 'date', header: 'Fecha' },
                { key: 'items_count', header: 'Total de Artículos' },
                { key: 'discrepancies', header: 'Discrepancias' },
                { key: 'user_name', header: 'Usuario' }
              ]}
            />
          </TabsContent>
        </Tabs>

        <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Auditoría de {selectedLocation}</DialogTitle>
            </DialogHeader>
            
            <DataTable 
              data={inventoryItems}
              columns={[
                { key: 'name', header: 'Nombre del Artículo' },
                { 
                  key: 'system_quantity', 
                  header: 'Cantidad en Sistema',
                  cell: (item) => <div>{item.quantity}</div>
                },
                { 
                  key: 'actual_quantity', 
                  header: 'Cantidad Real',
                  cell: (item) => (
                    <Input
                      type="number"
                      value={item.actual_quantity}
                      onChange={(e) => handleActualQuantityChange(item.id, Number(e.target.value))}
                      min="0"
                    />
                  )
                },
                { 
                  key: 'difference', 
                  header: 'Diferencia',
                  cell: (item) => (
                    <div className={`
                      font-medium 
                      ${item.difference > 0 ? 'text-green-600' : 
                        item.difference < 0 ? 'text-red-600' : 'text-gray-600'}
                    `}>
                      {item.difference}
                    </div>
                  )
                }
              ]}
            />
            
            <DialogFooter>
              <Button onClick={saveAudit}>Guardar Auditoría</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Audit;
