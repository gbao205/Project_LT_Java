import { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, Grid, Card, CardContent, Chip,
    Button, Dialog, DialogTitle, DialogContent, TextField,
    MenuItem, DialogActions, Tooltip, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate

import taskService from '../../services/taskService';
import { getAllUsers } from '../../services/userService';
import { type Task, TaskStatus, type CreateTaskRequest } from '../../types/Task';
import AdminLayout from '../../components/layout/AdminLayout';

const STATUS_COLORS: Record<TaskStatus, any> = {
    [TaskStatus.TO_DO]: 'default',
    [TaskStatus.IN_PROGRESS]: 'info',
    [TaskStatus.REVIEW]: 'warning',
    [TaskStatus.DONE]: 'success',
    [TaskStatus.CANCELED]: 'error',
};

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TO_DO]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELED],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.TO_DO, TaskStatus.CANCELED],
    [TaskStatus.REVIEW]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS, TaskStatus.CANCELED],
    [TaskStatus.DONE]: [TaskStatus.CANCELED],
    [TaskStatus.CANCELED]: [TaskStatus.TO_DO],
};

const TaskBoard = () => {
    // 1. Lấy teamId từ URL (Thay vì hardcode)
    const { teamId } = useParams<{ teamId: string }>();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTaskRequest>();

    // Load dữ liệu
    const fetchData = async () => {
        // Kiểm tra nếu teamId không tồn tại hoặc không phải số
        if (!teamId || isNaN(Number(teamId))) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [taskList, userList] = await Promise.all([
                taskService.getTasksByTeam(Number(teamId)),
                getAllUsers()
            ]);
            setTasks(taskList);
            setUsers(userList.data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetchData khi teamId thay đổi
    useEffect(() => {
        fetchData();
    }, [teamId]);

    // Xử lý tạo mới
    const onCreateSubmit = async (data: CreateTaskRequest) => {
        if (!teamId) return;

        try {
            await taskService.createTask({
                ...data,
                teamId: Number(teamId), // Dùng teamId từ URL
                assignedToId: data.assignedToId ? Number(data.assignedToId) : undefined
            });
            alert("Tạo công việc thành công!");
            setOpen(false);
            reset();
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi tạo công việc!");
        }
    };

    // Xử lý chuyển trạng thái
    const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
        try {
            await taskService.updateTaskStatus(taskId, newStatus);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Không thể chuyển trạng thái này!");
        }
    };

    // Render cột
    const renderColumn = (status: TaskStatus, title: string) => {
        const tasksInCol = tasks.filter(t => t.status === status);

        return (
            <Grid item xs={12} md={2.4} key={status}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        bgcolor: '#f4f5f7',
                        minHeight: '100%',
                        borderTop: `4px solid`,
                        borderColor: `${STATUS_COLORS[status]}.main`
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="bold" mb={2} sx={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'text.secondary' }}>
                        {title} <Chip label={tasksInCol.length} size="small" sx={{ ml: 1, height: 20 }} />
                    </Typography>

                    {tasksInCol.map(task => (
                        <Card key={task.id} sx={{ mb: 2, position: 'relative', '&:hover': { boxShadow: 3 } }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Typography variant="body1" fontWeight="600" gutterBottom>
                                    {task.title}
                                </Typography>

                                {task.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {task.description}
                                    </Typography>
                                )}

                                <Box display="flex" flexDirection="column" gap={1} mb={2}>
                                    {task.assignedTo && (
                                        <Box display="flex" alignItems="center" gap={1} color="text.secondary" fontSize="0.8rem">
                                            <PersonIcon fontSize="inherit" /> {task.assignedTo.fullName}
                                        </Box>
                                    )}
                                    {task.dueDate && (
                                        <Box display="flex" alignItems="center" gap={1} color="error.main" fontSize="0.8rem">
                                            <EventIcon fontSize="inherit" /> {new Date(task.dueDate).toLocaleDateString()}
                                        </Box>
                                    )}
                                </Box>

                                <Box display="flex" flexWrap="wrap" gap={0.5} justifyContent="flex-end">
                                    {VALID_TRANSITIONS[status]?.map(nextStatus => (
                                        <Tooltip key={nextStatus} title={`Chuyển sang ${nextStatus}`}>
                                            <Chip
                                                label={nextStatus.replace('_', ' ')}
                                                size="small"
                                                onClick={() => handleStatusChange(task.id, nextStatus)}
                                                color={STATUS_COLORS[nextStatus]}
                                                variant="outlined"
                                                clickable
                                                icon={<ArrowForwardIcon fontSize="small" />}
                                                sx={{ fontSize: '0.7rem' }}
                                            />
                                        </Tooltip>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    ))}

                    {tasksInCol.length === 0 && (
                        <Typography variant="caption" color="text.disabled" fontStyle="italic" align="center" display="block" mt={4}>
                            Trống
                        </Typography>
                    )}
                </Paper>
            </Grid>
        );
    };

    // Xử lý giao diện khi không có ID hoặc ID lỗi
    if (!teamId || isNaN(Number(teamId))) {
        return (
            <AdminLayout title="Lỗi">
                <Alert severity="error">
                    Không tìm thấy thông tin nhóm. Vui lòng chọn nhóm từ trang chủ.
                    <Button color="inherit" size="small" onClick={() => navigate('/home')}>
                        Quay lại trang chủ
                    </Button>
                </Alert>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`Quản Lý Công Việc - Team #${teamId}`}>
            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box display="flex" justifyContent="flex-end" mb={3}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                            Tạo Công Việc Mới
                        </Button>
                    </Box>

                    <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                        {renderColumn(TaskStatus.TO_DO, "Cần làm")}
                        {renderColumn(TaskStatus.IN_PROGRESS, "Đang làm")}
                        {renderColumn(TaskStatus.REVIEW, "Chờ duyệt")}
                        {renderColumn(TaskStatus.DONE, "Hoàn thành")}
                        {renderColumn(TaskStatus.CANCELED, "Đã hủy")}
                    </Grid>
                </>
            )}

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit(onCreateSubmit)}>
                    <DialogTitle>Giao Nhiệm Vụ Mới</DialogTitle>
                    <DialogContent dividers>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                label="Tiêu đề công việc" fullWidth
                                {...register("title", { required: "Vui lòng nhập tiêu đề" })}
                                error={!!errors.title}
                                helperText={errors.title?.message}
                            />
                            <TextField
                                label="Mô tả chi tiết" fullWidth multiline rows={4}
                                {...register("description")}
                            />
                            <TextField
                                type="datetime-local" label="Hạn chót (Deadline)" fullWidth
                                InputLabelProps={{ shrink: true }}
                                {...register("dueDate")}
                            />
                            <TextField
                                select label="Giao cho thành viên" fullWidth defaultValue=""
                                inputProps={register("assignedToId")}
                            >
                                <MenuItem value=""><em>-- Để trống (Chưa giao) --</em></MenuItem>
                                {users.map(u => (
                                    <MenuItem key={u.id} value={u.id}>
                                        {u.fullName} ({u.email})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Hủy bỏ</Button>
                        <Button type="submit" variant="contained">Xác nhận tạo</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </AdminLayout>
    );
};

export default TaskBoard;