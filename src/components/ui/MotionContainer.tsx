
import React from 'react';

interface MotionContainerProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const MotionContainer: React.FC<MotionContainerProps> = ({ 
  children, 
  delay = 0,
  className = "" 
}) => {
  return (
    <div 
      className={`opacity-0 animate-fade-in ${className}`}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {children}
    </div>
  );
};

export default MotionContainer;
