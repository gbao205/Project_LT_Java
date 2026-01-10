import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Paper, IconButton, Typography, TextField, Fab, Tooltip, Zoom, Avatar, Badge,
    List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Divider
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
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'CONTACTS' | 'CHAT'>('CONTACTS');
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [msgInput, setMsgInput] = useState("");
    const [connected, setConnected] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
    const [myEmail, setMyEmail] = useState("");
    const [token, setToken] = useState("");

    const clientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedUserRef = useRef<any>(null);
    const isOpenRef = useRef(false); // Dùng Ref để theo dõi trạng thái đóng/mở trong callback socket

    useEffect(() => {
        selectedUserRef.current = selectedUser;
        isOpenRef.current = isOpen;
    }, [selectedUser, isOpen]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const tokenStr = localStorage.getItem('token');
        if (userStr && tokenStr) {
            const userObj = JSON.parse(userStr);
            setMyEmail(userObj.email);
            setToken(tokenStr);
            loadContacts(tokenStr);
            syncUnreadCounts(userObj.email, tokenStr);
        }
    }, []);

    const loadContacts = async (authToken: string) => {
        try {
            const res = await axios.get('http://localhost:8080/api/users/contacts', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setContacts(res.data);
        } catch (error) { console.error("Lỗi danh bạ:", error); }
    };

    // MỚI: Đồng bộ số tin nhắn chưa đọc từ Database
    const syncUnreadCounts = async (email: string, authToken: string) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/chat/unread-map?email=${email}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setUnreadCounts(res.data);
        } catch (error) { console.error("Lỗi sync unread:", error); }
    };

    const moveContactToTop = (email: string) => {
        setContacts(prev => {
            const index = prev.findIndex(c => c.email === email);
            if (index === -1) return prev;
            const updated = [...prev];
            const contact = updated.splice(index, 1)[0];
            return [contact, ...updated];
        });
    };

    useEffect(() => {
        if (!myEmail || !token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/private/${myEmail}`, (message) => {
                    const body = JSON.parse(message.body);
                    const chattingWith = selectedUserRef.current?.email;
                    const isWidgetOpen = isOpenRef.current;

                    moveContactToTop(body.sender);

                    // Logic thông báo:
                    // 1. Nếu đang mở khung chat VÀ đang chat với chính người gửi -> Hiển thị tin nhắn & Mark Read
                    if (isWidgetOpen && chattingWith === body.sender) {
                        setMessages(prev => [...prev, body]);
                        axios.post(`http://localhost:8080/api/chat/mark-read`, null, {
                            params: { me: myEmail, other: body.sender },
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    }
                    // 2. Nếu tin nhắn của mình gửi từ thiết bị khác -> Chỉ hiển thị tin nhắn (Echo)
                    else if (body.sender === myEmail) {
                        setMessages(prev => [...prev, body]);
                    }
                    // 3. Trường hợp còn lại (đang đóng widget, hoặc đang chat với người khác) -> Tăng số đỏ
                    else {
                        setUnreadCounts(prev => ({
                            ...prev,
                            [body.sender]: (Number(prev[body.sender]) || 0) + 1
                        }));
                        new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3').play().catch(() => {});
                    }
                });
            },
        });
        client.activate();
        clientRef.current = client;
        return () => clientRef.current?.deactivate();
    }, [myEmail, token]);

    const handleSelectUser = async (user: any) => {
        setMessages([]);
        setSelectedUser(user);
        setView('CHAT');

        // Xóa số đỏ local
        setUnreadCounts(prev => ({ ...prev, [user.email]: 0 }));

        // Báo Server đã đọc
        await axios.post(`http://localhost:8080/api/chat/mark-read`, null, {
            params: { me: myEmail, other: user.email },
            headers: { Authorization: `Bearer ${token}` }
        });

        // Tải lịch sử
        const res = await axios.get(`http://localhost:8080/api/chat/history/private`, {
            params: { me: myEmail, other: user.email },
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) setMessages(res.data);
    };

    const sendMessage = () => {
        if (clientRef.current?.connected && msgInput.trim() && selectedUser) {
            const chatMessage = {
                sender: myEmail,
                recipient: selectedUser.email,
                content: msgInput,
                type: 'CHAT',
                isRead: false,
                timestamp: new Date().toISOString()
            };
            clientRef.current.publish({ destination: "/app/chat.sendMessage", body: JSON.stringify(chatMessage) });
            moveContactToTop(selectedUser.email);
            setMsgInput("");
        }
    };

    // Khi người dùng bấm nút mở khung chat -> Đồng bộ lại số đỏ từ Server cho chắc chắn
    const toggleWidget = () => {
        if (!isOpen) {
            syncUnreadCounts(myEmail, token);
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const totalUnread = Object.values(unreadCounts).reduce((a, b) => Number(a) + Number(b), 0);

    return (
        <>
            <Zoom in={isOpen}>
                <Paper elevation={10} sx={{ position: 'fixed', bottom: 8, right: 100, width: 380, height: 550, zIndex: 10000, display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden' }}>
                    <Box sx={{ p: 2, bgcolor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box display="flex" alignItems="center">
                            {view === 'CHAT' && <IconButton size="small" onClick={() => setView('CONTACTS')} sx={{ color: 'white', mr: 1 }}><ArrowBackIcon /></IconButton>}
                            <Typography variant="subtitle1" fontWeight="bold">{view === 'CONTACTS' ? 'Trò chuyện' : selectedUser?.fullName}</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}><RemoveIcon /></IconButton>
                    </Box>

                    {view === 'CONTACTS' ? (
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <List>
                                {contacts.map((user) => (
                                    <ListItem key={user.email} disablePadding>
                                        <ListItemButton onClick={() => handleSelectUser(user)}>
                                            <ListItemAvatar>
                                                <Badge badgeContent={unreadCounts[user.email]} color="error">
                                                    <Avatar sx={{ bgcolor: '#1976d2' }}>{user.fullName?.charAt(0)}</Avatar>
                                                </Badge>
                                            </ListItemAvatar>
                                            <ListItemText primary={user.fullName} secondary={user.role} />
                                            {unreadCounts[user.email] > 0 && <CircleIcon sx={{ fontSize: 10, color: '#f44336' }} />}
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ flexGrow: 1, p: 2, bgcolor: '#f5f7fb', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {messages.map((msg, i) => (
                                    <Box key={i} sx={{ alignSelf: msg.sender === myEmail ? 'flex-end' : 'flex-start' }}>
                                        <Paper sx={{ p: 1.5, bgcolor: msg.sender === myEmail ? '#007bff' : 'white', color: msg.sender === myEmail ? 'white' : 'black', borderRadius: '12px' }}>
                                            <Typography variant="body2">{msg.content}</Typography>
                                        </Paper>
                                    </Box>
                                ))}
                                <div ref={messagesEndRef} />
                            </Box>
                            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                                <TextField fullWidth size="small" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                                <IconButton color="primary" onClick={sendMessage} disabled={!msgInput.trim()}><SendIcon /></IconButton>
                            </Box>
                        </>
                    )}
                </Paper>
            </Zoom>
            <Fab color="primary" onClick={toggleWidget} sx={{ position: 'fixed', bottom: 90, right: 24 }}><Badge badgeContent={totalUnread} color="error">{isOpen ? <CloseIcon /> : <ChatBubbleIcon />}</Badge></Fab>
        </>
    );
};

export default ChatWidget;