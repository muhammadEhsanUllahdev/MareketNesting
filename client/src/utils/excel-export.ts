import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  columns: ExportColumn[];
  data: any[];
}

/**
 * Export data to Excel file
 */
export function exportToExcel({ filename, sheetName = 'Sheet1', columns, data }: ExportOptions) {
  try {
    // Transform data according to column configuration
    const transformedData = data.map(row => {
      const transformedRow: any = {};
      columns.forEach(column => {
        const value = getNestedValue(row, column.key);
        transformedRow[column.label] = column.format ? column.format(value) : value;
      });
      return transformedRow;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(transformedData);

    // Auto-size columns
    const colWidths = columns.map(column => {
      const maxLength = Math.max(
        column.label.length,
        ...transformedData.map(row => String(row[column.label] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Max width of 50 characters
    });
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file and save
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '';
  }, obj);
}

/**
 * Format currency value
 */
export function formatCurrency(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? '' : `$${numValue.toFixed(2)}`;
}

/**
 * Format date value
 */
export function formatDate(value: any): string {
  if (!value) return '';
  try {
    const date = new Date(value);
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

/**
 * Format boolean value
 */
export function formatBoolean(value: any): string {
  if (value === null || value === undefined) return '';
  return value ? 'Yes' : 'No';
}

/**
 * Format array to comma-separated string
 */
export function formatArray(value: any): string {
  if (!Array.isArray(value)) return '';
  return value.join(', ');
}

/**
 * Capitalize first letter of each word
 */
export function formatTitle(value: any): string {
  if (!value) return '';
  return String(value).replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}