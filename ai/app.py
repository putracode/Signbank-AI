import os
import cv2
import base64
import joblib
import numpy as np
import mediapipe as mp
from collections import deque
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model

app = FastAPI(title="Sign Language Recognition API")

# Enable CORS for frontend web interface
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and label encoder
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best_model.h5")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "models", "label_encoder.pkl")

print(f"Loading model from {MODEL_PATH}...")
model = load_model(MODEL_PATH)
print("Model loaded successfully.")

print(f"Loading label encoder from {ENCODER_PATH}...")
encoder = joblib.load(ENCODER_PATH)
print("Label encoder loaded successfully.")

# Setup MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Constants from training configuration
SEQUENCE_LENGTH = 40
SMOOTHING_WINDOW = 3
PREDICTION_THRESHOLD = 0.85

def normalize_hand(hand_array):
    """
    Normalisasi koordinat tangan agar relatif terhadap pergelangan tangan (wrist / landmark 0).
    Membuat fitur menjadi translation-invariant (tidak bergantung posisi di layar).
    """
    if np.all(hand_array == 0):
        return hand_array
    
    # Landmark 0 adalah pergelangan tangan (wrist)
    wrist_x = hand_array[0]
    wrist_y = hand_array[1]
    wrist_z = hand_array[2]
    
    normalized = hand_array.copy()
    for i in range(0, len(normalized), 3):
        normalized[i] -= wrist_x
        normalized[i+1] -= wrist_y
        normalized[i+2] -= wrist_z
    return normalized

def extract_landmarks(results):
    left_hand = np.zeros(63)
    right_hand = np.zeros(63)

    if results.multi_hand_landmarks and results.multi_handedness:
        for hand_landmarks, handedness in zip(
            results.multi_hand_landmarks,
            results.multi_handedness
        ):
            label = handedness.classification[0].label
            landmarks = []
            for lm in hand_landmarks.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])
            landmarks = np.array(landmarks)
            
            if label == 'Left':
                left_hand = landmarks
            else:
                right_hand = landmarks

    # Normalisasi pergelangan tangan (wrist-relative) untuk masing-masing tangan
    left_hand = normalize_hand(left_hand)
    right_hand = normalize_hand(right_hand)

    return np.concatenate([left_hand, right_hand])

def base64_to_cv2(b64_string):
    """
    Mengubah string base64 gambar jpeg/png menjadi image array OpenCV (BGR)
    """
    if "," in b64_string:
        b64_string = b64_string.split(",")[1]
    img_bytes = base64.b64decode(b64_string)
    img_arr = np.frombuffer(img_bytes, dtype=np.uint8)
    image = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
    return image

@app.get("/")
def read_root():
    return {"status": "running", "model": "LSTM Sign Language Recognition"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("New client connected to prediction WebSocket")
    
    # State tracking per connection to avoid crosstalk
    # State tracking per connection to avoid crosstalk
    sequence_buffer = deque(maxlen=12) # Matches training active sequence length (~10-13 active frames after frame skip)
    prediction_buffer = deque(maxlen=SMOOTHING_WINDOW)
    missing_hand_counter = 0
    low_confidence_counter = 0
    
    try:
        while True:
            # Receive frame as base64 string from client
            data = await websocket.receive_text()
            
            try:
                # Decode image and process
                frame = base64_to_cv2(data)
                if frame is None:
                    continue
                
                # Flip frame horizontally to align with user webcam perspective
                frame = cv2.flip(frame, 1)
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = hands.process(rgb)
                
                # If no hands are detected in the frame
                if not results.multi_hand_landmarks:
                    missing_hand_counter += 1
                    low_confidence_counter = 0
                    
                    # Do one final prediction right when hand exits
                    if missing_hand_counter == 1 and len(sequence_buffer) > 0:
                        padded_sequence = list(sequence_buffer)
                        while len(padded_sequence) < SEQUENCE_LENGTH:
                            padded_sequence.append(np.zeros(126))
                        input_data = np.expand_dims(padded_sequence, axis=0)
                        prediction = model.predict(input_data, verbose=0)[0]
                        confidence = float(np.max(prediction))
                        predicted_index = int(np.argmax(prediction))
                        predicted_label = encoder.inverse_transform([predicted_index])[0]
                        
                        if confidence > PREDICTION_THRESHOLD:
                            await websocket.send_json({
                                "prediction": predicted_label,
                                "confidence": confidence,
                                "active": True
                            })
                    
                    # If hand is missing for more than 3 consecutive frames (~300ms), clear buffers
                    if missing_hand_counter > 3:
                        sequence_buffer.clear()
                        prediction_buffer.clear()
                        await websocket.send_json({
                            "prediction": "",
                            "confidence": 0.0,
                            "active": False
                        })
                    continue

                # If hand is detected, reset missing counter
                missing_hand_counter = 0

                # Extract coordinates
                landmarks = extract_landmarks(results)
                sequence_buffer.append(landmarks)
                
                # Predict instantly using padded sequence if buffer is not empty
                if len(sequence_buffer) > 0:
                    # Pad sequence by appending zeros to match training tail-padding
                    padded_sequence = list(sequence_buffer)
                    while len(padded_sequence) < SEQUENCE_LENGTH:
                        padded_sequence.append(np.zeros(126))
                        
                    input_data = np.expand_dims(padded_sequence, axis=0)
                    prediction = model.predict(input_data, verbose=0)[0]
                    
                    confidence = float(np.max(prediction))
                    
                    # Transition detection: if confidence is very low, the hand is likely changing shape
                    if confidence < 0.50:
                        low_confidence_counter += 1
                        if low_confidence_counter >= 3:
                            sequence_buffer.clear()
                            prediction_buffer.clear()
                            low_confidence_counter = 0
                    else:
                        low_confidence_counter = 0
                        
                    predicted_index = int(np.argmax(prediction))
                    predicted_label = encoder.inverse_transform([predicted_index])[0]
                    
                    prediction_buffer.append(predicted_label)
                    stable_prediction = max(
                        set(prediction_buffer),
                        key=prediction_buffer.count
                    )
                    
                    # Return prediction if confidence is above threshold
                    if confidence > PREDICTION_THRESHOLD:
                        await websocket.send_json({
                            "prediction": stable_prediction,
                            "confidence": confidence,
                            "active": True
                        })
                    else:
                        await websocket.send_json({
                            "prediction": "",
                            "confidence": confidence,
                            "active": False
                        })
                else:
                    await websocket.send_json({
                        "prediction": "Mengumpulkan frame...",
                        "confidence": 0.0,
                        "active": False
                    })
            except Exception as e:
                # Send error message back or print
                print(f"Error processing frame: {e}")
                await websocket.send_json({"error": str(e)})
                
    except WebSocketDisconnect:
        print("Client disconnected from prediction WebSocket")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
