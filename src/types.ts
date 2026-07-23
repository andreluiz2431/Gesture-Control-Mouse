export type GestureType =
  | 'none'
  | 'move'
  | 'left_click'
  | 'right_click'
  | 'double_click'
  | 'scroll'
  | 'drag'
  | 'volume_up'
  | 'volume_down'
  | 'win_key'
  | 'alt_tab'
  | 'screenshot'
  | 'mute';

export type ActionType =
  | 'CURSOR_MOVE'
  | 'LEFT_CLICK'
  | 'RIGHT_CLICK'
  | 'DOUBLE_CLICK'
  | 'MIDDLE_CLICK'
  | 'SCROLL_UP'
  | 'SCROLL_DOWN'
  | 'DRAG_HOLD'
  | 'WIN_START'
  | 'ALT_TAB'
  | 'MEDIA_VOL_UP'
  | 'MEDIA_VOL_DOWN'
  | 'MEDIA_MUTE'
  | 'COPY'
  | 'PASTE'
  | 'SCREENSHOT';

export interface GestureMapping {
  id: string;
  name: string;
  handPoseName: string;
  description: string;
  iconName: string;
  defaultAction: ActionType;
  assignedAction: ActionType;
  customHotkey?: string;
  thumbPinchThreshold?: number;
}

export interface CalibrationSettings {
  smoothing: number; // 0 to 0.9 (EMA smoothing)
  cursorSpeed: number; // 1.0 to 3.0
  pinchThreshold: number; // 0.02 to 0.08
  deadzoneMargin: number; // Percentage offset for camera borders (e.g. 0.15)
  mirrorCamera: boolean;
  leftHanded: boolean;
  enableAudioFeedback: boolean;
  activeHand: 'Right' | 'Left' | 'Both';
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandDetectionResult {
  landmarks: HandLandmark[][];
  handedness: string[];
}

export interface VirtualCursorState {
  x: number;
  y: number;
  isLeftDown: boolean;
  isRightDown: boolean;
  isDragging: boolean;
  currentGesture: GestureType;
  gestureLabel: string;
  pinchDistance: number;
  fps: number;
  confidence: number;
}

export interface ScriptDownloadBundle {
  pythonCode: string;
  batScript: string;
  requirementsTxt: string;
  readmeTxt: string;
}
