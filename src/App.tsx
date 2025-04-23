import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ensureTables } from "@/utils/database/ensureTables";
import AuthGuard from "@/components/auth/AuthGuard";
import AssignedAssets from '@/pages/admin/AssignedAssets';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Check if users table exists
    ensureTables();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/inventory" element={
              <AuthGuard>
                <Inventory />
              </AuthGuard>
            } />
            <Route path="/transactions" element={
              <AuthGuard>
                <Transactions />
              </AuthGuard>
            } />
            <Route path="/colaborador" element={
              <AuthGuard>
                <TransaccionesColaborador />
              </AuthGuard>
            } />
            <Route path="/audit" element={
              <AuthGuard>
                <Audit />
              </AuthGuard>
            } />
            <Route path="/suppliers" element={
              <AuthGuard>
                <Suppliers />
              </AuthGuard>
            } />
            <Route path="/part-receipts" element={
              <AuthGuard>
                <PartReceipts />
              </AuthGuard>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/items" element={
              <AuthGuard>
                <AdminItems />
              </AuthGuard>
            } />
            <Route path="/admin/locations" element={
              <AuthGuard>
                <AdminLocations />
              </AuthGuard>
            } />
            <Route path="/admin/users" element={
              <AuthGuard>
                <AdminUsers />
              </AuthGuard>
            } />
            <Route 
              path="/admin/assigned-assets" 
              element={
                <AuthGuard>
                  <AssignedAssets />
                </AuthGuard>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
