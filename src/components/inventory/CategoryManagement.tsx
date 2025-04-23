
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';

interface CategoryManagementProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onAddCategory: (category: string) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onAddCategory
}) => {
  const { toast } = useToast();
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim() === '') {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Error",
        description: "Esta categoría ya existe",
        variant: "destructive"
      });
      return;
    }

    onAddCategory(newCategory.trim());
    setNewCategory('');
    setShowNewCategoryInput(false);
    
    toast({
      title: "Categoría añadida",
      description: `La categoría "${newCategory.trim()}" ha sido añadida correctamente`
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="category">Categoría *</Label>
      {!showNewCategoryInput ? (
        <div className="flex items-center gap-2">
          <Select 
            value={selectedCategory} 
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => setShowNewCategoryInput(true)}
            title="Añadir nueva categoría"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nueva categoría..."
            className="flex-1"
          />
          <Button 
            type="button" 
            size="sm"
            onClick={handleAddCategory}
          >
            Añadir
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setShowNewCategoryInput(false)}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
