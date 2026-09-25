import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, CheckCheck } from 'lucide-react';
import { copyToClipboard, downloadFile } from '../utils/exportUtils';

interface JsonViewerProps {
  data: Record<string, any>;
  title?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, title = 'Structured Output' }) => {
  const [copied, setCopied] = useState(false);
  const formattedJson = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    const success = await copyToClipboard(formattedJson);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadFile(formattedJson, 'extracted_document_data.json', 'application/json');
  };

  // Syntax highlighting for JSON
  const renderHighlightedJson = (jsonString: string) => {
    // Regex for tokens: strings, numbers, booleans, null, keys
    const lines = jsonString.split('\n');
    return lines.map((line, idx) => {
      // Find key-value pairs
      const formattedLine = line.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = 'text-amber-300'; // number
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'text-indigo-400 font-semibold'; // key
            } else {
              cls = 'text-emerald-300'; // string value
            }
          } else if (/true|false/.test(match)) {
            cls = 'text-cyan-400 font-bold'; // boolean
          } else if (/null/.test(match)) {
            cls = 'text-rose-400 font-italic'; // null
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );

      return (
        <div key={idx} className="table-row">
          <span className="table-cell pr-4 text-right text-slate-600 select-none font-mono text-[11px]">
            {idx + 1}
          </span>
          <span
            className="table-cell font-mono text-xs whitespace-pre"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
      {/* JSON Viewer header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">{title}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            ({(new Blob([formattedJson]).size / 1024).toFixed(1)} KB)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Copy JSON to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
            title="Download JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">Download</span>
          </button>
        </div>
      </div>

      {/* Code body with line numbers */}
      <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs">
        <div className="table w-full">
          {renderHighlightedJson(formattedJson)}
        </div>
      </div>
    </div>
  );
};
