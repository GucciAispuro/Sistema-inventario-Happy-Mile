
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon,
  trend,
  className = "" 
}) => {
  return (
    <div className={`stats-card ${className}`}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground/60">{icon}</div>}
      </div>
      
      <div className="mt-1">
        <h3 className="text-2xl font-semibold">{value}</h3>
        
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span className="ml-1">{Math.abs(trend.value)}%</span>
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
