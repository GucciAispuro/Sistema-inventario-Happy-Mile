
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem } from '@/components/audit/AuditItemsTable';
import { Audit } from '@/components/audit/AuditHistoryTable';

export const useAudit = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [previousAudits, setPreviousAudits] = useState<Audit[]>([]);

  useEffect(() => {
    fetchLocations();
    fetchPreviousAudits();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .select('*');
      
      if (locationError) throw locationError;
      
      if (locationData) {
        setLocations(locationData.map((location) => location.name));
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

  const handleLocationSelect = async (location: string) => {
    setSelectedLocation(location);
    
    try {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('location', location);
      
      if (inventoryError) throw inventoryError;
      
      if (inventoryData) {
        const itemsWithActual = inventoryData.map((item: InventoryItem) => ({
          ...item,
          actual_quantity: item.quantity,
          difference: 0
        }));
        
        setInventoryItems(itemsWithActual);
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
      fetchPreviousAudits();
      
    } catch (error) {
      console.error('Error saving audit:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la auditoría',
        variant: 'destructive'
      });
    }
  };

  return {
    locations,
    selectedLocation,
    inventoryItems,
    isAuditDialogOpen,
    previousAudits,
    setIsAuditDialogOpen,
    handleLocationSelect,
    handleActualQuantityChange,
    saveAudit
  };
};
