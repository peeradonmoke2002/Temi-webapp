import React, { useRef, useState, useEffect } from 'react';
import PhoneIcon from '@mui/icons-material/Phone';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

const WebRTC = () => {
    const [peerConnection, setPeerConnection] = useState(null);
    const [isCalling, setIsCalling] = useState(false);
    const [isCamEnabled, setIsCamEnabled] = useState(true);
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [signalingServer, setSignalingServer] = useState(null);  // Store signaling server connection
    const [status, setStatus] = useState('Waiting to start call'); // Status state
    const [error, setError] = useState(null); // Error state
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null); // Reference to local stream
    const signalingServerUrl = 'ws://localhost:8080'; // Replace with your signaling server URL
    const callTimeoutRef = useRef(null); // Ref to handle the 30-second timeout

    useEffect(() => {
        // Initialize WebSocket connection
        const ws = new WebSocket(signalingServerUrl);
        setSignalingServer(ws);

        ws.onopen = () => {
            console.log('Connected to signaling server');
        };

        ws.onclose = () => {
            console.log('Disconnected from signaling server');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            console.log('Received signaling data:', data);
            // Handle incoming signaling messages (e.g., SDP offers/answers, ICE candidates)
        };

        return () => {
            ws.close();
        };
    }, []);

    const createOffer = async () => {
        try {
            // Ensure WebSocket is open before proceeding
            if (!signalingServer || signalingServer.readyState !== WebSocket.OPEN) {
                setStatus('Signaling server is not ready.');
                console.error('WebSocket is not ready.');
                return;
            }

            // Prompt for camera and microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideoRef.current.srcObject = stream;
            localStreamRef.current = stream;

            const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

            const pc = new RTCPeerConnection(configuration);
            setPeerConnection(pc);

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    signalingServer.send(JSON.stringify({ candidate: event.candidate }));
                }
            };

            pc.ontrack = (event) => {
                remoteVideoRef.current.srcObject = event.streams[0];
                clearTimeout(callTimeoutRef.current); // Clear timeout when remote stream is received
                setStatus('In Call'); // Update status when remote stream starts
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            signalingServer.send(JSON.stringify({ sdp: offer }));

            setIsCalling(true);
            setStatus('Calling...'); // Update status to "Calling..."

            // Set a 30-second timeout to handle failure to connect
            callTimeoutRef.current = setTimeout(() => {
                setError('Failed to connect within 30 seconds.');
                hangUpCall(); // Hang up and reset state
            }, 30000); // 30 seconds
        } catch (error) {
            console.error('Error accessing media devices:', error);
            setStatus('Error accessing media devices'); // Handle error state
        }
    };

    const hangUpCall = () => {
        // Stop all local media tracks to disable the camera and microphone
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null; // Clear the reference to the local stream
        }

        if (peerConnection) {
            peerConnection.close();
            setPeerConnection(null);
        }

        setIsCalling(false);
        setIsCamEnabled(true); // Reset camera control to enabled
        setIsMicEnabled(true); // Reset mic control to enabled
        setStatus('Call ended'); // Update status when the call ends
        setError(null); // Clear any previous errors
    };

    const toggleCamera = () => {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamEnabled(videoTrack.enabled);
    };

    const toggleMic = () => {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicEnabled(audioTrack.enabled);
    };

    return (
        <div className="flex flex-col items-center space-y-6 mt-10">
            {/* Video section */}
            <div className="flex justify-center space-x-6">
                <div className="text-center">
                    <h3 className="text-lg font-bold">Local Video</h3>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className="border-2 border-gray-300 rounded-lg w-64 h-36"
                    ></video>
                    <p className="mt-2 text-gray-600">{isCalling ? 'In Call' : status}</p> {/* Local video status */}
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold">Remote Video</h3>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        className="border-2 border-gray-300 rounded-lg w-64 h-36"
                    ></video>
                    <p className="mt-2 text-gray-600">{status}</p> {/* Remote video status */}
                </div>
            </div>

            {/* Display error message if any */}
            {error && <p className="text-red-600">{error}</p>}

            {/* Call Controls */}
            <div className="flex space-x-4 mt-6">
                {/* Start Call Button */}
                <button
                    onClick={createOffer}
                    className={`rounded-full w-16 h-16 bg-green-500 flex justify-center items-center text-white shadow-lg transition ${
                        isCalling ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isCalling}
                >
                    <PhoneIcon style={{ fontSize: 28 }} />
                </button>

                {/* End Call Button */}
                <button
                    onClick={hangUpCall}
                    className="rounded-full w-16 h-16 bg-red-500 flex justify-center items-center text-white shadow-lg transition"
                    disabled={!isCalling}
                >
                    <CallEndIcon style={{ fontSize: 28 }} />
                </button>
            </div>

            {/* Camera and Microphone Controls */}
            <div className="flex space-x-4 mt-6">
                {/* Toggle Camera Button */}
                <button
                    onClick={toggleCamera}
                    className={`rounded-full w-16 h-16 flex justify-center items-center text-white shadow-lg transition ${
                        isCamEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500'
                    }`}
                    disabled={!isCalling}  // Disable before the call starts
                >
                    {isCamEnabled ? <VideocamIcon style={{ fontSize: 28 }} /> : <VideocamOffIcon style={{ fontSize: 28 }} />}
                </button>

                {/* Toggle Microphone Button */}
                <button
                    onClick={toggleMic}
                    className={`rounded-full w-16 h-16 flex justify-center items-center text-white shadow-lg transition ${
                        isMicEnabled ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-500'
                    }`}
                    disabled={!isCalling}  // Disable before the call starts
                >
                    {isMicEnabled ? <MicIcon style={{ fontSize: 28 }} /> : <MicOffIcon style={{ fontSize: 28 }} />}
                </button>
            </div>
        </div>
    );
};

export default WebRTC;
