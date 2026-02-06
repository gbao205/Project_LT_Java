import React, { useEffect, useState } from "react";
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    IconButton,
    Chip,
    Paper,
    Button,
    CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import api from "../services/api";

// --- IMPORT DASHBOARD CHO GIẢNG VIÊN ---
import LecturerDashboard from "./lecturer/LecturerDashboard";

// --- Components hỗ trợ ---
import ReportDialog from "../components/common/ReportDialog";
import ChatWidget from "../components/common/ChatWidget";
import AIChat from "./student/AIChatWidget";

// --- Pages / Dashboards ---
import UserManager from "./admin/UserManager";

// --- Icons Import ---
import LogoutIcon from "@mui/icons-material/Logout";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import SourceIcon from "@mui/icons-material/Source";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import MenuBookIcon from "@mui/icons-material/MenuBook";
// [NEW] Icons cho Head
import FactCheckIcon from "@mui/icons-material/FactCheck";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ClassIcon from '@mui/icons-material/Class';
import DashboardIcon from '@mui/icons-material/Dashboard'; // Icon Dashboard

import StudentDashboard from "./student/StudentDashboard";
import { MenuCard } from "../components/common/DashboardCards";

// ==========================================
// 1. DEFINITIONS & INTERFACES
// ==========================================

interface StaffStatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

interface StaffDashboardProps {
    user: any;
    roleConfig: any;
    navigate: (path: string) => void;
    onLogout: () => void;
    stats: {
        totalSubjects: number;
        totalClasses: number;
        totalUsers: number;
        totalProjects: number;
    };
}

// Component thẻ thống kê (Dùng chung)
const StatCard = ({ title, value, icon, color }: StaffStatCardProps) => (
    <Card
        sx={{
            borderRadius: 4,
            background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
            color: "white",
            boxShadow: `0 8px 32px ${color}40`,
            position: "relative",
            overflow: "hidden",
            height: "100%",
            border: "none",
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-5px)' }
        }}
    >
        <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
            >
                <Box>
                    <Typography variant="h3" fontWeight="700" sx={{ mb: 0.5 }}>
                        {value}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ opacity: 0.9, fontWeight: 700, letterSpacing: 1 }}
                    >
                        {title.toUpperCase()}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.25)",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
        <Box
            sx={{
                position: "absolute",
                right: -15,
                bottom: -15,
                opacity: 0.15,
                transform: "rotate(-15deg)",
                fontSize: "100px",
            }}
        >
            {icon}
        </Box>
    </Card>
);

const Header = ({ user, roleConfig, onLogout }: any) => (
    <Paper
        elevation={0}
        sx={{
            bgcolor: "white",
            px: { xs: 2, md: 4 },
            py: 2,
            borderBottom: "1px solid #eaeaea",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 100,
        }}
    >
        <Box display="flex" alignItems="center" gap={2}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    bgcolor: roleConfig.color,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                }}
            >
                CS
            </Box>
            <Box>
                <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                    CollabSphere
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {roleConfig.label} Workspace
                </Typography>
            </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                <Typography variant="subtitle2" fontWeight="bold">
                    {user.fullName}
                </Typography>
                <Chip
                    label={roleConfig.label}
                    size="small"
                    sx={{
                        bgcolor: roleConfig.bg,
                        color: roleConfig.color,
                        fontWeight: "bold",
                        height: 20,
                        fontSize: 10,
                    }}
                />
            </Box>
            <Avatar sx={{ bgcolor: roleConfig.color }}>
                {user.fullName?.charAt(0)}
            </Avatar>
            <IconButton
                size="small"
                onClick={onLogout}
                sx={{ bgcolor: "#ffebee", color: "#d32f2f" }}
            >
                <LogoutIcon fontSize="small" />
            </IconButton>
        </Box>
    </Paper>
);

// ==========================================
// 3. CÁC DASHBOARD RIÊNG BIỆT
// ==========================================

// --- ADMIN DASHBOARD  ---
const AdminDashboard = ({ user, roleConfig, onLogout }: any) => (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
        <Header user={user} roleConfig={roleConfig} onLogout={onLogout} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <UserManager />
        </Container>
    </Box>
);

