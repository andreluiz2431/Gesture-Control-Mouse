import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { CalibrationSettings, GestureType, HandLandmark } from '../types';

export class HandTrackerEngine {
  private handLandmarker: HandLandmarker | null = null;
  private isInitializing = false;
  private isReady = false;
  private lastLeftPinchState = false;
  private lastRightPinchState = false;
  private lastPinchTime = 0;
  private prevCursorX = 0;
  private prevCursorY = 0;

  public async initialize(): Promise<boolean> {
    if (this.isReady && this.handLandmarker) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      this.isReady = true;
      this.isInitializing = false;
      return true;
    } catch (err) {
      console.warn('Failed to initialize MediaPipe with GPU delegate, retrying CPU...', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );

        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
        });

        this.isReady = true;
        this.isInitializing = false;
        return true;
      } catch (e2) {
        console.error('Failed to initialize MediaPipe HandLandmarker:', e2);
        this.isInitializing = false;
        return false;
      }
    }
  }

  public detectHand(
    videoElement: HTMLVideoElement,
    timestamp: number
  ) {
    if (!this.handLandmarker || !this.isReady) return null;
    try {
      return this.handLandmarker.detectForVideo(videoElement, timestamp);
    } catch (err) {
      return null;
    }
  }

  public processGesture(
    landmarks: HandLandmark[],
    containerWidth: number,
    containerHeight: number,
    settings: CalibrationSettings
  ): {
    cursorX: number;
    cursorY: number;
    gesture: GestureType;
    label: string;
    pinchDist: number;
    isLeftClick: boolean;
    isRightClick: boolean;
    isDoubleCLick: boolean;
    isDragging: boolean;
    scrollDelta: number;
  } {
    if (!landmarks || landmarks.length === 0) {
      return {
        cursorX: this.prevCursorX,
        cursorY: this.prevCursorY,
        gesture: 'none',
        label: 'Nenhuma mão detectada',
        pinchDist: 1.0,
        isLeftClick: false,
        isRightClick: false,
        isDoubleCLick: false,
        isDragging: false,
        scrollDelta: 0,
      };
    }

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    // Calculate pinch distance between Thumb and Index Tip
    const dx = thumbTip.x - indexTip.x;
    const dy = thumbTip.y - indexTip.y;
    const pinchDistThumbIndex = Math.hypot(dx, dy);

    // Calculate pinch distance between Thumb and Middle Tip
    const dxM = thumbTip.x - middleTip.x;
    const dyM = thumbTip.y - middleTip.y;
    const pinchDistThumbMiddle = Math.hypot(dxM, dyM);

    // Finger extensions
    const isIndexUp = indexTip.y < indexPip.y;
    const isMiddleUp = middleTip.y < middlePip.y;
    const isRingUp = ringTip.y < ringPip.y;
    const isPinkyUp = pinkyTip.y < pinkyPip.y;

    // Map Index Tip position to screen coordinates with deadzone margin
    let normX = indexTip.x;
    let normY = indexTip.y;

    if (settings.mirrorCamera) {
      normX = 1 - normX;
    }

    const margin = settings.deadzoneMargin;
    normX = (normX - margin) / (1 - 2 * margin);
    normY = (normY - margin) / (1 - 2 * margin);

    normX = Math.max(0, Math.min(1, normX));
    normY = Math.max(0, Math.min(1, normY));

    const targetX = normX * containerWidth;
    const targetY = normY * containerHeight;

    // Apply Exponential Moving Average (EMA) smoothing
    const alpha = 1 - Math.min(0.92, Math.max(0.0, settings.smoothing));
    const cursorX = this.prevCursorX + (targetX - this.prevCursorX) * alpha;
    const cursorY = this.prevCursorY + (targetY - this.prevCursorY) * alpha;

    this.prevCursorX = cursorX;
    this.prevCursorY = cursorY;

    let gesture: GestureType = 'move';
    let label = 'Mover Cursor';
    let isLeftClick = false;
    let isRightClick = false;
    let isDoubleClick = false;
    let isDragging = false;
    let scrollDelta = 0;

    const threshold = settings.pinchThreshold;

    // 1. Check Left Click Pinch (Thumb + Index)
    if (pinchDistThumbIndex < threshold) {
      isLeftClick = true;
      gesture = 'left_click';
      label = 'Clique Esquerdo';

      const now = performance.now();
      if (!this.lastLeftPinchState) {
        if (now - this.lastPinchTime < 320) {
          isDoubleClick = true;
          gesture = 'double_click';
          label = 'Clique Duplo';
        }
        this.lastPinchTime = now;
      }
      this.lastLeftPinchState = true;
    } else {
      this.lastLeftPinchState = false;
    }

    // 2. Check Right Click Pinch (Thumb + Middle)
    if (!isLeftClick && pinchDistThumbMiddle < threshold) {
      isRightClick = true;
      gesture = 'right_click';
      label = 'Clique Direito';
      this.lastRightPinchState = true;
    } else {
      this.lastRightPinchState = false;
    }

    // 3. Check Scroll Gesture (Index + Middle extended up, Ring & Pinky folded)
    if (!isLeftClick && !isRightClick && isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) {
      gesture = 'scroll';
      const wrist = landmarks[0];
      const verticalMovement = wrist.y - indexTip.y;
      if (verticalMovement > 0.38) {
        scrollDelta = -18; // Scroll Down
        label = 'Rolar para Baixo 📜';
      } else if (verticalMovement < 0.28) {
        scrollDelta = 18; // Scroll Up
        label = 'Rolar para Cima 📜';
      } else {
        label = 'Modo Rolagem';
      }
    }

    // 4. Check Open Palm (Alt+Tab or Shortcuts)
    if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp && pinchDistThumbIndex > 0.15) {
      if (gesture === 'move') {
        gesture = 'alt_tab';
        label = 'Mão Aberta (Navegação)';
      }
    }

    // 5. Check Fist (Lock/Safety or Drag)
    if (!isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp && pinchDistThumbIndex > 0.08) {
      gesture = 'drag';
      isDragging = true;
      label = 'Punho Fechado (Trava/Arrastar)';
    }

    return {
      cursorX,
      cursorY,
      gesture,
      label,
      pinchDist: pinchDistThumbIndex,
      isLeftClick,
      isRightClick,
      isDoubleCLick: isDoubleClick,
      isDragging,
      scrollDelta,
    };
  }
}
