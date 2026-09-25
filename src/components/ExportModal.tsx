import React, { useState } from 'react';
import { X, Download, Copy, Check, FileJson, FileSpreadsheet, CheckCheck } from 'lucide-react';
import { StructuredExtractionData } from '../types/extraction';
import { fieldsToCsv, tableToCsv, downloadFile, copyToClipboard } from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StructuredExtractionData;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data }) => {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [csvTarget, setCsvTarget] = useState<'fields' | number>('fields'); // 'fields' or table index
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate contents based on choices
  let exportContent = '';
  let filename = '';
  let mimeType = '';

  if (exportFormat === 'json') {
    exportContent = JSON.stringify(data.rawJson || data, null, 2);
    filename = `${data.metadata?.fileName?.replace(/\.[^/.]+$/, '') || 'document'}_structured.json`;
    mimeType = 'application/json';
  } else {
    if (csvTarget === 'fields') {
      exportContent = fieldsToCsv(data);
      filename = `${data.metadata?.fileName?.replace(/\.[^/.]+$/, '') || 'document'}_fields.csv`;
    } else {
      const selectedTable = data.tables[csvTarget as number];
      if (selectedTable) {
        exportContent = tableToCsv(selectedTable);
        filename = `${selectedTable.title.toLowerCase().replace(/\s+/g, '_')}.csv`;
      }
    }
    mimeType = 'text/csv;charset=utf-8;';
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(exportContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadFile(exportContent, filename, mimeType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export Extracted Data</h3>
              <p className="text-xs text-slate-400">Download formatted JSON or CSV spreadsheets for analytics & ERPs.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Format selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  exportFormat === 'json'
                    ? 'bg-indigo-600/15 border-indigo-500/60 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <FileJson className={`w-5 h-5 mt-0.5 ${exportFormat === 'json' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div>
                  <h4 className="font-bold text-sm text-slate-200">JSON Payload (.json)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Hierarchical object for developer APIs, databases, or webhooks.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  exportFormat === 'csv'
                    ? 'bg-indigo-600/15 border-indigo-500/60 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 mt-0.5 ${exportFormat === 'csv' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <h4 className="font-bold text-sm text-slate-200">CSV Spreadsheet (.csv)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Tabular format for Excel, Google Sheets, or business accounting.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Sub-option if CSV: which table or fields */}
          {exportFormat === 'csv' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                CSV Target Dataset
              </label>
              <select
                value={csvTarget}
                onChange={(e) => {
                  const val = e.target.value;
                  setCsvTarget(val === 'fields' ? 'fields' : Number(val));
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="fields">All Key Fields ({data.keyFields.length} properties)</option>
                {data.tables.map((t, idx) => (
                  <option key={t.id || idx} value={idx}>
                    Table: {t.title} ({t.rows.length} rows)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Live Preview ({filename})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {(new Blob([exportContent]).size / 1024).toFixed(1)} KB
              </span>
            </div>

            <pre className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 overflow-auto selection:bg-indigo-500/40">
              {exportContent.slice(0, 1500)}
              {exportContent.length > 1500 ? '\n... (truncated for preview)' : ''}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