// --- STAFF DASHBOARD (MÀU TÍM) ---
// @ts-ignore
// @ts-ignore
const StaffDashboard = ({
                            user,
                            roleConfig,
                            navigate,
                            onLogout,
                            stats,
                        }: StaffDashboardProps) => (
    <Box
        sx={{
            minHeight: "100vh",
            bgcolor: "#f8fafc",
            pb: 10,
            width: "100%",
            overflowX: "hidden",
            fontFamily: "'Inter', sans-serif",
            "& *": { fontFamily: "'Inter', sans-serif !important" },
        }}
    >
        <Header user={user} roleConfig={roleConfig} onLogout={onLogout} />

        {/* Banner tím High-tech */}
        <Box
            sx={{
                minHeight: 120,
                background: "linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)",
                pt: 4,
                pb: 2,
                mb: 4,
            }}
        >
            <Container maxWidth="lg">
                <Box mb={4}>
                    <Typography
                        variant="h4"
                        fontWeight="700"
                        color="white"
                        sx={{ letterSpacing: -1 }}
                    >
                        Hệ Thống Quản Lý Đào Tạo
                    </Typography>
                    <Typography color="white" sx={{ opacity: 0.85 }}>
                        Chào buổi làm việc, {user.fullName} | Quyền hạn: {roleConfig.label}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <StatCard
                            title="Môn Học"
                            value={stats?.totalSubjects || 0}
                            icon={<SourceIcon fontSize="large" />}
                            color="#f59e0b"
                        />
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <StatCard
                            title="Lớp Học"
                            value={stats?.totalClasses || 0}
                            icon={<CastForEducationIcon fontSize="large" />}
                            color="#3b82f6"
                        />
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <StatCard
                            title="Sinh Viên"
                            value={stats?.totalUsers || 0}
                            icon={<GroupAddIcon fontSize="large" />}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <StatCard
                            title="Đề Tài"
                            value={stats?.totalProjects || 0}
                            icon={<RocketLaunchIcon fontSize="large" />}
                            color="#8b5cf6"
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>

        <Container maxWidth="lg">
            <Grid container spacing={4}>
                {/* Menu chính nghiệp vụ */}
                <Grid size={{xs:12, sm:8}}>
                    <Typography variant="h6" fontWeight="700" mb={3}>
                        Nghiệp Vụ Chính
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{xs:12, sm:6}}>
                            <MenuCard
                                title="Quản Lý Môn Học"
                                desc="Import và cấu hình Syllabus hệ thống"
                                icon={<AssignmentIcon />}
                                color="#9c27b0"
                                onClick={() => navigate("/staff/subjects")}
                            />
                        </Grid>
                        <Grid size={{xs:12, sm:6}}>
                            <MenuCard
                                title="Quản Lý Lớp Học"
                                desc="Mở lớp, chia nhóm & nhập dữ liệu"
                                icon={<SchoolIcon />}
                                color="#9c27b0"
                                onClick={() => navigate("/staff/classes")}
                            />
                        </Grid>
                        <Grid size={{xs:12, sm:6}}>
                            <MenuCard
                                title="Quản Lý Tài Khoản"
                                desc="Dữ liệu Giảng viên & Sinh viên"
                                icon={<PersonAddAlt1Icon />}
                                color="#9c27b0"
                                onClick={() => navigate("/staff/users")}
                            />
                        </Grid>
                        <Grid size={{xs:12, sm:6}}>
                            <MenuCard
                                title="Quản lý Chương Trình Học"
                                desc="xem & điều chỉnh chương trình học"
                                icon={<MenuBookIcon />}
                                color="#9c27b0"
                                onClick={() => navigate("/staff/syllabus")}
                            />
                        </Grid>
                        <Grid size={{xs:12, sm:6}}>
                            <MenuCard
                                title="Đổi Mật Khẩu"
                                desc="Bảo mật tài khoản"
                                icon={<VpnKeyIcon />}
                                color="#455a64"
                                onClick={() => navigate("/change-password")}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid size={{xs:12, md:4}}>
                    <Typography variant="h6" fontWeight="700" mb={3}>
                        Trung Tâm Dữ Liệu
                    </Typography>
                    <Paper
                        sx={{
                            p: 4,
                            borderRadius: 5,
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                            bgcolor: "white",
                        }}
                    >
                        <Avatar
                            sx={{
                                m: "auto",
                                bgcolor: "#f3e5f5",
                                color: "#9c27b0",
                                width: 60,
                                height: 60,
                                mb: 2,
                            }}
                        >
                            <CloudUploadIcon fontSize="large" />
                        </Avatar>
                        <Typography variant="h6" fontWeight="700">
                            Import CSV/Excel
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Tự động hóa quy trình nạp dữ liệu hàng loạt.
                        </Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                bgcolor: "#ed6c02",
                                fontWeight: 700,
                                "&:hover": { bgcolor: "#e65100" },
                            }}
                            onClick={() => navigate("/staff/import")}
                        >
                            Bắt đầu Import
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    </Box>
);

