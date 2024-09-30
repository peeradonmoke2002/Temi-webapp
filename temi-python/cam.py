import asyncio
import websockets
import cv2
import numpy as np
import base64

# Function to encode frame to base64
def encode_frame(frame):
    _, buffer = cv2.imencode('.jpg', frame)  # Encode the frame as JPEG
    frame_bytes = base64.b64encode(buffer)    # Encode JPEG to base64
    return frame_bytes.decode('utf-8')        # Convert to string

# WebSocket handler
async def stream_video(websocket, path):
    print("Client connected")
    # Open the video capture device (0 = default camera)
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open video stream.")
        await websocket.send("Error: Could not open video stream.")
        return

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame.")
                await websocket.send("Failed to grab frame.")
                break

            # Encode the frame
            encoded_frame = encode_frame(frame)

            # Send the frame to the WebSocket client
            await websocket.send(encoded_frame)

            # Delay to control frame rate (adjust as needed, here 30 FPS)
            await asyncio.sleep(1 / 30)

    except websockets.ConnectionClosed:
        print("Client disconnected")

    cap.release()

# Start the WebSocket server
async def main():
    async with websockets.serve(stream_video, "10.9.157.34", 8765):
        print("WebSocket server started on ws://localhost:8765")
        await asyncio.Future()  # Run forever

# Run the WebSocket server
if __name__ == "__main__":
    asyncio.run(main())