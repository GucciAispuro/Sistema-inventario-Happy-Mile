
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface AuditLocationSelectorProps {
  locations: string[];
  onLocationSelect: (location: string) => void;
}

export const AuditLocationSelector: React.FC<AuditLocationSelectorProps> = ({
  locations,
  onLocationSelect
}) => {
  return (
    <div className="flex items-center space-x-4">
      <Select onValueChange={onLocationSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar Ubicación" />
        </SelectTrigger>
        <SelectContent>
          {locations.map(location => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