// --- HEAD DEPARTMENT DASHBOARD (MÀU CAM CHỦ ĐẠO - KHÁC BIỆT) ---
const HeadDashboard = ({ user, roleConfig, navigate, onLogout }: any) => {
    // --- STATE ĐỂ LƯU DỮ LIỆU THẬT ---
    const [stats, setStats] = useState({
        pendingProposals: 0,
        totalLecturers: 0,
        totalClasses: 0, // Dữ liệu thật từ Backend (số lớp đang mở)
        totalSubjects: 0,
        totalSyllabi: 0
    });
    const [loading, setLoading] = useState(true);

    // --- GỌI API LẤY THỐNG KÊ ---
    useEffect(() => {
        const fetchHeadStats = async () => {
            try {
                const response = await api.get("/head/stats");
                setStats(response.data);
            } catch (error) {
                console.error("Lỗi lấy thống kê Head Dept:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHeadStats();
    }, []);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#fff7ed", pb: 10 }}> {/* Nền kem cam nhạt */}
            <Header user={user} roleConfig={roleConfig} onLogout={onLogout} />

            {/* --- BANNER CAM (Điểm nhấn khác biệt) --- */}
            <Box
                sx={{
                    minHeight: 120,
                    background: "linear-gradient(135deg, #c2410c 0%, #fb923c 100%)", // Gradient Cam đậm -> Cam sáng
                    pt: 4,
                    pb: 2,
                    mb: 4,
                    boxShadow: "0 4px 20px rgba(234, 88, 12, 0.2)"
                }}
            >
                <Container maxWidth="lg">
                    <Box mb={4} display="flex" alignItems="center" gap={2}>
                        <DashboardIcon sx={{ color: "white", fontSize: 40, opacity: 0.9 }} />
                        <Box>
                            <Typography
                                variant="h4"
                                fontWeight="700"
                                color="white"
                                sx={{ letterSpacing: -1 }}
                            >
                                Trưởng Bộ Môn
                            </Typography>
                            <Typography color="white" sx={{ opacity: 0.9 }}>
                                Xin chào, {user.fullName} | {roleConfig.label}
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        {/* THẺ 1: ĐỀ TÀI CẦN DUYỆT */}
                        <Grid size={{xs:12, sm:6, md:4}}>
                            <StatCard
                                title="Cần Duyệt Gấp"
                                value={loading ? <CircularProgress size={24} color="inherit" /> : stats.pendingProposals}
                                icon={<FactCheckIcon fontSize="large" />}
                                color="#ef4444" // Đỏ cảnh báo
                            />
                        </Grid>
                        {/* THẺ 2: TỔNG SỐ GIẢNG VIÊN */}
                        <Grid size={{xs:12, sm:6, md:4}}>
                            <StatCard
                                title="Giảng Viên"
                                value={loading ? <CircularProgress size={24} color="inherit" /> : stats.totalLecturers}
                                icon={<SupervisorAccountIcon fontSize="large" />}
                                color="#0ea5e9" // Xanh dương
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* --- KHU VỰC CHỨC NĂNG --- */}
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Cột Trái: Chuyên Môn */}
                    <Grid size={{xs:12, md:8}}>
                        <Typography variant="h6" fontWeight="700" mb={3} color="#c2410c">
                            Quản Lý Chuyên Môn
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{xs:12, sm:6}}>
                                <MenuCard
                                    title="Duyệt Đề Tài Và Phản Biện"
                                    desc="Phê duyệt đồ án & đề tài"
                                    icon={<FactCheckIcon />}
                                    color="#ea580c" // Cam
                                    onClick={() => navigate("/head/proposal-approval")}
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:6}}>
                                <MenuCard
                                    title="Giảng Viên"
                                    desc="Phân công & Thống kê"
                                    icon={<SupervisorAccountIcon />}
                                    color="#ea580c" // Cam
                                    onClick={() => navigate("/head/lecturers")}
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:6}}>
                                <MenuCard
                                    title="Danh Sách Lớp Học"
                                    desc="Theo dõi tiến độ lớp"
                                    icon={<ClassIcon />}
                                    color="#0f766e" // Xanh cổ vịt (Teal)
                                    onClick={() => navigate("/head/classes")}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Cột Phải: Tiện ích */}
                    <Grid size={{xs:12, md:4}}>
                        <Typography variant="h6" fontWeight="700" mb={3} color="#c2410c">
                            Tiện Ích Khác
                        </Typography>
                        <Grid container spacing={2} direction="column">
                            <Grid item>
                                <MenuCard
                                    title="Ngân Hàng Đề Cương"
                                    desc="Tra cứu Syllabus chi tiết"
                                    icon={<AssignmentIcon />}
                                    color="#7c3aed" // Tím (để phân biệt)
                                    onClick={() => navigate("/head/syllabi")}
                                />
                            </Grid>
                            <Grid item>
                                <MenuCard
                                    title="Đổi Mật Khẩu"
                                    desc="Bảo mật tài khoản"
                                    icon={<VpnKeyIcon />}
                                    color="#475569" // Xám xanh
                                    onClick={() => navigate("/change-password")}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

