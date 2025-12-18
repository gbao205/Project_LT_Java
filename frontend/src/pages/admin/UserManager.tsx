import { useEffect, useState, useMemo } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Switch, TextField,
    InputAdornment, IconButton, Tooltip, Avatar, Grid, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

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
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteIcon from '@mui/icons-material/Delete';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import { getAllUsers, toggleUserStatus, createUser, updateUser, resetUserPassword, deleteUser } from '../../services/userService';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';

const UserManager = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [pendingReports, setPendingReports] = useState(0);

    const navigate = useNavigate();

    // State quản lý Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState<'CREATE' | 'EDIT' | 'RESET'>('CREATE');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchUsers = async () => {
        try {
            const res = await getAllUsers(search);
            if (Array.isArray(res)) setUsers(res);
            else if (res.data && Array.isArray(res.data)) setUsers(res.data);
            else setUsers([]);
        } catch (error) {
            console.error("Lỗi tải danh sách user:", error);
            setUsers([]);
        }
    };

    // Hàm lấy số lượng báo cáo chờ xử lý
    const fetchReportCount = async () => {
        try {
            const res = await api.get('/reports/count-pending');
            setPendingReports(res.data);
        } catch (error) {
            console.error("Lỗi lấy số liệu báo cáo:", error);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers();
            fetchReportCount(); // Gọi hàm đếm mỗi khi load trang
        }, 500);
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

    // --- CÁC HÀM XỬ LÝ (Create, Edit, Delete...) ---
    const handleOpenCreate = () => {
        setDialogType('CREATE');
        setSelectedUser(null);
        reset({ fullName: '', email: '', password: '', role: 'STUDENT' });
        setOpenDialog(true);
    };

    const handleOpenEdit = (user: any) => {
        setDialogType('EDIT');
        setSelectedUser(user);
        setValue('fullName', user.fullName);
        setValue('email', user.email);
        setValue('role', user.role);
        setOpenDialog(true);
    };

    const handleOpenReset = (user: any) => {
        setDialogType('RESET');
        setSelectedUser(user);
        reset({ password: '' });
        setOpenDialog(true);
    };

    const handleDelete = async (user: any) => {
        if (window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA vĩnh viễn tài khoản "${user.fullName}"?\n\nHành động này không thể hoàn tác!`)) {
            try {
                await deleteUser(user.id);
                alert("Đã xóa thành công!");
                fetchUsers();
            } catch (error: any) {
                console.error(error);
                alert("Không thể xóa! Có thể tài khoản này đang phụ trách lớp học hoặc có dữ liệu liên quan.");
            }
        }
    };

    const handleClose = () => {
        setOpenDialog(false);
        reset();
    };

    const onSubmit = async (data: any) => {
        try {
            if (dialogType === 'CREATE') {
                await createUser(data);
                alert("Tạo tài khoản thành công!");
            } else if (dialogType === 'EDIT') {
                await updateUser(selectedUser.id, data);
                alert("Cập nhật thành công!");
            } else if (dialogType === 'RESET') {
                await resetUserPassword(selectedUser.id, data.password);
                alert(`Đã đổi mật khẩu cho ${selectedUser.fullName}`);
            }
            handleClose();
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || "Có lỗi xảy ra!");
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await toggleUserStatus(id);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
        } catch (error) { alert("Lỗi cập nhật trạng thái"); }
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
            case 'STAFF': return 'Phòng Đào Tạo';
            case 'HEAD_DEPARTMENT': return 'Trưởng Bộ Môn';
            case 'LECTURER': return 'Giảng Viên';
            case 'STUDENT': return 'Sinh Viên';
            default: return role;
        }
    };

    return (
        <Box sx={{ p: 3, height: '100%', bgcolor: '#f5f5f5' }}>

            {/* 1. THỐNG KÊ */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={6} md={3} lg={2}><StatCard title="Tổng User" value={stats.total} icon={<SupervisorAccountIcon fontSize="large"/>} color="#1976d2" /></Grid>
                <Grid item xs={6} md={3} lg={2}><StatCard title="Sinh Viên" value={stats.students} icon={<SchoolIcon fontSize="large"/>} color="#2e7d32" /></Grid>
                <Grid item xs={6} md={3} lg={2}><StatCard title="Giảng Viên" value={stats.lecturers} icon={<CastForEducationIcon fontSize="large"/>} color="#0288d1" /></Grid>
                <Grid item xs={6} md={3} lg={2}><StatCard title="Trưởng Khoa" value={stats.head_departments} icon={<AccountBalanceIcon fontSize="large"/>} color="#ed6c02" /></Grid>
                <Grid item xs={6} md={3} lg={2}><StatCard title="Phòng Đào Tạo" value={stats.staffs} icon={<SupportAgentIcon fontSize="large"/>} color="#9c27b0" /></Grid>
                <Grid item xs={6} md={3} lg={1}><StatCard title="Đã Khóa" value={stats.blocked} icon={<BlockIcon fontSize="large"/>} color="#616161" /></Grid>
                <Grid item xs={6} md={3} lg={1}
                    onClick={() => navigate('/admin/reports')}
                    sx={{
                        cursor: 'pointer',
                        transition: '0.3s',
                        '&:hover': { transform: 'scale(1.05)' }
                    }}
                >
                    <StatCard
                        title="Báo Cáo"
                        value={pendingReports}
                        icon={<ReportProblemIcon fontSize="large"/>}
                        color="#d32f2f"
                    />
                </Grid>
            </Grid>

            {/* 2. TOOLBAR */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ bgcolor: '#1976d2' }}>
                    Thêm Người Dùng
                </Button>
                <Box display="flex" gap={1} bgcolor="white" p={0.5} borderRadius={1} boxShadow={1}>
                    <TextField
                        size="small" placeholder="Tìm theo tên, email..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }}
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
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell>Họ và Tên</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Vai Trò</TableCell>
                            <TableCell align="center">Trạng Thái</TableCell>
                            <TableCell align="center">Hành Động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: `${getRoleColor(user.role)}.main`, fontSize: 14 }}>{user.fullName?.charAt(0)}</Avatar>
                                        <Box fontWeight="500">{user.fullName}</Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip label={getRoleName(user.role)} color={getRoleColor(user.role) as any} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Switch checked={Boolean(user.active)} onChange={() => handleToggleStatus(user.id)} color="success" disabled={user.role === 'ADMIN'} />
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Sửa thông tin">
                                        <IconButton color="primary" size="small" onClick={() => handleOpenEdit(user)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Đặt lại mật khẩu">
                                        <IconButton color="warning" size="small" onClick={() => handleOpenReset(user)}>
                                            <LockResetIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa tài khoản">
                                        <IconButton color="error" size="small" onClick={() => handleDelete(user)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Không có dữ liệu</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 4. DIALOG */}
            <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {dialogType === 'CREATE' && "Tạo Tài Khoản Mới"}
                        {dialogType === 'EDIT' && "Cập Nhật Thông Tin"}
                        {dialogType === 'RESET' && "Cấp Lại Mật Khẩu"}
                    </DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            {(dialogType === 'CREATE' || dialogType === 'EDIT') && (
                                <>
                                    <TextField label="Họ và Tên" fullWidth {...register("fullName", { required: "Vui lòng nhập họ tên" })} error={!!errors.fullName} />
                                    <TextField label="Email" fullWidth type="email" {...register("email", { required: "Vui lòng nhập email" })} error={!!errors.email} />
                                </>
                            )}
                            {(dialogType === 'CREATE' || dialogType === 'RESET') && (
                                <TextField label={dialogType === 'RESET' ? "Mật khẩu mới" : "Mật khẩu"} fullWidth type="password" {...register("password", { required: "Nhập mật khẩu", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })} error={!!errors.password} helperText={errors.password?.message as string} />
                            )}
                            {(dialogType === 'CREATE' || dialogType === 'EDIT') && (
                                <TextField select label="Vai trò" fullWidth defaultValue="STUDENT" {...register("role")}>
                                    <MenuItem value="STUDENT">Sinh Viên</MenuItem>
                                    <MenuItem value="LECTURER">Giảng Viên</MenuItem>
                                    <MenuItem value="HEAD_DEPARTMENT">Trưởng Khoa</MenuItem>
                                    <MenuItem value="STAFF">Phòng Đào Tạo</MenuItem>
                                    <MenuItem value="ADMIN">Quản Trị Viên</MenuItem>
                                </TextField>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleClose} color="inherit">Hủy</Button>
                        <Button type="submit" variant="contained">Lưu Thay Đổi</Button>
                    </DialogActions>
                </form>
            </Dialog>

        </Box>
    );
};

export default UserManager;