
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Auto-authenticate for testing
    const autoLogin = async () => {
      // Set auth data without actual login
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      navigate('/dashboard');
    };
    
    autoLogin();
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
      <div className="animate-pulse text-primary">Redireccionando...</div>
    </div>
  );
};

export default Index;
