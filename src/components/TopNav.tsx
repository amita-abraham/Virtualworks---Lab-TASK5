import React from 'react';
import { Download, Code2 } from 'lucide-react';

interface TopNavProps {
  activeTab: 'simulator' | 'model_lab' | 'cohort' | 'batch' | 'github';
  setActiveTab: (tab: 'simulator' | 'model_lab' | 'cohort' | 'batch' | 'github') => void;
  onDownloadZip: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, setActiveTab, onDownloadZip }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            D
          </div>
          <button 
            onClick={() => setActiveTab('simulator')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-600 transition-colors"
          >
            DiaPredict Analytics
          </button>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'simulator'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Risk Simulator
          </button>
          <button
            onClick={() => setActiveTab('model_lab')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'model_lab'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Model Lab & ROC
          </button>
          <button
            onClick={() => setActiveTab('cohort')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'cohort'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Cohort Data (1,200)
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'batch'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Batch Screening
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'github'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            GitHub Repository
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onDownloadZip}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download GitHub Repo (.zip)
          </button>
        </div>
      </div>
    </header>
  );
};
