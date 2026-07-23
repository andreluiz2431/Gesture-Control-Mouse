import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_GESTURE_MAPPINGS } from './data/defaultMappings';
import {
  ActionType,
  CalibrationSettings,
  GestureMapping,
  HandLandmark,
  VirtualCursorState,
} from './types';
import { HandTrackerEngine } from './utils/handTracker';
import { soundEffects } from './utils/soundEffects';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { VirtualDesktop } from './components/VirtualDesktop';
import { GestureConfigurator } from './components/GestureConfigurator';
import { ExecutableDownload } from './components/ExecutableDownload';
import { HandGuideModal } from './components/HandGuideModal';
import { CheckCircle2, Info, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'playground' | 'calibration' | 'downloads' | 'guide'>(
    'playground'
  );
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Settings
  const [settings, setSettings] = useState<CalibrationSettings>({
    smoothing: 0.5,
    cursorSpeed: 1.5,
    pinchThreshold: 0.05,
    deadzoneMargin: 0.12,
    mirrorCamera: true,
    leftHanded: false,
    enableAudioFeedback: true,
    activeHand: 'Right',
  });

  // Mappings
  const [mappings, setMappings] = useState<GestureMapping[]>(DEFAULT_GESTURE_MAPPINGS);

  // Toast Action Notice
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerNotice = useCallback((msg: string) => {
    setActionNotice(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActionNotice(null);
    }, 2200);
  }, []);

  // Hand Tracker Engine Instance
  const trackerRef = useRef<HandTrackerEngine | null>(null);
  if (!trackerRef.current) {
    trackerRef.current = new HandTrackerEngine();
  }

  // Virtual Cursor Telemetry
  const [cursorState, setCursorState] = useState<VirtualCursorState>({
    x: 200,
    y: 200,
    isLeftDown: false,
    isRightDown: false,
    isDragging: false,
    currentGesture: 'none',
    gestureLabel: 'Aguardando Câmera...',
    pinchDistance: 0.1,
    fps: 0,
    confidence: 0,
  });

  const [handDetected, setHandDetected] = useState(false);

  // FPS tracking
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const fpsValueRef = useRef(30);

  // Auto initialize engine on camera start
  useEffect(() => {
    if (isCameraActive) {
      trackerRef.current?.initialize();
    }
  }, [isCameraActive]);

  // Handle frame processing from CameraView
  const handleFrameProcessed = useCallback(
    (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
      if (!isCameraActive || !trackerRef.current) return;

      const now = performance.now();

      // Calculate FPS
      frameCountRef.current++;
      if (now - lastFpsTimeRef.current >= 1000) {
        fpsValueRef.current = Math.round(
          (frameCountRef.current * 1000) / (now - lastFpsTimeRef.current)
        );
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }

      // Run MediaPipe Detection
      const detection = trackerRef.current.detectHand(video, now);
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Draw original video frame onto canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (detection && detection.landmarks && detection.landmarks.length > 0) {
        const handLandmarks = detection.landmarks[0] as HandLandmark[];
        setHandDetected(true);

        // Process gestures & cursor position
        const result = trackerRef.current.processGesture(
          handLandmarks,
          canvas.width,
          canvas.height,
          settings
        );

        // Audio trigger
        if (result.isLeftClick) {
          soundEffects.playClick(settings.enableAudioFeedback && audioEnabled);
        } else if (result.isRightClick) {
          soundEffects.playRightClick(settings.enableAudioFeedback && audioEnabled);
        }

        // Draw hand skeleton on canvas
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#06b6d4'; // Cyan
        ctx.fillStyle = '#f43f5e'; // Rose

        // Connections
        const CONNECTIONS = [
          [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // Index
          [5, 9], [9, 10], [10, 11], [11, 12], // Middle
          [9, 13], [13, 14], [14, 15], [15, 16], // Ring
          [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
          [0, 17],
        ];

        CONNECTIONS.forEach(([start, end]) => {
          const p1 = handLandmarks[start];
          const p2 = handLandmarks[end];
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
        });

        // Draw Landmarks
        handLandmarks.forEach((lm, idx) => {
          const x = lm.x * canvas.width;
          const y = lm.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, idx === 8 || idx === 4 ? 6 : 3, 0, 2 * Math.PI);
          ctx.fillStyle = idx === 8 ? '#06b6d4' : idx === 4 ? '#f43f5e' : '#e2e8f0';
          ctx.fill();
        });

        // Draw Pinch Line if close
        const thumb = handLandmarks[4];
        const index = handLandmarks[8];
        ctx.beginPath();
        ctx.moveTo(thumb.x * canvas.width, thumb.y * canvas.height);
        ctx.lineTo(index.x * canvas.width, index.y * canvas.height);
        ctx.strokeStyle = result.isLeftClick ? '#22c55e' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Update virtual cursor state
        setCursorState({
          x: result.cursorX,
          y: result.cursorY,
          isLeftDown: result.isLeftClick,
          isRightDown: result.isRightClick,
          isDragging: result.isDragging,
          currentGesture: result.gesture,
          gestureLabel: result.label,
          pinchDistance: result.pinchDist,
          fps: fpsValueRef.current,
          confidence: 0.95,
        });
      } else {
        setHandDetected(false);
        setCursorState((prev) => ({
          ...prev,
          gestureLabel: 'Nenhuma mão detectada',
          fps: fpsValueRef.current,
        }));
      }
    },
    [isCameraActive, settings, audioEnabled]
  );

  const handleUpdateSettings = (newSettings: Partial<CalibrationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleUpdateMapping = (id: string, newAction: ActionType) => {
    setMappings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, assignedAction: newAction } : m))
    );
    triggerNotice('Mapeamento de gesto atualizado!');
  };

  const handleResetDefaults = () => {
    setMappings(DEFAULT_GESTURE_MAPPINGS);
    setSettings({
      smoothing: 0.5,
      cursorSpeed: 1.5,
      pinchThreshold: 0.05,
      deadzoneMargin: 0.12,
      mirrorCamera: true,
      leftHanded: false,
      enableAudioFeedback: true,
      activeHand: 'Right',
    });
    triggerNotice('Configurações restauradas para o padrão!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'guide') {
            setIsGuideOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isCameraActive={isCameraActive}
        onToggleCamera={() => setIsCameraActive(!isCameraActive)}
        fps={cursorState.fps}
        gestureLabel={cursorState.gestureLabel}
        handDetected={handDetected}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Toast Notification */}
        {actionNotice && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="text-xs font-bold">{actionNotice}</span>
          </div>
        )}

        {/* Tab 1: Playground */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Col: Live Webcam Feed */}
            <div className="lg:col-span-5 space-y-4">
              <CameraView
                isActive={isCameraActive}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onFrameProcessed={handleFrameProcessed}
                currentGestureLabel={cursorState.gestureLabel}
                fps={cursorState.fps}
                pinchDistance={cursorState.pinchDistance}
                isPinching={cursorState.isLeftDown || cursorState.isRightDown}
              />

              {/* Quick Instructions Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Resumo de Gestos Básicos</span>
                  </h3>
                  <button
                    onClick={() => setIsGuideOpen(true)}
                    className="text-[11px] text-cyan-400 font-semibold hover:underline"
                  >
                    Ver Todos os 10 Gestos
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                    <p className="font-bold text-cyan-300">☝️ Mover Cursor</p>
                    <p className="text-slate-400 text-[10px]">Aponte o indicador</p>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                    <p className="font-bold text-cyan-300">🤏 Clique Esquerdo</p>
                    <p className="text-slate-400 text-[10px]">Pinça Polegar+Indicador</p>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                    <p className="font-bold text-cyan-300">🤌 Clique Direito</p>
                    <p className="text-slate-400 text-[10px]">Pinça Polegar+Médio</p>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                    <p className="font-bold text-cyan-300">✌️ Rolagem (Scroll)</p>
                    <p className="text-slate-400 text-[10px]">Dois dedos levantados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Virtual Windows Desktop Sandbox */}
            <div className="lg:col-span-7">
              <VirtualDesktop
                cursorState={cursorState}
                isCameraActive={isCameraActive}
                onTriggerActionNotice={triggerNotice}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Calibration & Mappings */}
        {activeTab === 'calibration' && (
          <GestureConfigurator
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            mappings={mappings}
            onUpdateMapping={handleUpdateMapping}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {/* Tab 3: Downloads & Windows Executable */}
        {activeTab === 'downloads' && (
          <ExecutableDownload settings={settings} mappings={mappings} />
        )}
      </main>

      {/* Hand Gesture Cheat Sheet Modal */}
      <HandGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        mappings={mappings}
      />

      {/* App Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>Gesture Control Mouse • Sistema de Controle por Gestos AI para Windows</p>
      </footer>
    </div>
  );
}
