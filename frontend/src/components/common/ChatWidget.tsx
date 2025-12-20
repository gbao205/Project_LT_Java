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
    // --- STATE UI ---
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'CONTACTS' | 'CHAT'>('CONTACTS');

    // --- STATE DATA ---
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [msgInput, setMsgInput] = useState("");
    const [connected, setConnected] = useState(false);

    // --- THÔNG BÁO ---
    const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
    const [myEmail, setMyEmail] = useState("");
    const [token, setToken] = useState("");

    const clientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Khởi tạo User & Danh bạ
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

    const loadContacts = async (authToken: string) => {
        try {
            const res = await axios.get('http://localhost:8080/api/users/contacts', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setContacts(res.data);
        } catch (error) {
            console.error("Lỗi tải danh bạ:", error);
        }
    };

    const loadChatHistory = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/chat/history');
            if (res.data) setMessages(res.data);
        } catch (error) {
            console.error("Lỗi lịch sử chat:", error);
        }
    };

    // 2. KẾT NỐI WEBSOCKET & XỬ LÝ TIN NHẮN ĐẾN
    useEffect(() => {
        if (!myEmail) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/private/${myEmail}`, (message) => {
                    const body = JSON.parse(message.body);

                    // A. Đẩy người gửi lên đầu danh sách contacts
                    setContacts(prev => {
                        const newContacts = [...prev];
                        const index = newContacts.findIndex(c => c.email === body.sender);
                        if (index > -1) {
                            const sender = newContacts.splice(index, 1)[0];
                            return [sender, ...newContacts];
                        }
                        return prev;
                    });

                    // B. Thêm tin nhắn vào mảng chung
                    setMessages(prev => [...prev, body]);

                    // C. Xử lý thông báo (Badge)
                    // Nếu đang không mở chat với người này thì tăng count
                    if (!isOpen || view === 'CONTACTS' || selectedUser?.email !== body.sender) {
                        setUnreadCounts(prev => ({
                            ...prev,
                            [body.sender]: (prev[body.sender] || 0) + 1
                        }));

                        // Phát tiếng "ting"
                        new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3').play().catch(() => {});
                    }
                });
            },
        });

        client.activate();
        clientRef.current = client;
        return () => clientRef.current?.deactivate();
    }, [myEmail, selectedUser, isOpen, view]);

    // 3. CHỌN NGƯỜI CHAT
    const handleSelectUser = (user: any) => {
        setSelectedUser(user);
        setView('CHAT');
        // Xóa thông báo của người này
        setUnreadCounts(prev => ({ ...prev, [user.email]: 0 }));
        loadChatHistory();
    };

    // 4. GỬI TIN NHẮN
    const sendMessage = () => {
        if (clientRef.current?.connected && msgInput.trim() && selectedUser) {
            const chatMessage = {
                sender: myEmail,
                recipient: selectedUser.email,
                content: msgInput,
                type: 'CHAT',
                timestamp: new Date()
            };
            clientRef.current.publish({
                destination: "/app/chat.sendMessage",
                body: JSON.stringify(chatMessage)
            });
            setMsgInput("");
            // Tự đẩy người mình vừa nhắn lên đầu danh sách của mình
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

    // Tự cuộn xuống dưới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, view]);

    const filteredMessages = messages.filter(msg =>
        (msg.sender === myEmail && msg.recipient === selectedUser?.email) ||
        (msg.sender === selectedUser?.email && msg.recipient === myEmail)
    );

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
                                {view === 'CONTACTS' ? 'Tin nhắn' : selectedUser?.fullName}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                            <RemoveIcon />
                        </IconButton>
                    </Box>

                    {/* VIEW DANH BẠ */}
                    {view === 'CONTACTS' && (
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                            <List>
                                {contacts.map((user) => (
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
                                                primary={<Typography variant="body1" sx={{ fontWeight: unreadCounts[user.email] > 0 ? 'bold' : 'normal' }}>{user.fullName}</Typography>}
                                                secondary={user.role}
                                            />
                                            {unreadCounts[user.email] > 0 ? <CircleIcon sx={{ fontSize: 12, color: '#f44336' }} /> : <CircleIcon sx={{ fontSize: 10, color: '#4caf50' }} />}
                                        </ListItem>
                                        <Divider variant="inset" component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* VIEW KHUNG CHAT */}
                    {view === 'CHAT' && (
                        <>
                            <Box sx={{ flexGrow: 1, p: 2, bgcolor: '#f5f7fb', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {filteredMessages.map((msg, index) => {
                                    const isMe = msg.sender === myEmail;
                                    return (
                                        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                            <Paper sx={{ p: 1.5, bgcolor: isMe ? '#007bff' : 'white', color: isMe ? 'white' : 'black', borderRadius: '12px', maxWidth: '85%' }}>
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
                            <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth size="small" placeholder="Nhập tin nhắn..."
                                    value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                />
                                <IconButton color="primary" onClick={sendMessage} disabled={!msgInput.trim()}><SendIcon /></IconButton>
                            </Box>
                        </>
                    )}
                </Paper>
            </Zoom>

            {/* NÚT FAB CHÍNH */}
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