import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Paper, 
    Typography, Divider, Tooltip, Dialog, 
    DialogTitle, DialogContent, DialogContentText, 
    DialogActions, Button, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import Draggable from 'react-draggable'; 
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

import { BASE_URL } from '../../../services/api';
import chatService from '../../../services/chatService';
import studentService from '../../../services/studentService';

interface DraggableChatProps {
    teamId: number;
    isVisible: boolean;
    onClose: () => void;
}

const DraggableChat = ({ teamId, isVisible, onClose }: DraggableChatProps) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLeader, setIsLeader] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const draggableNodeRef = useRef(null);
    const stompClient = useRef<Client | null>(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    // 1. Hợp nhất logic STOMP vào 1 useEffect duy nhất
    useEffect(() => {
        if (!teamId || !isVisible) return;

        const socket = new SockJS(`${BASE_URL}/ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('STOMP Connected: ' + frame);
            
            // Đăng ký nhận tin nhắn mới
            client.subscribe(`/topic/team_${teamId}`, (message) => {
                const newMessage = JSON.parse(message.body);
                setMessages((prev) => [...prev, {
                    senderName: newMessage.username,
                    content: newMessage.content,
                    isMe: newMessage.username === currentUser?.fullName,
                    timestamp: newMessage.time
                }]);
            });

            // Đăng ký sự kiện xóa chat (Sửa lỗi subscribe ngoài onConnect)
            client.subscribe(`/topic/team_${teamId}/clear`, () => {
                setMessages([]);
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP Error:', frame);
        };

        client.activate();
        stompClient.current = client;

        // Cleanup: Ngắt kết nối khi đóng chat hoặc chuyển team
        return () => {
            if (stompClient.current) {
                console.log("Deactivating STOMP...");
                stompClient.current.deactivate();
                stompClient.current = null;
            }
        };
    }, [teamId, isVisible]); // Chỉ chạy lại khi teamId hoặc trạng thái hiển thị thay đổi

    // 2. Tải lịch sử chat và Kiểm tra quyền Leader
    useEffect(() => {
        const loadData = async () => {
            if (isVisible && teamId) {
                try {
                    // Tải lịch sử
                    const history = await chatService.getChatHistory(teamId);
                    setMessages(history.map((m: any) => ({
                        senderName: m.username,
                        content: m.content,
                        isMe: m.username === currentUser?.fullName,
                        timestamp: m.time
                    })));

                    // Kiểm tra quyền Leader
                    const members = await studentService.getTeamMembers(teamId);
                    const myInfo = members.find((m: any) => m.email === currentUser?.email);
                    setIsLeader(myInfo?.role === 'LEADER');
                } catch (error) {
                    console.error("Lỗi khi tải dữ liệu chat:", error);
                }
            }
        };
        loadData();
    }, [teamId, isVisible]);

    // 3. Tự động cuộn xuống dưới
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (input.trim() && stompClient.current?.connected) {
            const messageData = {
                teamId,
                content: input,
                senderName: currentUser?.email,
            };
            stompClient.current.publish({
                destination: '/app/send_message',
                body: JSON.stringify(messageData)
            });
            setInput('');
        }
    };

    // Hàm để mở Dialog
    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    // Hàm để đóng Dialog
    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    // Hàm thực hiện xóa (gọi khi nhấn "Xác nhận" trên Dialog)
    const handleClearChat = async () => {
        setIsDeleting(true);
        try {
            await chatService.clearChat(teamId);
            handleCloseConfirm(); // Đóng dialog sau khi xóa thành công
        } catch (error) {
            console.error("Xóa chat thất bại:", error);
            // Có thể thêm thông báo lỗi ở đây
        } finally {
            setIsDeleting(false); 
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    };

    const formatDateHeader = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    };

    if (!isVisible) return null;

    return (
        <>
            <Draggable nodeRef={draggableNodeRef} handle=".chat-header">
                <Paper 
                    ref={draggableNodeRef}
                    elevation={10} 
                    sx={{ 
                        position: 'fixed', bottom: 80, left: 20, 
                        width: 320, height: 400, 
                        display: 'flex', flexDirection: 'column', 
                        borderRadius: 2, zIndex: 2000, overflow: 'hidden'
                    }}
                >
                    <Box className="chat-header" sx={{ p: 1.5, bgcolor: 'primary.main', color: 'white', cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Chat Nhóm</Typography>
                        <Box>
                            {isLeader && (
                                <Tooltip title="Xóa tất cả tin nhắn">
                                    <IconButton size="small" onClick={handleOpenConfirm} sx={{ color: 'white', mr: 1 }}>
                                        <DeleteSweepIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
    
                    <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
                        {messages.map((msg, index) => {
                            const currentDate = formatDateHeader(msg.timestamp);
                            const prevDate = index > 0 ? formatDateHeader(messages[index - 1].timestamp) : null;
                            const showDateHeader = currentDate !== prevDate;
                            return (
                                <React.Fragment key={index}>
                                {/* HIỂN THỊ NGÀY TRÊN ĐẦU MỖI NGÀY MỚI */}
                                {showDateHeader && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                bgcolor: 'rgba(0,0,0,0.1)', 
                                                px: 1.5, 
                                                py: 0.2, 
                                                borderRadius: 10, 
                                                fontWeight: 'bold',
                                                color: 'text.secondary' 
                                            }}
                                        >
                                            {currentDate}
                                        </Typography>
                                    </Box>
                                )}

                                <Box sx={{ 
                                    alignSelf: msg.isMe ? 'flex-end' : 'flex-start', 
                                    maxWidth: '85%', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: msg.isMe ? 'flex-end' : 'flex-start' 
                                }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
                                        {msg.isMe ? 'Bạn' : msg.senderName}
                                    </Typography>
                                    
                                    <Paper elevation={1} sx={{ 
                                        p: 1.2, 
                                        bgcolor: msg.isMe ? 'primary.main' : 'white', 
                                        color: msg.isMe ? 'white' : 'black', 
                                        borderRadius: 2, 
                                        borderBottomRightRadius: msg.isMe ? 0 : 8, 
                                        borderBottomLeftRadius: msg.isMe ? 8 : 0, 
                                        wordBreak: 'break-word' 
                                    }}>
                                        <Typography variant="body2">{msg.content}</Typography>
                                    </Paper>

                                    {/* HIỂN THỊ GIỜ (HH:mm) DƯỚI TIN NHẮN */}
                                    <Typography variant="caption" sx={{ mt: 0.3, px: 0.5, fontSize: '0.65rem', color: 'text.disabled' }}>
                                        {formatTime(msg.timestamp)}
                                    </Typography>
                                </Box>
                            </React.Fragment>
                            )
                        })}
                    </Box>
    
                    <Divider />
                    <Box sx={{ p: 1, display: 'flex', gap: 1, bgcolor: 'white' }}>
                        <TextField 
                            fullWidth 
                            size="small" 
                            placeholder="Nhắn tin..." 
                            value={input} 
                            multiline // Kích hoạt xuống dòng
                            maxRows={4} // Giới hạn chiều cao tối đa là 4 dòng
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && input.trim() && handleSendMessage()}
                            onKeyDown={(e) => {
                                // Gửi tin nhắn khi nhấn Enter (không kèm Shift)
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (input.trim()) {
                                        handleSendMessage();
                                    }
                                }
                            }} 
                            sx={{
                                "& .MuiInputBase-root": {
                                    padding: '8px 12px', 
                                }
                            }}
                        />
                        <IconButton size="small" color="primary" onClick={handleSendMessage} disabled={!input.trim()} sx={{ mb: 0.5 }}>
                            <SendIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Paper>
            </Draggable>
    
            {/* Dialog Xác nhận xóa chat */}
            <Dialog
                open={openConfirm}
                onClose={handleCloseConfirm}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {"Xác nhận xóa lịch sử trò chuyện?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Hành động này sẽ xóa vĩnh viễn toàn bộ tin nhắn trong nhóm này đối với tất cả thành viên. Bạn không thể hoàn tác thao tác này.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseConfirm} color="inherit" variant="outlined" disabled={isDeleting}>
                        Hủy bỏ
                    </Button>
                    <Button 
                        onClick={handleClearChat} 
                        color="error" 
                        variant="contained" 
                        autoFocus
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DraggableChat;