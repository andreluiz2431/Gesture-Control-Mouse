import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Zap } from 'lucide-react';
import { CalibrationSettings, HandLandmark } from '../types';

interface CameraViewProps {
  isActive: boolean;
  settings: CalibrationSettings;
  onUpdateSettings: (newSettings: Partial<CalibrationSettings>) => void;
  onFrameProcessed: (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    landmarks: HandLandmark[] | null
  ) => void;
  currentGestureLabel: string;
  fps: number;
  pinchDistance: number;
  isPinching: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  isActive,
  settings,
  onUpdateSettings,
  onFrameProcessed,
  currentGestureLabel,
  fps,
  pinchDistance,
  isPinching,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const animFrameIdRef = useRef<number | null>(null);

  // Enumerate cameras
  useEffect(() => {
    async function getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch (err) {
        console.warn('Could not enumerate video devices:', err);
      }
    }
    getCameras();
  }, [selectedDeviceId]);

  // Start / Stop Video Stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      if (!isActive) {
        if (videoRef.current && videoRef.current.srcObject) {
          const s = videoRef.current.srcObject as MediaStream;
          s.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        return;
      }

      setIsLoadingCamera(true);
      setCameraError(null);

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 },
          },
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Error opening webcam:', err);
        setCameraError(
          'Permissão de Câmera Negada ou Nenhuma WebCam encontrada. Verifique se o seu navegador permite acesso à câmera.'
        );
      } finally {
        setIsLoadingCamera(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive, selectedDeviceId]);

  // Processing loop
  useEffect(() => {
    let active = true;

    const processLoop = () => {
      if (!active) return;

      if (
        isActive &&
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState >= 2
      ) {
        onFrameProcessed(videoRef.current, canvasRef.current, null);
      }

      animFrameIdRef.current = requestAnimationFrame(processLoop);
    };

    if (isActive) {
      animFrameIdRef.current = requestAnimationFrame(processLoop);
    }

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isActive, onFrameProcessed]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Video Canvas Container */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden group">
        {/* Hidden Video element used as texture source */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
        />

        {/* Live Canvas Overlay */}
        {isActive && !cameraError ? (
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className={`w-full h-full object-cover transition-transform ${
              settings.mirrorCamera ? '-scale-x-100' : ''
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-3 border border-slate-700/60">
              <Camera className="w-8 h-8" />
            </div>
            {cameraError ? (
              <div className="max-w-md">
                <p className="text-sm font-semibold text-rose-400 mb-1">
                  Erro de Acesso à Câmera
                </p>
                <p className="text-xs text-slate-400">{cameraError}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-300">
                  Câmera AI Desativada
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Clique em "Ativar Câmera AI" no topo para ligar o rastreamento por gestos ao vivo.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoadingCamera && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-cyan-400 gap-3 font-semibold text-sm">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Iniciando Câmera e Modelo AI...
          </div>
        )}

        {/* Live Badge Overlay on Camera */}
        {isActive && !cameraError && (
          <>
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-2 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{currentGestureLabel}</span>
            </div>

            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono text-cyan-400">
              {fps} FPS
            </div>

            {/* Pinch Distance Bar */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Zap className={`w-4 h-4 ${isPinching ? 'text-cyan-400 animate-bounce' : 'text-slate-500'}`} />
                <span>Distância Pinça:</span>
              </div>
              <div className="flex-1 max-w-xs bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-75 ${
                    isPinching ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-slate-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (1 - pinchDistance * 8) * 100))}%` }}
                />
              </div>
              <span className={`font-mono text-xs font-bold ${isPinching ? 'text-cyan-300' : 'text-slate-400'}`}>
                {(pinchDistance * 100).toFixed(1)}%
              </span>
            </div>
          </>
        )}
      </div>

      {/* Toolbar Options */}
      <div className="p-3 bg-slate-900 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={settings.mirrorCamera}
              onChange={(e) => onUpdateSettings({ mirrorCamera: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
            />
            <span>Espelhar Imagem (Mirror)</span>
          </label>
        </div>

        {availableDevices.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Câmera:</span>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
            >
              {availableDevices.map((dev, idx) => (
                <option key={dev.deviceId} value={dev.deviceId}>
                  {dev.label || `Câmera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
