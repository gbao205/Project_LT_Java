import { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent,
    Avatar, IconButton, Chip, Stack, Divider, Paper, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import api from '../services/api';
import UserManager from './admin/UserManager';

// --- IMPORT DASHBOARD MỚI CHO GIẢNG VIÊN ---
import LecturerDashboard from "./lecturer/LecturerDashboard";

// --- Components hỗ trợ (Giữ nguyên từ nhánh Main) ---
import ReportDialog from '../components/common/ReportDialog';
import ChatWidget from '../components/common/ChatWidget';
import AIChat from './student/AIChatWidget.tsx';

// --- Icons Import (Giữ nguyên) ---
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import SourceIcon from '@mui/icons-material/Source';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

// ==========================================
// 1. CÁC COMPONENT DÙNG CHUNG (KHÔNG ĐỔI)
// ==========================================

const StatCard = ({ title, value, icon, color }: any) => (
    <Card elevation={0} sx={{
        height: '100%', borderRadius: 3, border: '1px solid #e0e0e0',
        background: `linear-gradient(135deg, #ffffff 0%, ${color}08 100%)`,
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 10px 20px ${color}30`,
            borderColor: color
        }
    }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: `${color}15`, color: color, mr: 2 }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary">{value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
            </Box>
        </CardContent>
    </Card>
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
                <Typography variant="subtitle2" fontWeight="bold">{user.fullName}</Typography>
                <Chip label={roleConfig.label} size="small" sx={{ bgcolor: roleConfig.bg, color: roleConfig.color, fontWeight: 'bold', height: 20, fontSize: 10 }} />
            </Box>
            <Avatar sx={{ bgcolor: roleConfig.color }}>{user.fullName?.charAt(0)}</Avatar>
            <IconButton size="small" onClick={onLogout} sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}><LogoutIcon fontSize="small" /></IconButton>
        </Box>
    </Paper>
);

// ==========================================
// 2. CÁC DASHBOARD RIÊNG BIỆT (GIỮ NGUYÊN CŨ)
// ==========================================

// --- ADMIN DASHBOARD (Giữ nguyên) ---
const AdminDashboard = ({ user, roleConfig, onLogout}: any) => (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <Header user={user} roleConfig={roleConfig} onLogout={onLogout} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <UserManager />
        </Container>
    </Box>
);

// --- STAFF DASHBOARD (Giữ nguyên) ---
const StaffDashboard = ({ user, roleConfig, navigate, onLogout, stats }: any) => (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3e5f5' }}>
        <Header user={user} roleConfig={roleConfig} onLogout={onLogout} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box mb={5}>
                <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: roleConfig.color }}>
                    Nghiệp Vụ Đào Tạo
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Môn Học" value={stats.totalSubjects} icon={<SourceIcon fontSize="large"/>} color="#ed6c02" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Lớp Đang Mở" value={stats.totalClasses} icon={<CastForEducationIcon fontSize="large"/>} color="#0288d1" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Sinh Viên" value={stats.totalUsers} icon={<GroupAddIcon fontSize="large"/>} color="#2e7d32" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Đề Tài" value={stats.totalProjects} icon={<DashboardIcon fontSize="large"/>} color="#9c27b0" /></Grid>
                </Grid>
            </Box>
            <Divider sx={{ mb: 5 }} />
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <MenuCard
                        title="Quản Lý Môn Học"
                        desc="Thiết lập danh mục môn và đề cương."
                        icon={<AssignmentIcon />}
                        color="#ed6c02"
                        onClick={() => navigate('/admin/subjects')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <MenuCard
                        title="Quản Lý Lớp Học"
                        desc="Mở lớp, xếp giảng viên và import sinh viên."
                        icon={<SchoolIcon />}
                        color="#0288d1"
                        onClick={() => navigate('/admin/classes')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <MenuCard
                        title="Đổi Mật Khẩu"
                        desc="Bảo mật tài khoản."
                        icon={<VpnKeyIcon />}
                        color="#455a64"
                        onClick={() => navigate('/change-password')}
                    />
                </Grid>
            </Grid>
        </Container>
    </Box>
);

// --- STUDENT DASHBOARD (Giữ nguyên) ---
const StudentDashboard = ({ user, roleConfig, navigate, onLogout }: any) => (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f8e9' }}>
        <Header user={user} roleConfig={roleConfig} onLogout={onLogout} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box mb={5}>
                <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: roleConfig.color }}>
                    Góc Học Tập
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}><StatCard title="Lớp Đang Học" value="4" icon={<ClassIcon fontSize="large"/>} color="#2e7d32" /></Grid>
                    <Grid item xs={12} sm={6} md={4}><StatCard title="Deadline Tuần Này" value="2" icon={<AccessTimeIcon fontSize="large"/>} color="#ed6c02" /></Grid>
                    <Grid item xs={12} sm={6} md={4}><StatCard title="Điểm TB Tích Lũy" value="8.5" icon={<SchoolIcon fontSize="large"/>} color="#1976d2" /></Grid>
                </Grid>
            </Box>
            <Divider sx={{ mb: 5 }} />
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <MenuCard
                        title="Đăng Ký Môn Học"
                        desc="Đăng ký các lớp tín chỉ."
                        icon={<AppRegistrationIcon />}
                        color="#7b1fa2"
                        onClick={() => navigate('/student/registration')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}><MenuCard title="Lớp Học Của Tôi" desc="Truy cập tài liệu & Bài giảng." icon={<SchoolIcon />} color="#2e7d32" onClick={() => navigate('/student/classes')} /></Grid>
                <Grid item xs={12} sm={6} md={4}><MenuCard title="Đăng Ký Đề Tài" desc="Chọn đề tài đồ án/tiểu luận." icon={<AssignmentIcon />} color="#ef6c00" onClick={() => alert("Tính năng đang phát triển")} /></Grid>
                <Grid item xs={12} sm={6} md={4}><MenuCard title="Nhóm Của Tôi" desc="Trao đổi với thành viên nhóm." icon={<GroupsIcon />} color="#0288d1" onClick={() => navigate('/student/workspace')} /></Grid>
                <Grid item xs={12} sm={6} md={4}><MenuCard title="Hồ Sơ Cá Nhân" desc="Xem điểm & Thông tin." icon={<PersonIcon />} color="#455a64" onClick={() => alert("Tính năng đang phát triển")} /></Grid>
                <Grid item xs={12} sm={6} md={4}><MenuCard title="Đổi Mật Khẩu" desc="Bảo mật tài khoản." icon={<VpnKeyIcon />} color="#455a64" onClick={() => navigate('/change-password')} /></Grid>
            </Grid>
        </Container>
    </Box>
);

// --- LECTURER DASHBOARD ---
// (ĐÃ XÓA CODE CŨ Ở ĐÂY VÀ THAY BẰNG IMPORT FILE MỚI Ở TRÊN CÙNG)

// ==========================================
// 3. HOME CONTROLLER (MAIN)
// ==========================================

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalClasses: 0,
        totalSubjects: 0,
        totalProjects: 0
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
            const role = JSON.parse(userStr).role;
            // Load stats nếu cần (Admin/Staff)
            if (['ADMIN', 'STAFF'].includes(role)) {
                api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error);
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const getRoleConfig = (role: string) => {
        switch (role) {
            case 'ADMIN': return { label: 'Quản Trị Viên', color: '#d32f2f', bg: '#fdecea' };
            case 'STAFF': return { label: 'Phòng Đào Tạo', color: '#9c27b0', bg: '#f3e5f5' };
            case 'HEAD_DEPARTMENT': return { label: 'Trưởng Khoa', color: '#ed6c02', bg: '#fff3e0' };
            case 'LECTURER': return { label: 'Giảng Viên', color: '#0288d1', bg: '#e1f5fe' };
            case 'STUDENT': return { label: 'Sinh Viên', color: '#2e7d32', bg: '#e8f5e9' };
            default: return { label: 'Người dùng', color: '#757575', bg: '#f5f5f5' };
        }
    };

    const roleConfig = getRoleConfig(user.role);
    const props = { user, roleConfig, navigate, onLogout: handleLogout, stats };

    // --- PHÂN LUỒNG HIỂN THỊ ---
    const renderMainContent = () => {
        if (user.role === 'ADMIN') return <AdminDashboard {...props} />;
        if (user.role === 'STAFF') return <StaffDashboard {...props} />;

        // 👉 SỬ DỤNG DASHBOARD MỚI ĐÃ IMPORT
        if (user.role === 'LECTURER' || user.role === 'HEAD_DEPARTMENT') return <LecturerDashboard />;

        if (user.role === 'STUDENT') return <StudentDashboard {...props} />;

        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h5" color="error" gutterBottom>Vai trò không hợp lệ!</Typography>
                <Button variant="outlined" onClick={handleLogout}>Đăng xuất</Button>
            </Box>
        );
    };

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh' }}>
            {/* Dashboard Chính */}
            {renderMainContent()}

            {/* Các Widget Hỗ Trợ (Report, Chat, AI) */}
            <ReportDialog />
            <ChatWidget />
            <AIChat />
        </Box>
    );
};

export default Home;