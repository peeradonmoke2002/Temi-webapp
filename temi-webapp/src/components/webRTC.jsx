import React, { useRef, useState, useEffect } from 'react';
import PhoneIcon from '@mui/icons-material/Phone';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

// const WebRTC = () => {
//     const [peerConnection, setPeerConnection] = useState(null);
//     const [isCalling, setIsCalling] = useState(false);
//     const [isCamEnabled, setIsCamEnabled] = useState(true);
//     const [isMicEnabled, setIsMicEnabled] = useState(true);
//     const [signalingServer, setSignalingServer] = useState(null);
//     const [status, setStatus] = useState('Waiting to start call');
//     const [error, setError] = useState(null);
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);
//     const localStreamRef = useRef(null);
//     const signalingServerUrl = 'ws://192.168.1.108:8080'; // Replace with your WebSocket signaling server URL
//     const callTimeoutRef = useRef(null);

//     useEffect(() => {
//         // Initialize WebSocket connection
//         const ws = new WebSocket(signalingServerUrl);
//         setSignalingServer(ws);

//         ws.onopen = () => {
//             console.log('Connected to signaling server');
//         };

//         ws.onclose = () => {
//             console.log('Disconnected from signaling server');
//         };

//         ws.onerror = (error) => {
//             console.error('WebSocket error:', error);
//         };

//         ws.onmessage = async (message) => {
//             const data = typeof message.data === 'string' ? JSON.parse(message.data) : {};
//             console.log('Received signaling data:', data);

//             if (data.sdp) {
//                 if (data.sdp.type === 'offer') {
//                     await handleOffer(data.sdp);
//                 } else if (data.sdp.type === 'answer') {
//                     await handleAnswer(data.sdp);
//                 }
//             } else if (data.candidate) {
//                 await handleIceCandidate(data.candidate);
//             }
//         };

//         return () => {
//             ws.close();
//         };
//     }, []);

//     const createOffer = async () => {
//         try {
//             if (!signalingServer || signalingServer.readyState !== WebSocket.OPEN) {
//                 setStatus('Signaling server is not ready.');
//                 return;
//             }

//             const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//             console.log('Local stream obtained', stream);
//             localVideoRef.current.srcObject = stream;
//             localStreamRef.current = stream;

//             const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
//             const pc = new RTCPeerConnection(configuration);
//             setPeerConnection(pc);

//             stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//             pc.onicecandidate = (event) => {
//                 if (event.candidate) {
//                     signalingServer.send(JSON.stringify({ candidate: event.candidate }));
//                 }
//             };

//             pc.ontrack = (event) => {
//                 if (event.streams && event.streams[0] && remoteVideoRef.current) {
//                     remoteVideoRef.current.srcObject = event.streams[0];
//                     setStatus('In Call');
//                 }
//             };

//             const offer = await pc.createOffer();
//             await pc.setLocalDescription(offer);
//             signalingServer.send(JSON.stringify({ sdp: offer }));

//             setIsCalling(true);
//             setStatus('Calling...');
            
//             // Set timeout to handle call failure
//             callTimeoutRef.current = setTimeout(() => {
//                 setError('Failed to connect within 30 seconds.');
//                 hangUpCall();
//             }, 30000);
//         } catch (error) {
//             console.error('Error accessing media devices:', error);
//             setStatus('Error accessing media devices');
//         }
//     };

//     const handleOffer = async (offer) => {
//         console.log('Handling offer:', offer);
//         try {
//             const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
//             const pc = peerConnection || new RTCPeerConnection(configuration);

//             pc.ontrack = (event) => {
//                 if (event.streams && event.streams[0]) {
//                     remoteVideoRef.current.srcObject = event.streams[0];
//                     setStatus('In Call');
//                 }
//             };

//             pc.onicecandidate = (event) => {
//                 if (event.candidate) {
//                     signalingServer.send(JSON.stringify({ candidate: event.candidate }));
//                 }
//             };

//             if (!localStreamRef.current) {
//                 const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//                 localVideoRef.current.srcObject = stream;
//                 localStreamRef.current = stream;
//                 stream.getTracks().forEach((track) => pc.addTrack(track, stream));
//             }

//             await pc.setRemoteDescription(new RTCSessionDescription(offer));
//             const answer = await pc.createAnswer();
//             await pc.setLocalDescription(answer);
//             signalingServer.send(JSON.stringify({ sdp: answer }));

//             setPeerConnection(pc);
//         } catch (error) {
//             console.error('Error handling offer:', error);
//         }
//     };

