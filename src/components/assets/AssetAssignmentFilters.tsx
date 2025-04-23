
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AssetAssignmentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const AssetAssignmentFilters: React.FC<AssetAssignmentFiltersProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por activo o persona..." 
          className="pl-9 subtle-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AssetAssignmentFilters;
