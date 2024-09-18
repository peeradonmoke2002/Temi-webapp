import React, { useEffect, useRef, useState } from 'react';

const Video = ({ websocketUrl }) => {
  const [connected, setConnected] = useState(false);
  const videoRef = useRef(null); // Reference to update the video element with new frames

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
      
      // Update the video element with the new image
      if (videoRef.current) {
        videoRef.current.src = imgSrc;
      }
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
            ref={videoRef}
            width="640"
            height="480"
            style={{ border: 'none' }}
        />
    </div>
);
};

export default Video;
