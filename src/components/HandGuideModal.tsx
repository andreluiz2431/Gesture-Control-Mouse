import React from 'react';
import {
  X,
  MousePointer,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { GestureMapping } from '../types';

interface HandGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  mappings: GestureMapping[];
}

export const HandGuideModal: React.FC<HandGuideModalProps> = ({
  isOpen,
  onClose,
  mappings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-100">Guia Completo de Gestos de Mão</h2>
              <p className="text-xs text-slate-400">
                Aprenda a realizar os gestos com a webcam para controlar o seu computador Windows.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Quick Tips Box */}
          <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-start gap-3 text-xs text-cyan-200">
            <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Dicas para melhor precisão:</p>
              <ul className="list-disc list-inside space-y-0.5 text-cyan-300/90">
                <li>Mantenha a sua mão a cerca de 40cm a 80cm de distância da webcam.</li>
                <li>Garanta que o ambiente tenha iluminação razoável.</li>
                <li>Mantenha a palma da mão virada em direção à câmera.</li>
              </ul>
            </div>
          </div>

          {/* Gestures List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mappings.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-3.5 hover:border-cyan-500/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shrink-0">
                  {m.handPoseName.slice(-2)}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-100">{m.name}</h3>
                  <p className="text-xs text-cyan-400 font-semibold">{m.handPoseName}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
          >
            Entendido, Voltar para o App
          </button>
        </div>
      </div>
    </div>
  );
};
