
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search,
  User
} from 'lucide-react';

interface AssignedAsset {
  id: string;
  name: string;
  category: string;
  assigned_to: string;
  location: string;
  quantity: number;
}

const AssignedAssets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedAssets, setAssignedAssets] = useState<AssignedAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AssignedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchAssignedAssets();
  }, [navigate]);

  const fetchAssignedAssets = async () => {
    setIsLoading(true);
    try {
      // Fetch inventory items marked as Activo and their current assignments
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          name,
          category,
          location,
          quantity,
          asset_assignments (assigned_to)
        `)
        .eq('asset_type', 'Activo')
        .eq('asset_assignments.is_active', true);

      if (error) throw error;

      const formattedAssets = data?.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        location: item.location,
        quantity: item.quantity,
        assigned_to: item.asset_assignments[0]?.assigned_to || 'No asignado'
      })) || [];

      setAssignedAssets(formattedAssets);
      setFilteredAssets(formattedAssets);
    } catch (error) {
      console.error('Error fetching assigned assets:', error);
      toast({
        title: "Error al cargar activos",
        description: "No se pudieron cargar los activos asignados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAssets(assignedAssets);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = assignedAssets.filter(asset => 
        asset.name.toLowerCase().includes(query) ||
        asset.category.toLowerCase().includes(query) ||
        asset.assigned_to.toLowerCase().includes(query) ||
        asset.location.toLowerCase().includes(query)
      );
      setFilteredAssets(filtered);
    }
  }, [searchQuery, assignedAssets]);

  return (
    <Layout title="Activos Asignados">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar activos por nombre, categoría, asignado o ubicación..." 
              className="pl-9 subtle-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <DataTable 
          data={filteredAssets}
          columns={[
            { 
              key: 'name', 
              header: 'Nombre del Activo',
              cell: (item) => (
                <div className="font-medium">{item.name}</div>
              )
            },
            { 
              key: 'category', 
              header: 'Categoría',
              cell: (item) => (
                <div>{item.category}</div>
              )
            },
            { 
              key: 'assigned_to', 
              header: 'Asignado a',
              cell: (item) => (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {item.assigned_to}
                </div>
              )
            },
            { 
              key: 'location', 
              header: 'Ubicación',
              cell: (item) => (
                <div>{item.location}</div>
              )
            },
            { 
              key: 'quantity', 
              header: 'Cantidad',
              cell: (item) => (
                <div>{item.quantity}</div>
              )
            },
          ]}
          loading={isLoading}
          emptyState="No hay activos asignados"
        />
      </div>
    </Layout>
  );
};

export default AssignedAssets;
