import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, TextField, Button, Chip, 
    Divider, LinearProgress, Alert, AlertTitle, Tooltip
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import CommentIcon from '@mui/icons-material/Comment'; // Icon cho phần phản hồi

import { workspaceService } from '../../../services/workspaceService';
import { useConfirm } from '../../../context/ConfirmContext';
import { useAppSnackbar } from '../../../hooks/useAppSnackbar';
import taskService from '../../../services/taskService'; 

const MilestoneTab = ({ teamId }: { teamId: number }) => {
    const [milestones, setMilestones] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any>({});
    const [loading, setLoading] = useState(true);

    const [teamTasks, setTeamTasks] = useState<any[]>([]); // Lưu tất cả task của nhóm

    const { confirm } = useConfirm();
    const { showSuccess, showError } = useAppSnackbar();

    useEffect(() => {
        loadData();
    }, [teamId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load song song Milestone và Tasks
            const [milestoneRes, taskRes] = await Promise.all([
                workspaceService.getMilestones(teamId),
                taskService.getTasksByTeam(teamId)
            ]);

            setMilestones(milestoneRes.data);
            setTeamTasks(taskRes);

            // Khởi tạo state cho Answer và TaskIds đã lưu từ trước
            const existingAnswers: any = {};
            const existingTaskIds: any = {};

            milestoneRes.data.forEach((m: any) => {
                existingAnswers[m.id] = m.answer || "";
                existingTaskIds[m.id] = m.completedTaskIds || []; // Giả sử backend trả về trường này
            });

            setAnswers(existingAnswers);
        } catch (error) {
            showError("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAnswer = async (milestoneId: number) => {
        try {
            const currentAnswer = (answers[milestoneId] || "").trim();

            const automaticTaskIds = teamTasks
                .filter(t => t.milestone?.id === milestoneId && t.status === 'DONE')
                .map(t => t.id);

            await workspaceService.submitMilestoneAnswer(teamId, milestoneId, answers[milestoneId], automaticTaskIds);
            showSuccess("Đã lưu báo cáo thành công!");

            setMilestones(prevMilestones => 
                prevMilestones.map(m => 
                    m.id === milestoneId 
                        ? { ...m, answer: currentAnswer, completedTaskIds: automaticTaskIds } 
                        : m
                )
            );
        } catch (error) {
            showError("Không thể lưu báo cáo.");
        }
    };

    const handleMarkDone = (m: any) => {
        confirm({
            title: "Xác nhận hoàn thành?",
            message: (
                <>
                    Bạn có chắc chắn muốn xác nhận hoàn thành mốc: <strong>{m.title}</strong>? 
                    Sau khi xác nhận, bạn sẽ không thể chỉnh sửa báo cáo.
                </>
            ),
            onConfirm: async () => {
                try {
                    // Lấy danh sách task ID đã DONE thuộc milestone này
                    const automaticTaskIds = teamTasks
                        .filter(t => t.milestone?.id === m.id && t.status === 'DONE')
                        .map(t => t.id);

                    // Gọi API lưu báo cáo trước (để cập nhật taskIds và answer mới nhất)
                    // Điều này đảm bảo bản ghi TeamMilestoneStatus tồn tại và chính xác
                    await workspaceService.submitMilestoneAnswer(
                        teamId, 
                        m.id, 
                        answers[m.id] || "", 
                        automaticTaskIds
                    );

                    // Bước 3: Gọi API xác nhận hoàn thành để chốt trạng thái
                    await workspaceService.markMilestoneDone(teamId, m.id);

                    showSuccess("Cột mốc đã được đánh dấu hoàn thành!");
                    loadData();
                } catch (error) {
                    showError("Có lỗi xảy ra khi cập nhật trạng thái.");
                }
            }
        });
    };

    // --- Logic tính toán tiến độ ---
    const completedCount = milestones.filter(m => m.completed).length;
    const totalCount = milestones.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    if (loading) return <LinearProgress />;

    return (
        <Box>
            {/* 1. Thanh tiến độ dự án */}
            <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        TIẾN ĐỘ HOÀN THÀNH LỘ TRÌNH
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                        {completedCount}/{totalCount} Cột mốc ({Math.round(progressPercentage)}%)
                    </Typography>
                </Box>
                <LinearProgress 
                    variant="determinate" 
                    value={progressPercentage} 
                    sx={{ height: 10, borderRadius: 5, bgcolor: '#e0e0e0' }} 
                />
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlagIcon color="primary" /> Lộ trình dự án (Milestones)
            </Typography>
            
            {milestones.map((m) => {

                // Lấy danh sách ID các task đang có trạng thái DONE thực tế hiện tại
                const currentTaskIds = teamTasks
                    .filter(t => t.milestone?.id === m.id && t.status === 'DONE')
                    .map(t => t.id)
                    .sort((a, b) => a - b);

                // Lấy danh sách ID các task đã được lưu trong database trước đó
                const savedTaskIds = [...(m.completedTaskIds || [])].sort((a, b) => a - b);

                // So sánh sự thay đổi của danh sách Task
                const hasTaskChange = JSON.stringify(currentTaskIds) !== JSON.stringify(savedTaskIds);
                const currentText = (answers[m.id] || "").trim();
                // So sánh sự thay đổi của nội dung văn bản (Answer)
                const hasTextChange = currentText !== (m.answer || "").trim();

                // Nút lưu báo cáo sẽ bị disable nếu KHÔNG có thay đổi nào
                const isSaveDisabled = !hasTaskChange && !hasTextChange;

                // Nút xác nhận hoàn thành bị disable nếu không có nhiệm vụ nào hoàn thành và không có nội dung
                const hasCompletedTasks = currentTaskIds.length > 0;
                const hasReportContent = currentText.length > 0;

                const canConfirm = hasCompletedTasks || hasReportContent;

                return (
                    <Paper key={m.id} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, position: 'relative' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">{m.title}</Typography>
                                <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
                                    Hạn nộp: {new Date(m.dueDate).toLocaleDateString()}
                                </Typography>
                            </Box>
                            <Chip 
                                label={m.completed ? "Đã hoàn thành" : "Chưa hoàn thành"} 
                                color={m.completed ? "success" : "warning"} 
                                variant={m.completed ? "filled" : "outlined"}
                                size="small" 
                            />
                        </Box>
                        <Typography variant="body2" sx={{ my: 1, color: 'text.secondary' }}>{m.description}</Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
                            Nhiệm vụ đã hoàn thành trong giai đoạn này (Hệ thống tự động ghi nhận):
                        </Typography>

                        <Box sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa', maxHeight: 300, overflowY: 'auto' }}>
                            {teamTasks.filter(t => t.milestone?.id === m.id && t.status === 'DONE').length > 0 ? (
                                teamTasks
                                    .filter(t => t.milestone?.id === m.id && t.status === 'DONE')
                                    .map((task) => (
                                        <Box key={task.id} sx={{ p: 1.5, borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 'none' } }}>
                                            <Typography variant="body2" fontWeight="bold">{task.title}</Typography>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                                {task.description || "Không có mô tả"}
                                            </Typography>
                                            <Box display="flex" gap={3}>
                                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PersonIcon sx={{ fontSize: 14 }} /> {task.assignedTo?.fullName || 'Chưa gán'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <EventIcon sx={{ fontSize: 14 }} /> 
                                                    Hạn: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))
                            ) : (
                                <Typography variant="caption" color="text.disabled" sx={{ p: 2, display: 'block', textAlign: 'center' }}>
                                    Chưa có nhiệm vụ nào hoàn thành trong giai đoạn này.
                                </Typography>
                            )}
                        </Box>

                        <Typography variant="subtitle2" gutterBottom>Nội dung báo cáo của nhóm:</Typography>
                        <TextField 
                            fullWidth multiline rows={3} variant="outlined"
                            placeholder="Nhập link tài liệu hoặc tóm tắt kết quả giai đoạn này..."
                            value={answers[m.id] || ""}
                            onChange={(e) => setAnswers({...answers, [m.id]: e.target.value})}
                            disabled={m.completed}
                        />

                        {m.feedback && (
                            <Alert severity="info" icon={<CommentIcon fontSize="small" />} sx={{ mt: 2, bgcolor: '#e3f2fd' }}>
                                <AlertTitle sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Phản hồi từ Giảng viên</AlertTitle>
                                <Typography variant="body2" fontStyle="italic">
                                    "{m.feedback}"
                                </Typography>
                            </Alert>
                        )}

                        <Box mt={2} display="flex" gap={1}>
                            {!m.completed && (
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    onClick={() => handleUpdateAnswer(m.id)}
                                    disabled={isSaveDisabled}
                                >
                                    Lưu báo cáo
                                </Button>
                            )}
                            
                            {!m.completed && (
                                <Tooltip title={!hasCompletedTasks ? "Bạn cần ít nhất 1 nhiệm vụ hoàn thành để xác nhận" : ""}>
                                    <span>
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            color="success" 
                                            onClick={() => handleMarkDone(m)}
                                            // Vô hiệu hóa nếu chưa có task nào DONE
                                            disabled={!canConfirm}
                                            sx={{
                                                "&.Mui-disabled": {
                                                    borderColor: 'rgba(0, 0, 0, 0.12)',
                                                    color: 'rgba(0, 0, 0, 0.26)'
                                                }
                                            }}
                                        >
                                            Xác nhận hoàn thành
                                        </Button>
                                    </span>
                                </Tooltip>
                            )}
                        </Box>
                    </Paper>
                );
            })}
        </Box>
    );
};

export default MilestoneTab;