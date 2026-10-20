import React, { useState } from 'react';
import { GITHUB_REPO_FILES } from '../data/githubRepoFiles';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  FolderGit2, 
  ExternalLink,
  ChevronRight,
  Code
} from 'lucide-react';

interface GitHubRepoViewerProps {
  onDownloadZip: () => void;
}

export const GitHubRepoViewer: React.FC<GitHubRepoViewerProps> = ({ onDownloadZip }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'terminal_guide'>('code');

  const selectedFile = GITHUB_REPO_FILES[selectedFileIndex];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', selectedFile.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Production ML Codebase</span>
            <span aria-hidden="true">·</span>
            <span>Scikit-Learn &amp; Python 3.10+</span>
            <span aria-hidden="true">·</span>
            <span>GitHub-Ready Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            GitHub Python Repository Hub
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Complete, modular, and fully tested Python project ready to publish directly to GitHub. Includes end-to-end training pipeline, CLI patient inference, unit tests, and synthetic cohort generator.
          </p>
        </div>

        {/* Global ZIP Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadZip}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            Download Complete Repo (.zip)
          </button>
        </div>
      </div>

      {/* Main Code View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Tree Explorer (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <FolderGit2 className="w-4 h-4 text-blue-600" />
                <span>Repository Files</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {GITHUB_REPO_FILES.length} files
              </span>
            </div>

            <div className="space-y-1">
              {GITHUB_REPO_FILES.map((file, idx) => {
                const isSelected = idx === selectedFileIndex;
                return (
                  <button
                    key={file.name}
                    onClick={() => { setSelectedFileIndex(idx); setActiveTab('code'); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Terminal Guide Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
              <Terminal className="w-4 h-4 text-slate-700" />
              <span>Publish to GitHub in 3 Steps</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Download the repository <strong>.zip</strong> and extract files.</li>
              <li>Create a new repository on GitHub (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">diabetes-risk-prediction</code>).</li>
              <li>Run the terminal commands to initialize and push.</li>
            </ol>
            <button
              onClick={() => setActiveTab('terminal_guide')}
              className="w-full text-center py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              View Step-by-Step Terminal Commands
            </button>
          </div>
        </div>

        {/* Right Column: Code Viewer / Terminal Guide (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
            {/* Code Viewer Top Ribbon */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="font-semibold text-white">{selectedFile.path}</span>
                </div>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedFile.language.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                  title="Copy file contents"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadSingleFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                  title="Download this file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Description Sub-bar */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/60 text-xs text-slate-400">
              {selectedFile.description}
            </div>

            {/* Content Display */}
            {activeTab === 'code' ? (
              <div className="p-4 overflow-x-auto max-h-[620px] overflow-y-auto font-mono text-xs leading-relaxed text-slate-200">
                <pre className="tab-size-4">
                  <code>{selectedFile.content}</code>
                </pre>
              </div>
            ) : (
              <div className="p-6 space-y-6 text-xs text-slate-300 max-h-[620px] overflow-y-auto">
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">1. Local Setup &amp; Git Push</h3>
                  <p className="text-slate-400 mb-2">
                    Open your terminal in the extracted folder and execute:
                  </p>
                  <div className="bg-slate-950 p-3.5 rounded-lg font-mono text-slate-200 text-xs border border-slate-800 select-all">
                    git init<br />
                    git add .<br />
                    git commit -m "feat: complete diabetes predictive analytics pipeline"<br />
                    git branch -M main<br />
                    git remote add origin https://github.com/&lt;YOUR_USERNAME&gt;/diabetes-risk-prediction.git<br />
                    git push -u origin main
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-2">2. Environment Installation</h3>
                  <div className="bg-slate-950 p-3.5 rounded-lg font-mono text-slate-200 text-xs border border-slate-800 select-all">
                    # Create virtual environment<br />
                    python3 -m venv venv<br />
                    source venv/bin/activate  # On Windows: venv\Scripts\activate<br /><br />
                    # Install scikit-learn, pandas, matplotlib, etc.<br />
                    pip install -r requirements.txt
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-2">3. Execute Model Training &amp; Evaluation</h3>
                  <div className="bg-slate-950 p-3.5 rounded-lg font-mono text-slate-200 text-xs border border-slate-800 select-all">
                    python diabetes_predictive_model.py --threshold 0.45
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1.5">
                    This generates evaluation metrics and saves <code className="text-blue-400">outputs/roc_curve.png</code>, <code className="text-blue-400">outputs/confusion_matrix.png</code>, and the model artifact.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-2">4. CLI Patient Inference</h3>
                  <div className="bg-slate-950 p-3.5 rounded-lg font-mono text-slate-200 text-xs border border-slate-800 select-all">
                    python predict_patient.py --glucose 126 --hba1c 6.5 --bmi 32.1 --age 54 --family_history 1
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-2">5. Automated Testing</h3>
                  <div className="bg-slate-950 p-3.5 rounded-lg font-mono text-slate-200 text-xs border border-slate-800 select-all">
                    pytest test_pipeline.py -v
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
