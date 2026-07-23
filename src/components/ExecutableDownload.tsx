import React, { useState } from 'react';
import {
  Download,
  FileCode,
  Terminal,
  CheckCircle2,
  Copy,
  Zap,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import JSZip from 'jszip';
import { CalibrationSettings, GestureMapping } from '../types';
import {
  generateBatScript,
  generatePythonScript,
  generateReadmeTxt,
  generateRequirementsTxt,
} from '../utils/pythonScriptGenerator';

interface ExecutableDownloadProps {
  settings: CalibrationSettings;
  mappings: GestureMapping[];
}

export const ExecutableDownload: React.FC<ExecutableDownloadProps> = ({
  settings,
  mappings,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'bat' | 'req' | 'readme'>('python');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  const pythonScriptContent = generatePythonScript(settings, mappings);
  const batScriptContent = generateBatScript();
  const requirementsContent = generateRequirementsTxt();
  const readmeContent = generateReadmeTxt();

  const handleCopyCode = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string, contentType = 'text/plain') => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = async () => {
    setIsGeneratingZip(true);
    try {
      const zip = new JSZip();
      zip.file('gesture_mouse.py', pythonScriptContent);
      zip.file('build_exe.bat', batScriptContent);
      zip.file('requirements.txt', requirementsContent);
      zip.file('LEAME_INSTRUCOES.txt', readmeContent);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'GestureMouseWindows_Executavel.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-5xl mx-auto">
      {/* Top Main Download Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Gerador de Executável Windows (.EXE)</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
              Baixe o Programa Executável para o seu Windows
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tudo pronto para rodar direto no seu sistema operacional! Baixe o pacote completo com o código Python otimizado e o compilador automático de 1 clique para gerar o arquivo <strong className="text-cyan-300">GestureMouseWindows.exe</strong>.
            </p>
          </div>

          <button
            onClick={handleDownloadAllZip}
            disabled={isGeneratingZip}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-slate-950 font-black text-sm flex items-center gap-3 shadow-xl hover:shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            <FolderArchive className="w-5 h-5" />
            <span>
              {isGeneratingZip ? 'Criando Pacote ZIP...' : 'Baixar Pacote Executável (.ZIP)'}
            </span>
          </button>
        </div>
      </div>

      {/* 1-Minute Step by Step Guide for Windows */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-100">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <span>Como Criar o Executável (.exe) no Seu Windows em 3 Passos</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-200">Ter o Python no PC</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Baixe e instale o Python em python.org. Certifique-se de marcar a caixa <strong className="text-cyan-300">"Add Python to PATH"</strong> ao instalar.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-200">Baixar o Pacote ZIP</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clique no botão azul acima para baixar o ZIP e extraia os arquivos em qualquer pasta do seu computador.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-200">Dar 2 Cliques no build_exe.bat</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              O Windows irá instalar os pacotes e gerar automaticamente o arquivo <strong className="text-cyan-300">GestureMouseWindows.exe</strong> na pasta <code className="text-amber-300">dist</code>!
            </p>
          </div>
        </div>
      </div>

      {/* Individual File Download Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* File 1: Python */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <FileCode className="w-4 h-4" />
              <span>gesture_mouse.py</span>
            </div>
            <p className="text-[11px] text-slate-400">Código Python principal com OpenCV + MediaPipe + PyAutoGUI.</p>
          </div>
          <button
            onClick={() => handleDownloadFile('gesture_mouse.py', pythonScriptContent)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar .py
          </button>
        </div>

        {/* File 2: Bat Script */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Terminal className="w-4 h-4" />
              <span>build_exe.bat</span>
            </div>
            <p className="text-[11px] text-slate-400">Script do Windows que compila o código em .exe automaticamente.</p>
          </div>
          <button
            onClick={() => handleDownloadFile('build_exe.bat', batScriptContent, 'text/plain')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar .bat
          </button>
        </div>

        {/* File 3: Requirements */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <FileCode className="w-4 h-4" />
              <span>requirements.txt</span>
            </div>
            <p className="text-[11px] text-slate-400">Lista de dependências Python para o sistema.</p>
          </div>
          <button
            onClick={() => handleDownloadFile('requirements.txt', requirementsContent)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar .txt
          </button>
        </div>

        {/* File 4: Readme */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>LEAME_INSTRUCOES.txt</span>
            </div>
            <p className="text-[11px] text-slate-400">Manual detalhado de instruções em português.</p>
          </div>
          <button
            onClick={() => handleDownloadFile('LEAME_INSTRUCOES.txt', readmeContent)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar Guia
          </button>
        </div>
      </div>

      {/* Code Inspector Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCodeTab === 'python'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              gesture_mouse.py
            </button>
            <button
              onClick={() => setActiveCodeTab('bat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCodeTab === 'bat'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              build_exe.bat
            </button>
            <button
              onClick={() => setActiveCodeTab('req')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCodeTab === 'req'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              requirements.txt
            </button>
          </div>

          <button
            onClick={() => {
              const content =
                activeCodeTab === 'python'
                  ? pythonScriptContent
                  : activeCodeTab === 'bat'
                  ? batScriptContent
                  : requirementsContent;
              handleCopyCode(content, activeCodeTab);
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            {copiedTab === activeCodeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Container */}
        <div className="p-4 bg-slate-950 overflow-x-auto max-h-96 text-xs font-mono text-slate-300">
          <pre>
            {activeCodeTab === 'python'
              ? pythonScriptContent
              : activeCodeTab === 'bat'
              ? batScriptContent
              : requirementsContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
