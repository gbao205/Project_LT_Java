import { useEffect, useState, useMemo } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Switch, TextField,
    InputAdornment, IconButton, Tooltip, Avatar, Grid, Button,
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
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';

import { getAllUsers, toggleUserStatus, createUser, updateUser, resetUserPassword } from '../../services/userService';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/common/StatCard';

const UserManager = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    // State quản lý Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState<'CREATE' | 'EDIT' | 'RESET'>('CREATE');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

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

    // Mở Dialog Tạo mới
    const handleOpenCreate = () => {
        setDialogType('CREATE');
        setSelectedUser(null);
        reset({ fullName: '', email: '', password: '', role: 'STUDENT' });
        setOpenDialog(true);
    };

    // Mở Dialog Sửa
    const handleOpenEdit = (user: any) => {
        setDialogType('EDIT');
        setSelectedUser(user);
        // Điền dữ liệu cũ vào form
        setValue('fullName', user.fullName);
        setValue('email', user.email);
        setValue('role', user.role);
        setOpenDialog(true);
    };

    // Mở Dialog Reset Pass
    const handleOpenReset = (user: any) => {
        setDialogType('RESET');
        setSelectedUser(user);
        reset({ password: '' }); // Reset ô nhập pass
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        reset();
    };

    // Xử lý Submit chung cho cả 3 trường hợp
    const onSubmit = async (data: any) => {
        try {
            if (dialogType === 'CREATE') {
                await createUser(data);
                alert("Tạo tài khoản thành công!");
            } else if (dialogType === 'EDIT') {
                // Gọi API update
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
                <Grid item xs={6} md={4} lg={2}><StatCard title="Đã Khóa" value={stats.blocked} icon={<BlockIcon fontSize="large"/>} color="#d32f2f" /></Grid>
            </Grid>

            {/* 2. TOOLBAR */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
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
                            <TableCell fontWeight="bold">ID</TableCell>
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 4. DIALOG DYNAMIC (Create / Edit / Reset) */}
            <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {dialogType === 'CREATE' && "Tạo Tài Khoản Mới"}
                        {dialogType === 'EDIT' && "Cập Nhật Thông Tin"}
                        {dialogType === 'RESET' && "Cấp Lại Mật Khẩu"}
                    </DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>

                            {/* Form cho Create & Reset Pass */}
                            {(dialogType === 'CREATE' || dialogType === 'RESET') && (
                                <TextField
                                    label={dialogType === 'RESET' ? "Mật khẩu mới" : "Mật khẩu"}
                                    fullWidth type="password"
                                    {...register("password", { required: "Nhập mật khẩu", minLength: 6 })}
                                    error={!!errors.password}
                                    helperText="Tối thiểu 6 ký tự"
                                />
                            )}

                            {/* Form cho Create & Edit */}
                            {(dialogType === 'CREATE' || dialogType === 'EDIT') && (
                                <>
                                    <TextField
                                        label="Họ và Tên" fullWidth
                                        {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                                        error={!!errors.fullName}
                                    />
                                    <TextField
                                        label="Email" fullWidth type="email"
                                        disabled={dialogType === 'EDIT'} // Không cho sửa Email
                                        {...register("email", { required: "Vui lòng nhập email" })}
                                        error={!!errors.email}
                                    />
                                    <TextField
                                        select label="Vai trò" fullWidth
                                        defaultValue="STUDENT"
                                        {...register("role")}
                                    >
                                        <MenuItem value="STUDENT">Sinh Viên</MenuItem>
                                        <MenuItem value="LECTURER">Giảng Viên</MenuItem>
                                        <MenuItem value="HEAD_DEPARTMENT">Trưởng Bộ Môn</MenuItem>
                                        <MenuItem value="STAFF">Nhân Viên Đào Tạo</MenuItem>
                                        <MenuItem value="ADMIN">Quản Trị Viên</MenuItem>
                                    </TextField>
                                </>
                            )}

                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleClose} color="inherit">Hủy</Button>
                        <Button type="submit" variant="contained">Lưu Thay Đổi</Button>
                    </DialogActions>
                </form>
            </Dialog>

        </AdminLayout>
    );
};

export default UserManager;