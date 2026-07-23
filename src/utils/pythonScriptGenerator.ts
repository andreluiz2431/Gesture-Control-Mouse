import { CalibrationSettings, GestureMapping } from '../types';

export function generatePythonScript(
  settings: CalibrationSettings,
  mappings: GestureMapping[]
): string {
  const leftClickPinch = settings.pinchThreshold.toFixed(3);
  const smoothing = settings.smoothing.toFixed(2);
  const margin = settings.deadzoneMargin.toFixed(2);
  const mirrorStr = settings.mirrorCamera ? 'True' : 'False';

  return `"""
===================================================================
  CONTROLE DE MOUSE POR GESTOS PARA WINDOWS (.exe)
  Gerado por Gesture Control Mouse
===================================================================
Requisitos:
  pip install opencv-python mediapipe pyautogui pynput screeninfo
  
Para gerar o executável (.exe) standalone:
  pip install pyinstaller
  pyinstaller --onefile --noconsole gesture_mouse.py
===================================================================
"""

import cv2
import mediapipe as mp
import pyautogui
import math
import time
import sys
import ctypes

# Configuração de PyAutoGUI
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.001

# Obter resolução da tela
try:
    user32 = ctypes.windll.user32
    SCREEN_WIDTH, SCREEN_HEIGHT = user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)
except Exception:
    SCREEN_WIDTH, SCREEN_HEIGHT = pyautogui.size()

# Inicializa MediaPipe Hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# Parâmetros de Configuração
SMOOTHING = ${smoothing}  # Filtro de suavização (0.0 a 0.9)
DEADZONE_MARGIN = ${margin}  # Margem das bordas da câmera
PINCH_THRESHOLD = ${leftClickPinch}  # Distância para clique (pinça)
MIRROR = ${mirrorStr}

# Variáveis do estado do mouse
prev_x, prev_y = SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2
curr_x, curr_y = prev_x, prev_y

is_left_clicked = False
is_right_clicked = False
is_dragging = False
last_scroll_time = 0

def calculate_distance(p1, p2):
    return math.hypot(p1.x - p2.x, p1.y - p2.y)

def is_finger_extended(landmarks, tip_idx, pip_idx):
    return landmarks[tip_idx].y < landmarks[pip_idx].y

def main():
    global prev_x, prev_y, curr_x, curr_y
    global is_left_clicked, is_right_clicked, is_dragging, last_scroll_time

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Erro: Não foi possível acessar a câmera do Windows.")
        sys.exit(1)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    print("==========================================================")
    print(" Control do Mouse por Gestos Iniciado no Windows!")
    print(" Pressione 'Q' na janela da câmera para encerrar.")
    print("==========================================================")

    p_time = 0

    while True:
        success, image = cap.read()
        if not success:
            continue

        if MIRROR:
            image = cv2.flip(image, 1)

        h, w, _ = image.shape
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(image_rgb)

        current_gesture = "Mover Mouse (Indicador)"
        status_color = (0, 255, 0)

        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]

            # Landmarks de interesse
            wrist = hand_landmarks.landmark[0]
            thumb_tip = hand_landmarks.landmark[4]
            index_tip = hand_landmarks.landmark[8]
            index_pip = hand_landmarks.landmark[6]
            middle_tip = hand_landmarks.landmark[12]
            middle_pip = hand_landmarks.landmark[10]
            ring_tip = hand_landmarks.landmark[16]
            pinky_tip = hand_landmarks.landmark[20]

            # 1. Posição do Indicador mapeada para a Tela com Deadzone
            raw_x = index_tip.x
            raw_y = index_tip.y

            # Mapeamento do retângulo delimitado pela deadzone
            norm_x = (raw_x - DEADZONE_MARGIN) / (1.0 - 2 * DEADZONE_MARGIN)
            norm_y = (raw_y - DEADZONE_MARGIN) / (1.0 - 2 * DEADZONE_MARGIN)

            norm_x = max(0.0, min(1.0, norm_x))
            norm_y = max(0.0, min(1.0, norm_y))

            target_x = norm_x * SCREEN_WIDTH
            target_y = norm_y * SCREEN_HEIGHT

            # Suavização Exponential Moving Average
            curr_x = prev_x + (target_x - prev_x) * (1.0 - SMOOTHING)
            curr_y = prev_y + (target_y - prev_y) * (1.0 - SMOOTHING)

            prev_x, prev_y = curr_x, curr_y

            # Mover cursor do Windows
            try:
                pyautogui.moveTo(int(curr_x), int(curr_y))
            except Exception:
                pass

            # Distâncias de Pinça
            dist_thumb_index = calculate_distance(thumb_tip, index_tip)
            dist_thumb_middle = calculate_distance(thumb_tip, middle_tip)

            # Verificar Dedos Levantados
            index_up = is_finger_extended(hand_landmarks.landmark, 8, 6)
            middle_up = is_finger_extended(hand_landmarks.landmark, 12, 10)
            ring_up = is_finger_extended(hand_landmarks.landmark, 16, 14)
            pinky_up = is_finger_extended(hand_landmarks.landmark, 20, 18)

            # Gesto 1: CLIQUE ESQUERDO (Pinça Polegar + Indicador)
            if dist_thumb_index < PINCH_THRESHOLD:
                current_gesture = "CLIQUE ESQUERDO"
                status_color = (255, 0, 0)
                if not is_left_clicked:
                    pyautogui.click(button='left')
                    is_left_clicked = True
            else:
                is_left_clicked = False

            # Gesto 2: CLIQUE DIREITO (Pinça Polegar + Médio)
            if dist_thumb_index >= PINCH_THRESHOLD and dist_thumb_middle < PINCH_THRESHOLD:
                current_gesture = "CLIQUE DIREITO"
                status_color = (0, 0, 255)
                if not is_right_clicked:
                    pyautogui.click(button='right')
                    is_right_clicked = True
            else:
                is_right_clicked = False

            # Gesto 3: ROLAGEM (Indicador + Médio levantados juntos)
            if index_up and middle_up and not ring_up and not pinky_up:
                current_gesture = "ROLAGEM (Scroll)"
                status_color = (255, 255, 0)
                now = time.time()
                if now - last_scroll_time > 0.08:
                    # Direção do movimento vertical do pulso ou dedo
                    scroll_dir = (index_pip.y - index_tip.y)
                    if scroll_dir > 0.05:
                        pyautogui.scroll(120)  # Scroll Up
                    elif scroll_dir < 0.0:
                        pyautogui.scroll(-120)  # Scroll Down
                    last_scroll_time = now

            # Gesto 4: ATALHO ALT+TAB (Mão inteira aberta)
            if index_up and middle_up and ring_up and pinky_up and dist_thumb_index > 0.15:
                current_gesture = "MÃO ABERTA (Livre)"

            # Desenha a malha da mão na tela
            mp_drawing.draw_landmarks(
                image,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style()
            )

            # Desenha ponto indicador e círculos nas pinças
            cx, cy = int(index_tip.x * w), int(index_tip.y * h)
            cv2.circle(image, (cx, cy), 10, (255, 0, 255), cv2.FILLED)

        # Cálculo de FPS
        c_time = time.time()
        fps = 1 / (c_time - p_time) if (c_time - p_time) > 0 else 0
        p_time = c_time

        # Overlay na Câmera
        cv2.putText(image, f"FPS: {int(fps)}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(image, f"Gesto: {current_gesture}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
        cv2.putText(image, "Pressione 'Q' para Sair", (20, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        cv2.imshow("Gesture Control Mouse - Windows", image)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
`;
}

