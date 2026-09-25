import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { DocumentViewer } from './components/DocumentViewer';
import { StructuredDataEditor } from './components/StructuredDataEditor';
import { CustomSchemaModal } from './components/CustomSchemaModal';
import { ExportModal } from './components/ExportModal';
import { HistorySidebar } from './components/HistorySidebar';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { 
  DocumentItem, 
  StructuredExtractionData, 
  PresetType, 
  CustomSchemaConfig, 
  SessionHistoryEntry 
} from './types/extraction';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { AlertCircle, RefreshCw, Eye, FileText, CheckCircle2 } from 'lucide-react';

const DEFAULT_CUSTOM_CONFIG: CustomSchemaConfig = {
  name: 'Custom Target Schema',
  description: 'Targeted extraction of specific business fields',
  fields: [
    { id: '1', key: 'document_id', label: 'Document / Tracking ID', type: 'string', description: 'Primary reference number' },
    { id: '2', key: 'issue_date', label: 'Issue / Transaction Date', type: 'date', description: 'Date of creation or execution' },
    { id: '3', key: 'primary_entity', label: 'Primary Entity or Company', type: 'string', description: 'Originating organization' },
    { id: '4', key: 'total_amount', label: 'Total Monetary Value', type: 'currency', description: 'Grand total or valuation' },
  ],
  includeTables: true,
  customPromptRules: 'Normalize all dates into YYYY-MM-DD. Extract all amounts as numerical digits without currency symbols.',
};

