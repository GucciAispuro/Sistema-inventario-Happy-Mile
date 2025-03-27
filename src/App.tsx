
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Transactions from "./pages/Transactions";
import TransaccionesColaborador from "./pages/TransaccionesColaborador";
import Audit from "./pages/Audit";
import AdminItems from "./pages/admin/Items";
import AdminLocations from "./pages/admin/Locations";
import AdminUsers from "./pages/admin/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Ensure users table exists in Supabase
const ensureUserTable = async () => {
  try {
    // Check if users table exists
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    if (error && error.code === '42P01') { // Table doesn't exist error
      console.log('Users table does not exist, creating...');
      // Create users table
      const createTableQuery = `
        create table if not exists public.users (
          id uuid default gen_random_uuid() primary key,
          name text not null,
          email text not null unique,
          role text not null default 'viewer',
          location text not null,
          receive_alerts boolean default false,
          created_at timestamp with time zone default now()
        );
      `;
      
      // Need to use service role key for this, so use the SQL editor in Supabase dashboard
      console.log('Please run the following SQL in Supabase SQL Editor if the users table does not exist:');
      console.log(createTableQuery);
    } else {
      console.log('Users table exists');
    }
  } catch (error) {
    console.error('Error checking/creating users table:', error);
  }
};

const App = () => {
  useEffect(() => {
    // Check if users table exists
    ensureUserTable();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/colaborador" element={<TransaccionesColaborador />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/admin/items" element={<AdminItems />} />
            <Route path="/admin/locations" element={<AdminLocations />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
