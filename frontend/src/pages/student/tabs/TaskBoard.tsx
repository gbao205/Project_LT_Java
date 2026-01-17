import { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, Card, CardContent, Chip,
    Button, Dialog, DialogTitle, DialogContent, TextField,
    MenuItem, DialogActions, Tooltip, CircularProgress, Alert, IconButton,
    Menu
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import taskService from '../../../services/taskService';
import studentService from '../../../services/studentService';
import { workspaceService } from '../../../services/workspaceService';
import { type Task, TaskStatus, type CreateTaskRequest } from '../../../types/Task';
import AdminLayout from '../../../components/layout/AdminLayout';
import { useConfirm } from '../../../context/ConfirmContext';
import { useAppSnackbar } from '../../../hooks/useAppSnackbar';

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

const STATUS_ORDER = [
    TaskStatus.TO_DO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.REVIEW,
    TaskStatus.DONE,
    TaskStatus.CANCELED
];

const TaskBoard = ({ teamId }: { teamId: number }) => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const { confirm } = useConfirm();
    const { showSuccess, showError } = useAppSnackbar();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTaskRequest>();

    const fetchData = async () => {
        if (!teamId || isNaN(Number(teamId))) {
            setLoading(false);
            return;
        }

        const numericTeamId = Number(teamId);
        try {
            setLoading(true);
            // 1. Chạy song song: Lấy danh sách Task và Chi tiết Nhóm (bao gồm members)
            const [taskList, currentTeam, milestoneRes] = await Promise.all([
                taskService.getTasksByTeam(numericTeamId),
                studentService.getTeamDetail(numericTeamId),
                workspaceService.getMilestones(numericTeamId)
            ]);

            // Cập nhật Tasks
            setTasks(taskList);
            setMilestones(milestoneRes.data);

            if (currentTeam?.members) {
                setMembers(currentTeam.members);
            }

        } catch (error) {
            console.error("Lỗi tải dữ liệu Board:", error);
            showError("Không thể tải dữ liệu bảng công việc");
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetchData khi teamId thay đổi
    useEffect(() => {
        fetchData();
    }, [teamId]);

    // Xử lý tạo mới
    const onCreateSubmit = async (data: any) => {
        if (!teamId) return;

        try {
            await taskService.createTask({
                ...data,
                teamId: Number(teamId),
                assignedToId: data.assignedToId ? Number(data.assignedToId) : undefined,
                milestoneId: data.milestoneId ? Number(data.milestoneId) : undefined,
                dueDate: data.dueDate ? `${data.dueDate}T23:59:59` : undefined
            });
            showSuccess("Tạo nhiệm vụ thành công!");
            setOpen(false);
            reset();
            fetchData();
        } catch (error: any) {
            showError(error.response?.data?.message || "Lỗi khi tạo công việc!");
        }
    };

    const isTaskLocked = (task: Task) => {
        if (!task.milestone) return false;
        const associatedMs = milestones.find(ms => ms.id === task.milestone?.id);
        return !!associatedMs?.completed;
    };

    // Xử lý chuyển trạng thái
    const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && isTaskLocked(task)) {
            showError("Giai đoạn này đã kết thúc, không thể thay đổi trạng thái nhiệm vụ!");
            return;
        }
        try {
            await taskService.updateTaskStatus(taskId, newStatus);
            showSuccess(`Đã chuyển sang trạng thái ${newStatus}`);
            fetchData();
        } catch (error: any) {
            showError(error.response?.data?.message || "Không thể chuyển trạng thái!");
        }
    };

    const handleDeleteTask = (task: Task) => {
        confirm({
            title: "Xóa nhiệm vụ?",
            message: (
                <>Bạn có chắc chắn muốn xóa nhiệm vụ <strong>{task.title}</strong>?</>
            ),
            onConfirm: async () => {
                try {
                    await taskService.deleteTask(task.id);
                    showSuccess("Đã xóa nhiệm vụ thành công");
                    fetchData();
                } catch (error: any) {
                    showError("Lỗi khi xóa nhiệm vụ");
                }
            }
        });
    };

    const handleOpenAssigneeMenu = (event: React.MouseEvent<HTMLElement>, task: Task) => {
        setAnchorEl(event.currentTarget);
        setActiveTask(task);
    };

    const handleCloseAssigneeMenu = () => {
        setAnchorEl(null);
        setActiveTask(null);
    };

    const handleAssignMember = async (studentId: number | null) => {
        if (!activeTask) return;

        if (isTaskLocked(activeTask)) {
            showError("Không thể thay đổi người thực hiện cho nhiệm vụ đã khóa!");
            handleCloseAssigneeMenu();
            return;
        }

        try {
            await taskService.updateTask(activeTask.id, { 
                assignedToId: studentId ?? undefined
            });
            showSuccess("Đã cập nhật người thực hiện");
            fetchData(); // Load lại dữ liệu
        } catch (error: any) {
            showError("Không thể cập nhật người thực hiện");
        } finally {
            handleCloseAssigneeMenu();
        }
    };

    // Render cột
    const renderColumn = (status: TaskStatus, title: string) => {
        const tasksInCol = tasks.filter(t => {

            const associatedMs = milestones.find(ms => ms.id === t.milestone?.id);
            const isMilestoneDone = associatedMs?.completed;

            if (isMilestoneDone && t.status === TaskStatus.DONE) {
                return false;
            }

            const effectiveStatus = (isMilestoneDone && t.status !== TaskStatus.DONE)
                ? TaskStatus.CANCELED
                : t.status; 

            return effectiveStatus === status;
        });

        return (
            <Box  
                key={status} 
                sx={{
                    flex: 1, 
                    minWidth: '210px',
                    maxWidth: '20%',
                    display: 'flex', 
                    flexDirection: 'column',
                    boxSizing: 'border-box'
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        py: 2,
                        px: 0,
                        bgcolor: '#f4f5f7',
                        minHeight: '100%',
                        width: '100%',
                        boxSizing: 'border-box',
                        borderTop: `4px solid`,
                        borderColor: `${STATUS_COLORS[status]}.main`,
                    }}
                >
                    <Typography 
                        variant="subtitle1" 
                        fontWeight="bold" 
                        mb={2} 
                        sx={{ 
                            textTransform: 'uppercase', 
                            fontSize: '0.85rem', 
                            color: 'text.secondary',
                            display: 'flex',           
                            justifyContent: 'center',  
                            alignItems: 'center',     
                            textAlign: 'center'   
                        }}
                    >
                        {title.replace('_', ' ')} 
                        <Chip label={tasksInCol.length} size="small" sx={{ ml: 1, height: 20 }} />
                    </Typography>

                    {tasksInCol.map(task => {
                        const isLocked = isTaskLocked(task);

                        return (
                            <Card 
                                key={task.id}  
                                sx={{
                                    position: 'relative', 
                                    mb: 2, 
                                    bgcolor: isLocked ? '#fcfcfc' : 'white',
                                    opacity: isLocked ? 0.75 : 1,
                                    border: isLocked ? '1px dashed #ccc' : '1px solid #e0e0e0',
                                    '&:hover': { boxShadow: 3 } 
                                }}
                            >
                                <CardContent sx={{'&:last-child': { pb: 1 } }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                        <Typography variant="body1" fontWeight="600" gutterBottom sx={{ pr: 2 }}>
                                            {task.title}
                                        </Typography>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteTask(task)} sx={{ mt: -0.5, mr: -0.5 }}>
                                            <DeleteIcon fontSize="inherit" />
                                        </IconButton>
                                    </Box>

                                    {task.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {task.description}
                                        </Typography>
                                    )}

                                    <Box display="flex" flexDirection="column" gap={1} mb={2}>
                                        <Box 
                                            display="inline-flex"
                                            alignItems="center" 
                                            gap={1} 
                                            sx={{ 
                                                cursor: 'pointer', 
                                                p: 0.5, 
                                                borderRadius: 1,
                                                '&:hover': { bgcolor: 'action.hover' },
                                                color: 'text.secondary',
                                                fontSize: '0.8rem'
                                            }}
                                            onClick={(e) => !isLocked && handleOpenAssigneeMenu(e, task)}
                                        >
                                            <PersonIcon fontSize="inherit" /> 
                                            <Typography variant="caption" fontWeight="medium">
                                                {task.assignedTo ? task.assignedTo.fullName : 'Chưa gán (Unassigned)'}
                                            </Typography>
                                        </Box>

                                        {task.milestone && (
                                            <Box 
                                                display="flex" 
                                                gap={1} 
                                                sx={{ 
                                                    px: 0.5,
                                                    color: 'primary.main', 
                                                    fontSize: '0.8rem' 
                                                }}
                                            >
                                                <FlagIcon fontSize="inherit" sx={{ fontSize: '0.9rem', mt: 0.5 }} />
                                                <Typography variant="caption" fontWeight="bold">
                                                    {task.milestone.title}
                                                </Typography>
                                            </Box>
                                        )}
                                        
                                        {task.dueDate && (
                                            <Box display="flex" alignItems="center" gap={1} color="error.main" fontSize="0.8rem">
                                                <EventIcon fontSize="inherit" /> {new Date(task.dueDate).toLocaleDateString()}
                                            </Box>
                                        )}
                                    </Box>

                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                        {VALID_TRANSITIONS[status]
                                            ?.slice() // Tạo bản sao để tránh làm thay đổi mảng gốc
                                            .sort((a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b)) // Sắp xếp theo thứ tự ưu tiên
                                            .map(nextStatus => (
                                                <Tooltip key={nextStatus} title={`Chuyển sang ${nextStatus}`}>
                                                    <Chip
                                                        label={nextStatus.replace('_', ' ')}
                                                        size="small"
                                                        onClick={() => handleStatusChange(task.id, nextStatus)}
                                                        color={STATUS_COLORS[nextStatus]}
                                                        variant="outlined"
                                                        clickable
                                                        // Nếu trạng thái là "ngược lại" (về TO DO), có thể đổi icon thành ArrowBack
                                                        icon={STATUS_ORDER.indexOf(nextStatus) < STATUS_ORDER.indexOf(status) 
                                                            ? <ArrowBackIcon fontSize="small" style={{ fontSize: '0.7rem' }} /> 
                                                            : <ArrowForwardIcon fontSize="small" style={{ fontSize: '0.7rem' }} />
                                                        }
                                                        sx={{ fontSize: '0.65rem', height: 22 }}
                                                    />
                                                </Tooltip>
                                            ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        )
                    })}

                    {tasksInCol.length === 0 && (
                        <Typography variant="caption" color="text.disabled" fontStyle="italic" align="center" display="block" mt={4}>
                            Trống
                        </Typography>
                    )}
                </Paper>
            </Box>
        );
    };

    // Xử lý giao diện khi không có ID hoặc ID lỗi
    if (!teamId || isNaN(Number(teamId))) {
        return (
            <AdminLayout title="Lỗi">
                <Alert severity="error">
                    Không tìm thấy thông tin nhóm. Vui lòng chọn nhóm từ trang chủ.
                    <Button color="inherit" size="small" onClick={() => navigate('/home')}> Quay lại trang chủ </Button>
                </Alert>
            </AdminLayout>
        );
    }

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
        </Box>
    );

    return (
        <Box>
            <Box display="flex" justifyContent="flex-end" mb={3}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Tạo Việc Mới
                </Button>
            </Box>

            <Box 
                sx={{ 
                display: 'flex', 
                flexDirection: 'row',
                flexWrap: 'wrap', 
                width: '100%', 
                gap: 2,         
                justifyContent: 'flex-start' 
            }}
            >
                {Object.values(TaskStatus).map(status => renderColumn(status, status))}
            </Box>

            {/* Dialog Tạo Task */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit(onCreateSubmit)}>
                    <DialogTitle>Tạo Nhiệm Vụ Mới</DialogTitle>
                    <DialogContent dividers>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField label="Tiêu đề" fullWidth {...register("title", { required: true })} error={!!errors.title}/>
                            <TextField label="Mô tả" fullWidth multiline rows={3} {...register("description")} />
                            
                            <TextField 
                                select 
                                label="Thuộc Cột mốc (Milestone)" 
                                fullWidth 
                                defaultValue="" 
                                inputProps={register("milestoneId")}
                            >
                                <MenuItem value=""><em>-- Không bắt buộc --</em></MenuItem>
                                {/* Lọc: Chỉ hiện những milestone chưa hoàn thành */}
                                {milestones
                                    ?.filter(ms => !ms.completed) 
                                    .map(ms => (
                                        <MenuItem key={ms.id} value={ms.id}>
                                            {ms.title}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>

                            <TextField select label="Người thực hiện" fullWidth defaultValue="" inputProps={register("assignedToId")}>
                                <MenuItem value=""><em>-- Chưa giao --</em></MenuItem>
                                {members.map(m => (
                                    <MenuItem key={m.student.id} value={m.student.id}>
                                        {m.student.fullName} ({m.role})
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField type="date" label="Hạn chót" fullWidth InputLabelProps={{ shrink: true }} {...register("dueDate")} />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Hủy</Button>
                        <Button type="submit" variant="contained">Tạo Task</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseAssigneeMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',      
                    horizontal: 'left',   
                }}
                PaperProps={{
                    sx: { 
                        width: 280, 
                        mt: 1,     
                        ml: -4,   
                        boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
                        borderRadius: '12px'
                    }
                }}
            >
                <Typography variant="overline" sx={{ px: 2, py: 1, display: 'block', color: 'text.disabled' }}>
                    Gán cho thành viên
                </Typography>

                {/* Option: Bỏ gán */}
                <MenuItem onClick={() => handleAssignMember(null)}>
                    <PersonIcon sx={{ mr: 1, color: 'text.disabled' }} />
                    <Typography variant="body2">Chưa gán (Unassigned)</Typography>
                </MenuItem>

                <hr style={{ border: '0.5px solid #eee', margin: '4px 0' }} />

                {/* Danh sách thành viên */}
                {members.map((m) => (
                    <MenuItem 
                        key={m.student.id} 
                        onClick={() => handleAssignMember(m.student.id)}
                        selected={activeTask?.assignedTo?.id === m.student.id}
                    >
                        <Box display="flex" alignItems="center" width="100%">
                            {/* Avatar giả lập bằng chữ cái đầu */}
                            <Box 
                                sx={{ 
                                    width: 24, height: 24, bgcolor: 'primary.main', 
                                    borderRadius: '50%', color: 'white', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', 
                                    fontSize: '0.7rem', mr: 1.5, fontWeight: 'bold' 
                                }}
                            >
                                {m.student.fullName.charAt(0).toUpperCase()}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2">{m.student.fullName}</Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {m.student.email || m.role}
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default TaskBoard;