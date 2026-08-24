'use client';

import React, { useState } from 'react';
import { Camera, Hand, PenTool, ShieldCheck, X } from 'lucide-react';

interface CameraPermissionModalProps {
  open: boolean;
  onAllow: () => void;
  onUseTouch: () => void;
  onDismiss?: () => void;
  childName?: string;
}

/**
 * Pre-permission explainer shown before the browser camera prompt.
 * Explains WHY the camera is needed and reassures privacy (in-memory only),
 * and always offers a touch/stylus fallback if denied or unavailable.
 */
export const CameraPermissionModal: React.FC<CameraPermissionModalProps> = ({
  open,
  onAllow,
  onUseTouch,
  onDismiss,
}) => {
  const [requesting, setRequesting] = useState(false);

  if (!open) return null;

  const handleAllow = async () => {
    setRequesting(true);
    try {
      // Warm up the permission so the native prompt appears in user-gesture context
      await navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } });
    } catch {
      /* denial handled by parent via cameraError state */
    } finally {
      setRequesting(false);
      onAllow();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cam-perm-title"
    >
      <div className="bg-white border-2 border-amber/40 rounded-3xl shadow-soft-lg max-w-md w-full p-6 md:p-8 relative">
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-ink hover:bg-paper cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-amber-100 border-2 border-amber rounded-2xl flex items-center justify-center">
            <Camera className="w-8 h-8 text-amber-700" />
          </div>
          <h2 id="cam-perm-title" className="font-display font-extrabold text-xl text-ink">
            Ready for Magic Air-Tracing?
          </h2>
          <p className="text-sm text-muted font-body leading-relaxed">
            The lantern needs your camera to watch your hand wave in the air — like a magic wand!
            Prefer to draw? Touch and stylus work too.
          </p>
        </div>

        {/* Privacy assurance */}
        <div className="my-5 flex items-start gap-3 bg-sage-50 border border-sage/30 rounded-2xl p-3.5">
          <ShieldCheck className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
          <p className="text-xs text-sage-700 font-body leading-relaxed">
            <strong>100% private:</strong> the camera runs entirely on this device.
            No video is ever recorded, stored, or sent anywhere.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAllow}
            disabled={requesting}
            className="w-full min-h-[56px] px-6 py-3 rounded-2xl font-display font-bold text-lg bg-amber text-ink border-2 border-amber-600/30 hover:bg-amber-400 hover:shadow-amber-glow transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Hand className="w-5 h-5" />
            {requesting ? 'Waiting for permission…' : 'Use Magic Air Wand 🪄'}
          </button>
          <button
            onClick={onUseTouch}
            className="w-full min-h-[52px] px-6 py-3 rounded-2xl font-display font-bold text-base bg-white text-ink border-2 border-hairline hover:border-amber/50 hover:bg-paper transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            Draw with Touch / Stylus instead
          </button>
        </div>

        <p className="mt-4 text-[11px] text-muted font-body text-center">
          If you tap &ldquo;Block&rdquo; in the browser prompt, no worries — touch mode still works!
        </p>
      </div>
    </div>
  );
};
