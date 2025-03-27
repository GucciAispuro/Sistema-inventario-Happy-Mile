
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { TableEmpty } from './DataTable/TableEmpty';
import { TableLoading } from './DataTable/TableLoading';
import { DataTablePagination } from './DataTablePagination';

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
  pagination?: boolean;
  itemsPerPage?: number;
}

export function DataTable<T>({ 
  data, 
  columns, 
  className = '',
  loading = false,
  emptyState = 'No results.',
  pagination = false,
  itemsPerPage = 10
}: DataTableProps<T>) {
  const [paginatedData, setPaginatedData] = useState<T[]>(
    pagination ? data.slice(0, itemsPerPage) : data
  );

  // If not using pagination, just use the data directly
  useEffect(() => {
    if (!pagination) {
      setPaginatedData(data);
    }
  }, [data, pagination]);

  const handlePageChange = (items: T[]) => {
    setPaginatedData(items);
  };

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
            <TableLoading colSpan={columns.length} />
          ) : data.length > 0 ? (
            (pagination ? paginatedData : data).map((item, rowIndex) => (
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
            <TableEmpty colSpan={columns.length} message={emptyState} />
          )}
        </TableBody>
      </Table>
      
      {pagination && data.length > itemsPerPage && (
        <DataTablePagination 
          data={data}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
