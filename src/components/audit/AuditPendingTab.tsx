import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  MapPin,
  Save,
  ClipboardCheck
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuditItem } from './types';

interface AuditPendingTabProps {
  inventoryItems: Array<AuditItem>;
  locations: Array<string>;
  onAuditSaved: () => void;
  setActiveTab: (tab: string) => void;
}

const AuditPendingTab: React.FC<AuditPendingTabProps> = ({ 
  inventoryItems, 
  locations, 
  onAuditSaved,
  setActiveTab
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (selectedLocation) {
      const locationItems = inventoryItems.filter(item => 
        item.location === selectedLocation
      );
      
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const filtered = locationItems.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
        setAuditItems(filtered);
      } else {
        setAuditItems(locationItems);
      }
    } else {
      setAuditItems([]);
    }
  }, [selectedLocation, searchQuery, inventoryItems]);

  const handleQuantityChange = (id: number, value: string) => {
    const actualQuantity = value === '' ? null : parseInt(value);
    setAuditItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const difference = actualQuantity !== null ? actualQuantity - item.system_quantity : null;
          return { ...item, actual_quantity: actualQuantity, difference };
        }
        return item;
      })
    );
  };

  const handleSaveAudit = async () => {
    const uncountedItems = auditItems.filter(item => item.actual_quantity === null);
    if (uncountedItems.length > 0) {
      toast({
        title: "Auditoría incompleta",
        description: "Por favor ingrese la cantidad real de todos los artículos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userName = localStorage.getItem('userName') || 'Usuario';
      
      const auditData = {
        location: selectedLocation,
        date: new Date().toISOString().substring(0, 10),
        user_name: userName,
        items_count: auditItems.length,
        discrepancies: auditItems.filter(item => item.difference !== 0).length,
      };
      
      const { data, error } = await supabase
        .from('audits')
        .insert(auditData)
        .select();
      
      if (error) {
        console.error('Error saving audit:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const auditId = data[0].id;
        
        const auditItemsData = auditItems.map(item => ({
          audit_id: auditId,
          name: item.name,
          category: item.category,
          location: item.location,
          system_quantity: item.system_quantity,
          actual_quantity: item.actual_quantity || 0,
          difference: item.difference || 0
        }));
        
        const { error: itemsError } = await supabase
          .from('audit_items')
          .insert(auditItemsData);
        
        if (itemsError) {
          console.error('Error saving audit items:', itemsError);
          throw itemsError;
        }
      }
      
      toast({
        title: "Auditoría guardada",
        description: `Se ha guardado la auditoría de ${selectedLocation} correctamente`,
      });
      
      resetAuditForm();
      onAuditSaved();
      setActiveTab("history");
      
    } catch (err) {
      console.error('Error in save audit:', err);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la auditoría. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAuditForm = () => {
    setSelectedLocation('');
    setAuditItems([]);
    setSearchQuery('');
  };

  return (
    <>
      <MotionContainer>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="text-sm font-medium mb-2 block">Seleccionar Ubicación a Auditar</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Seleccionar ubicación" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedLocation && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar artículos..." 
                className="pl-9 subtle-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
      </MotionContainer>
      
      {selectedLocation && (
        <>
          <MotionContainer delay={100}>
            <DataTable 
              data={auditItems}
              columns={[
                { key: 'name', header: 'Nombre del Artículo' },
                { key: 'category', header: 'Categoría' },
                { 
                  key: 'system_quantity', 
                  header: 'Cantidad en Sistema',
                  cell: (item) => (
                    <div className="font-medium">{item.system_quantity}</div>
                  )
                },
                { 
                  key: 'actual_quantity', 
                  header: 'Cantidad Real',
                  cell: (item) => (
                    <Input 
                      type="number" 
                      className="w-20" 
                      min="0"
                      value={item.actual_quantity === null ? '' : item.actual_quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                  )
                },
                { 
                  key: 'difference', 
                  header: 'Diferencia',
                  cell: (item) => {
                    if (item.difference === null) return null;
                    
                    const colorClass = item.difference < 0 
                      ? 'text-red-600' 
                      : (item.difference > 0 ? 'text-green-600' : 'text-gray-600');
                    
                    const prefix = item.difference > 0 ? '+' : '';
                    
                    return (
                      <div className={`font-medium ${colorClass}`}>
                        {prefix}{item.difference}
                      </div>
                    );
                  }
                },
                { 
                  key: 'last_audit', 
                  header: 'Última Auditoría',
                  cell: (item) => (
                    <div className="text-muted-foreground">{item.last_audit}</div>
                  )
                },
              ]}
            />
          </MotionContainer>

          <MotionContainer delay={200}>
            <div className="flex justify-end">
              <Button onClick={handleSaveAudit} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Auditoría'}
              </Button>
            </div>
          </MotionContainer>
        </>
      )}

      {!selectedLocation && (
        <MotionContainer delay={100}>
          <div className="text-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Auditoría de Inventario</h3>
            <p className="text-muted-foreground">
              Seleccione una ubicación para comenzar a auditar su inventario
            </p>
          </div>
        </MotionContainer>
      )}
    </>
  );
};

export default AuditPendingTab;
