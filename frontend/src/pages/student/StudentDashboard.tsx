import { useEffect, useState } from "react";
import { 
    Container, Typography, Box, Grid, Divider, Paper, 
    Avatar, Button, IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ClassIcon from "@mui/icons-material/Class";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LeftIcon from '@mui/icons-material/ChevronLeft';
import RightIcon from '@mui/icons-material/ChevronRight';

import Header from "../../components/layout/Header";
import { StatCard, MenuCard } from "../../components/common/DashboardCards";
import { getMyClasses } from "../../services/classService";
import studentService from "../../services/studentService";

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [myClassCount, setMyClassCount] = useState(0);
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
                        "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"];

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileData, classes] = await Promise.all([
                    studentService.getProfile(),
                    getMyClasses()
                ]);
                setProfile(profileData);
                setMyClassCount(classes.length);
            } catch (error) {
                console.error("Lỗi tải dữ liệu dashboard:", error);
            } finally {
            }
        };
        loadData();
    }, []);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f1f8e9" }}>
            <Header />

            <Container maxWidth="lg" sx={{ py: 4 }}>

                <Grid container spacing={2.4} sx={{ mb: 4 }}>

                    <Grid size={{ xs: 12, md: 7.5 }}>
                        <Grid container spacing={2.4}>
                            
                            {/* THÔNG TIN SINH VIÊN */}
                            <Grid size={{ xs: 12 }}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e0e0", height: '100%' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight="bold" color="#2e7d32" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccountBoxIcon /> Thông tin sinh viên
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                    
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: 'center' }}>
                                            <Avatar 
                                                src={profile?.avatarUrl}
                                                variant="rounded"
                                                sx={{ width: 132, height: 172, mx: "auto", borderRadius: 2, border: "1px solid #2e7d32", cursor: "pointer" }}
                                                onClick={() => navigate('/student/profile')}
                                            >
                                                {profile?.fullName?.charAt(0)}
                                            </Avatar>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 9 }} sx={{display: 'flex', alignItem: 'center'}}>
                                            <Grid container spacing={2}>
                                                {[
                                                    { label: "MSSV", value: profile?.studentId },
                                                    { label: "Khóa học", value: profile?.batch },
                                                    { label: "Họ tên", value: profile?.user?.fullName },
                                                    { label: "Giới tính", value: profile?.profile?.gender},
                                                    { label: "Ngày sinh", value: profile?.dob },
                                                    { label: "Bậc đào tạo", value: profile?.eduLevel },
                                                    { label: "Nơi sinh", value: profile?.profile?.placeOfBirth },
                                                    { label: "Loại hình đào tạo", value: profile?.trainingType },
                                                    { label: "Ngành", value: profile?.major },
                                                    { label: "Chuyên ngành", value: profile?.specialization },
                                                ].map((item, index) => (
                                                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                                        <Typography variant="body2">
                                                            <strong>{item.label}: </strong> {item.value}
                                                        </Typography>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            {/* NHẮC NHỞ */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Paper elevation={0} sx={{ 
                                    p: 3, borderRadius: 4, 
                                    background: "white", 
                                    color: "text.primary", position: "relative", overflow: "hidden",
                                    height: '100%', 
                                }}>
                                    <Box sx={{ position: "relative", zIndex: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Nhắc nhở</Typography>
                                        <Typography variant="h5" fontWeight="800" sx={{ my: 1 }}>0</Typography>
                                        <Button onClick={() => navigate('/notedetail')} sx={{ color: "red", p: 0, textTransform: 'none' }}>
                                            Xem chi tiết
                                        </Button>
                                    </Box>
                                    <NotificationsIcon sx={{ position: "absolute", right: 16, bottom: 58, fontSize: 28, color: "#2e7d32" }} />
                                </Paper>
                            </Grid>

                            {/* LỊCH HỌC TUẦN NÀY */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Paper elevation={0} sx={{ 
                                    p: 3, borderRadius: 3, 
                                    background: "#2e7d32", 
                                    color: "white", position: "relative", overflow: "hidden",
                                    height: '100%',

                                }}>
                                    <Box sx={{ position: "relative", zIndex: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Lịch học tuần này</Typography>
                                        <Typography variant="h5" fontWeight="800" sx={{ my: 1 }}>12</Typography>
                                        <Button onClick={() => navigate('/calendar')} sx={{ color: "rgba(255,255,255,0.8)", p: 0, textTransform: 'none' }}>
                                            Xem chi tiết
                                        </Button>
                                    </Box>
                                    <EventIcon sx={{ position: "absolute", right: 16, bottom: 58, fontSize: 28, color: "#fff" }} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* LỊCH THÁNG */}
                    <Grid size={{ xs: 12, md: 4.5 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e0e0", height: '100%', bgcolor: '#fcfcfc' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                <Typography variant="subtitle1" fontWeight="bold" color="#2e7d32">
                                    Lịch theo tháng
                                </Typography>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <IconButton size="small" sx={{ color: '#1A3C34' }}>
                                        <LeftIcon fontSize="small" />
                                    </IconButton>
                                    
                                    {/* Ant Design Style Picker Input */}
                                    <Box sx={{
                                        fontSize: '13.5px',
                                        fontWeight: 600,
                                        color: 'rgb(26, 60, 52)',
                                        border: '1px solid rgb(209, 213, 219)',
                                        borderRadius: '4px',
                                        bgcolor: '#fff',
                                        px: 1, py: 0.5,
                                        width: '130px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}>
                                        {`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                                        <CalendarMonthIcon sx={{ fontSize: '16px', color: '#999' }} />
                                    </Box>

                                    <IconButton size="small" sx={{ color: '#1A3C34' }}>
                                        <RightIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Thứ trong tuần */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 1 }}>
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, i) => (
                                    <Typography key={day} variant="caption" fontWeight="bold" sx={{ color: i === 0 ? '#ff6600' : 'text.secondary' }}>
                                        {day}
                                    </Typography>
                                ))}
                            </Box>

                            {/* Ngày trong tháng (Ví dụ demo 31 ngày) */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                                    const hasEvent = [2, 3, 5, 8, 12, 17, 22].includes(date);
                                    const isToday = date === 17;

                                    return (
                                        <Box
                                            key={date}
                                            sx={{
                                                height: 50,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 2,
                                                cursor: hasEvent ? 'pointer' : 'default',
                                                bgcolor: isToday ? 'transparent' : (hasEvent ? '#e0f2f1' : 'white'),
                                                border: isToday ? '2px solid #008689' : '1px solid transparent',
                                                '&:hover': hasEvent ? { bgcolor: '#b2dfdb' } : {}
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: isToday ? 'bold' : 500 }}>
                                                {date}
                                            </Typography>
                                            {hasEvent && (
                                                <Box sx={{ display: 'flex', gap: 0.3, mt: 0.5 }}>
                                                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                    {date % 3 === 0 && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ff9800' }} />}
                                                </Box>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>

                            <Box mt={3}>
                                <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                    * Nhấn vào ngày có dấu chấm để xem lịch học cụ thể.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                </Grid>

                <Box mb={5}>
                    <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: "#2e7d32" }}>
                        Góc Học Tập
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard title="Lớp Đang Học" value={myClassCount} icon={<ClassIcon fontSize="large" />} color="#2e7d32" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard title="Deadline Tuần Này" value="2" icon={<AccessTimeIcon fontSize="large" />} color="#ed6c02" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard title="Điểm TB Tích Lũy" value="8.5" icon={<SchoolIcon fontSize="large" />} color="#1976d2" />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ mb: 5 }} />
                

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Đăng Ký Môn Học" desc="Đăng ký các lớp tín chỉ." icon={<AppRegistrationIcon />} color="#7b1fa2" onClick={() => navigate("/student/registration")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Lớp Học Của Tôi" desc="Truy cập tài liệu & Bài giảng." icon={<SchoolIcon />} color="#2e7d32" onClick={() => navigate("/student/classes")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Đăng Ký Đề Tài" desc="Chọn đề tài đồ án/tiểu luận." icon={<AssignmentIcon />} color="#ef6c00" onClick={() => navigate("/student/project-registration")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Nhóm Của Tôi" desc="Trao đổi với thành viên nhóm." icon={<GroupsIcon />} color="#0288d1" onClick={() => navigate("/student/my-teams")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Hồ Sơ Cá Nhân" desc="Xem điểm & Thông tin." icon={<PersonIcon />} color="#455a64" onClick={() => navigate("/student/profile")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Đổi Mật Khẩu" desc="Bảo mật tài khoản." icon={<VpnKeyIcon />} color="#455a64" onClick={() => navigate("/change-password")} />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default StudentDashboard;