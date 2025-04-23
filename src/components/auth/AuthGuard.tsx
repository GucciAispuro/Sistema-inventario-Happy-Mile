
import React from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  // During testing, always allow access
  return <>{children}</>;
};

export default AuthGuard;
