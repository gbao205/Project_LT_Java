import React, { useEffect, useRef, useState } from 'react';
import {
    Dialog, Box, IconButton, Typography, Fab, Tooltip
} from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import RemoveIcon from '@mui/icons-material/Remove'; // Icon thu nhỏ
import OpenInFullIcon from '@mui/icons-material/OpenInFull'; // Icon phóng to

interface VideoCallProps {
    open: boolean;
    onClose: () => void;
    myEmail: string;
    targetEmail: string;
    stompClient: any;
    isIncoming: boolean;
    signalData: any;
    minimized: boolean;
    onToggleMinimize: () => void;
}

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

const VideoCallWindow: React.FC<VideoCallProps> = ({
                                                       open, onClose, myEmail, targetEmail, stompClient, isIncoming, signalData, minimized, onToggleMinimize
                                                   }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    // [FIX 2] Hàng đợi lưu ICE Candidate khi Remote Description chưa sẵn sàng
    const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [status, setStatus] = useState("Đang kết nối...");

    // Hàm hỗ trợ xử lý hàng đợi ICE
    const processIceQueue = async () => {
        const pc = peerConnection.current;
        if (!pc || !pc.remoteDescription) return;

        while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            if (candidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Lỗi thêm ICE từ hàng đợi:", e);
                }
            }
        }
    };

    // 1. Khởi tạo PeerConnection & Media
    useEffect(() => {
        if (!open) return;

        // [FIX 1] Biến cờ kiểm tra component còn mount hay không
        let isMounted = true;

        const init = async () => {
            try {
                // Tạo PeerConnection
                const pc = new RTCPeerConnection(configuration);
                peerConnection.current = pc;

                // Lắng nghe ICE Candidate
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        sendSignal('ICE_CANDIDATE', event.candidate);
                    }
                };

                // Lắng nghe Remote Stream
                pc.ontrack = (event) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                // Lắng nghe trạng thái kết nối
                pc.onconnectionstatechange = () => {
                    if (!isMounted) return;
                    switch(pc.connectionState) {
                        case 'connected': setStatus("Đã kết nối"); break;
                        case 'disconnected': setStatus("Mất kết nối"); break;
                        case 'failed': setStatus("Kết nối thất bại"); break;
                        case 'closed': setStatus("Đã kết thúc"); break;
                    }
                };

                // Lấy Local Stream (Async)
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                // [FIX 1] Kiểm tra nếu component đã bị unmount hoặc PC đã đóng thì dừng ngay
                if (!isMounted || pc.signalingState === 'closed') {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Add Tracks to PC
                stream.getTracks().forEach(track => {
                    // Kiểm tra an toàn lần nữa
                    if (pc.signalingState !== 'closed') {
                        pc.addTrack(track, stream);
                    }
                });

                // LOGIC GỌI / NHẬN
                if (isIncoming && signalData) {
                    // Người nhận (Callee)
                    setStatus("Đang xử lý cuộc gọi...");
                    await pc.setRemoteDescription(new RTCSessionDescription(signalData));

                    // [FIX 2] Xử lý ICE queue ngay sau khi set remote description thành công
                    await processIceQueue();

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    sendSignal('ANSWER', answer);
                } else {
                    // Người gọi (Caller)
                    setStatus("Đang gọi...");
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    sendSignal('OFFER', offer);
                }

            } catch (err) {
                console.error("Lỗi khởi tạo Video Call:", err);
                if (isMounted) setStatus("Lỗi khởi tạo media");
            }
        };

        init();

        // Cleanup function
        return () => {
            isMounted = false; // Đánh dấu đã unmount
            endCall(false); // False để không gửi tín hiệu HANGUP lần nữa khi unmount
        };
    }, [open]);

    // 2. Gửi tín hiệu qua WebSocket
    const sendSignal = (type: string, data: any) => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: "/app/video.signal",
                body: JSON.stringify({
                    type: type,
                    sender: myEmail,
                    recipient: targetEmail,
                    data: data
                })
            });
        }
    };

    // 3. Xử lý tín hiệu đến (Answer, ICE, Hangup)
    useEffect(() => {
        // @ts-ignore
        window.handleVideoSignal = async (payload: any) => {
            const pc = peerConnection.current;
            if (!pc) return;

            try {
                if (payload.type === 'ANSWER') {
                    // Kiểm tra trạng thái trước khi set Remote Description
                    if (pc.signalingState === 'stable') {
                        console.log("WebRTC đã kết nối, bỏ qua tín hiệu ANSWER trùng lặp.");
                        return;
                    }
                    if (pc.signalingState === 'have-local-offer') {
                        await pc.setRemoteDescription(new RTCSessionDescription(payload.data));
                        // [FIX 2] Xử lý hàng đợi ICE sau khi nhận Answer
                        await processIceQueue();
                    }
                }
                else if (payload.type === 'ICE_CANDIDATE') {
                    if (payload.data) {
                        // [FIX 2] Kiểm tra Remote Description
                        if (pc.remoteDescription && pc.remoteDescription.type) {
                            // Nếu đã có Remote Description, add luôn
                            await pc.addIceCandidate(new RTCIceCandidate(payload.data));
                        } else {
                            // Nếu chưa có, đưa vào hàng đợi chờ
                            console.log("Remote chưa sẵn sàng, queue ICE candidate");
                            iceCandidatesQueue.current.push(payload.data);
                        }
                    }
                }
                else if (payload.type === 'HANGUP') {
                    endCall(false);
                    onClose();
                    alert("Cuộc gọi đã kết thúc.");
                }
            } catch (error) {
                console.error("Lỗi xử lý tín hiệu Video:", error);
            }
        };

        return () => {
            // @ts-ignore
            window.handleVideoSignal = null;
        };
    }, []);

    const endCall = (notify: boolean = true) => {
        if (notify) sendSignal('HANGUP', {});

        // Stop tracks
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        if (peerConnection.current) {
            // Kiểm tra trạng thái trước khi đóng để tránh lỗi dư thừa
            if (peerConnection.current.signalingState !== 'closed') {
                peerConnection.current.close();
            }
            peerConnection.current = null;
        }
        if (notify) onClose();
    };

    const toggleMic = () => {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getAudioTracks().forEach(track => track.enabled = !micOn);
            setMicOn(!micOn);
        }
    };

    const toggleCam = () => {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(track => track.enabled = !cameraOn);
            setCameraOn(!cameraOn);
        }
    };

    // --- GIAO DIỆN THU NHỎ ---
    if (minimized) {
        return (
            <Fab
                color="secondary"
                variant="extended"
                size="medium"
                onClick={onToggleMinimize}
                sx={{
                    position: 'fixed',
                    bottom: 160,
                    right: 24,
                    zIndex: 1301,
                    fontWeight: 'bold',
                    boxShadow: 3
                }}
            >
                <VideocamIcon sx={{ mr: 1 }} />
                Đang gọi: {targetEmail.split('@')[0]}
                <OpenInFullIcon sx={{ ml: 1, fontSize: 16 }} />
            </Fab>
        );
    }

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={() => {}} // Không đóng khi bấm ra ngoài
        >
            <Box sx={{
                height: '100vh',
                bgcolor: '#202124',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <Box sx={{
                    p: 2,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'
                }}>
                    <Typography variant="h6" color="white" sx={{ textShadow: '1px 1px 2px black' }}>
                        {status} | {targetEmail}
                    </Typography>
                    <Tooltip title="Thu nhỏ màn hình">
                        <IconButton onClick={onToggleMinimize} sx={{ color: 'white' }}>
                            <RemoveIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Remote Video (Full Screen) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />

                {/* Local Video (PIP) */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 100,
                    right: 20,
                    width: 160,
                    height: 120,
                    bgcolor: 'black',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3,
                    border: '2px solid white'
                }}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </Box>

                {/* Controls */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 3,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    p: 1.5,
                    borderRadius: 8
                }}>
                    <Fab color={micOn ? "default" : "error"} onClick={toggleMic}>
                        {micOn ? <MicIcon /> : <MicOffIcon />}
                    </Fab>
                    <Fab color="error" onClick={() => endCall(true)} size="large">
                        <CallEndIcon />
                    </Fab>
                    <Fab color={cameraOn ? "default" : "error"} onClick={toggleCam}>
                        {cameraOn ? <VideocamIcon /> : <VideocamOffIcon />}
                    </Fab>
                </Box>
            </Box>
        </Dialog>
    );
};

export default VideoCallWindow;