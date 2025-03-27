
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { FileX } from 'lucide-react';

interface TableEmptyProps {
  colSpan: number;
  message: string;
}

export function TableEmpty({ colSpan, message }: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-36 text-center">
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
          <FileX className="h-10 w-10 text-muted-foreground/50" />
          <p>{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
