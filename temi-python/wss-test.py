import asyncio
import websockets
import cv2
import numpy as np
import base64

# WebSocket client to receive the stream
async def receive_image():
    # Connect to the WebSocket server
    uri = "ws://10.61.2.1:8765"
    
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket server")

        while True:
            try:
                # Receive the base64-encoded image
                image_data = await websocket.recv()

                # Decode the base64 string to bytes
                image_bytes = base64.b64decode(image_data)

                # Convert the bytes to a NumPy array
                np_arr = np.frombuffer(image_bytes, np.uint8)

                # Decode the image from the NumPy array
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                # Display the image using OpenCV
                cv2.imshow("WebSocket Live Stream", frame)

                # Exit the window by pressing 'q'
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

            except websockets.ConnectionClosed:
                print("Connection closed")
                break

        cv2.destroyAllWindows()

# Run the WebSocket client
async def main():
    await receive_image()

# Start the async event loop
if __name__ == "__main__":
    asyncio.run(main())
