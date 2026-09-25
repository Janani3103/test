import React, { useState } from 'react';
import { 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Copy, 
  Check, 
  ChevronLeft,
  ChevronRight,
  Layers,
  Columns,
  BookOpen
} from 'lucide-react';
import { DocumentItem } from '../types/extraction';
import { copyToClipboard } from '../utils/exportUtils';

interface DocumentViewerProps {
  document: DocumentItem;
  layoutType?: string;
  onSelectSample?: (sampleId: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, layoutType }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState<'preview' | 'text'>('preview');
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const isImage = document.type.startsWith('image/');
  const isPdf = document.type === 'application/pdf';
  const hasText = Boolean(document.textContent);

  // Compute pages if document has pages or split by '--- Page '
  const pagesList = document.pages || (
    document.textContent && document.textContent.includes('--- Page ')
      ? document.textContent
          .split(/(?=--- Page \d+)/g)
          .map((chunk, idx) => ({
            pageNumber: idx + 1,
            textContent: chunk.trim(),
          }))
      : null
  );

  const totalPages = pagesList ? pagesList.length : (document.totalPages || 1);
  const currentPageData = pagesList ? pagesList[currentPage - 1] : null;
  const currentContentToDisplay = currentPageData?.textContent || document.textContent;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoomLevel(100);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleCopyText = async () => {
    if (currentContentToDisplay) {
      const ok = await copyToClipboard(currentContentToDisplay);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatLayoutLabel = (type?: string) => {
    switch (type) {
      case 'multi_page_document':
        return 'Multi-Page Flow';
      case 'two_column':
        return 'Two-Column Layout';
      case 'tabular_dense':
        return 'Dense Tabular';
      case 'form_grid':
        return 'Form Key-Grid';
      default:
        return 'Standard Document';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <FileText className="w-4 h-4 flex-shrink-0" />
          </span>
          <span className="font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-[200px]" title={document.name}>
            {document.name}
          </span>
          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 flex-shrink-0">
            {formatFileSize(document.size)}
          </span>
          {totalPages > 1 && (
            <span className="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 flex items-center gap-1 flex-shrink-0">
              <BookOpen className="w-3 h-3" />
              {totalPages} Pages
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Multi-page Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-mono text-slate-300 font-medium">
                p.{currentPage}/{totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {hasText && (
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  viewMode === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Formatted reading view"
              >
                Reader
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  viewMode === 'text'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Raw text view"
              >
                Raw
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-1 py-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 text-[11px] font-mono text-slate-300 hover:text-white"
              title="Reset zoom"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {hasText && (
            <button
              onClick={handleCopyText}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              title="Copy current page text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Document Content Pane */}
      <div className="relative flex-1 overflow-auto bg-slate-950/60 p-4 min-h-[380px] flex items-start justify-center">
        {/* Visual PDF / Image presentation */}
        {viewMode === 'preview' && isImage && document.previewUrl ? (
          <div
            className="transition-transform duration-150 origin-top flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <img
              src={document.previewUrl}
              alt={document.name}
              className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-700/60 object-contain"
            />
          </div>
        ) : viewMode === 'preview' && isPdf && document.previewUrl && !document.isSample ? (
          <div className="w-full h-full flex flex-col items-center">
            <iframe
              src={document.previewUrl}
              title={document.name}
              className="w-full h-[650px] rounded-lg border border-slate-700 bg-white"
            />
          </div>
        ) : (
          /* Formatted Text / Multi-page Document Render */
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl transition-transform duration-150 origin-top font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/40"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {/* Header info bar */}
            <div className="border-b border-slate-800 pb-3 mb-4 font-sans flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block">
                  Document View • Page {currentPage} of {totalPages}
                </span>
                <h4 className="text-sm font-bold text-white truncate max-w-md">{document.name}</h4>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  {formatLayoutLabel(layoutType)}
                </span>
              </div>
            </div>

            {/* Document Content */}
            {currentContentToDisplay ? (
              <div className="text-slate-300 font-mono text-xs whitespace-pre-wrap break-words leading-relaxed">
                {currentContentToDisplay}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="font-semibold text-slate-300">Document Uploaded</p>
                <p className="text-xs text-slate-500 mt-1">
                  Preview is being processed directly by Gemini 3.0 Flash.
                </p>
              </div>
            )}

            {/* Bottom Page Break Notice if Multi-Page */}
            {totalPages > 1 && (
              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between font-sans text-[11px] text-slate-400">
                <span>Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                  {currentPage > 1 && (
                    <button
                      onClick={handlePrevPage}
                      className="text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3 h-3" /> Previous Page
                    </button>
                  )}
                  {currentPage < totalPages && (
                    <button
                      onClick={handleNextPage}
                      className="text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      Next Page <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document footer meta */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Engine: <strong className="text-slate-300">Gemini 3.0 Flash</strong></span>
          <span>•</span>
          <span>{totalPages} {totalPages === 1 ? 'Page' : 'Pages'}</span>
        </span>
        <span className="font-mono text-slate-500">
          ID: {document.id.slice(0, 16)}
        </span>
      </div>
    </div>
  );
};