//     const handleAnswer = async (answer) => {
//         if (peerConnection) {
//             await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//     };

//     const handleIceCandidate = async (candidate) => {
//         if (peerConnection) {
//             await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//     };

//     const hangUpCall = () => {
//         console.log('Hanging up call');
//         if (localStreamRef.current) {
//             localStreamRef.current.getTracks().forEach((track) => track.stop());
//             localStreamRef.current = null;
//         }

//         if (peerConnection) {
//             peerConnection.close();
//             setPeerConnection(null);
//         }

//         setIsCalling(false);
//         setIsCamEnabled(true);
//         setIsMicEnabled(true);
//         setStatus('Call ended');
//         setError(null);
//     };

//     const toggleCamera = () => {
//         const videoTrack = localStreamRef.current.getVideoTracks()[0];
//         videoTrack.enabled = !videoTrack.enabled;
//         setIsCamEnabled(videoTrack.enabled);
//     };

//     const toggleMic = () => {
//         const audioTrack = localStreamRef.current.getAudioTracks()[0];
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsMicEnabled(audioTrack.enabled);
//     };

//     return (
//         <div className="flex flex-col items-center space-y-6 mt-10">
//             <div className="flex justify-center space-x-6">
//                 <div className="text-center">
//                     <h3 className="text-lg font-bold">Local Video</h3>
//                     <video
//                         ref={localVideoRef}
//                         autoPlay
//                         muted
//                         className="border-2 border-gray-300 rounded-lg w-64 h-36"
//                     ></video>
//                     <p className="mt-2 text-gray-600">{isCalling ? 'In Call' : status}</p>
//                 </div>
//                 <div className="text-center">
//                     <h3 className="text-lg font-bold">Remote Video</h3>
//                     <video
//                         ref={remoteVideoRef}
//                         autoPlay
//                         className="border-2 border-gray-300 rounded-lg w-64 h-36"
//                     ></video>
//                     <p className="mt-2 text-gray-600">{status}</p>
//                 </div>
//             </div>

//             {error && <p className="text-red-600">{error}</p>}

//             <div className="flex space-x-4 mt-6">
//                 <button
//                     onClick={createOffer}
//                     className={`rounded-full w-16 h-16 bg-green-500 flex justify-center items-center text-white shadow-lg transition ${
//                         isCalling ? 'opacity-50 cursor-not-allowed' : ''
//                     }`}
//                     disabled={isCalling}
//                 >
//                     <PhoneIcon style={{ fontSize: 28 }} />
//                 </button>

//                 <button
//                     onClick={hangUpCall}
//                     className="rounded-full w-16 h-16 bg-red-500 flex justify-center items-center text-white shadow-lg transition"
//                     disabled={!isCalling}
//                 >
//                     <CallEndIcon style={{ fontSize: 28 }} />
//                 </button>
//             </div>

//             <div className="flex space-x-4 mt-6">
//                 <button
//                     onClick={toggleCamera}
//                     className={`rounded-full w-16 h-16 flex justify-center items-center text-white shadow-lg transition ${
//                         isCamEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500'
//                     }`}
//                     disabled={!isCalling}
//                 >
//                     {isCamEnabled ? <VideocamIcon style={{ fontSize: 28 }} /> : <VideocamOffIcon style={{ fontSize: 28 }} />}
//                 </button>

//                 <button
//                     onClick={toggleMic}
//                     className={`rounded-full w-16 h-16 flex justify-center items-center text-white shadow-lg transition ${
//                         isMicEnabled ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-500'
//                     }`}
//                     disabled={!isCalling}
//                 >
//                     {isMicEnabled ? <MicIcon style={{ fontSize: 28 }} /> : <MicOffIcon style={{ fontSize: 28 }} />}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default WebRTC;






