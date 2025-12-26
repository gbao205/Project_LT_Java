import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent,
    Avatar, IconButton, Chip, Stack, Divider, Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService'; // Đảm bảo đường dẫn đúng
import StatCard from '../../components/common/StatCard'; // Import StatCard nếu có, hoặc dùng code bên dưới

// --- Icons ---
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupsIcon from '@mui/icons-material/Groups';
import ClassIcon from '@mui/icons-material/Class';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// --- COMPONENTS CON (Header, MenuCard) ---

const Header = ({ user, roleConfig, onLogout }: any) => (
    <Paper elevation={0} sx={{
        bgcolor: 'white', px: { xs: 2, md: 4 }, py: 2,
        borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100
    }}>
        <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ width: 40, height: 40, bgcolor: roleConfig.color, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>CS</Box>
            <Box>
                <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>CollabSphere</Typography>
                <Typography variant="caption" color="text.secondary">{roleConfig.label} Workspace</Typography>
            </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" fontWeight="bold">{user?.fullName}</Typography>
                <Chip label={roleConfig.label} size="small" sx={{ bgcolor: roleConfig.bg, color: roleConfig.color, fontWeight: 'bold', height: 20, fontSize: 10 }} />
            </Box>
            <Avatar sx={{ bgcolor: roleConfig.color }}>{user?.fullName?.charAt(0)}</Avatar>
            <IconButton size="small" onClick={onLogout} sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}><LogoutIcon fontSize="small" /></IconButton>
        </Box>
    </Paper>
);

const MenuCard = ({ title, desc, icon, color, onClick }: any) => (
    <Card onClick={onClick} elevation={0} sx={{
        height: '100%', cursor: 'pointer', borderRadius: 3, border: '1px solid #f0f0f0',
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', borderColor: color, '& .icon-box': { bgcolor: color, color: 'white' } }
    }}>
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Stack spacing={2}>
                <Box className="icon-box" sx={{
                    width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '12px', bgcolor: `${color}15`, color: color, transition: 'all 0.3s ease'
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>{desc}</Typography>
                </Box>
            </Stack>
            <ArrowForwardIosIcon sx={{ fontSize: 16, color: '#e0e0e0', mt: 1 }} />
        </CardContent>
    </Card>
);

// --- MAIN COMPONENT ---
export default function LecturerDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    // Load user từ localStorage để component tự chạy được độc lập
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const roleConfig = { label: 'Giảng Viên', color: '#0288d1', bg: '#e1f5fe' };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#e3f2fd' }}>
            <Header user={user} roleConfig={roleConfig} onLogout={handleLogout} />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box mb={5}>
                    <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: roleConfig.color }}>
                        Khu Vực Giảng Viên
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Lớp Đang Dạy" value="3" icon={<SchoolIcon fontSize="large"/>} color="#0288d1" /></Grid>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Yêu Cầu Duyệt Đề Tài" value="5" icon={<AssignmentIcon fontSize="large"/>} color="#d32f2f" /></Grid>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Sinh Viên Phụ Trách" value="120" icon={<GroupsIcon fontSize="large"/>} color="#7b1fa2" /></Grid>
                    </Grid>
                </Box>
                <Divider sx={{ mb: 5 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <MenuCard
                            title="Lớp Học Phụ Trách"
                            desc="Quản lý sinh viên & Nhóm."
                            icon={<ClassIcon />}
                            color="#0277bd"
                            // 👇 Link tới trang ClassManager
                            onClick={() => navigate('/lecturer/classes')}
                        />
                    </Grid>
                    {user.role === 'HEAD_DEPARTMENT' && (
                        <Grid item xs={12} sm={6} md={4}><MenuCard title="Phê Duyệt Đề Tài" desc="Duyệt đề tài cấp bộ môn." icon={<AdminPanelSettingsIcon />} color="#ed6c02" onClick={() => alert("Tính năng đang phát triển")} /></Grid>
                    )}
                    <Grid item xs={12} sm={6} md={4}><MenuCard title="Duyệt Đề Tài (GV)" desc="Xem và phê duyệt đề tài SV." icon={<RateReviewIcon />} color="#c2185b" onClick={() => alert("Tính năng đang phát triển")} /></Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <MenuCard
                            title="Chấm Điểm Hội Đồng"
                            desc="Nhập điểm bảo vệ đồ án."
                            icon={<AssignmentIcon />}
                            color="#fbc02d"
                            // 👇 Link tới trang TeamDetail (Demo ID 1)
                            onClick={() => navigate('/lecturer/teams/1')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}><MenuCard title="Đổi Mật Khẩu" desc="Bảo mật tài khoản." icon={<VpnKeyIcon />} color="#455a64" onClick={() => navigate('/change-password')} /></Grid>
                </Grid>
            </Container>
        </Box>
    );
}