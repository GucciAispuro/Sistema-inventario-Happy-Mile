
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

/**
 * Generates an email template for low stock notification
 * @param items Array of low stock items
 * @param location Location name
 * @param adminName Administrator name
 * @returns HTML email template as string
 */
export const generateLowStockEmailTemplate = (
  items: any[],
  location: string,
  adminName: string = 'Administrador'
): string => {
  const date = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  const itemsHtml = items.map(item => {
    const stockStatus = 
      item.quantity === 0 ? 'Agotado' :
      item.quantity < item.min_stock / 2 ? 'Crítico' :
      'Bajo';
    
    const statusColor = 
      stockStatus === 'Agotado' ? '#dc2626' :
      stockStatus === 'Crítico' ? '#f59e0b' :
      '#f97316';
      
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.min_stock}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <span style="background-color: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            ${stockStatus}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Alerta de Stock Bajo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f97316;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #fff;
          padding: 20px;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
        }
        .footer {
          background-color: #f3f4f6;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-radius: 0 0 5px 5px;
          border: 1px solid #e5e7eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #f3f4f6;
          padding: 10px;
          text-align: left;
          border-bottom: 2px solid #e5e7eb;
        }
        .button {
          display: inline-block;
          background-color: #f97316;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .highlighted {
          font-weight: bold;
          color: #f97316;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Alerta de Stock Bajo</h1>
        </div>
        <div class="content">
          <p>Estimado/a <span class="highlighted">${adminName}</span>,</p>
          
          <p>Este es un aviso automático para informarle que los siguientes artículos en la ubicación <span class="highlighted">${location}</span> están por debajo del nivel mínimo de stock requerido y necesitan ser reabastecidos.</p>
          
          <table>
            <thead>
              <tr>
                <th>Artículo</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p>Fecha del reporte: <span class="highlighted">${date}</span></p>
          
          <p>Por favor, tome las medidas necesarias para reabastecer estos artículos lo antes posible para evitar problemas de disponibilidad.</p>
          
          <div style="text-align: center;">
            <a href="#" class="button">Ver Inventario Completo</a>
          </div>
        </div>
        <div class="footer">
          <p>Este es un correo automático, por favor no responda a este mensaje.</p>
          <p>Sistema de Gestión de Inventario - © 2024</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

