import React from 'react';
import {
  Camera,
  Download,
  Hand,
  HelpCircle,
  Monitor,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'playground' | 'calibration' | 'downloads' | 'guide';
  setActiveTab: (tab: 'playground' | 'calibration' | 'downloads' | 'guide') => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  fps: number;
  gestureLabel: string;
  handDetected: boolean;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isCameraActive,
  onToggleCamera,
  fps,
  gestureLabel,
  handDetected,
  audioEnabled,
  onToggleAudio,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Hand className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Gesture Control Mouse
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Controle o Windows por Gestos • Webcam AI
              </p>
            </div>
          </div>

          {/* Quick Camera Toggle Button for Mobile/Tablet header */}
          <button
            onClick={onToggleCamera}
            className={`md:hidden px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isCameraActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {isCameraActive ? 'Desligar Câmera' : 'Ligar Câmera'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-sm font-medium w-full md:w-auto justify-center">
          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'playground'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Mesa de Testes</span>
            <span className="sm:hidden">Testar</span>
          </button>

          <button
            onClick={() => setActiveTab('calibration')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'calibration'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Calibração & Gestos</span>
            <span className="sm:hidden">Ajustes</span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'downloads'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar .EXE Windows</span>
            <span className="sm:hidden">Baixar .EXE</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'guide'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Guia de Gestos"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Guia</span>
          </button>
        </nav>

        {/* Telemetry Pill & Main Camera Button */}
        <div className="hidden md:flex items-center gap-3">
          {/* Live Telemetry Status Pill */}
          {isCameraActive && (
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    handDetected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    handDetected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="font-semibold text-slate-200">
                {handDetected ? gestureLabel : 'Aguardando mão...'}
              </span>
              <span className="text-slate-500 border-l border-slate-800 pl-2">
                {fps} FPS
              </span>
            </div>
          )}

          {/* Sound Effect Toggle */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-lg border transition-colors ${
              audioEnabled
                ? 'bg-slate-800 text-cyan-400 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={audioEnabled ? 'Efeitos Sonoros Ativados' : 'Efeitos Sonoros Desativados'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Camera On/Off Toggle Button */}
          <button
            onClick={onToggleCamera}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              isCameraActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 font-extrabold shadow-cyan-500/25'
            }`}
          >
            <Camera className="w-4 h-4" />
            {isCameraActive ? 'Desativar Câmera' : 'Ativar Câmera AI'}
          </button>
        </div>
      </div>
    </header>
  );
};
