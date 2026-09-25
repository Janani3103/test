import React, { useEffect, useState } from 'react';
import { Sparkles, Layers, ShieldCheck, FileSearch } from 'lucide-react';

interface ProcessingOverlayProps {
  documentName: string;
}

const STEPS = [
  { icon: FileSearch, text: 'Scanning layout type, column structure & page boundaries with Gemini 3.0 Flash...' },
  { icon: Sparkles, text: 'Executing multimodal reasoning & resolving multi-page content flow...' },
  { icon: Layers, text: 'Structuring itemized rows, multi-page tables & semantic entities...' },
  { icon: ShieldCheck, text: 'Validating strict JSON schema & assigning confidence scores...' },
];

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ documentName }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central pulsing animation */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 animate-pulse opacity-75 blur-sm" />
          <div className="relative w-16 h-16 rounded-2xl bg-slate-950 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-xl">
            <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Processing Document</h3>
        <p className="text-xs text-slate-400 truncate max-w-xs mx-auto mb-6 font-mono bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
          {documentName}
        </p>

        {/* Step Indicators */}
        <div className="space-y-3 text-left">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                    : isDone
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    : 'bg-transparent border-transparent text-slate-600 opacity-60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-indigo-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs leading-tight font-medium flex-1">
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500 mt-6">
          Powered by Gemini 3.0 Flash multimodal extraction. Built to prevent parsing crashes across diverse layouts.
        </p>
      </div>
    </div>
  );
};
