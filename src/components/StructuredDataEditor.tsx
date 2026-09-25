import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Edit3, 
  Check, 
  Plus, 
  Trash2, 
  Table as TableIcon, 
  ListFilter, 
  Tag, 
  Code, 
  Download, 
  Search, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  FileCheck2,
  Copy
} from 'lucide-react';
import { 
  StructuredExtractionData, 
  ExtractionField, 
  ExtractionTable, 
  ConfidenceLevel 
} from '../types/extraction';
import { tableToCsv, downloadFile, copyToClipboard } from '../utils/exportUtils';
import { JsonViewer } from './JsonViewer';

interface StructuredDataEditorProps {
  data: StructuredExtractionData;
  onChange: (updatedData: StructuredExtractionData) => void;
  onOpenExportModal: () => void;
  onReprocess?: () => void;
  isProcessing?: boolean;
}

export const StructuredDataEditor: React.FC<StructuredDataEditorProps> = ({
  data,
  onChange,
  onOpenExportModal,
  onReprocess,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'fields' | 'tables' | 'entities' | 'json'>('fields');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [newFieldModalOpen, setNewFieldModalOpen] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newFieldCategory, setNewFieldCategory] = useState('General');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Categories list
  const categories = Array.from(new Set(data.keyFields.map((f) => f.category || 'General')));

  // Filtered fields
  const filteredFields = data.keyFields.filter((f) => {
    const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
    const q = searchFilter.toLowerCase();
    const matchesSearch =
      !q ||
      f.label.toLowerCase().includes(q) ||
      f.key.toLowerCase().includes(q) ||
      String(f.value).toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Handle Field Value Edit
  const handleFieldValueChange = (id: string, newVal: string | number) => {
    const updated = data.keyFields.map((f) => (f.id === id ? { ...f, value: newVal } : f));
    onChange({ ...data, keyFields: updated });
  };

  // Toggle Field Verified
  const handleToggleVerified = (id: string) => {
    const updated = data.keyFields.map((f) =>
      f.id === id ? { ...f, verified: !f.verified } : f
    );
    onChange({ ...data, keyFields: updated });
  };

  // Delete Field
  const handleDeleteField = (id: string) => {
    const updated = data.keyFields.filter((f) => f.id !== id);
    onChange({ ...data, keyFields: updated });
  };

  // Add Field
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;
    const newField: ExtractionField = {
      id: `custom-f-${Date.now()}`,
      key: newFieldKey.trim() || newFieldLabel.toLowerCase().replace(/\s+/g, '_'),
      label: newFieldLabel.trim(),
      value: newFieldValue.trim(),
      category: newFieldCategory.trim() || 'General',
      confidence: 'high',
      verified: true,
    };
    onChange({
      ...data,
      keyFields: [...data.keyFields, newField],
    });
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldValue('');
    setNewFieldModalOpen(false);
  };

  // Edit Table Cell
  const handleTableCellChange = (tableIndex: number, rowIndex: number, colIndex: number, val: string) => {
    const updatedTables = [...data.tables];
    const targetTable = { ...updatedTables[tableIndex] };
    const targetRows = targetTable.rows.map((row) => [...row]);
    targetRows[rowIndex][colIndex] = val;
    targetTable.rows = targetRows;
    updatedTables[tableIndex] = targetTable;
    onChange({ ...data, tables: updatedTables });
  };

  // Add Row to Table
  const handleAddTableRow = (tableIndex: number) => {
    const updatedTables = [...data.tables];
    const targetTable = { ...updatedTables[tableIndex] };
    const emptyRow = new Array(targetTable.headers.length).fill('');
    targetTable.rows = [...targetTable.rows, emptyRow];
    updatedTables[tableIndex] = targetTable;
    onChange({ ...data, tables: updatedTables });
  };

  // Export specific table to CSV
  const handleExportTableCsv = (table: ExtractionTable) => {
    const csvContent = tableToCsv(table);
    downloadFile(csvContent, `${table.title.toLowerCase().replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
  };

  // Confidence badge render
  const renderConfidenceBadge = (confidence: ConfidenceLevel) => {
    if (confidence === 'high') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          High
        </span>
      );
    }
    if (confidence === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" />
          Med
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertCircle className="w-3 h-3" />
        Low
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Top Metadata & Stats Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold text-xs tracking-wide uppercase">
              {data.documentType || 'Structured Extraction'}
            </span>
            {data.metadata?.pageCount && data.metadata.pageCount > 1 && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
                {data.metadata.pageCount} Pages Multi-Flow
              </span>
            )}
            {data.layoutAnalysis?.layoutType && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px] capitalize">
                Layout: {data.layoutAnalysis.layoutType.replace(/_/g, ' ')}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Confidence: <strong className="text-emerald-400">{Math.round((data.metadata?.confidenceScore || 0.96) * 100)}%</strong>
              </span>
            </div>
            {data.metadata?.processingTimeMs && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{data.metadata.processingTimeMs}ms</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        {data.summary && (
          <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="flex-1">{data.summary}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-950/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={() => setActiveTab('fields')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'fields'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Key Fields ({data.keyFields.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'tables'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tables ({data.tables.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('entities')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'entities'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Entities ({data.entities?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'json'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>

        {activeTab === 'fields' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search fields or values..."
                className="bg-slate-900 border border-slate-700/80 rounded-lg pl-7 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-40 sm:w-48 placeholder-slate-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
            </div>

            <button
              onClick={() => setNewFieldModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
              title="Add a custom key-value field"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Add Field</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-auto p-4 bg-slate-900/50">
        {/* TAB 1: Key Fields */}
        {activeTab === 'fields' && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            {categories.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Categories ({data.keyFields.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all ${
                      categoryFilter === cat
                        ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {filteredFields.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No matching fields found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredFields.map((field) => (
                  <div
                    key={field.id}
                    className={`p-3 rounded-xl border transition-all ${
                      field.verified
                        ? 'bg-slate-950/70 border-emerald-500/30 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-200">
                            {field.label}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                            {field.key}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.2 rounded">
                            {field.category}
                          </span>
                          {field.page && (
                            <span className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.2 rounded font-mono">
                              p.{field.page}
                            </span>
                          )}
                        </div>

                        {/* Editable Field Value */}
                        {editingFieldId === field.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                              className="flex-1 bg-slate-900 border border-indigo-500 rounded px-2.5 py-1 text-sm text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => setEditingFieldId(null)}
                              className="p-1 rounded bg-indigo-600 text-white"
                              title="Save changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => setEditingFieldId(field.id)}
                            className="group flex items-center justify-between text-sm font-medium text-indigo-200 bg-slate-900/80 hover:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800/80 cursor-pointer transition-colors"
                            title="Click to edit value"
                          >
                            <span className="truncate">{String(field.value)}</span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                          </div>
                        )}

                        {field.sourceSnippet && (
                          <p className="text-[10px] text-slate-500 mt-1 truncate">
                            Source: "{field.sourceSnippet}"
                          </p>
                        )}
                      </div>

                      {/* Right metadata & action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {renderConfidenceBadge(field.confidence)}

                        <button
                          onClick={() => handleToggleVerified(field.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            field.verified
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                          title={field.verified ? 'Marked as verified' : 'Click to verify field'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/40 bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Remove field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Tables */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            {data.tables.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No itemized tables were detected in this document.
              </div>
            ) : (
              data.tables.map((table, tIdx) => (
                <div key={table.id || tIdx} className="bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-lg">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-bold text-sm text-white">{table.title}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({table.rows.length} rows, {table.headers.length} cols)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddTableRow(tIdx)}
                        className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-indigo-400" />
                        <span>Add Row</span>
                      </button>
                      <button
                        onClick={() => handleExportTableCsv(table)}
                        className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
                        title="Download this table as CSV"
                      >
                        <Download className="w-3 h-3" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                          {table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="py-2.5 px-3 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/60 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2 px-3 text-slate-300 font-mono text-[11px]">
                                <input
                                  type="text"
                                  value={String(cell ?? '')}
                                  onChange={(e) => handleTableCellChange(tIdx, rIdx, cIdx, e.target.value)}
                                  className="w-full bg-transparent hover:bg-slate-900 focus:bg-slate-900 border border-transparent focus:border-indigo-500/60 rounded px-1.5 py-0.5 focus:outline-none transition-colors"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Named Entities */}
        {activeTab === 'entities' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Named entities and semantic anchors discovered across the document:
            </p>

            {(!data.entities || data.entities.length === 0) ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No entities recognized.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {data.entities.map((entity, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-indigo-400">
                          {entity.type}
                        </span>
                      </div>
                      <h5 className="text-sm font-semibold text-white">{entity.name}</h5>
                      {entity.context && (
                        <p className="text-xs text-slate-400 mt-1">{entity.context}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Raw JSON Inspector */}
        {activeTab === 'json' && (
          <JsonViewer data={data.rawJson || data} />
        )}
      </div>

      {/* Add New Field Modal */}
      {newFieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Add Custom Structured Field</span>
            </h3>

            <form onSubmit={handleAddField} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Field Label
                </label>
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={(e) => {
                    setNewFieldLabel(e.target.value);
                    if (!newFieldKey) {
                      setNewFieldKey(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                    }
                  }}
                  placeholder="e.g. Tax Exemption Code"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Property Key (JSON)
                </label>
                <input
                  type="text"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  placeholder="e.g. tax_exemption_code"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  placeholder="e.g. EXEMPT-9942"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newFieldCategory}
                  onChange={(e) => setNewFieldCategory(e.target.value)}
                  placeholder="e.g. Tax, General, Billing"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewFieldModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/25"
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
