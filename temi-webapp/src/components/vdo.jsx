import React, { useEffect, useRef, useState } from 'react';

const Video = () => {
  const websocketUrl = "ws://10.7.142.208:8765";
  const [connected, setConnected] = useState(false);
  const canvasRef = useRef(null); // Reference to update the canvas element with new frames

  useEffect(() => {
    // Create a WebSocket connection
    const ws = new WebSocket(websocketUrl);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      // This assumes the message is a base64-encoded JPEG image
      const imgSrc = `data:image/jpeg;base64,${event.data}`;

      // Create a new Image object
      const img = new Image();
      img.src = imgSrc;

      // Draw the image on the canvas when it loads
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the previous frame
        context.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the new frame
      };
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup the WebSocket connection when the component unmounts
    return () => {
      ws.close();
    };
  }, [websocketUrl]);

  return (
    <div className="video-stream">
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ border: 'none' }}
      />
      <div>{connected ? 'Connected' : 'Disconnected'}</div>
    </div>
  );
};

export default Video;
