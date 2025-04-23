
import { DataTable } from "@/components/ui/DataTable";
import Layout from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssetAssignment {
  id: string;
  assigned_to: string;
  assigned_date: string;
  notes: string;
  is_active: boolean;
  inventory: {
    name: string;
    category: string;
    location: string;
  };
}

export default function AssetAssignments() {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["asset-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_assignments")
        .select(`
          *,
          inventory:inventory_id (
            name,
            category,
            location
          )
        `)
        .eq("is_active", true)
        .order("assigned_date", { ascending: false });

      if (error) {
        toast.error("Error loading assignments");
        throw error;
      }

      return data as AssetAssignment[];
    },
  });

  const columns = [
    {
      key: "inventory.name",
      header: "Activo",
      cell: (row: AssetAssignment) => row.inventory.name,
    },
    {
      key: "inventory.category",
      header: "Categoría",
      cell: (row: AssetAssignment) => row.inventory.category,
    },
    {
      key: "assigned_to",
      header: "Asignado a",
    },
    {
      key: "assigned_date",
      header: "Fecha de asignación",
      cell: (row: AssetAssignment) => new Date(row.assigned_date).toLocaleDateString(),
    },
    {
      key: "inventory.location",
      header: "Ubicación",
      cell: (row: AssetAssignment) => row.inventory.location,
    },
    {
      key: "notes",
      header: "Notas",
    },
  ];

  return (
    <Layout title="Activos Asignados">
      <div className="bg-background rounded-lg p-4 shadow">
        <DataTable
          data={assignments || []}
          columns={columns}
          loading={isLoading}
          emptyState="No hay activos asignados"
        />
      </div>
    </Layout>
  );
}
