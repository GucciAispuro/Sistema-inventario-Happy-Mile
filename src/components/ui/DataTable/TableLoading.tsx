
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

interface TableLoadingProps {
  colSpan: number;
}

export function TableLoading({ colSpan }: TableLoadingProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
          Cargando...
        </div>
      </TableCell>
    </TableRow>
  );
}
