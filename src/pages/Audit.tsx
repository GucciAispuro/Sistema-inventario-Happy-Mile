
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditLocationSelector } from '@/components/audit/AuditLocationSelector';
import { AuditHistoryTable } from '@/components/audit/AuditHistoryTable';
import { AuditDialog } from '@/components/audit/AuditDialog';
import { useAudit } from '@/hooks/useAudit';

const Audit = () => {
  const {
    locations,
    selectedLocation,
    inventoryItems,
    isAuditDialogOpen,
    previousAudits,
    setIsAuditDialogOpen,
    handleLocationSelect,
    handleActualQuantityChange,
    saveAudit
  } = useAudit();

  return (
    <Layout title="Auditoría">
      <div className="space-y-6">
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Auditoría Pendiente</TabsTrigger>
            <TabsTrigger value="history">Historial de Auditorías</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <AuditLocationSelector 
              locations={locations} 
              onLocationSelect={handleLocationSelect} 
            />
          </TabsContent>
          
          <TabsContent value="history">
            <AuditHistoryTable audits={previousAudits} />
          </TabsContent>
        </Tabs>

        <AuditDialog
          open={isAuditDialogOpen}
          onOpenChange={setIsAuditDialogOpen}
          locationName={selectedLocation}
          inventoryItems={inventoryItems}
          onActualQuantityChange={handleActualQuantityChange}
          onSaveAudit={saveAudit}
        />
      </div>
    </Layout>
  );
};

export default Audit;
