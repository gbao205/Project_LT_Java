import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Paper, IconButton, Typography,
    TextField, Fab, Tooltip, Zoom, Avatar, Badge,
    List, ListItem, ListItemAvatar, ListItemText, Divider
} from '@mui/material';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Icons
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIcon from '@mui/icons-material/Circle';

const ChatWidget = () => {
    // --- STATE ĐIỀU KHIỂN UI ---
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'CONTACTS' | 'CHAT'>('CONTACTS');

    // --- STATE DỮ LIỆU ---
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [msgInput, setMsgInput] = useState("");
    const [connected, setConnected] = useState(false);

    // --- THÔNG TIN USER & THÔNG BÁO ---
    const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
    const [myEmail, setMyEmail] = useState("");
    const [token, setToken] = useState("");

    const clientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Khởi tạo dữ liệu User khi Component mount
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const tokenStr = localStorage.getItem('token');
        if (userStr && tokenStr) {
            const userObj = JSON.parse(userStr);
            setMyEmail(userObj.email);
            setToken(tokenStr);
            loadContacts(tokenStr);
        }
    }, []);

    // 2. Tải danh sách những người được phép chat (theo Role)
    const loadContacts = async (authToken: string) => {
        try {
            const res = await axios.get('http://localhost:8080/api/users/contacts', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setContacts(res.data);
        } catch (error) {
            console.error("Lỗi khi tải danh bạ:", error);
        }
    };

    // 3. Tải lịch sử chat riêng tư giữa 2 người (từ MongoDB)
    const loadPrivateHistory = async (otherEmail: string) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/chat/history/private`, {
                params: {
                    me: myEmail,
                    other: otherEmail
                }
            });
            if (res.data) setMessages(res.data);
        } catch (error) {
            console.error("Lỗi khi tải lịch sử chat:", error);
        }
    };

    // 4. Thiết lập kết nối WebSocket Real-time
    useEffect(() => {
        if (!myEmail) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                // Đăng ký nhận tin nhắn tại kênh riêng tư của mình
                client.subscribe(`/topic/private/${myEmail}`, (message) => {
                    const body = JSON.parse(message.body);

                    // A. Tự động đẩy người vừa nhắn lên đầu danh sách danh bạ
                    setContacts(prev => {
                        const newContacts = [...prev];
                        const index = newContacts.findIndex(c => c.email === body.sender);
                        if (index > -1) {
                            const sender = newContacts.splice(index, 1)[0];
                            return [sender, ...newContacts];
                        }
                        return prev;
                    });

                    // B. Nếu đang mở đúng khung chat với người gửi, cập nhật tin nhắn ngay
                    if (selectedUser?.email === body.sender) {
                        setMessages(prev => [...prev, body]);
                    }

                    // C. Xử lý Badge thông báo (nếu đang không xem chat với người đó)
                    if (!isOpen || view === 'CONTACTS' || selectedUser?.email !== body.sender) {
                        setUnreadCounts(prev => ({
                            ...prev,
                            [body.sender]: (prev[body.sender] || 0) + 1
                        }));
                        // Phát âm thanh thông báo
                        new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3').play().catch(() => {});
                    }
                });
            },
        });

        client.activate();
        clientRef.current = client;
        return () => clientRef.current?.deactivate();
    }, [myEmail, selectedUser, isOpen, view]);

    // 5. Khi nhấn chọn một người để chat
    const handleSelectUser = (user: any) => {
        setSelectedUser(user);
        setView('CHAT');
        // Xóa thông báo của người này
        setUnreadCounts(prev => ({ ...prev, [user.email]: 0 }));
        // Tải lịch sử chat 1-1
        loadPrivateHistory(user.email);
    };

    // 6. Gửi tin nhắn
    const sendMessage = () => {
        if (clientRef.current?.connected && msgInput.trim() && selectedUser) {
            const chatMessage = {
                sender: myEmail,
                recipient: selectedUser.email,
                content: msgInput,
                type: 'CHAT',
                timestamp: new Date().toISOString()
            };

            // Gửi qua WebSocket
            clientRef.current.publish({
                destination: "/app/chat.sendMessage",
                body: JSON.stringify(chatMessage)
            });

            // Cập nhật giao diện của chính mình ngay lập tức
            setMessages(prev => [...prev, chatMessage]);
            setMsgInput("");

            // Đẩy người mình vừa nhắn lên đầu danh sách của mình
            setContacts(prev => {
                const newContacts = [...prev];
                const index = newContacts.findIndex(c => c.email === selectedUser.email);
                if (index > -1) {
                    const recipient = newContacts.splice(index, 1)[0];
                    return [recipient, ...newContacts];
                }
                return prev;
            });
        }
    };

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, view]);

    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

    return (
        <>
            <Zoom in={isOpen}>
                <Paper elevation={10} sx={{
                    position: 'fixed', bottom: 100, right: 24,
                    width: 380, height: 550, zIndex: 10000,
                    display: 'flex', flexDirection: 'column',
                    borderRadius: '16px', overflow: 'hidden'
                }}>

                    {/* HEADER */}
                    <Box sx={{ p: 2, bgcolor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box display="flex" alignItems="center">
                            {view === 'CHAT' && (
                                <IconButton size="small" onClick={() => setView('CONTACTS')} sx={{ color: 'white', mr: 1 }}>
                                    <ArrowBackIcon />
                                </IconButton>
                            )}
                            <Typography variant="subtitle1" fontWeight="bold">
                                {view === 'CONTACTS' ? 'Trò chuyện' : selectedUser?.fullName}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                            <RemoveIcon />
                        </IconButton>
                    </Box>

                    {/* VIEW: DANH BẠ (CONTACTS) */}
                    {view === 'CONTACTS' && (
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                            <List>
                                {contacts.length === 0 ? (
                                    <Typography sx={{ p: 3, textAlign: 'center', color: '#999' }}>Không có người liên hệ nào</Typography>
                                ) : (
                                    contacts.map((user) => (
                                        <React.Fragment key={user.id}>
                                            <ListItem button onClick={() => handleSelectUser(user)}>
                                                <ListItemAvatar>
                                                    <Badge badgeContent={unreadCounts[user.email]} color="error">
                                                        <Avatar sx={{ bgcolor: user.role === 'ADMIN' ? '#d32f2f' : '#1976d2' }}>
                                                            {user.fullName?.charAt(0)}
                                                        </Avatar>
                                                    </Badge>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body1" sx={{ fontWeight: unreadCounts[user.email] > 0 ? 'bold' : 'normal' }}>
                                                            {user.fullName}
                                                        </Typography>
                                                    }
                                                    secondary={user.role}
                                                />
                                                {unreadCounts[user.email] > 0 ? (
                                                    <CircleIcon sx={{ fontSize: 12, color: '#f44336' }} />
                                                ) : (
                                                    <CircleIcon sx={{ fontSize: 10, color: '#4caf50' }} />
                                                )}
                                            </ListItem>
                                            <Divider variant="inset" component="li" />
                                        </React.Fragment>
                                    ))
                                )}
                            </List>
                        </Box>
                    )}

                    {/* VIEW: KHUNG CHAT (CHAT) */}
                    {view === 'CHAT' && (
                        <>
                            <Box sx={{ flexGrow: 1, p: 2, bgcolor: '#f5f7fb', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender === myEmail;
                                    return (
                                        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                            <Paper sx={{
                                                p: 1.5,
                                                bgcolor: isMe ? '#007bff' : 'white',
                                                color: isMe ? 'white' : 'black',
                                                borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                maxWidth: '85%',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                            }}>
                                                <Typography variant="body2">{msg.content}</Typography>
                                            </Paper>
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#999', mt: 0.5 }}>
                                                {msg.timestamp ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: vi }) : ''}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* INPUT GỬI TIN */}
                            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth size="small" placeholder="Nhập tin nhắn..."
                                    value={msgInput}
                                    onChange={(e) => setMsgInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
                                />
                                <IconButton color="primary" onClick={sendMessage} disabled={!msgInput.trim() || !connected}>
                                    <SendIcon />
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Paper>
            </Zoom>

            {/* NÚT BÓNG CHAT (FAB) */}
            <Tooltip title="Trò chuyện" placement="left">
                <Fab color="primary" onClick={() => setIsOpen(!isOpen)} sx={{ position: 'fixed', bottom: 90, right: 24, zIndex: 9999 }}>
                    <Badge badgeContent={totalUnread} color="error">
                        {isOpen ? <CloseIcon /> : <ChatBubbleIcon />}
                    </Badge>
                </Fab>
            </Tooltip>
        </>
    );
};

export default ChatWidget;