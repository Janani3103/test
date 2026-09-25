import React from 'react';
import { X, Clock, FileText, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { SessionHistoryEntry } from '../types/extraction';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: SessionHistoryEntry[];
  onSelectEntry: (entry: SessionHistoryEntry) => void;
  onClearHistory: () => void;
  onDeleteEntry: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onSelectEntry,
  onClearHistory,
  onDeleteEntry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Extraction History</h3>
            <span className="text-xs text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Clock className="w-10 h-10 mx-auto text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No session extractions yet</p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Documents you process or evaluate will appear here for fast switching.
              </p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-3.5 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <h4 className="font-semibold text-sm text-slate-200 truncate max-w-[200px]" title={entry.document.name}>
                      {entry.document.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {entry.result.documentType}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Preset: <strong className="text-slate-400 capitalize">{entry.preset}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>{entry.result.keyFields.length} fields</span>
                    <span>•</span>
                    <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectEntry(entry);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300 font-medium transition-colors"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
