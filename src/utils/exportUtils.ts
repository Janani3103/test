import { StructuredExtractionData, ExtractionTable } from '../types/extraction';

/**
 * Converts key-value fields to CSV string
 */
export function fieldsToCsv(data: StructuredExtractionData): string {
  const headers = ['Category', 'Field Key', 'Label', 'Value', 'Confidence', 'Verified'];
  const rows = data.keyFields.map((f) => {
    const cleanValue = typeof f.value === 'string' ? `"${f.value.replace(/"/g, '""')}"` : f.value;
    const cleanLabel = `"${f.label.replace(/"/g, '""')}"`;
    return [f.category, f.key, cleanLabel, cleanValue, f.confidence, f.verified ? 'Yes' : 'No'].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Converts a specific ExtractionTable to CSV string
 */
export function tableToCsv(table: ExtractionTable): string {
  const headerRow = table.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
  const dataRows = table.rows.map((row) =>
    row
      .map((cell) => {
        const str = String(cell ?? '');
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Triggers browser download of a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies text to clipboard safely
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
