
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
}

export function DataTable<T>({ data, columns, className = '' }: DataTableProps<T>) {
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
          {data.length > 0 ? (
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
