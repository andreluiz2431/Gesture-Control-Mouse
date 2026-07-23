import React from 'react';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  MousePointer,
  Sparkles,
  Zap,
  Volume2,
  ShieldAlert,
  Hand,
} from 'lucide-react';
import { ActionType, CalibrationSettings, GestureMapping } from '../types';

interface GestureConfiguratorProps {
  settings: CalibrationSettings;
  onUpdateSettings: (newSettings: Partial<CalibrationSettings>) => void;
  mappings: GestureMapping[];
  onUpdateMapping: (id: string, newAction: ActionType) => void;
  onResetDefaults: () => void;
}

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'CURSOR_MOVE', label: '☝️ Mover Ponteiro do Mouse' },
  { value: 'LEFT_CLICK', label: '🖱️ Clique Esquerdo (Left Click)' },
  { value: 'RIGHT_CLICK', label: '🖱️ Clique Direito (Right Click)' },
  { value: 'DOUBLE_CLICK', label: '⚡ Clique Duplo' },
  { value: 'SCROLL_UP', label: '📜 Rolar para Cima / Baixo (Scroll)' },
  { value: 'DRAG_HOLD', label: '✊ Arrastar e Soltar (Drag & Drop)' },
  { value: 'ALT_TAB', label: '📑 Alternar Janelas (Alt + Tab)' },
  { value: 'WIN_START', label: '🪟 Menu Iniciar do Windows' },
  { value: 'MEDIA_VOL_UP', label: '🔊 Aumentar Volume' },
  { value: 'MEDIA_VOL_DOWN', label: '🔉 Diminuir Volume' },
  { value: 'MEDIA_MUTE', label: '🔇 Mudar para Mudo' },
  { value: 'COPY', label: '📋 Copiar (Ctrl + C)' },
  { value: 'PASTE', label: '📥 Colar (Ctrl + V)' },
  { value: 'SCREENSHOT', label: '📸 Captura de Tela (Win + Shift + S)' },
];

export const GestureConfigurator: React.FC<GestureConfiguratorProps> = ({
  settings,
  onUpdateSettings,
  mappings,
  onUpdateMapping,
  onResetDefaults,
}) => {
  return (
    <div className="space-y-6 text-slate-100">
      {/* Calibration Controls Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Calibração da Câmera & Filtro de Movimento</h2>
              <p className="text-xs text-slate-400">
                Ajuste a sensibilidade do rastreamento de mão para melhor precisão no seu PC.
              </p>
            </div>
          </div>

          <button
            onClick={onResetDefaults}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrões
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Slider 1: Smoothing */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-200">Suavização do Cursor (Filtro)</span>
              <span className="text-cyan-400 font-mono">
                {Math.round(settings.smoothing * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.85"
              step="0.05"
              value={settings.smoothing}
              onChange={(e) => onUpdateSettings({ smoothing: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Valores altos deixam o cursor mais estável e sem tremores; valores baixos dão resposta mais rápida.
            </p>
          </div>

          {/* Slider 2: Pinch Distance */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-200">Sensibilidade de Pinça (Clique)</span>
              <span className="text-cyan-400 font-mono">
                {(settings.pinchThreshold * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.09"
              step="0.005"
              value={settings.pinchThreshold}
              onChange={(e) => onUpdateSettings({ pinchThreshold: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Define a proximidade necessária entre o polegar e o dedo para registrar o clique.
            </p>
          </div>

          {/* Slider 3: Deadzone Margin */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-200">Margem de Borda da Câmera</span>
              <span className="text-cyan-400 font-mono">
                {Math.round(settings.deadzoneMargin * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.25"
              step="0.01"
              value={settings.deadzoneMargin}
              onChange={(e) => onUpdateSettings({ deadzoneMargin: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Facilita alcançar os cantos da tela inteira do Windows sem precisar mover a mão fora da câmera.
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-800 text-xs">
          <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={settings.leftHanded}
              onChange={(e) => onUpdateSettings({ leftHanded: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
            />
            <div>
              <p className="font-semibold text-slate-200">Modo Canhoto</p>
              <p className="text-[10px] text-slate-500">Otimiza gestos para a mão esquerda</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={settings.enableAudioFeedback}
              onChange={(e) => onUpdateSettings({ enableAudioFeedback: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
            />
            <div>
              <p className="font-semibold text-slate-200">Sons de Clique (Efeitos)</p>
              <p className="text-[10px] text-slate-500">Toca bipe suave ao acionar cliques</p>
            </div>
          </label>
        </div>
      </div>

      {/* Gesture Customization Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Hand className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Mapeamento Personalizado de Gestos</h2>
            <p className="text-xs text-slate-400">
              Escolha qual ação do Windows cada postura de mão deve executar.
            </p>
          </div>
        </div>

        {/* Mappings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mappings.map((m) => (
            <div
              key={m.id}
              className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>{m.name}</span>
                  </h3>
                  <p className="text-xs text-cyan-400 font-medium mt-0.5">{m.handPoseName}</p>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  ID: {m.id}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>

              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Ação Vinculada no Windows:
                </label>
                <select
                  value={m.assignedAction}
                  onChange={(e) => onUpdateMapping(m.id, e.target.value as ActionType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {ACTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