// ==========================================
// 4. MAIN COMPONENT (HOME)
// ==========================================

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalClasses: 0,
        totalSubjects: 0,
        totalProjects: 0,
    });

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setUser(JSON.parse(userStr));
            const role = JSON.parse(userStr).role;
            // Load stats nếu cần (Admin/Staff)
            if (["ADMIN", "STAFF"].includes(role)) {
                api
                    .get("/dashboard/stats")
                    .then((res) => setStats(res.data))
                    .catch(console.error);
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) return null;

    const getRoleConfig = (role: string) => {
        switch (role) {
            case "ADMIN":
                return { label: "Quản Trị Viên", color: "#d32f2f", bg: "#fdecea" };
            case "STAFF":
                return { label: "Phòng Đào Tạo", color: "#9c27b0", bg: "#f3e5f5" };
            case "HEAD_DEPARTMENT":
                return { label: "Trưởng Bộ Môn", color: "#c2410c", bg: "#fff7ed" }; // Màu Cam đậm
            case "LECTURER":
                return { label: "Giảng Viên", color: "#0288d1", bg: "#e1f5fe" };
            case "STUDENT":
                return { label: "Sinh Viên", color: "#2e7d32", bg: "#e8f5e9" };
            default:
                return { label: "Người dùng", color: "#757575", bg: "#f5f5f5" };
        }
    };

    const roleConfig = getRoleConfig(user.role);
    const props = {
        user,
        roleConfig,
        navigate,
        onLogout: handleLogout,
        stats,
    };

    // --- PHÂN LUỒNG HIỂN THỊ ---
    const renderMainContent = () => {
        switch (user.role) {
            case "ADMIN":
                return <AdminDashboard {...props} />;
            case "STAFF":
                return <StaffDashboard {...props} />;
            case "HEAD_DEPARTMENT":
                // Hiển thị Dashboard nội bộ đã được cập nhật
                return <HeadDashboard {...props} />;
            case "LECTURER":
                return <LecturerDashboard />;
            case "STUDENT":
                return <StudentDashboard />;
            default:
                return (
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        height="100vh"
                    >
                        <Typography variant="h5" color="error" gutterBottom>
                            Vai trò không hợp lệ!
                        </Typography>
                        <Button variant="outlined" onClick={handleLogout}>
                            Đăng xuất
                        </Button>
                    </Box>
                );
        }
    };

    return (
        <Box sx={{ position: "relative", minHeight: "100vh" }}>
            {renderMainContent()}
            <ReportDialog />
            <ChatWidget />
            <AIChat />
        </Box>
    );
};

export default Home;