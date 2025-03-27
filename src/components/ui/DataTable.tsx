
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    cell?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  className?: string;
  loading?: boolean;
  emptyState?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  className = '',
  loading = false,
  emptyState = 'No results.'
}: DataTableProps<T>) {
  return (
    <div className={`table-container ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
                  Cargando...
                </div>
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((item, rowIndex) => (
              <TableRow key={rowIndex} className="transition hover:bg-secondary/50">
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${String(column.key)}`} className={column.className}>
                    {column.cell 
                      ? column.cell(item) 
                      : String(item[column.key as keyof T] || '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyState}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
