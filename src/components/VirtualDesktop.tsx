import React, { useEffect, useRef, useState } from 'react';
import {
  Folder,
  FileText,
  Paintbrush,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  MousePointer,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { GestureType, VirtualCursorState } from '../types';

interface VirtualDesktopProps {
  cursorState: VirtualCursorState;
  isCameraActive: boolean;
  onTriggerActionNotice: (msg: string) => void;
}

interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
}

export const VirtualDesktop: React.FC<VirtualDesktopProps> = ({
  cursorState,
  isCameraActive,
  onTriggerActionNotice,
}) => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Right Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Windows State
  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'paint', title: 'Quadro de Desenho AI', isOpen: false, isMaximized: false, x: 40, y: 30 },
    { id: 'notepad', title: 'Bloco de Notas', isOpen: false, isMaximized: false, x: 100, y: 80 },
    { id: 'explorer', title: 'Explorador de Arquivos', isOpen: false, isMaximized: false, x: 160, y: 60 },
  ]);

  // Notepad text
  const [notepadText, setNotepadText] = useState<string>(
    'Bem-vindo ao Controle por Gestos!\n\n- Aponte para mover o cursor.\n- Junte o indicador e polegar para clicar.\n- Junte o médio e polegar para clicar com o botão direito.'
  );

  // Taskbar Start Menu
  const [isStartOpen, setIsStartOpen] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const lastDrawPos = useRef<{ x: number; y: number } | null>(null);

  // Drag & drop card state
  const [cardPos, setCardPos] = useState({ x: 50, y: 150 });
  const [isCardDragging, setIsCardDragging] = useState(false);

  // System Volume
  const [volume, setVolume] = useState(70);

  // Reaction to gesture triggers (e.g. Volume Up, Volume Down, Start Menu, Right Click)
  const lastGestureRef = useRef<GestureType>('none');

  useEffect(() => {
    if (cursorState.currentGesture !== lastGestureRef.current) {
      const g = cursorState.currentGesture;
      lastGestureRef.current = g;

      if (g === 'right_click') {
        setContextMenu({ x: cursorState.x, y: cursorState.y });
        onTriggerActionNotice('Clique Direito detectado!');
      } else if (g === 'left_click') {
        if (contextMenu) setContextMenu(null);
      } else if (g === 'volume_up') {
        setVolume((v) => Math.min(100, v + 10));
        onTriggerActionNotice('Volume: ' + Math.min(100, volume + 10) + '%');
      } else if (g === 'volume_down') {
        setVolume((v) => Math.max(0, v - 10));
        onTriggerActionNotice('Volume: ' + Math.max(0, volume - 10) + '%');
      } else if (g === 'win_key') {
        setIsStartOpen((prev) => !prev);
        onTriggerActionNotice('Menu Iniciar acionado!');
      }
    }
  }, [cursorState, contextMenu, volume, onTriggerActionNotice]);

  // Drawing logic on Canvas
  useEffect(() => {
    if (!canvasRef.current || !windows.find((w) => w.id === 'paint' && w.isOpen)) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (cursorState.isLeftDown || cursorState.isDragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = cursorState.x - rect.left;
      const y = cursorState.y - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        if (!isDrawing) {
          setIsDrawing(true);
          lastDrawPos.current = { x, y };
        } else if (lastDrawPos.current) {
          ctx.beginPath();
          ctx.moveTo(lastDrawPos.current.x, lastDrawPos.current.y);
          ctx.lineTo(x, y);
          ctx.strokeStyle = '#06b6d4'; // Cyan neon
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.stroke();
          lastDrawPos.current = { x, y };
        }
      }
    } else {
      setIsDrawing(false);
      lastDrawPos.current = null;
    }
  }, [cursorState, isDrawing, windows]);

  // Clear paint canvas
  const handleClearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const toggleWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isOpen: !w.isOpen } : w))
    );
  };

  return (
    <div
      ref={desktopRef}
      className="relative w-full h-[580px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between select-none"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.95) 75%)',
      }}
      onClick={() => {
        if (contextMenu) setContextMenu(null);
      }}
    >
      {/* Top Windows Header Banner */}
      <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-100">
            Mesa de Testes Virtual (Windows Desktop Sandbox)
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mova a mão na câmera para controlar o ponteiro abaixo</span>
        </div>
      </div>

      {/* Main Desktop Area */}
      <div className="relative flex-1 p-6 overflow-hidden">
        {/* Desktop Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
          {/* Shortcut 1: Paint */}
          <button
            onClick={() => toggleWindow('paint')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 backdrop-blur-sm transition-all hover:scale-105 group text-slate-200"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md group-hover:shadow-cyan-500/30">
              <Paintbrush className="w-6 h-6" />
            </div>
            <span className="mt-2 text-xs font-semibold">Desenhar por Gestos</span>
            <span className="text-[10px] text-slate-500">Desenhe com a mão</span>
          </button>

          {/* Shortcut 2: Notepad */}
          <button
            onClick={() => toggleWindow('notepad')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 backdrop-blur-sm transition-all hover:scale-105 group text-slate-200"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:shadow-indigo-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <span className="mt-2 text-xs font-semibold">Bloco de Notas</span>
            <span className="text-[10px] text-slate-500">Testar cliques de foco</span>
          </button>

          {/* Shortcut 3: Explorer */}
          <button
            onClick={() => toggleWindow('explorer')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 backdrop-blur-sm transition-all hover:scale-105 group text-slate-200"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md group-hover:shadow-amber-500/30">
              <Folder className="w-6 h-6" />
            </div>
            <span className="mt-2 text-xs font-semibold">Explorador Pasta</span>
            <span className="text-[10px] text-slate-500">Rolagem e arquivos</span>
          </button>
        </div>

        {/* Draggable Card Sandbox */}
        <div
          style={{ left: `${cardPos.x}px`, top: `${cardPos.y}px` }}
          className="absolute p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md shadow-xl text-xs max-w-xs text-slate-200 cursor-grab active:cursor-grabbing border-l-4 border-l-cyan-400"
        >
          <div className="flex items-center justify-between mb-2 font-bold text-cyan-300">
            <span>Teste de Arrastar (Drag & Drop)</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Faça o gesto de <strong className="text-cyan-300">Pinça Mantida</strong> ou <strong className="text-cyan-300">Punho Fechado</strong> para arrastar este card!
          </p>
        </div>

        {/* Windows Applications */}

        {/* 1. Paint Window */}
        {windows.find((w) => w.id === 'paint')?.isOpen && (
          <div className="absolute top-12 left-10 md:left-24 w-[360px] md:w-[480px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-20">
            <div className="bg-slate-800 px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-cyan-400" />
                <span>Quadro de Desenho por Gestos</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearCanvas}
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                  title="Limpar Quadro"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleWindow('paint')}
                  className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-2 bg-slate-950 flex flex-col items-center">
              <canvas
                ref={canvasRef}
                width={440}
                height={220}
                className="bg-slate-900 border border-slate-800 rounded-lg cursor-crosshair w-full"
              />
              <span className="text-[10px] text-slate-500 mt-1.5">
                Pressione a pinça com o dedo indicador para desenhar linhas neons!
              </span>
            </div>
          </div>
        )}

        {/* 2. Notepad Window */}
        {windows.find((w) => w.id === 'notepad')?.isOpen && (
          <div className="absolute top-20 left-16 md:left-48 w-[320px] md:w-[420px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-20">
            <div className="bg-slate-800 px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Bloco de Notas</span>
              </div>
              <button
                onClick={() => toggleWindow('notepad')}
                className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-2 bg-slate-950">
              <textarea
                value={notepadText}
                onChange={(e) => setNotepadText(e.target.value)}
                className="w-full h-40 bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* 3. Explorer Window */}
        {windows.find((w) => w.id === 'explorer')?.isOpen && (
          <div className="absolute top-16 left-12 md:left-36 w-[340px] md:w-[460px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-20">
            <div className="bg-slate-800 px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-400" />
                <span>Explorador - Documentos (Teste de Rolagem)</span>
              </div>
              <button
                onClick={() => toggleWindow('explorer')}
                className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 max-h-56 overflow-y-auto space-y-2 text-xs text-slate-300">
              <p className="font-bold text-cyan-400">
                📜 Levante o Dedo Indicador + Médio juntos para rolar esta lista!
              </p>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Arquivo_Windows_Doc_{i + 1}.pdf</span>
                  </div>
                  <span className="text-[10px] text-slate-500">1.2 MB</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Context Menu on Right Click */}
        {contextMenu && (
          <div
            style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
            className="absolute z-50 w-48 bg-slate-900/95 border border-slate-700/80 backdrop-blur-md rounded-xl shadow-2xl py-1 text-xs text-slate-200 animate-in fade-in zoom-in duration-100"
          >
            <div className="px-3 py-1.5 font-bold border-b border-slate-800 text-cyan-400 flex items-center justify-between">
              <span>Menu de Contexto</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <button
              onClick={() => {
                onTriggerActionNotice('Atualizado!');
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between"
            >
              <span>Atualizar Tela</span>
            </button>
            <button
              onClick={() => {
                toggleWindow('paint');
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between"
            >
              <span>Novo Desenho</span>
            </button>
            <button
              onClick={() => {
                onTriggerActionNotice('Propriedades abertas!');
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between border-t border-slate-800 text-slate-400"
            >
              <span>Propriedades do Sistema</span>
            </button>
          </div>
        )}

        {/* Start Menu Overlay */}
        {isStartOpen && (
          <div className="absolute bottom-12 left-4 z-40 w-72 bg-slate-900/95 border border-slate-700/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 text-slate-200 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800 mb-3">
              <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-slate-950">
                W
              </div>
              <div>
                <p className="font-bold text-sm">Windows User</p>
                <p className="text-[10px] text-slate-400">Gesto do Rock 🤘 acionou o Start!</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  toggleWindow('paint');
                  setIsStartOpen(false);
                }}
                className="w-full p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 flex items-center gap-2.5 text-left"
              >
                <Paintbrush className="w-4 h-4 text-cyan-400" />
                <span>Quadro de Desenho</span>
              </button>

              <button
                onClick={() => {
                  toggleWindow('notepad');
                  setIsStartOpen(false);
                }}
                className="w-full p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 flex items-center gap-2.5 text-left"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Bloco de Notas</span>
              </button>

              <button
                onClick={() => {
                  toggleWindow('explorer');
                  setIsStartOpen(false);
                }}
                className="w-full p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 flex items-center gap-2.5 text-left"
              >
                <Folder className="w-4 h-4 text-amber-400" />
                <span>Arquivos e Documentos</span>
              </button>
            </div>
          </div>
        )}

        {/* Simulated Virtual Mouse Cursor */}
        {isCameraActive && (
          <div
            style={{
              transform: `translate3d(${cursorState.x}px, ${cursorState.y}px, 0)`,
            }}
            className="pointer-events-none fixed top-0 left-0 z-50 transition-transform duration-75"
          >
            {/* Pulsing ring on left or right click */}
            {(cursorState.isLeftDown || cursorState.isRightDown) && (
              <div
                className={`absolute -top-4 -left-4 w-10 h-10 rounded-full animate-ping border-2 ${
                  cursorState.isRightDown ? 'border-rose-400' : 'border-cyan-400'
                }`}
              />
            )}

            {/* Custom Mouse Cursor SVG */}
            <div className="relative">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={`drop-shadow-lg transition-transform ${
                  cursorState.isLeftDown ? 'scale-90 text-cyan-400' : 'text-slate-100'
                }`}
              >
                <path
                  d="M3 3l7.5 18 3.5-7.5 7.5-3.5L3 3z"
                  fill={cursorState.isRightDown ? '#f43f5e' : '#06b6d4'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Action Badge attached to cursor */}
              <div className="absolute top-5 left-4 bg-slate-950/90 text-[10px] font-bold text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 whitespace-nowrap shadow-md">
                {cursorState.gestureLabel}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Windows Taskbar */}
      <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {/* Start Menu Button */}
          <button
            onClick={() => setIsStartOpen(!isStartOpen)}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-2 font-bold ${
              isStartOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
            }`}
          >
            <div className="w-4 h-4 rounded bg-cyan-400 flex items-center justify-center text-[10px] font-black text-slate-950">
              W
            </div>
            <span>Iniciar</span>
          </button>
        </div>

        {/* System Tray Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="font-mono text-[11px]">{volume}%</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px]">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
