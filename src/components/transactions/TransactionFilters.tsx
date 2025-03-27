
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter, Download } from 'lucide-react';

interface TransactionFiltersProps {
  searchQuery: string;
  filterCategory: string;
  filterType: string;
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onResetFilters: () => void;
  onExport: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  filterCategory,
  filterType,
  categories,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onResetFilters,
  onExport
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar transacciones..." 
          className="pl-9 subtle-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Select 
          value={filterCategory} 
          onValueChange={onCategoryChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category || "unknown"}>
                {category || "Sin categoría"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filterType} 
          onValueChange={onTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de Transacción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="IN">Entrada</SelectItem>
            <SelectItem value="OUT">Salida</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onResetFilters}
          disabled={filterCategory === 'all' && filterType === 'all' && !searchQuery}
        >
          <Filter className="h-4 w-4 mr-2" />
          Limpiar Filtros
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onExport}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;
