import { useState, useEffect, useRef } from 'react';
import {
    Box, Paper, IconButton, Typography,
    TextField, Fab, Tooltip, Zoom, Avatar, CircularProgress
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Reuse Icons from your project
import SmartToyIcon from '@mui/icons-material/SmartToy'; // Icon cho Robot AI
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; // Icon xóa lịch sử

// Import service API
import { aiService } from '../../services/aiService';

interface Message {
    id: number;
    sender: 'USER' | 'AI';
    content: string;
    timestamp: string;
}

const WELCOME_MESSAGE = {
    id: -1, // Dùng ID âm để tránh trùng với ID trong Database
    sender: 'AI',
    content: 'Xin chào! Tôi là trợ lý AI của CollabSphere. Tôi có thể giúp bạn kiểm tra tiến độ, phân tích công việc hoặc brainstorm ý tưởng.',
    timestamp: new Date().toISOString()
};

const AIChatWidget = () => {
    // --- STATE UI ---
    const [isOpen, setIsOpen] = useState(() => {
        const saved = localStorage.getItem('ai_chat_open');
        return saved === 'true'; // Nếu trong kho lưu là 'true' thì mở, ngược lại đóng
    });

    const [messages, setMessages] = useState<any[]>([WELCOME_MESSAGE]);

    // // --- STATE DATA ---
    // const [messages, setMessages] = useState<Message[]>([
    //     {
    //         id: 1,
    //         sender: 'AI',
    //         content: 'Xin chào! Tôi là trợ lý AI của CollabSphere. Tôi có thể giúp bạn kiểm tra tiến độ, phân tích công việc hoặc brainstorm ý tưởng.',
    //         timestamp: new Date().toISOString()
    //     }
    // ]);

    const [msgInput, setMsgInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        localStorage.setItem('ai_chat_open', String(isOpen));
    }, [isOpen]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!isOpen) return; // Chỉ tải khi mở cửa sổ

            try {
                const historyData = await aiService.getHistory();

                const formattedMsgs = historyData.map((item: any) => ({
                    id: item.id,
                    sender: item.sender,
                    content: item.content,
                    timestamp: item.timestamp
                }));

                // LUÔN ĐẶT WELCOME MESSAGE Ở ĐẦU + LỊCH SỬ TỪ DB
                setMessages([WELCOME_MESSAGE, ...formattedMsgs]);

            } catch (error) {
                console.error("Không thể tải lịch sử chat", error);
                // Nếu lỗi, vẫn giữ tin nhắn chào mừng
                setMessages([WELCOME_MESSAGE]);
            }
        };

        fetchHistory();
    }, [isOpen]);

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    // Xử lý gửi tin nhắn
    const handleSendMessage = async () => {
        if (!msgInput.trim() || isLoading) return;

        // 1. Tạo tin nhắn của User
        const userMsg: Message = {
            id: Date.now(),
            sender: 'USER',
            content: msgInput,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setMsgInput("");
        setIsLoading(true);

        try {
            // 2. Gọi API AI (Thay teamId bằng ID thực tế của sinh viên)
            const teamId = 1;
            const responseText = await aiService.askAI(userMsg.content, teamId);

            // 3. Tạo tin nhắn phản hồi của AI
            const aiMsg: Message = {
                id: Date.now() + 1,
                sender: 'AI',
                content: responseText,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg: Message = {
                id: Date.now() + 1,
                sender: 'AI',
                content: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // Xóa lịch sử chat (Optional)
    const clearChat = async () => {
        // Reset giao diện về tin nhắn chào mừng ngay lập tức
        setMessages([WELCOME_MESSAGE]);

        // (Tuỳ chọn) Gọi API xóa lịch sử trong DB nếu bạn đã làm API đó
        try {
            await aiService.clearHistory();
        } catch (e) { console.error(e); }
    };

    return (
        <>
            {/* CỬA SỔ CHAT */}
            <Zoom in={isOpen}>
                <Paper elevation={12} sx={{
                    position: 'fixed', bottom: 8, right: 100,
                    width: 380, height: 550, zIndex: 10000,
                    display: 'flex', flexDirection: 'column',
                    borderRadius: '16px', overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.08)'
                }}>

                    {/* HEADER - Gradient tím/xanh để phân biệt với chat thường */}
                    <Box sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ bgcolor: 'white', color: '#764ba2', width: 32, height: 32 }}>
                                <SmartToyIcon fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
                                    AI Assistant
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <span style={{width: 6, height: 6, backgroundColor: '#00e676', borderRadius: '50%'}}></span>
                                    Luôn sẵn sàng
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Tooltip title="Xóa đoạn chat">
                                <IconButton size="small" onClick={clearChat} sx={{ color: 'rgba(255,255,255,0.8)', mr: 0.5 }}>
                                    <DeleteSweepIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                                <RemoveIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* KHUNG CHAT */}
                    <Box sx={{ flexGrow: 1, p: 2, bgcolor: '#f5f7fb', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {messages.map((msg, index) => {
                            const isAI = msg.sender === 'AI';
                            return (
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: isAI ? 'flex-start' : 'flex-end' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, flexDirection: isAI ? 'row' : 'row-reverse', maxWidth: '85%' }}>
                                        {/* Avatar nhỏ bên cạnh tin nhắn AI */}
                                        {isAI && (
                                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#764ba2', fontSize: '0.8rem' }}>AI</Avatar>
                                        )}

                                        <Paper sx={{
                                            p: 1.5,
                                            bgcolor: isAI ? 'white' : '#764ba2', // Màu tím cho User
                                            color: isAI ? '#333' : 'white',
                                            borderRadius: isAI ? '12px 12px 12px 0' : '12px 12px 0 12px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                            position: 'relative'
                                        }}>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {msg.content}
                                            </Typography>
                                        </Paper>
                                    </Box>

                                    {/* Thời gian */}
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#999', mt: 0.5, ml: isAI ? 5 : 0, mr: isAI ? 0 : 1 }}>
                                        {msg.timestamp ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: vi }) : ''}
                                    </Typography>
                                </Box>
                            );
                        })}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, bgcolor: '#764ba2' }}><SmartToyIcon sx={{ fontSize: 14 }} /></Avatar>
                                <Paper sx={{ p: 1.5, borderRadius: '12px 12px 12px 0', bgcolor: 'white' }}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <CircularProgress size={10} thickness={6} sx={{ color: '#764ba2' }} />
                                        <Typography variant="caption" color="textSecondary">Đang suy nghĩ...</Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* INPUT AREA */}
                    <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee', display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Hỏi về dự án..."
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={isLoading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px',
                                    bgcolor: '#f8f9fa'
                                }
                            }}
                        />
                        <IconButton
                            onClick={handleSendMessage}
                            disabled={!msgInput.trim() || isLoading}
                            sx={{
                                bgcolor: (!msgInput.trim() || isLoading) ? '#e0e0e0' : '#764ba2',
                                color: 'white',
                                '&:hover': { bgcolor: '#5a3785' },
                                width: 40, height: 40
                            }}
                        >
                            {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
                        </IconButton>
                    </Box>
                </Paper>
            </Zoom>

            {/* FLOATING BUTTON (FAB) */}
            <Tooltip title="Hỏi AI Assistant" placement="left">
                <Fab
                    aria-label="ai-chat"
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        position: 'fixed',
                        bottom: 160, // Thấp hơn ChatWidget gốc một chút nếu muốn xếp chồng, hoặc đặt bottom: 160 nếu muốn nằm trên
                        right: 24,
                        zIndex: 9999,
                        bgcolor: isOpen ? '#f44336' : '#764ba2', // Màu tím đặc trưng AI
                        color: 'white',
                        '&:hover': { bgcolor: isOpen ? '#d32f2f' : '#5a3785' }
                    }}
                >
                    {isOpen ? <CloseIcon /> : <SmartToyIcon />}
                </Fab>
            </Tooltip>
        </>
    );
};

export default AIChatWidget;