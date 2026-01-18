import { useEffect, useState } from "react";
import { 
    Typography, Paper, List, ListItem,
    Button, Divider, Box, Chip, Container 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { IconButton } from "@mui/material";

import StudentLayout from "../components/layout/StudentLayout";
import { useConfirm } from "../context/ConfirmContext";
import { useAppSnackbar } from "../hooks/useAppSnackbar";
import { getNotifications, markAsRead, deleteNotification, clearAllNotifications } from "../services/notificationService";

const NotificationPage = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { showSuccess, showError, showWarning } = useAppSnackbar();

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách thông báo:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleAction = async (item: any) => {
        // Nếu chưa đọc, gọi API đánh dấu đã đọc
        if (!item.read) {
            try {
                await markAsRead(item.id);

                // Điều hướng đến URL được đính kèm trong thông báo
                navigate(item.redirectUrl);
            } catch (error) {
                showError("Không thể mở thông báo này");
            }
        }
    };

    const handleDelete = async (id: number) => {
        confirm({
            title: "Xóa thông báo",
            message: "Bạn có chắc chắn muốn xóa thông báo này không?",
            onConfirm: async () => {
                try {
                    await deleteNotification(id);
                    setNotifications(prev => prev.filter(n => n.id !== id));
                    showSuccess("Đã xóa thông báo thành công");
                } catch (error) {
                    showError("Lỗi khi xóa thông báo");
                }
            }
        });
    };

    const handleClearAll = async () => {
        confirm({
            title: "Xóa tất cả thông báo",
            message: "Bạn có chắc chắn muốn xóa sạch toàn bộ hộp thư thông báo? Hành động này không thể hoàn tác.",
            onConfirm: async () => {
                try {
                    await clearAllNotifications();
                    setNotifications([]);
                    showSuccess("Đã dọn sạch hộp thư thông báo");
                } catch (error) {
                    showError("Không thể xóa tất cả thông báo");
                }
            }
        });
    };

    return (
        <StudentLayout title="Thông báo của bạn">
            <Container maxWidth="md" sx={{ py: 2 }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e0e0e0" }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight="bold" color="#2e7d32" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <NotificationsActiveIcon fontSize="large" /> Thông báo của bạn
                        </Typography>
                        {notifications.length > 0 && (
                            <Button 
                                startIcon={<ClearAllIcon />} 
                                color="error" 
                                onClick={handleClearAll}
                                sx={{ textTransform: 'none', fontWeight: 'bold' }}
                            >
                                Xóa sạch thông báo
                            </Button>
                        )}
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />

                    <List sx={{ width: '100%' }}>
                        {notifications.length > 0 ? (
                            notifications.map((item) => (
                                <ListItem 
                                    key={item.id} 
                                    sx={{ 
                                        display: 'block', mb: 2, p: 2.5, borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: item.read ? '#eeeeee' : '#c8e6c9',
                                        bgcolor: item.read ? 'white' : '#f1f8e9',
                                        transition: 'all 0.2s',
                                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="start">
                                        <Typography variant="subtitle1" fontWeight="bold" color={item.read ? "text.primary" : "#1b5e20"}>
                                            {item.title}
                                        </Typography>

                                        <Box display="flex" alignItems="center" gap={1}>
                                            {!item.read ? (
                                                <Chip label="Mới" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                                            ) : (
                                                <DoneAllIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                                            )}

                                            {/* Nút xóa từng thông báo */}
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleDelete(item.id)} 
                                                sx={{ color: 'text.disabled', '&:hover': { color: '#d32f2f' } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ my: 1.5, lineHeight: 1.6 }}>
                                        {item.message}
                                    </Typography>

                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                        <Typography variant="caption" color="text.disabled">
                                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            disableElevation
                                            onClick={() => handleAction(item)}
                                            sx={{ 
                                                textTransform: 'none', 
                                                borderRadius: 2,
                                                bgcolor: "#2e7d32",
                                                '&:hover': { bgcolor: "#1b5e20" }
                                            }}
                                        >
                                            Xem ngay
                                        </Button>
                                    </Box>
                                </ListItem>
                            ))
                        ) : (
                            <Box textAlign="center" py={10}>
                                <Typography variant="body1" color="text.disabled">
                                    Hiện tại bạn không có thông báo nào.
                                </Typography>
                            </Box>
                        )}
                    </List>
                </Paper>
            </Container>
        </StudentLayout>
    );
};

export default NotificationPage;