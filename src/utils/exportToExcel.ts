
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param filename Filename without extension
 * @param sheetName Name of the worksheet
 */
export const exportToExcel = (
  data: any[],
  filename: string = 'export',
  sheetName: string = 'Datos'
): void => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create a Blob from the buffer
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  // Save the file
  saveAs(blob, `${filename}.xlsx`);
};

/**
 * Formats the inventory data for export
 */
export const formatInventoryForExport = (items: any[]): any[] => {
  return items.map(item => ({
    'Nombre del Artículo': item.name,
    'Categoría': item.category,
    'Ubicación': item.location,
    'Cantidad': item.quantity,
    'Costo Unitario': item.cost,
    'Valor Total': item.total_value,
    'Stock Mínimo': item.min_stock,
    'Estado': item.status
  }));
};
