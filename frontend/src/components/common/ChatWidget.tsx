import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Paper, IconButton, Typography, TextField, Fab, Tooltip, Zoom, Avatar, Badge,
    List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert
} from '@mui/material';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

// --- COMPONENTS ---
import VideoCallWindow from './VideoCallWindow';
import WhiteboardWindow from './WhiteboardWindow';

// --- ICONS ---
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIcon from '@mui/icons-material/Circle';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import BrushIcon from '@mui/icons-material/Brush';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import DrawIcon from '@mui/icons-material/Draw';

// --- URL CONFIG ---
const BASE_BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://collabsphere-backend-mk5g.onrender.com';

const ChatWidget = () => {
    // --- STATE CHAT ---
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

    // Snackbar thông báo
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");

    // --- STATE VIDEO CALL ---
    const [videoCallOpen, setVideoCallOpen] = useState(false);
    const [incomingCallSignal, setIncomingCallSignal] = useState(null);
    const [isIncoming, setIsIncoming] = useState(false);
    const [incomingCallDialog, setIncomingCallDialog] = useState<{open: boolean, sender: string} | null>(null);

    // State quản lý việc thu nhỏ video (Thủ công)
    const [isVideoMinimized, setIsVideoMinimized] = useState(false);

    // --- STATE WHITEBOARD ---
    const [whiteboardOpen, setWhiteboardOpen] = useState(false);
    const [incomingDrawAction, setIncomingDrawAction] = useState(null);
    const [incomingWhiteboardRequest, setIncomingWhiteboardRequest] = useState<{open: boolean, sender: string} | null>(null);

    // --- REFS ---
    const clientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedUserRef = useRef<any>(null);
    const isOpenRef = useRef(false);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
        isOpenRef.current = isOpen;
    }, [selectedUser, isOpen]);

    // --- INITIAL LOAD ---
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
            const res = await axios.get(`${BASE_BACKEND_URL}/api/users/contacts`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setContacts(res.data);
        } catch (error) { console.error("Lỗi danh bạ:", error); }
    };

    const syncUnreadCounts = async (email: string, authToken: string) => {
        try {
            const res = await axios.get(`${BASE_BACKEND_URL}/api/chat/unread-map?email=${email}`, {
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

    const sendCallLog = (content: string, recipientEmail: string) => {
        if (clientRef.current?.connected) {
            const chatMessage = {
                sender: myEmail,
                recipient: recipientEmail,
                content: content,
                type: 'CHAT',
                isRead: false,
                timestamp: new Date().toISOString()
            };
            clientRef.current.publish({ destination: "/app/chat.sendMessage", body: JSON.stringify(chatMessage) });
            moveContactToTop(recipientEmail);
        }
    };

    // ==============================================================
    // LOGIC VIDEO CALL
    // ==============================================================
    const startVideoCall = () => {
        if (!selectedUser) return;
        setIsIncoming(false);
        setVideoCallOpen(true);
        setIsVideoMinimized(false); // Reset trạng thái thu nhỏ khi bắt đầu gọi mới
        sendCallLog("📞 Đã bắt đầu cuộc gọi video", selectedUser.email);
    };

    const acceptCall = () => {
        if (incomingCallDialog) {
            const callerEmail = incomingCallDialog.sender;
            const contactInfo = contacts.find(c => c.email === callerEmail);
            const userToSet = contactInfo || { email: callerEmail, fullName: callerEmail };
            setSelectedUser(userToSet);
            setView('CHAT');

            // 1. Cập nhật trạng thái Video
            setIsIncoming(true);
            setVideoCallOpen(true);
            setIsVideoMinimized(false);

            // 2. [FIX QUAN TRỌNG] Xóa hẳn dialog thông báo để nó không hiện lại khi thu nhỏ
            setIncomingCallDialog(null);
        }
    };

    const rejectCall = () => {
        if (incomingCallDialog) {
            const callerEmail = incomingCallDialog.sender;
            if (clientRef.current?.connected) {
                clientRef.current.publish({
                    destination: "/app/video.signal",
                    body: JSON.stringify({ type: "HANGUP", sender: myEmail, recipient: callerEmail, data: {} })
                });
            }
            sendCallLog("📞 Đã từ chối cuộc gọi", callerEmail);
            setIncomingCallDialog(null);
        }
    };

    // ==============================================================
    // LOGIC WHITEBOARD (BẢNG TRẮNG)
    // ==============================================================
    const startWhiteboard = () => {
        if (!selectedUser) return;
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination: "/app/whiteboard.draw",
                body: JSON.stringify({
                    type: "REQUEST",
                    sender: myEmail,
                    recipient: selectedUser.email,
                    points: [],
                    color: "",
                    strokeWidth: 0
                })
            });
            setSnackbarMsg("Đã gửi lời mời vẽ...");
            setSnackbarOpen(true);
            sendCallLog("🎨 Đã gửi lời mời tham gia Bảng trắng", selectedUser.email);
        }
    };

    const acceptWhiteboard = () => {
        if (incomingWhiteboardRequest) {
            const sender = incomingWhiteboardRequest.sender;
            const contactInfo = contacts.find(c => c.email === sender);
            const userToSet = contactInfo || { email: sender, fullName: sender };
            setSelectedUser(userToSet);
            setView('CHAT');

            setWhiteboardOpen(true);

            // [FIX QUAN TRỌNG] Xóa lời mời ngay khi chấp nhận
            setIncomingWhiteboardRequest(null);

            if (clientRef.current?.connected) {
                clientRef.current.publish({
                    destination: "/app/whiteboard.draw",
                    body: JSON.stringify({
                        type: "ACCEPT",
                        sender: myEmail,
                        recipient: sender,
                        points: [],
                        color: "",
                        strokeWidth: 0
                    })
                });
            }
            sendCallLog("🎨 Đã tham gia Bảng trắng", sender);
        }
    };

    const rejectWhiteboard = () => {
        if (incomingWhiteboardRequest) {
            const sender = incomingWhiteboardRequest.sender;
            if (clientRef.current?.connected) {
                clientRef.current.publish({
                    destination: "/app/whiteboard.draw",
                    body: JSON.stringify({
                        type: "REJECT",
                        sender: myEmail,
                        recipient: sender,
                        points: [],
                        color: "",
                        strokeWidth: 0
                    })
                });
            }
            sendCallLog("🎨 Đã từ chối tham gia Bảng trắng", sender);
            setIncomingWhiteboardRequest(null);
        }
    };

    // ==============================================================
    // WEBSOCKET HANDLER
    // ==============================================================
    useEffect(() => {
        if (!myEmail || !token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${BASE_BACKEND_URL}/ws`),
            onConnect: () => {
                setConnected(true);
                console.log(">>> WebSocket Connected: " + myEmail);

                client.subscribe(`/topic/private/${myEmail}`, (message) => {
                    const body = JSON.parse(message.body);

                    // --- VIDEO CALL ---
                    if (body.type && ['OFFER', 'ANSWER', 'ICE_CANDIDATE', 'HANGUP'].includes(body.type)) {
                        if (body.type === 'OFFER') {
                            setIncomingCallSignal(body.data);
                            setIncomingCallDialog({ open: true, sender: body.sender });
                            new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3').play().catch(()=>{});
                        } else {
                            // @ts-ignore
                            if (window.handleVideoSignal) window.handleVideoSignal(body);
                        }
                        return;
                    }

                    // --- WHITEBOARD ---
                    if (body.type && ['REQUEST', 'ACCEPT', 'REJECT', 'DRAW', 'CLEAR'].includes(body.type)) {
                        if (body.type === 'REQUEST') {
                            if (!isOpenRef.current) setIsOpen(true);
                            setIncomingWhiteboardRequest({ open: true, sender: body.sender });
                            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
                        } else if (body.type === 'ACCEPT') {
                            setWhiteboardOpen(true);
                            setSnackbarMsg(`${body.sender} đã tham gia vẽ!`);
                            setSnackbarOpen(true);
                        } else if (body.type === 'REJECT') {
                            setSnackbarMsg(`${body.sender} đã từ chối tham gia.`);
                            setSnackbarOpen(true);
                        } else if (body.type === 'DRAW' || body.type === 'CLEAR') {
                            if (whiteboardOpen) setIncomingDrawAction(body);
                        }
                        return;
                    }

                    // --- CHAT MESSAGE ---
                    const chattingWith = selectedUserRef.current?.email;
                    const isWidgetOpen = isOpenRef.current;
                    moveContactToTop(body.sender);

                    if (isWidgetOpen && chattingWith === body.sender) {
                        setMessages(prev => [...prev, body]);
                        axios.post(`${BASE_BACKEND_URL}/api/chat/mark-read`, null, {
                            params: { me: myEmail, other: body.sender },
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    }
                    else if (body.sender === myEmail) {
                        setMessages(prev => [...prev, body]);
                    }
                    else {
                        setUnreadCounts(prev => ({
                            ...prev,
                            [body.sender]: (Number(prev[body.sender]) || 0) + 1
                        }));
                        if (!body.content.startsWith("📞") && !body.content.startsWith("🎨")) {
                            new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3').play().catch(() => {});
                        }
                    }
                });
            },
            reconnectDelay: 5000,
        });
        client.activate();
        clientRef.current = client;
        return () => clientRef.current?.deactivate();
    }, [myEmail, token, whiteboardOpen]);

    // --- UI HANDLERS ---
    const handleSelectUser = async (user: any) => {
        setMessages([]);
        setSelectedUser(user);
        setView('CHAT');
        setUnreadCounts(prev => ({ ...prev, [user.email]: 0 }));
        await axios.post(`${BASE_BACKEND_URL}/api/chat/mark-read`, null, {
            params: { me: myEmail, other: user.email },
            headers: { Authorization: `Bearer ${token}` }
        });
        const res = await axios.get(`${BASE_BACKEND_URL}/api/chat/history/private`, {
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
            {/* CHAT WIDGET */}
            <Zoom in={isOpen}>
                <Paper elevation={10} sx={{ position: 'fixed', bottom: 8, right: 100, width: 380, height: 550, zIndex: 10000, display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden' }}>
                    <Box sx={{ p: 2, bgcolor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box display="flex" alignItems="center">
                            {view === 'CHAT' && <IconButton size="small" onClick={() => setView('CONTACTS')} sx={{ color: 'white', mr: 1 }}><ArrowBackIcon /></IconButton>}

                            {view === 'CHAT' && (
                                <Box>
                                    <Tooltip title="Mời vẽ Bảng trắng">
                                        <IconButton size="small" onClick={startWhiteboard} sx={{ color: 'white', mr: 1 }}>
                                            <BrushIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Gọi Video">
                                        <IconButton size="small" onClick={startVideoCall} sx={{ color: 'white', mr: 1 }}>
                                            <VideoCallIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}

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
                                {messages.map((msg, i) => {
                                    const isSystemMsg = msg.content && (msg.content.startsWith("📞") || msg.content.startsWith("🎨"));
                                    return (
                                        <Box key={i} sx={{
                                            alignSelf: isSystemMsg ? 'center' : (msg.sender === myEmail ? 'flex-end' : 'flex-start'),
                                            maxWidth: isSystemMsg ? '100%' : '80%',
                                            mb: isSystemMsg ? 1 : 0
                                        }}>
                                            <Paper sx={{
                                                p: 1.5,
                                                bgcolor: isSystemMsg ? '#e3f2fd' : (msg.sender === myEmail ? '#007bff' : 'white'),
                                                color: isSystemMsg ? '#0277bd' : (msg.sender === myEmail ? 'white' : 'black'),
                                                borderRadius: '12px',
                                                border: isSystemMsg ? '1px dashed #90caf9' : 'none',
                                                boxShadow: isSystemMsg ? 'none' : '0 1px 2px rgba(0,0,0,0.1)'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: isSystemMsg ? 'bold' : 'normal',
                                                    textAlign: isSystemMsg ? 'center' : 'left',
                                                    fontSize: isSystemMsg ? '0.8rem' : '0.875rem'
                                                }}>
                                                    {msg.content}
                                                </Typography>
                                                {isSystemMsg && (
                                                    <Typography variant="caption" display="block" textAlign="center" sx={{fontSize: '0.65rem', opacity: 0.7, mt: 0.5}}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </Typography>
                                                )}
                                            </Paper>
                                        </Box>
                                    );
                                })}
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

            {/* VIDEO CALL WINDOW */}
            {videoCallOpen && selectedUser && (
                <VideoCallWindow
                    open={videoCallOpen}
                    onClose={() => setVideoCallOpen(false)}
                    myEmail={myEmail}
                    targetEmail={selectedUser.email}
                    stompClient={clientRef.current}
                    isIncoming={isIncoming}
                    signalData={incomingCallSignal}
                    minimized={isVideoMinimized}
                    onToggleMinimize={() => setIsVideoMinimized(!isVideoMinimized)}
                />
            )}

            {/* WHITEBOARD WINDOW */}
            {whiteboardOpen && selectedUser && (
                <WhiteboardWindow
                    open={whiteboardOpen}
                    onClose={() => setWhiteboardOpen(false)}
                    myEmail={myEmail}
                    targetEmail={selectedUser.email}
                    stompClient={clientRef.current}
                    incomingAction={incomingDrawAction}
                />
            )}

            {/* DIALOG 1: NHẬN CUỘC GỌI VIDEO - [ĐÃ FIX 100%] */}
            <Dialog
                // Chỉ hiện khi: Có cuộc gọi đến VÀ (chưa mở cửa sổ video)
                open={!!incomingCallDialog && !videoCallOpen}

                // [FIX LỖI BẤM RA NGOÀI TẮT CUỘC GỌI]
                disableEscapeKeyDown
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        rejectCall();
                    }
                }}

                PaperProps={{ sx: { borderRadius: 3, p: 2, minWidth: 300, textAlign: 'center' } }}
            >
                <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 60, height: 60, bgcolor: '#1976d2' }}><VideoCallIcon fontSize="large" /></Avatar>
                    <Typography variant="h6" fontWeight="bold">Cuộc gọi đến</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1"><strong>{incomingCallDialog?.sender}</strong> đang gọi video cho bạn...</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 3, pb: 2 }}>
                    <Fab color="error" onClick={rejectCall} variant="extended"><CallEndIcon sx={{ mr: 1 }} /> Từ chối</Fab>
                    <Fab color="success" onClick={acceptCall} variant="extended"><CallIcon sx={{ mr: 1 }} /> Trả lời</Fab>
                </DialogActions>
            </Dialog>

            {/* DIALOG 2: LỜI MỜI BẢNG TRẮNG - [ĐÃ FIX 100%] */}
            <Dialog
                // [FIX LỖI KHI MỞ BẢNG TRẮNG VẪN CÒN LỜI MỜI]
                open={!!incomingWhiteboardRequest && !whiteboardOpen}

                // [FIX LỖI BẤM RA NGOÀI BỊ TẮT]
                disableEscapeKeyDown
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        rejectWhiteboard();
                    }
                }}
                PaperProps={{ sx: { borderRadius: 3, p: 2, minWidth: 300, textAlign: 'center' } }}
            >
                <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 60, height: 60, bgcolor: '#ed6c02' }}><DrawIcon fontSize="large" /></Avatar>
                    <Typography variant="h6" fontWeight="bold">Lời mời vẽ chung</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1"><strong>{incomingWhiteboardRequest?.sender}</strong> muốn mời bạn tham gia vẽ Bảng trắng.</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 3, pb: 2 }}>
                    <Button onClick={rejectWhiteboard} color="inherit">Từ chối</Button>
                    <Button onClick={acceptWhiteboard} variant="contained" color="warning" startIcon={<BrushIcon />}>Tham gia</Button>
                </DialogActions>
            </Dialog>

            {/* SNACKBAR THÔNG BÁO */}
            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>{snackbarMsg}</Alert>
            </Snackbar>
        </>
    );
};

export default ChatWidget;