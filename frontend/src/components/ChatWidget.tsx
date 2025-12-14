import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    Box, TextField, IconButton, Paper, Typography, Fab, Tooltip, Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// Component nhận vào teamId và màu chủ đạo (themeColor)
const ChatWidget = ({ teamId, themeColor }: { teamId: number, themeColor: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const messagesEndRef = useRef<div | null>(null);

    // Lấy user an toàn
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Tự cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    useEffect(() => {
        if (!isOpen || !user.email) return;

        // 1. Load tin nhắn cũ
        axios.get(`http://localhost:8080/api/chat/${teamId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => setMessages(res.data)).catch(console.error);

        // 2. Kết nối WebSocket
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/topic/team/${teamId}`, (msg) => {
                    if (msg.body) setMessages(prev => [...prev, JSON.parse(msg.body)]);
                });
            },
        });
        client.activate();
        setStompClient(client);

        return () => { client.deactivate(); };
    }, [isOpen, teamId]);

    const handleSend = () => {
        if (stompClient && input.trim()) {
            stompClient.publish({
                destination: `/app/chat/${teamId}`,
                body: JSON.stringify({ senderEmail: user.email, content: input })
            });
            setInput("");
        }
    };

    if (!user.email) return null;

    return (
        <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
            {/* Nút mở Chat (Màu theo role) */}
            {!isOpen && (
                <Tooltip title="Thảo luận nhóm">
                    <Fab sx={{ bgcolor: themeColor, color: 'white', '&:hover': { bgcolor: themeColor } }} onClick={() => setIsOpen(true)}>
                        <ChatIcon />
                    </Fab>
                </Tooltip>
            )}

            {/* Khung Chat */}
            {isOpen && (
                <Paper elevation={6} sx={{ width: 320, height: 450, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
                    {/* Header */}
                    <Box sx={{ p: 2, bgcolor: themeColor, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="bold">Team Chat {teamId}</Typography>
                        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                    </Box>

                    {/* List Tin nhắn */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderEmail === user.email;
                            return (
                                <Box key={idx} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                        {isMe ? 'Bạn' : msg.senderEmail.split('@')[0]}
                                    </Typography>
                                    <Paper sx={{
                                        p: 1.5, borderRadius: 2,
                                        bgcolor: isMe ? themeColor : 'white',
                                        color: isMe ? 'white' : 'text.primary',
                                        borderTopRightRadius: isMe ? 0 : 2,
                                        borderTopLeftRadius: isMe ? 2 : 0
                                    }}>
                                        <Typography variant="body2">{msg.content}</Typography>
                                    </Paper>
                                </Box>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input */}
                    <Box sx={{ p: 1.5, bgcolor: 'white', display: 'flex', gap: 1, borderTop: '1px solid #eee' }}>
                        <TextField
                            fullWidth size="small" placeholder="Nhập tin nhắn..."
                            value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <IconButton onClick={handleSend} sx={{ color: themeColor }}><SendIcon /></IconButton>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default ChatWidget;