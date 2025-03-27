
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import MotionContainer from '@/components/ui/MotionContainer';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { DataTable } from '@/components/ui/DataTable';
import { Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AuditDetail, { AuditDetail as AuditDetailType, AuditItem } from '@/components/audit/AuditDetail';

// Type definitions
type AuditHistory = {
  id: string;
  location: string;
  date: string;
  user_name: string;
  items_count: number;
  discrepancies: number;
  created_at?: string;
};

type SavedAudit = {
  location: string;
  date: string;
  user_name: string;
  items_count: number;
  discrepancies: number;
  items: AuditItem[];
};

const Audit = () => {
  const [location, setLocation] = useState('');
  const [user, setUser] = useState('');
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditDetailType | null>(null);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([
    { 
      id: '1', 
      name: 'Laptop HP', 
      category: 'Electrónicos',
      location: 'Almacén Principal',
      system_quantity: 10, 
      actual_quantity: 8, 
      difference: -2 
    },
    { 
      id: '2', 
      name: 'Monitor Dell', 
      category: 'Electrónicos',
      location: 'Almacén Principal',
      system_quantity: 15, 
      actual_quantity: 15, 
      difference: 0 
    },
    { 
      id: '3', 
      name: 'Teclado Mecánico', 
      category: 'Periféricos',
      location: 'Almacén Principal',
      system_quantity: 20, 
      actual_quantity: 22, 
      difference: 2 
    }
  ]);

  // Fetch audit history
  const { 
    data: auditHistory = [], 
    isLoading, 
    refetch: refetchAuditHistory
  } = useQuery<AuditHistory[]>({
    queryKey: ['audit-history'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('audits')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          toast({
            title: 'Error al cargar el historial de auditorías',
            description: error.message,
            variant: 'destructive'
          });
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error('Error fetching audit history:', err);
        return [];
      }
    }
  });

  // Get discrepancy count
  const getDiscrepancyCount = () => {
    return auditItems.filter(item => item.difference !== 0).length;
  };

  // Handle form submission
  const handleSaveAudit = async () => {
    try {
      if (!location || !user) {
        toast({
          title: 'Información Incompleta',
          description: 'Por favor completa todos los campos requeridos.',
          variant: 'destructive'
        });
        return;
      }

      const itemsWithDiscrepancies = auditItems.length;
      const discrepancyCount = getDiscrepancyCount();

      // Audit data to save
      const auditData: SavedAudit = {
        location,
        date: new Date().toISOString().split('T')[0],
        user_name: user,
        items_count: itemsWithDiscrepancies,
        discrepancies: discrepancyCount,
        items: auditItems
      };

      // Insert audit record
      const { data: auditRecord, error: auditError } = await supabase
        .from('audits')
        .insert({
          location: auditData.location,
          date: auditData.date,
          user_name: auditData.user_name,
          items_count: auditData.items_count,
          discrepancies: auditData.discrepancies
        })
        .select()
        .single();

      if (auditError) {
        throw new Error(`Error al guardar la auditoría: ${auditError.message}`);
      }

      // Insert audit items
      const auditItems = auditData.items.map(item => ({
        audit_id: auditRecord.id,
        name: item.name,
        category: item.category,
        location: item.location,
        system_quantity: item.system_quantity,
        actual_quantity: item.actual_quantity,
        difference: item.difference
      }));

      const { error: itemsError } = await supabase
        .from('audit_items')
        .insert(auditItems);

      if (itemsError) {
        throw new Error(`Error al guardar los elementos de la auditoría: ${itemsError.message}`);
      }

      // Success!
      toast({
        title: 'Auditoría Guardada',
        description: `Se ha guardado la auditoría con ${discrepancyCount} discrepancias.`,
      });

      // Reset form and close dialog
      setLocation('');
      setUser('');
      setIsAuditDialogOpen(false);

      // Refresh audit history
      refetchAuditHistory();
    } catch (error) {
      console.error('Error saving audit:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido al guardar la auditoría',
        variant: 'destructive'
      });
    }
  };

  // View audit details
  const handleViewAuditDetails = async (auditId: string) => {
    try {
      // Fetch audit details
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .single();

      if (auditError) {
        throw new Error(`Error al cargar la auditoría: ${auditError.message}`);
      }

      // Fetch audit items
      const { data: itemsData, error: itemsError } = await supabase
        .from('audit_items')
        .select('*')
        .eq('audit_id', auditId);

      if (itemsError) {
        throw new Error(`Error al cargar los elementos de la auditoría: ${itemsError.message}`);
      }

      // Set selected audit for detail view
      setSelectedAudit({
        ...auditData,
        items: itemsData || []
      });

      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error fetching audit details:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido al cargar los detalles',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout title="Auditoría de Inventario">
      <div className="space-y-6">
        <MotionContainer>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Auditoría de Inventario</h1>
            <Button onClick={() => setIsAuditDialogOpen(true)}>Nueva Auditoría</Button>
          </div>
        </MotionContainer>
        
        <MotionContainer delay={100}>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Historial de Auditorías</h2>
            
            <DataTable 
              data={auditHistory}
              loading={isLoading}
              emptyState="No hay registros de auditorías"
              columns={[
                { 
                  key: 'date', 
                  header: 'Fecha',
                  cell: (audit: AuditHistory) => (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {audit.date}
                    </div>
                  )
                },
                { key: 'location', header: 'Ubicación' },
                { key: 'user_name', header: 'Usuario' },
                { 
                  key: 'items_count', 
                  header: 'Artículos',
                  cell: (audit: AuditHistory) => (
                    <span className="font-medium">{audit.items_count}</span>
                  )
                },
                { 
                  key: 'discrepancies', 
                  header: 'Discrepancias',
                  cell: (audit: AuditHistory) => (
                    <span className={`font-medium ${audit.discrepancies > 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {audit.discrepancies}
                    </span>
                  )
                },
                {
                  key: 'actions',
                  header: 'Acciones',
                  cell: (audit: AuditHistory) => (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewAuditDetails(audit.id)}
                    >
                      Ver Detalles
                    </Button>
                  )
                }
              ]}
            />
          </div>
        </MotionContainer>
      </div>
      
      {/* Nueva Auditoría Dialog */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Auditoría</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ubicación</label>
              <Input 
                placeholder="Ingrese la ubicación" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <Input 
                placeholder="Nombre del usuario" 
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAudit}>
              Guardar Auditoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Audit Detail Dialog */}
      <AuditDetail 
        audit={selectedAudit}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </Layout>
  );
};

export default Audit;
