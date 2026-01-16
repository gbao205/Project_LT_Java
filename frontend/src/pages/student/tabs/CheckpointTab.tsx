import { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, Checkbox, Paper, TextField, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, 
    IconButton, Tooltip, Avatar, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';

import { workspaceService } from '../../../services/workspaceService';
import studentService from '../../../services/studentService';
import { useConfirm } from '../../../context/ConfirmContext';
import { useAppSnackbar } from '../../../hooks/useAppSnackbar';

const CheckpointTab = ({ teamId }: { teamId: number }) => {
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newCp, setNewCp] = useState({ 
        title: '', 
        content: '', 
        dueDate: '', 
        assignedToId: '' 
    });

    const { confirm } = useConfirm();
    const { showSuccess, showError } = useAppSnackbar();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [checkpointList, teamDetail] = await Promise.all([
                workspaceService.getCheckpoints(teamId),
                studentService.getTeamDetail(teamId)
            ]);

            setCheckpoints(checkpointList.data);
            if (teamDetail?.members) {
                setMembers(teamDetail.members);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            showError("Không thể tải danh sách công việc");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [teamId]);

    const handleCreate = async () => {
        try {
            // Chuẩn hóa format ngày tháng trước khi gửi
            const payload = {
                ...newCp,
                dueDate: newCp.dueDate ? `${newCp.dueDate}T23:59:59` : null
            };
            await workspaceService.createCheckpoint(teamId, payload);
            
            showSuccess("Đã thêm việc cần làm mới!");
            setOpenAdd(false);
            setNewCp({ title: '', content: '', dueDate: '', assignedToId: '' });
            fetchData();
        } catch (error: any) {
            showError(error.response?.data?.message || "Không thể tạo việc cần làm.");
        }
    };

    const handleToggle = async (id: number) => {
       try {
            await workspaceService.toggleCheckpoint(id);
            showSuccess("Đã cập nhật trạng thái!");
            fetchData();
        } catch (error) {
            showError("Lỗi khi cập nhật trạng thái.");
        }
    };

    const handleDelete = async (cp: any) => {
       confirm({
            title: "Xóa việc cần làm?",
            message: (
                <>
                    Bạn có chắc chắn muốn xóa việc: <strong>{cp.title}</strong>?
                </>
            ),
            onConfirm: async () => {
                try {
                    await workspaceService.deleteCheckpoint(cp.id);
                    showSuccess("Đã xóa việc cần làm.");
                    fetchData();
                } catch (error) {
                    showError("Lỗi khi xóa.");
                }
            }
        });
    };

    if (loading) return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                <Typography variant="h6" fontWeight="bold">Điểm kiểm tra nội bộ</Typography>
                <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => setOpenAdd(true)}>
                    Thêm việc cần làm
                </Button>
            </Box>

            {checkpoints.map((cp) => (
                <Paper key={cp.id} sx={{ p: 2, mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: cp.isDone ? '4px solid #4caf50' : '4px solid #ff9800' }}>
                    <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
                        <Checkbox checked={cp.done} onChange={() => handleToggle(cp.id)} color="success" />
                        <Box ml={1}>
                            <Typography sx={{ textDecoration: cp.isDone ? 'line-through' : 'none', fontWeight: '500', color: cp.isDone ? 'text.disabled' : 'text.primary' }}>
                                {cp.title}
                            </Typography>
                            <Box display="flex" gap={2} alignItems="center">
                                <Typography variant="caption" color="textSecondary">{cp.content}</Typography>
                                {cp.dueDate && (
                                    <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <EventIcon sx={{ fontSize: 12 }} /> {new Date(cp.dueDate).toLocaleDateString()}
                                    </Typography>
                                )}
                                {cp.assignedTo && (
                                    <Tooltip title={`Người phụ trách: ${cp.assignedTo.fullName}`}>
                                        <Chip 
                                            size="small" 
                                            avatar={<Avatar src={cp.assignedTo.avatar}>{cp.assignedTo.fullName[0]}</Avatar>} 
                                            label={cp.assignedTo.fullName} 
                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => handleDelete(cp)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Paper>
            ))}

            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Tạo việc cần làm mới</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Tiêu đề (Ví dụ: Vẽ ERD)" margin="dense" variant="outlined" 
                        value={newCp.title}
                        onChange={(e) => setNewCp({...newCp, title: e.target.value})} />
                    
                    <TextField fullWidth label="Chi tiết công việc" multiline rows={2} margin="dense" 
                        value={newCp.content}
                        onChange={(e) => setNewCp({...newCp, content: e.target.value})} />

                    <TextField select fullWidth label="Người phụ trách" margin="dense" value={newCp.assignedToId}
                        onChange={(e) => setNewCp({...newCp, assignedToId: e.target.value})}>
                        <MenuItem value=""><em>-- Chưa giao --</em></MenuItem>
                        {members.map((m) => (
                            <MenuItem key={m.student.id} value={m.student.id}>
                                {m.student.fullName} ({m.role})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField type="date" fullWidth label="Hạn chót" margin="dense" InputLabelProps={{ shrink: true }}
                        value={newCp.dueDate}
                        onChange={(e) => setNewCp({...newCp, dueDate: e.target.value})} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenAdd(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={!newCp.title}>Tạo Checkpoint</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CheckpointTab;