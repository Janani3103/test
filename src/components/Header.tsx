import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  History, 
  Settings2, 
  Sparkles, 
  FileText, 
  Upload, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { PresetType } from '../types/extraction';

interface HeaderProps {
  currentPreset: PresetType;
  onSelectPreset: (preset: PresetType) => void;
  onOpenCustomModal: () => void;
  onOpenExportModal: () => void;
  onOpenHistory: () => void;
  onNewUpload: () => void;
  historyCount: number;
  hasData: boolean;
  isProcessing: boolean;
}

const PRESET_OPTIONS: { id: PresetType; label: string; icon: string }[] = [
  { id: 'auto', label: 'Auto-Detect Schema', icon: '✨' },
  { id: 'invoice', label: 'Invoices & Receipts', icon: '🧾' },
  { id: 'contract', label: 'Contracts & Legal', icon: '⚖️' },
  { id: 'resume', label: 'Resumes & CVs', icon: '👤' },
  { id: 'medical', label: 'Medical Statements', icon: '🏥' },
  { id: 'custom', label: 'Custom User Schema', icon: '⚙️' },
];

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  onOpenCustomModal,
  onOpenExportModal,
  onOpenHistory,
  onNewUpload,
  historyCount,
  hasData,
  isProcessing,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                DocuStruct <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 font-semibold tracking-wide">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Gemini 3.0 Flash • Multi-Page & Multi-Layout Structured Data
            </p>
          </div>
        </div>

        {/* Central Controls: Preset Selector */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block -mb-0.5 ml-1">
              Extraction Schema
            </label>
            <div className="flex items-center">
              <select
                value={currentPreset}
                onChange={(e) => onSelectPreset(e.target.value as PresetType)}
                disabled={isProcessing}
                className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs sm:text-sm font-medium rounded-lg px-3 py-1.5 pr-8 transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PRESET_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200 py-1">
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 bottom-2.5" />
            </div>
          </div>

          {currentPreset === 'custom' && (
            <button
              onClick={onOpenCustomModal}
              disabled={isProcessing}
              title="Configure custom extraction fields and rules"
              className="mt-3.5 flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs px-2.5 py-1.5 rounded-lg transition-all"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-medium">Edit Schema</span>
            </button>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all"
            title="Session extraction history"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-indigo-500/40">
                {historyCount}
              </span>
            )}
          </button>

          {/* New Document Button */}
          <button
            onClick={onNewUpload}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all"
            title="Upload a new document"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Upload New</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onOpenExportModal}
            disabled={!hasData || isProcessing}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all ${
              hasData && !isProcessing
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-500/20 active:scale-[0.98]'
                : 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