export function generateBatScript(): string {
  return `@echo off
title Criador de Executavel Windows (.exe) - Gesture Control Mouse
color 0A

echo =========================================================
echo   INSTALANDO DEPENDENCIAS E GERANDO O EXECUTAVEL .EXE
echo =========================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao foi encontrado no seu Windows!
    echo Por favor, instale o Python 3.10+ marcando "Add Python to PATH".
    echo Download: https://www.python.org/downloads/
    pause
    exit /b
)

echo [1/3] Instalando bibliotecas necessarias...
pip install opencv-python mediapipe pyautogui pynput screeninfo pyinstaller --quiet

echo.
echo [2/3] Compilando gesture_mouse.py em um aplicativo .EXE único...
pyinstaller --onefile --noconsole --name="GestureMouseWindows" gesture_mouse.py

echo.
if exist "dist\\GestureMouseWindows.exe" (
    echo =========================================================
    echo [SUCESSO!] O executavel foi criado com sucesso!
    echo Localizacao: pasta "dist\\GestureMouseWindows.exe"
    echo =========================================================
    echo.
    echo Abrindo a pasta dist...
    explorer dist
) else (
    echo [ERRO] Falha ao compilar o executavel. Verifique os logs acima.
)

pause
`;
}

export function generateRequirementsTxt(): string {
  return `opencv-python>=4.8.0
mediapipe>=0.10.0
pyautogui>=0.9.54
pynput>=1.7.6
screeninfo>=0.8.1
pyinstaller>=6.0.0
`;
}

export function generateReadmeTxt(): string {
  return `====================================================================
  GUIA PASSO A PASSO PARA RODAR E GERAR O .EXE NO WINDOWS
====================================================================

OPÇÃO 1: EXECUTAR DIRETAMENTE PELO PYTHON
--------------------------------------------------------------------
1. Certifique-se de ter o Python instalado (https://www.python.org).
   * Marque a opção "Add Python to PATH" ao instalar!
2. Abra o Prompt de Comando (CMD) na pasta destes arquivos.
3. Digite:
   pip install -r requirements.txt
4. Para rodar:
   python gesture_mouse.py

--------------------------------------------------------------------
OPÇÃO 2: GERAR O EXECUTÁVEL (.EXE) COM 1 CLIQUE NO WINDOWS
--------------------------------------------------------------------
1. Dê um duplo clique no arquivo: build_exe.bat
2. Aguarde alguns segundos enquanto o PyInstaller gera o aplicativo.
3. O executável "GestureMouseWindows.exe" estará pronto na pasta "dist"!
4. Você pode mover o "GestureMouseWindows.exe" para a área de trabalho
   e executá-lo em qualquer computador com Windows!

--------------------------------------------------------------------
GESTOS PADRÃO SUPORTADOS:
--------------------------------------------------------------------
- Mover Cursor: Mova a mão apontando o dedo Indicador.
- Clique Esquerdo: Junte o Polegar e o Indicador (gesto de pinça).
- Clique Direito: Junte o Polegar e o Dedo Médio.
- Rolagem (Scroll): Levante o Indicador + Médio juntos e mova para cima/baixo.
- Tecla Sair: Pressione a tecla 'Q' na janela da câmera.
`;
}