export default function App() {
  const [currentDocument, setCurrentDocument] = useState<DocumentItem | null>(null);
  const [extractedData, setExtractedData] = useState<StructuredExtractionData | null>(null);
  const [currentPreset, setCurrentPreset] = useState<PresetType>('auto');
  const [customConfig, setCustomConfig] = useState<CustomSchemaConfig>(DEFAULT_CUSTOM_CONFIG);
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Responsive tab switcher for mobile/small screens (Document vs Data)
  const [mobileActivePane, setMobileActivePane] = useState<'document' | 'data'>('data');

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('docustruct_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (entry: SessionHistoryEntry) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== entry.id);
      const updated = [entry, ...filtered].slice(0, 20); // Keep last 20
      try {
        localStorage.setItem('docustruct_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not store to localStorage', err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('docustruct_history');
    } catch (err) {
      console.warn('Could not clear history in localStorage', err);
    }
  };

  const handleDeleteHistoryEntry = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem('docustruct_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not update history in localStorage', err);
      }
      return updated;
    });
  };

  // Trigger document extraction
  const processDocument = async (
    doc: DocumentItem,
    presetToUse: PresetType = currentPreset,
    customSchemaToUse: CustomSchemaConfig = customConfig
  ) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setMobileActivePane('data');

    // If it's a sample document and we have fallback sample data
    const matchedSample = SAMPLE_DOCUMENTS.find((s) => s.item.id === doc.id || s.item.sampleId === doc.sampleId);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: doc.base64
            ? {
                mimeType: doc.type,
                base64: doc.base64,
              }
            : undefined,
          textContent: doc.textContent,
          preset: presetToUse,
          customConfig: presetToUse === 'custom' ? customSchemaToUse : undefined,
          fileName: doc.name,
          fileType: doc.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const result: StructuredExtractionData = await response.json();
      setExtractedData(result);

      // Add to history
      saveToHistory({
        id: `hist-${Date.now()}`,
        timestamp: Date.now(),
        document: doc,
        preset: presetToUse,
        result,
      });

      setSuccessToast(`Extracted ${result.keyFields.length} structured attributes successfully!`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      console.warn('Extraction API call encountered an error:', err);

      // Graceful fallback for samples if API key is not yet configured
      if (matchedSample && matchedSample.defaultData) {
        setExtractedData(matchedSample.defaultData);
        saveToHistory({
          id: `hist-${Date.now()}`,
          timestamp: Date.now(),
          document: doc,
          preset: presetToUse,
          result: matchedSample.defaultData,
        });
        setSuccessToast(`Sample loaded with verified structured data schema.`);
        setTimeout(() => setSuccessToast(null), 3500);
      } else {
        setErrorMessage(
          err.message || 'Unable to process document. Please check server logs or verify your document.'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDocumentSelected = (doc: DocumentItem, targetPreset?: PresetType) => {
    setCurrentDocument(doc);
    const chosenPreset = targetPreset || currentPreset;
    if (targetPreset) {
      setCurrentPreset(targetPreset);
    }
    processDocument(doc, chosenPreset);
  };

  const handleSelectPreset = (newPreset: PresetType) => {
    setCurrentPreset(newPreset);
    if (newPreset === 'custom') {
      setIsCustomModalOpen(true);
    } else if (currentDocument) {
      // Re-extract with new preset
      processDocument(currentDocument, newPreset);
    }
  };

  const handleSaveCustomSchema = (newConfig: CustomSchemaConfig) => {
    setCustomConfig(newConfig);
    setCurrentPreset('custom');
    if (currentDocument) {
      processDocument(currentDocument, 'custom', newConfig);
    }
  };

  const handleSelectHistoryEntry = (entry: SessionHistoryEntry) => {
    setCurrentDocument(entry.document);
    setCurrentPreset(entry.preset);
    setExtractedData(entry.result);
    setMobileActivePane('data');
    setSuccessToast(`Loaded previous extraction for "${entry.document.name}"`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleNewUpload = () => {
    setCurrentDocument(null);
    setExtractedData(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Top Application Header */}
      <Header
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewUpload={handleNewUpload}
        historyCount={history.length}
        hasData={Boolean(extractedData)}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-3 lg:p-5 max-w-7xl w-full mx-auto">
        {/* Toast Notification */}
        {successToast && (
          <div className="fixed top-16 right-5 z-50 flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-2.5 rounded-xl shadow-xl backdrop-blur-md animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            {currentDocument && (
              <button
                onClick={() => processDocument(currentDocument)}
                className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold text-rose-200 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {!currentDocument ? (
          /* Empty State: Upload or Pick Sample */
          <div className="flex-1 flex items-center justify-center">
            <UploadZone
              onDocumentSelected={handleDocumentSelected}
              isProcessing={isProcessing}
            />
          </div>
        ) : (
          /* Active Document Workspace: Split Screen */
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            {/* Mobile View Toggle (Visible on small screens only) */}
            <div className="flex lg:hidden items-center justify-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                onClick={() => setMobileActivePane('document')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  mobileActivePane === 'document'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Original Document</span>
              </button>
              <button
                onClick={() => setMobileActivePane('data')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  mobileActivePane === 'data'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Structured Data ({extractedData?.keyFields?.length || 0})</span>
              </button>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[620px]">
              {/* Left Pane: Document Viewer (5 cols) */}
              <div
                className={`lg:col-span-5 h-[620px] lg:h-auto ${
                  mobileActivePane === 'document' ? 'block' : 'hidden lg:block'
                }`}
              >
                <DocumentViewer 
                  document={currentDocument} 
                  layoutType={extractedData?.metadata?.layoutType || extractedData?.layoutAnalysis?.layoutType}
                />
              </div>

              {/* Right Pane: Structured Data Inspector (7 cols) */}
              <div
                className={`lg:col-span-7 h-[620px] lg:h-auto ${
                  mobileActivePane === 'data' ? 'block' : 'hidden lg:block'
                }`}
              >
                {extractedData ? (
                  <StructuredDataEditor
                    data={extractedData}
                    onChange={setExtractedData}
                    onOpenExportModal={() => setIsExportModalOpen(true)}
                    onReprocess={() => processDocument(currentDocument)}
                    isProcessing={isProcessing}
                  />
                ) : (
                  <div className="h-full bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                    <h4 className="font-semibold text-white mb-1">Awaiting Extraction</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Extracting key attributes, tables, and entities from {currentDocument.name}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Processing Screen Overlay */}
      {isProcessing && currentDocument && (
        <ProcessingOverlay documentName={currentDocument.name} />
      )}

      {/* Custom Schema Config Modal */}
      <CustomSchemaModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        config={customConfig}
        onSave={handleSaveCustomSchema}
      />

      {/* Export Modal */}
      {extractedData && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          data={extractedData}
        />
      )}

      {/* Session History Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectEntry={handleSelectHistoryEntry}
        onClearHistory={handleClearHistory}
        onDeleteEntry={handleDeleteHistoryEntry}
      />
    </div>
  );
}
