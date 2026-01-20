import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { CallEnd, Mic, MicOff, Videocam, VideocamOff, OpenInFull, CloseFullscreen } from '@mui/icons-material';

// Cấu hình STUN Server (Để kết nối peer-to-peer)
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

interface VideoCallProps {
    open: boolean;
    onClose: () => void;
    myEmail: string;
    targetEmail: string;
    stompClient: any;
    isIncoming: boolean;
    signalData?: any;
    minimized?: boolean; // Trạng thái thu nhỏ
    onToggleMinimize?: () => void; // Hàm bật/tắt thu nhỏ
}

const VideoCallWindow = ({
                             open, onClose, myEmail, targetEmail, stompClient,
                             isIncoming, signalData, minimized = false, onToggleMinimize
                         }: VideoCallProps) => {

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [status, setStatus] = useState("Đang kết nối...");

    // 1. Khởi tạo Peer Connection
    useEffect(() => {
        if (!open) return;

        const startCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                const peer = new RTCPeerConnection(rtcConfig);
                peerRef.current = peer;

                stream.getTracks().forEach(track => peer.addTrack(track, stream));

                peer.ontrack = (event) => {
                    if (remoteVideoRef.current && event.streams[0]) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        setStatus(""); // Xóa chữ đang kết nối khi đã thấy video
                    }
                };

                peer.onicecandidate = (event) => {
                    if (event.candidate) sendSignal("ICE_CANDIDATE", event.candidate);
                };

                if (isIncoming && signalData) {
                    await peer.setRemoteDescription(new RTCSessionDescription(signalData));
                    const answer = await peer.createAnswer();
                    await peer.setLocalDescription(answer);
                    sendSignal("ANSWER", answer);
                } else {
                    const offer = await peer.createOffer();
                    await peer.setLocalDescription(offer);
                    sendSignal("OFFER", offer);
                }

            } catch (err) {
                console.error("Lỗi media:", err);
                setStatus("Lỗi Camera/Mic");
            }
        };

        startCall();

        return () => {
            const stream = localVideoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
            peerRef.current?.close();
        };
    }, [open]);

    // Giữ connection khi props thay đổi
    useEffect(() => {}, [minimized]);

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

    // Expose hàm xử lý tín hiệu
    // @ts-ignore
    window.handleVideoSignal = async (signal: any) => {
        const peer = peerRef.current;
        if (!peer) return;

        if (signal.type === "ANSWER") {
            await peer.setRemoteDescription(new RTCSessionDescription(signal.data));
        } else if (signal.type === "ICE_CANDIDATE") {
            try { await peer.addIceCandidate(new RTCIceCandidate(signal.data)); } catch (e) {}
        } else if (signal.type === "HANGUP") {
            onClose(); // Bên kia tắt thì mình cũng tắt
        }
    };

    const toggleMic = () => {
        const stream = localVideoRef.current?.srcObject as MediaStream;
        stream?.getAudioTracks().forEach(t => t.enabled = !micOn);
        setMicOn(!micOn);
    };

    const toggleCam = () => {
        const stream = localVideoRef.current?.srcObject as MediaStream;
        stream?.getVideoTracks().forEach(t => t.enabled = !camOn);
        setCamOn(!camOn);
    };

    const handleHangup = () => {
        sendSignal("HANGUP", {});
        onClose();
    };

    if (!open) return null;

    return (
        <Box sx={{
            position: 'fixed',
            // Logic vị trí:
            top: minimized ? 'auto' : 0,
            left: minimized ? 'auto' : 0,
            bottom: minimized ? 20 : 0,
            right: minimized ? 20 : 0,
            width: minimized ? 320 : '100vw',
            height: minimized ? 240 : '100vh',
            // Z-Index cực cao để đè lên mọi thứ khác
            zIndex: 14000,
            bgcolor: 'black',
            borderRadius: minimized ? 3 : 0,
            boxShadow: minimized ? '0 8px 32px rgba(0,0,0,0.5)' : 'none',
            border: minimized ? '2px solid white' : 'none',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>

            {/* CONTAINER VIDEO (Chiếm toàn bộ diện tích) */}
            <Box sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#000' }}>

                {/* 1. REMOTE VIDEO (Full màn hình) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover' // Đảm bảo video luôn lấp đầy khung
                    }}
                />

                {/* Chữ trạng thái (nếu đang kết nối) */}
                {status && (
                    <Typography sx={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        color: 'white', bgcolor: 'rgba(0,0,0,0.6)', p: 1, borderRadius: 1, zIndex: 2
                    }}>
                        {status}
                    </Typography>
                )}

                {/* 2. LOCAL VIDEO (Góc phải trên) */}
                <Box sx={{
                    position: 'absolute',
                    top: 10, right: 10,
                    width: minimized ? 80 : 150,
                    height: minimized ? 60 : 100,
                    bgcolor: '#333', borderRadius: 2,
                    overflow: 'hidden', border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: 3,
                    zIndex: 3 // Cao hơn remote video
                }}>
                    <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>

                {/* 3. NÚT THU NHỎ (Góc trái trên) */}
                {onToggleMinimize && (
                    <IconButton
                        onClick={onToggleMinimize}
                        sx={{
                            position: 'absolute', top: 10, left: 10,
                            color: 'white', bgcolor: 'rgba(0,0,0,0.3)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                            zIndex: 4
                        }}
                    >
                        {minimized ? <OpenInFull /> : <CloseFullscreen />}
                    </IconButton>
                )}

                {/* 4. THANH ĐIỀU KHIỂN (Luôn nổi ở dưới đáy) */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: minimized ? 50 : 80,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: minimized ? 1 : 3,
                    bgcolor: 'rgba(0,0,0,0.6)', // Nền đen mờ
                    backdropFilter: 'blur(5px)',
                    zIndex: 5 // Quan trọng: Luôn cao hơn video
                }}>
                    <IconButton onClick={toggleMic} size={minimized ? "small" : "medium"} sx={{ bgcolor: micOn ? 'rgba(255,255,255,0.2)' : '#f44336', color: 'white' }}>
                        {micOn ? <Mic fontSize={minimized ? "small" : "medium"} /> : <MicOff fontSize={minimized ? "small" : "medium"} />}
                    </IconButton>

                    <IconButton onClick={handleHangup} size={minimized ? "small" : "medium"} sx={{ bgcolor: '#d32f2f', color: 'white', px: minimized ? 2 : 4 }}>
                        <CallEnd fontSize={minimized ? "small" : "medium"} />
                    </IconButton>

                    <IconButton onClick={toggleCam} size={minimized ? "small" : "medium"} sx={{ bgcolor: camOn ? 'rgba(255,255,255,0.2)' : '#f44336', color: 'white' }}>
                        {camOn ? <Videocam fontSize={minimized ? "small" : "medium"} /> : <VideocamOff fontSize={minimized ? "small" : "medium"} />}
                    </IconButton>
                </Box>

            </Box>
        </Box>
    );
};

export default VideoCallWindow;