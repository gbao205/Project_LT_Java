import { useEffect, useState, useMemo } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Switch, TextField,
    InputAdornment, IconButton, Tooltip, Avatar, Grid
} from '@mui/material';

// Icons Import
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; // Icon Tổng
import SchoolIcon from '@mui/icons-material/School'; // Icon Sinh viên
import CastForEducationIcon from '@mui/icons-material/CastForEducation'; // Icon Giảng viên
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Icon Trưởng bộ môn
import SupportAgentIcon from '@mui/icons-material/SupportAgent'; // Icon Nhân viên
import BlockIcon from '@mui/icons-material/Block'; // Icon Khóa

import { getAllUsers, toggleUserStatus } from '../../services/userService';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/common/StatCard';

const UserManager = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    // Hàm load dữ liệu từ API
    const fetchUsers = async () => {
        try {
            const res = await getAllUsers(search);
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách user:", error);
        }
    };

    // Chỉ gọi API sau khi ngừng gõ 500ms
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    // --- TÍNH TOÁN THỐNG KÊ ---
    const stats = useMemo(() => {
        return {
            total: users.length,
            // Backend trả về 'STUDENT', 'LECTURER'... không phải tiếng Việt
            students: users.filter(u => u.role === 'STUDENT').length,
            lecturers: users.filter(u => u.role === 'LECTURER').length,
            head_departments: users.filter(u => u.role === 'HEAD_DEPARTMENT').length,
            staffs: users.filter(u => u.role === 'STAFF').length,
            blocked: users.filter(u => !u.active).length // active == false là bị khóa
        };
    }, [users]);

    // Xử lý khóa/mở khóa tài khoản
    const handleToggleStatus = async (id: number) => {
        try {
            await toggleUserStatus(id);
            // Cập nhật giao diện ngay lập tức
            setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
        } catch (error) {
            alert("Có lỗi khi cập nhật trạng thái!");
            fetchUsers(); // Load lại nếu lỗi
        }
    };

    // Helper 1: Màu sắc Role (Đồng bộ với trang Home)
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'error';             // Đỏ
            case 'STAFF': return 'secondary';         // Tím
            case 'HEAD_DEPARTMENT': return 'warning'; // Cam
            case 'LECTURER': return 'info';           // Xanh dương
            case 'STUDENT': return 'success';         // Xanh lá
            default: return 'default';
        }
    };

    // Helper 2: Chuyển đổi tên Role sang Tiếng Việt để hiển thị
    const getRoleName = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Quản Trị Viên';
            case 'STAFF': return 'Nhân Viên Đào Tạo';
            case 'HEAD_DEPARTMENT': return 'Trưởng Bộ Môn';
            case 'LECTURER': return 'Giảng Viên';
            case 'STUDENT': return 'Sinh Viên';
            default: return role;
        }
    };

    return (
        <AdminLayout title="Quản Lý Người Dùng">

            {/* 1. KHU VỰC THỐNG KÊ (GRID 6 CỘT) */}
            {/* xs=6 (2 thẻ/hàng), md=4 (3 thẻ/hàng), lg=2 (6 thẻ/hàng) */}
            <Grid container spacing={2} mb={4}>
                {/* Tổng User */}
                <Grid item xs={6} md={4} lg={2}>
                    <StatCard
                        title="Tổng User"
                        value={stats.total}
                        icon={<SupervisorAccountIcon fontSize="large"/>}
                        color="#1976d2" // Xanh đậm
                    />
                </Grid>

                {/* Sinh Viên */}
                <Grid item xs={6} md={4} lg={2}>
                    <StatCard
                        title="Sinh Viên"
                        value={stats.students}
                        icon={<SchoolIcon fontSize="large"/>}
                        color="#2e7d32" // Xanh lá
                    />
                </Grid>

                {/* Giảng Viên */}
                <Grid item xs={6} md={4} lg={2}>
                    <StatCard
                        title="Giảng Viên"
                        value={stats.lecturers}
                        icon={<CastForEducationIcon fontSize="large"/>}
                        color="#0288d1" // Xanh dương
                    />
                </Grid>

                {/* Trưởng Bộ Môn */}
                <Grid item xs={6} md={4} lg={2}>
                    <StatCard
                        title="Trưởng BM"
                        value={stats.head_departments}
                        icon={<AccountBalanceIcon fontSize="large"/>}
                        color="#ed6c02" // Cam
                    />
                </Grid>

                {/* Nhân Viên Đào Tạo */}
                <Grid item xs={6} md={4} lg={2}>
                    <StatCard
                        title="NVDT"
                        value={stats.staffs}
                        icon={<SupportAgentIcon fontSize="large"/>}
                        color="#9c27b0" // Tím
                    />
                </Grid>

                {/* Đã Khóa */}
                <Grid item xs={6} md={4} lg={2}>
                    <StatCard
                        title="Đã Khóa"
                        value={stats.blocked}
                        icon={<BlockIcon fontSize="large"/>}
                        color="#d32f2f" // Đỏ cảnh báo
                    />
                </Grid>
            </Grid>

            {/* 2. THANH CÔNG CỤ (SEARCH) */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box sx={{ typography: 'subtitle1', fontWeight: 'bold', color: 'text.secondary' }}>
                    Danh sách tài khoản hệ thống
                </Box>
                <Box display="flex" gap={1} bgcolor="white" p={0.5} borderRadius={1} boxShadow={1}>
                    <TextField
                        size="small"
                        placeholder="Tìm theo tên, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
                        }}
                        sx={{ minWidth: '250px' }}
                    />
                    <Tooltip title="Làm mới danh sách">
                        <IconButton onClick={fetchUsers} size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* 3. BẢNG DỮ LIỆU */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell fontWeight="bold">ID</TableCell>
                            <TableCell>Họ và Tên</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Vai Trò</TableCell>
                            <TableCell align="center">Trạng Thái</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        {/* Avatar tự đổi màu nền theo Role */}
                                        <Avatar
                                            sx={{ width: 36, height: 36, bgcolor: `${getRoleColor(user.role)}.main`, fontSize: 14 }}
                                        >
                                            {user.fullName?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Box fontWeight="500">{user.fullName}</Box>
                                            {/* Hiển thị role tiếng Anh nhỏ bên dưới tên để dễ debug */}
                                            <Box fontSize="0.75rem" color="text.secondary">{user.role}</Box>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={getRoleName(user.role)} // Hiển thị tiếng Việt
                                        color={getRoleColor(user.role) as any} // Màu sắc theo Role
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 'bold', borderRadius: 1 }}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title={user.active ? "Đang hoạt động" : "Đã bị khóa"}>
                                        <Switch
                                            checked={Boolean(user.active)}
                                            onChange={() => handleToggleStatus(user.id)}
                                            color="success"
                                            disabled={user.role === 'ADMIN'} // Không cho phép khóa Admin
                                        />
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    Không tìm thấy dữ liệu phù hợp
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </AdminLayout>
    );
};

export default UserManager;