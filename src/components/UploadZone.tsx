import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  FileCode, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import { DocumentItem, PresetType } from '../types/extraction';

interface UploadZoneProps {
  onDocumentSelected: (doc: DocumentItem, targetPreset?: PresetType) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onDocumentSelected,
  isProcessing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('Pasted_Document.txt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMessage(null);

    // Limit check: 25MB
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds 25MB limit. Please upload a smaller document.');
      return;
    }

    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = () => {
        const base64Url = reader.result as string;
        // Strip data url prefix for API
        const base64Data = base64Url.split(',')[1];
        const docItem: DocumentItem = {
          id: `doc-${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          base64: base64Data,
          previewUrl: base64Url,
          isSample: false,
        };
        onDocumentSelected(docItem);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      reader.onload = () => {
        const base64Url = reader.result as string;
        const base64Data = base64Url.split(',')[1];
        const docItem: DocumentItem = {
          id: `doc-${Date.now()}`,
          name: file.name,
          type: 'application/pdf',
          size: file.size,
          base64: base64Data,
          previewUrl: base64Url,
          isSample: false,
        };
        onDocumentSelected(docItem);
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text, Markdown, CSV, JSON
      reader.onload = () => {
        const text = reader.result as string;
        // Detect page count if delimiter or page-break markers are present
        const pageCount = (text.match(/--- Page \d+|Page \d+ of \d+|\f/gi) || []).length || 1;
        const docItem: DocumentItem = {
          id: `doc-${Date.now()}`,
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
          textContent: text,
          totalPages: Math.max(1, pageCount),
          isSample: false,
        };
        onDocumentSelected(docItem);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePastedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setErrorMessage('Please enter or paste text to extract.');
      return;
    }
    const pageCount = (pastedText.match(/--- Page \d+|Page \d+ of \d+|\f/gi) || []).length || 1;
    const docItem: DocumentItem = {
      id: `doc-paste-${Date.now()}`,
      name: pastedTitle.trim() || 'Pasted_Document.txt',
      type: 'text/plain',
      size: new Blob([pastedText]).size,
      textContent: pastedText.trim(),
      totalPages: Math.max(1, pageCount),
      isSample: false,
    };
    onDocumentSelected(docItem);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Intro hero banner */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Document Parser & Entity Normalizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Convert Unstructured Documents into Clean Structured Data
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Upload any PDF, invoice, receipt, legal contract, or scanned document. 
          Extract verified key-value attributes, line-item tables, and named entities in seconds.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Upload Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl mb-10">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPasteMode(false)}
              className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-all ${
                !pasteMode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload PDF or Image
            </button>
            <button
              onClick={() => setPasteMode(true)}
              className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-all ${
                pasteMode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Document Text
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              PDF, PNG, JPG, WebP
            </span>
            <span>•</span>
            <span>Up to 25MB</span>
          </div>
        </div>

        {!pasteMode ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.005]'
                : 'border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800/40 bg-slate-950/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              accept=".pdf,image/png,image/jpeg,image/webp,image/tiff,.txt,.json,.csv,.md"
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">
              Drag & drop your document here, or <span className="text-indigo-400 underline decoration-indigo-400/40 underline-offset-4">browse files</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-4">
              Upload invoices, purchase orders, statements, medical reports, or legal agreements.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
                PDF Documents
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
                Receipts & Scans (JPG/PNG)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
                Plain Text / Markdown
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePastedSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Document Title
              </label>
              <input
                type="text"
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                placeholder="e.g. Consulting_Agreement_Draft.txt"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Document Content / Text
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={9}
                placeholder="Paste the raw text of the document, invoice, contract, or clinical note here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3.5 text-sm text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!pastedText.trim() || isProcessing}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Extract Structured Data</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 1-Click Interactive Sample Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Or test with a pre-loaded sample document</span>
              <span className="text-xs font-normal text-slate-400">(instant 1-click evaluation)</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <button
              key={sample.item.id}
              onClick={() => onDocumentSelected(sample.item, sample.defaultPreset)}
              disabled={isProcessing}
              className="text-left bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all group flex flex-col justify-between shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {sample.badge}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                  {sample.item.name.replace('.pdf', '')}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Preset: <strong className="text-slate-300 capitalize">{sample.defaultPreset}</strong></span>
                <span className="text-indigo-400 font-medium group-hover:underline">Load & Extract →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
