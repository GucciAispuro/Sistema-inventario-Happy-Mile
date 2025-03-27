
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Auto-authenticate with admin role
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'admin');
    navigate('/dashboard');
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-glass">
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;