const WebRTC = () => {
    const [peerConnection, setPeerConnection] = useState(null);
    const [queuedCandidates, setQueuedCandidates] = useState([]); // Queue for ICE candidates
    const [signalingServer, setSignalingServer] = useState(null);
    const remoteVideoRef = useRef(null);
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const [isCalling, setIsCalling] = useState(false);
    const [isCamEnabled, setIsCamEnabled] = useState(true);
    const [isMicEnabled, setIsMicEnabled] = useState(true);

    const signalingServerUrl = 'ws://192.168.1.108:8080'; // Replace with your WebSocket URL
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

    // Set up WebSocket signaling server
    useEffect(() => {
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

        ws.onmessage = async (message) => {
            console.log('Received message:', message.data);
            let data = {};

            if (message.data instanceof Blob) {
                const text = await message.data.text();
                try {
                    data = JSON.parse(text);
                    console.log('Parsed signaling data:', data);
                } catch (error) {
                    console.error('Error parsing JSON from Blob:', error);
                }
            } else if (typeof message.data === 'string') {
                try {
                    data = JSON.parse(message.data);
                    console.log('Parsed signaling data:', data);
                } catch (error) {
                    console.error('Error parsing string message as JSON:', error);
                }
            }

            if (data.candidate) {
                handleIceCandidate(data.candidate);
            } else if (data.sdp) {
                if (data.sdp.type === 'offer') {
                    handleOffer(data.sdp);
                } else if (data.sdp.type === 'answer') {
                    handleAnswer(data.sdp);
                }
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const createOffer = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;
    
        const pc = new RTCPeerConnection(configuration);
        setPeerConnection(pc);
    
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                signalingServer.send(JSON.stringify({ candidate: event.candidate }));
            }
        };
    
        pc.ontrack = (event) => {
            if (event.streams && event.streams.length > 0) {
                remoteVideoRef.current.srcObject = event.streams[0];
            } else {
                console.error('No remote stream found on event');
            }
        };
    
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        signalingServer.send(JSON.stringify({ sdp: offer }));
        setIsCalling(true);
    };

    // On the remote peer
    const handleOffer = async (offer) => {
        const pc = new RTCPeerConnection(configuration);
        setPeerConnection(pc);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                signalingServer.send(JSON.stringify({ candidate: event.candidate }));
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            } else {
                console.error('No remote stream found on event');
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signalingServer.send(JSON.stringify({ sdp: answer }));
    };

    const handleAnswer = async (answer) => {
        if (peerConnection) {
            console.log('Handling answer:', answer);
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    // Handle incoming ICE candidates
    const handleIceCandidate = async (candidate) => {
        if (peerConnection) {
            console.log('Adding ICE candidate:', candidate);
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
            console.log('Queuing candidate until peer connection is established');
            setQueuedCandidates((prev) => [...prev, candidate]);
        }
    };

    // End the call
    const hangUpCall = () => {
        console.log('Ending call...');
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        if (peerConnection) {
            peerConnection.close();
            setPeerConnection(null);
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setIsCalling(false);
        console.log('Call ended');
    };

    // Toggle camera
    const toggleCamera = () => {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamEnabled(videoTrack.enabled);
    };

    // Toggle microphone
    const toggleMicrophone = () => {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicEnabled(audioTrack.enabled);
    };

    return (
        <div className="flex flex-col items-center space-y-6 mt-10">
            <div className="flex justify-center space-x-6">
                <div className="text-center">
                    <h3 className="text-lg font-bold">Local Video</h3>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="border-2 border-gray-300 rounded-lg w-64 h-36"
                    ></video>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold">Remote Video</h3>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="border-2 border-gray-300 rounded-lg w-64 h-36"
                    ></video>
                </div>
            </div>

            <div className="flex space-x-4 mt-6">
                <button
                    onClick={createOffer}
                    className="rounded-full w-16 h-16 bg-green-500 flex justify-center items-center text-white shadow-lg transition"
                    disabled={isCalling}
                >
                    <PhoneIcon style={{ fontSize: 28 }} />
                </button>

                <button
                    onClick={hangUpCall}
                    className="rounded-full w-16 h-16 bg-red-500 flex justify-center items-center text-white shadow-lg transition"
                    disabled={!isCalling}
                >
                    <CallEndIcon style={{ fontSize: 28 }} />
                </button>
            </div>

            <div className="flex space-x-4 mt-6">
                <button
                    onClick={toggleCamera}
                    className={`rounded-full w-16 h-16 flex justify-center items-center text-white shadow-lg transition ${
                        isCamEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500'
                    }`}
                    disabled={!isCalling}
                >
                    {isCamEnabled ? <VideocamIcon style={{ fontSize: 28 }} /> : <VideocamOffIcon style={{ fontSize: 28 }} />}
                </button>

                <button
                    onClick={toggleMicrophone}
                    className={`rounded-full w-16 h-16 flex justify-center items-center text-white shadow-lg transition ${
                        isMicEnabled ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-500'
                    }`}
                    disabled={!isCalling}
                >
                    {isMicEnabled ? <MicIcon style={{ fontSize: 28 }} /> : <MicOffIcon style={{ fontSize: 28 }} />}
                </button>
            </div>
        </div>
    );
};

export default WebRTC;