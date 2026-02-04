import { useEffect, useState } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, CircularProgress,
    Container, Avatar, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

// Icons
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// [MỚI] Import thêm icons cho các mục mới
import ClassIcon from '@mui/icons-material/Class';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Interface khớp với DTO HeadDashboardStats từ Backend
interface DashboardStats {
    pendingProposals: number; // Số đề tài chờ duyệt
    totalLecturers: number;   // Tổng số giảng viên

    // [MỚI] Các trường bổ sung
    totalClasses: number;     // Tổng số lớp học
    totalSubjects: number;    // Tổng số môn học
    totalSyllabi: number;     // Tổng số đề cương
}

const HeadDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Gọi API lấy dữ liệu thật khi vào trang
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Endpoint này sẽ gọi HeadController.getStats()
                const response = await api.get('/head/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Lỗi kết nối Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Component thẻ thống kê (Widget)
    const StatWidget = ({ title, value, icon, color, onClick }: any) => (
        <Card
            sx={{
                height: '100%',
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
            }}
            onClick={onClick}
        >
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar
                    variant="rounded"
                    sx={{ bgcolor: `${color}15`, color: color, width: 56, height: 56, mr: 2 }}
                >
                    {icon}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">
                        {title.toUpperCase()}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ my: 0.5 }}>
                        {/* Nếu đang tải thì hiện vòng quay, xong thì hiện số thật */}
                        {loading ? <CircularProgress size={25} /> : (value ?? 0)}
                    </Typography>
                </Box>
                <ArrowForwardIcon color="action" />
            </CardContent>
        </Card>
    );

    return (
        <AdminLayout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" color="#1e293b">
                            Tổng Quan Bộ Môn
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Theo dõi hoạt động và duyệt đề tài
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* --- HÀNG 1: CÁC CHỈ SỐ QUAN TRỌNG (3 CỘT) --- */}

                    {/* THẺ 1: ĐỀ TÀI CẦN DUYỆT */}
                    <Grid item xs={12} sm={6} md={4}>
                        <StatWidget
                            title="Đề tài chờ duyệt"
                            value={stats?.pendingProposals}
                            icon={<AssignmentLateIcon fontSize="large" />}
                            color="#ef4444" // Màu đỏ
                            onClick={() => navigate('/head/approval')}
                        />
                    </Grid>

                    {/* THẺ 2: TỔNG SỐ GIẢNG VIÊN */}
                    <Grid item xs={12} sm={6} md={4}>
                        <StatWidget
                            title="Giảng viên bộ môn"
                            value={stats?.totalLecturers}
                            icon={<PeopleAltIcon fontSize="large" />}
                            color="#3b82f6" // Màu xanh dương
                            onClick={() => navigate('/head/lecturers')}
                        />
                    </Grid>

                    {/* [MỚI] THẺ 3: TỔNG SỐ LỚP HỌC */}
                    <Grid item xs={12} sm={6} md={4}>
                        <StatWidget
                            title="Lớp học đang mở"
                            value={stats?.totalClasses}
                            icon={<ClassIcon fontSize="large" />}
                            color="#10b981" // Màu xanh lá
                            onClick={() => navigate('/head/classes')}
                        />
                    </Grid>

                    {/* --- HÀNG 2: THÔNG TIN ĐÀO TẠO (2 CỘT) --- */}

                    {/* [MỚI] THẺ 4: TỔNG SỐ MÔN HỌC */}
                    <Grid item xs={12} sm={6} md={6}>
                        <StatWidget
                            title="Môn học chuyên ngành"
                            value={stats?.totalSubjects}
                            icon={<MenuBookIcon fontSize="large" />}
                            color="#f59e0b" // Màu vàng cam
                            onClick={() => navigate('/head/subjects')}
                        />
                    </Grid>

                    {/* [MỚI] THẺ 5: TỔNG SỐ ĐỀ CƯƠNG */}
                    <Grid item xs={12} sm={6} md={6}>
                        <StatWidget
                            title="Đề cương chi tiết"
                            value={stats?.totalSyllabi}
                            icon={<AssignmentIcon fontSize="large" />}
                            color="#8b5cf6" // Màu tím
                            onClick={() => navigate('/head/syllabi')}
                        />
                    </Grid>

                </Grid>
            </Container>
        </AdminLayout>
    );
};

export default HeadDashboard;