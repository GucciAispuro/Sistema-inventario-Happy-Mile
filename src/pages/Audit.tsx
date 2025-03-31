
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AuditPendingTab from '@/components/audit/AuditPendingTab';
import AuditHistoryTab from '@/components/audit/AuditHistoryTab';
import { AuditHistory } from '@/components/audit/types';

// Mock data for inventory items by location
const inventoryItems = [
  { id: 1, name: 'Silla de Oficina', category: 'Mobiliario', location: 'CDMX', system_quantity: 15, actual_quantity: null, difference: null, last_audit: '2023-05-15', cost: 1200 },
  { id: 2, name: 'Papel para Impresora', category: 'Material de Oficina', location: 'CDMX', system_quantity: 8, actual_quantity: null, difference: null, last_audit: '2023-05-10', cost: 85 },
  { id: 3, name: 'Laptop', category: 'Electrónicos', location: 'CDMX', system_quantity: 12, actual_quantity: null, difference: null, last_audit: '2023-06-01', cost: 15000 },
  { id: 4, name: 'Silla de Oficina', category: 'Mobiliario', location: 'Monterrey', system_quantity: 7, actual_quantity: null, difference: null, last_audit: '2023-04-22', cost: 1200 },
  { id: 5, name: 'Papel para Impresora', category: 'Material de Oficina', location: 'Monterrey', system_quantity: 3, actual_quantity: null, difference: null, last_audit: '2023-04-20', cost: 85 },
  { id: 6, name: 'Llanta de Repuesto', category: 'Piezas de Vehículo', location: 'Guadalajara', system_quantity: 5, actual_quantity: null, difference: null, last_audit: '2023-05-28', cost: 2500 },
  { id: 7, name: 'Chaleco de Seguridad', category: 'Equipo de Seguridad', location: 'Culiacán', system_quantity: 4, actual_quantity: null, difference: null, last_audit: '2023-06-02', cost: 350 },
  { id: 8, name: 'Tóner para Impresora', category: 'Material de Oficina', location: 'Guadalajara', system_quantity: 9, actual_quantity: null, difference: null, last_audit: '2023-05-19', cost: 950 },
  { id: 9, name: 'Kit de Primeros Auxilios', category: 'Equipo de Seguridad', location: 'CDMX', system_quantity: 12, actual_quantity: null, difference: null, last_audit: '2023-05-30', cost: 780 },
  { id: 10, name: 'Lámpara de Escritorio', category: 'Mobiliario', location: 'Culiacán', system_quantity: 6, actual_quantity: null, difference: null, last_audit: '2023-06-01', cost: 450 },
];

const Audit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [auditHistory, setAuditHistory] = useState<AuditHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [registeredLocations, setRegisteredLocations] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Get user role
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    // Load audit history when component mounts
    loadAuditHistory();
    loadRegisteredLocations();
  }, [navigate]);
  
  // Load registered locations from database
  const loadRegisteredLocations = async () => {
    setLoadingLocations(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('name')
        .order('name');
        
      if (error) {
        console.error('Error loading locations:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las ubicaciones',
          variant: 'destructive'
        });
        return;
      }
      
      if (data && data.length > 0) {
        const locationNames = data.map(loc => loc.name);
        setRegisteredLocations(locationNames);
      } else {
        console.log('No registered locations found in database');
        // Use inventory locations as fallback
        const uniqueLocations = Array.from(new Set(inventoryItems.map(item => item.location)));
        setRegisteredLocations(uniqueLocations);
      }
    } catch (err) {
      console.error('Error in loadRegisteredLocations:', err);
      // Use inventory locations as fallback
      const uniqueLocations = Array.from(new Set(inventoryItems.map(item => item.location)));
      setRegisteredLocations(uniqueLocations);
    } finally {
      setLoadingLocations(false);
    }
  };
  
  // Load audit history from Supabase
  const loadAuditHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading audit history:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el historial de auditorías',
          variant: 'destructive'
        });
        return;
      }

      setAuditHistory(data || []);
    } catch (err) {
      console.error('Error in loadAuditHistory:', err);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al cargar el historial',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get all unique locations from the inventory items
  const inventoryLocations = Array.from(new Set(inventoryItems.map(item => item.location)));

  return (
    <Layout title="Auditoría de Inventario">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">Auditoría Pendiente</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        {/* Pestaña de Auditoría Pendiente */}
        <TabsContent value="pending" className="space-y-6">
          <AuditPendingTab 
            inventoryItems={inventoryItems}
            locations={registeredLocations.length > 0 ? registeredLocations : inventoryLocations}
            onAuditSaved={loadAuditHistory}
            setActiveTab={setActiveTab}
          />
        </TabsContent>

        {/* Pestaña de Historial */}
        <TabsContent value="history" className="space-y-6">
          <AuditHistoryTab 
            auditHistory={auditHistory}
            loading={loading}
            onDeleteAudit={loadAuditHistory}
          />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Audit;
