
import React, { useState } from 'react';
import { ChartLineIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

// Mock historical data for demonstration
const generateHistoricalData = (title: string) => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const currentMonth = new Date().getMonth();
  
  // Generate the last 12 months of data
  return Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (currentMonth - 11 + i) % 12;
    const monthName = months[monthIndex >= 0 ? monthIndex : monthIndex + 12];
    
    // Generate value based on title
    let baseValue = 0;
    if (title.includes('Artículos')) baseValue = 200;
    else if (title.includes('Ubicaciones')) baseValue = 3;
    else if (title.includes('Transacciones')) baseValue = 70;
    else if (title.includes('Valor')) baseValue = 200000;
    
    // Add some randomness
    const randomFactor = 1 + (Math.random() * 0.3 - 0.15);
    const value = Math.round(baseValue * randomFactor);
    
    return { 
      name: monthName,
      value: value
    };
  });
};

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
  const [showChart, setShowChart] = useState(false);
  const historicalData = generateHistoricalData(title);
  
  // Fix: Ensure formatYAxisTick always returns a string
  const formatYAxisTick = (value: number): string => {
    if (title.includes('Valor')) {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }
    // Make sure to return a string
    return value.toString();
  };

  return (
    <>
      <div 
        className={`stats-card ${className} cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => setShowChart(true)}
      >
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-1">
            {icon && <div className="text-muted-foreground/60">{icon}</div>}
            <ChartLineIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
          </div>
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

      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Historial: {title}</DialogTitle>
          </DialogHeader>
          
          <div className="h-[300px] w-full mt-4">
            <ChartContainer 
              config={{
                primary: { theme: { light: "#3b82f6", dark: "#60a5fa" } },
                grid: { theme: { light: "#e2e8f0", dark: "#334155" } },
              }}
            >
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={formatYAxisTick}
                  fontSize={12}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      let formattedValue = data.value;
                      
                      if (title.includes('Valor')) {
                        formattedValue = new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN',
                        }).format(data.value);
                      }
                      
                      return (
                        <div className="bg-background border rounded-md p-2 shadow-md">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-primary">{formattedValue}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StatsCard;
