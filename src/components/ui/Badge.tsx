
import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const badgeVariants = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
};

const Badge: React.FC<BadgeProps> = ({ 
  variant = 'primary', 
  children, 
  className 
}) => {
  return (
    <span className={cn('badge', badgeVariants[variant], className)}>
      {children}
    </span>
  );
};

export default Badge;
