import { useEffect, useState, useMemo } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Switch, TextField,
    InputAdornment, IconButton, Avatar, Grid, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from '@mui/material';
import { useForm } from 'react-hook-form';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SchoolIcon from '@mui/icons-material/School';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BlockIcon from '@mui/icons-material/Block';

import { getAllUsers, toggleUserStatus, createUser } from '../../services/userService';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/common/StatCard';

const UserManager = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false); // State mở Dialog

    // React Hook Form
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchUsers = async () => {
        try {
            const res = await getAllUsers(search);
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách user:", error);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => fetchUsers(), 500);
        return () => clearTimeout(timeout);
    }, [search]);

    const stats = useMemo(() => {
        return {
            total: users.length,
            students: users.filter(u => u.role === 'STUDENT').length,
            lecturers: users.filter(u => u.role === 'LECTURER').length,
            head_departments: users.filter(u => u.role === 'HEAD_DEPARTMENT').length,
            staffs: users.filter(u => u.role === 'STAFF').length,
            blocked: users.filter(u => !u.active).length
        };
    }, [users]);

    const handleToggleStatus = async (id: number) => {
        try {
            await toggleUserStatus(id);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
        } catch (error) {
            alert("Có lỗi xảy ra!");
        }
    };

    // Xử lý tạo User mới
    const onSubmit = async (data: any) => {
        try {
            await createUser(data);
            alert("Tạo tài khoản thành công!");
            setOpen(false);
            reset(); // Xóa form
            fetchUsers(); // Load lại danh sách
        } catch (error: any) {
            alert(error.response?.data?.message || "Có lỗi khi tạo tài khoản!");
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'STAFF': return 'secondary';
            case 'HEAD_DEPARTMENT': return 'warning';
            case 'LECTURER': return 'info';
            case 'STUDENT': return 'success';
            default: return 'default';
        }
    };

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

            {/* 1. THỐNG KÊ */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={6} md={4} lg={2}><StatCard title="Tổng User" value={stats.total} icon={<SupervisorAccountIcon fontSize="large"/>} color="#1976d2" /></Grid>
                <Grid item xs={6} md={4} lg={2}><StatCard title="Sinh Viên" value={stats.students} icon={<SchoolIcon fontSize="large"/>} color="#2e7d32" /></Grid>
                <Grid item xs={6} md={4} lg={2}><StatCard title="Giảng Viên" value={stats.lecturers} icon={<CastForEducationIcon fontSize="large"/>} color="#0288d1" /></Grid>
                <Grid item xs={6} md={4} lg={2}><StatCard title="Trưởng BM" value={stats.head_departments} icon={<AccountBalanceIcon fontSize="large"/>} color="#ed6c02" /></Grid>
                <Grid item xs={6} md={4} lg={2}><StatCard title="NVDT" value={stats.staffs} icon={<SupportAgentIcon fontSize="large"/>} color="#9c27b0" /></Grid>
                <Grid item xs={6} md={4} lg={2}><StatCard title="Đã Khóa" value={stats.blocked} icon={<BlockIcon fontSize="large"/>} color="#d32f2f" subtitle="Bị chặn" /></Grid>
            </Grid>

            {/* 2. TOOLBAR */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                {/* Nút Tạo Mới */}
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Thêm Người Dùng
                </Button>

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
                    <IconButton onClick={fetchUsers} size="small"><RefreshIcon /></IconButton>
                </Box>
            </Box>

            {/* 3. TABLE */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0' }}>
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
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: `${getRoleColor(user.role)}.main`, fontSize: 14 }}>
                                            {user.fullName?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Box fontWeight="500">{user.fullName}</Box>
                                            <Box fontSize="0.75rem" color="text.secondary">{user.role}</Box>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip label={getRoleName(user.role)} color={getRoleColor(user.role) as any} size="small" variant="outlined" sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Switch checked={Boolean(user.active)} onChange={() => handleToggleStatus(user.id)} color="success" disabled={user.role === 'ADMIN'} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 4. DIALOG TẠO USER */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        Tạo Tài Khoản Mới
                    </DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                label="Họ và Tên" fullWidth
                                {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                                error={!!errors.fullName}
                            />
                            <TextField
                                label="Email đăng nhập" fullWidth type="email"
                                {...register("email", { required: "Vui lòng nhập email" })}
                                error={!!errors.email}
                            />
                            <TextField
                                label="Mật khẩu" fullWidth type="password"
                                {...register("password", { required: "Vui lòng nhập mật khẩu", minLength: 6 })}
                                error={!!errors.password}
                                helperText="Tối thiểu 6 ký tự"
                            />
                            <TextField
                                select label="Vai trò (Role)" fullWidth
                                defaultValue="STUDENT"
                                inputProps={register("role", { required: true })}
                            >
                                <MenuItem value="STUDENT">Sinh Viên (Student)</MenuItem>
                                <MenuItem value="LECTURER">Giảng Viên (Lecturer)</MenuItem>
                                <MenuItem value="HEAD_DEPARTMENT">Trưởng Bộ Môn (Head Department)</MenuItem>
                                <MenuItem value="STAFF">Nhân Viên Đào Tạo (Staff)</MenuItem>
                                <MenuItem value="ADMIN">Quản Trị Viên (Admin)</MenuItem>
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setOpen(false)} color="inherit">Hủy bỏ</Button>
                        <Button type="submit" variant="contained" size="large">Tạo Tài Khoản</Button>
                    </DialogActions>
                </form>
            </Dialog>

        </AdminLayout>
    );
};

export default UserManager;