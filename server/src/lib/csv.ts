export class CSVExportService {
  /**
   * Escape and quote CSV field value
   */
  private static escapeField(val: any): string {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  /**
   * Generate CSV text from array of objects
   */
  public static generateCSV(headers: { key: string; label: string }[], rows: Record<string, any>[]): string {
    const headerLine = headers.map((h) => this.escapeField(h.label)).join(',');
    const dataLines = rows.map((row) => headers.map((h) => this.escapeField(row[h.key])).join(','));
    return [headerLine, ...dataLines].join('\r\n');
  }
}
