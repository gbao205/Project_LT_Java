import { useEffect, useState } from "react";
import { Container, Typography, Box, Grid, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getMyClasses } from "../../services/classService";
import Header from "../../components/layout/Header";
import { StatCard, MenuCard } from "../../components/common/DashboardCards";

// Icons
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ClassIcon from "@mui/icons-material/Class";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [myClassCount, setMyClassCount] = useState(0);

    useEffect(() => {
        getMyClasses()
            .then((data) => setMyClassCount(data.length))
            .catch(console.error);
    }, []);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f1f8e9" }}>
            {/* Sử dụng Header chung đã tối ưu ở các bước trước */}
            <Header />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box mb={5}>
                    <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: "#2e7d32" }}>
                        Góc Học Tập
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard title="Lớp Đang Học" value={myClassCount} icon={<ClassIcon fontSize="large" />} color="#2e7d32" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard title="Deadline Tuần Này" value="2" icon={<AccessTimeIcon fontSize="large" />} color="#ed6c02" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard title="Điểm TB Tích Lũy" value="8.5" icon={<SchoolIcon fontSize="large" />} color="#1976d2" />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ mb: 5 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <MenuCard title="Đăng Ký Môn Học" desc="Đăng ký các lớp tín chỉ." icon={<AppRegistrationIcon />} color="#7b1fa2" onClick={() => navigate("/student/registration")} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <MenuCard title="Lớp Học Của Tôi" desc="Truy cập tài liệu & Bài giảng." icon={<SchoolIcon />} color="#2e7d32" onClick={() => navigate("/student/classes")} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <MenuCard title="Đăng Ký Đề Tài" desc="Chọn đề tài đồ án/tiểu luận." icon={<AssignmentIcon />} color="#ef6c00" onClick={() => alert("Tính năng đang phát triển")} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <MenuCard title="Nhóm Của Tôi" desc="Trao đổi với thành viên nhóm." icon={<GroupsIcon />} color="#0288d1" onClick={() => navigate("/student/my-teams")} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <MenuCard title="Hồ Sơ Cá Nhân" desc="Xem điểm & Thông tin." icon={<PersonIcon />} color="#455a64" onClick={() => navigate("/student/profile")} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <MenuCard title="Đổi Mật Khẩu" desc="Bảo mật tài khoản." icon={<VpnKeyIcon />} color="#455a64" onClick={() => navigate("/change-password")} />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default StudentDashboard;