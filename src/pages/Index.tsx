
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle login/signup form submission
  const handleFormSubmit = async (email: string, password: string, isLogin: boolean) => {
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        // Handle login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Set user role (default to admin for now to maintain existing functionality)
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Handle signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'admin', // Default role for new users
            }
          }
        });
        
        if (error) throw error;
        
        // If signup is successful but requires email confirmation
        if (data.user && !data.session) {
          toast({
            title: "Registro exitoso",
            description: "Por favor revise su correo electrónico para confirmar su cuenta.",
          });
          return;
        }
        
        // Set user role
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error con la autenticación",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-glass">
        <LoginForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default Index;
