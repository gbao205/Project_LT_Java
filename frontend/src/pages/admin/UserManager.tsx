import { useEffect, useState } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Switch, TextField,
    InputAdornment, IconButton, Tooltip, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getAllUsers, toggleUserStatus } from '../../services/userService';
import AdminLayout from '../../components/layout/AdminLayout';

const UserManager = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    // Hàm load dữ liệu
    const fetchUsers = async () => {
        try {
            const res = await getAllUsers(search);
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách user:", error);
        }
    };

    // Gọi lần đầu và khi search thay đổi (debounce 500ms)
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    // Xử lý khóa/mở khóa
    const handleToggleStatus = async (id: number) => {
        try {
            await toggleUserStatus(id);
            // Cập nhật lại giao diện ngay lập tức (Optimistic UI)
            setUsers(prev => prev.map(u =>
                u.id === id ? { ...u, active: !u.active } : u
            ));
        } catch (error) {
            alert("Có lỗi khi cập nhật trạng thái!");
            fetchUsers(); // Load lại nếu lỗi
        }
    };

    // Hàm tô màu Role
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'LECTURER': return 'info';
            case 'STUDENT': return 'success';
            default: return 'default';
        }
    };

    return (
        <AdminLayout title="Quản Lý Người Dùng">

            {/* THANH CÔNG CỤ (Tìm kiếm + Refresh) */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Box display="flex" gap={1} bgcolor="white" p={0.5} borderRadius={1} boxShadow={1}>
                    <TextField
                        size="small"
                        placeholder="Tìm theo tên, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: '250px' }}
                    />
                    <Tooltip title="Tải lại danh sách">
                        <IconButton onClick={fetchUsers} size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* BẢNG DỮ LIỆU */}
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
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
                                        <Avatar
                                            sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: 14 }}
                                            src={user.avatar} // Nếu có avatar ảnh thì hiện, ko thì hiện chữ cái
                                        >
                                            {user.fullName?.charAt(0)}
                                        </Avatar>
                                        {user.fullName}
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role}
                                        color={getRoleColor(user.role) as any}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title={user.active ? "Đang hoạt động" : "Đã bị khóa"}>
                                        <Switch
                                            checked={user.active}
                                            onChange={() => handleToggleStatus(user.id)}
                                            color="success"
                                            disabled={user.role === 'ADMIN'} // Không cho khóa Admin
                                        />
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
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