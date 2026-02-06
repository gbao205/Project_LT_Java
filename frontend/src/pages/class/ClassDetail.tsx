import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Tabs, Tab, Paper, Button,
    List, ListItem, ListItemText, ListItemIcon, Divider,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip,
    CircularProgress, Grid, Card, CardContent, CardActions, FormControl,
    RadioGroup, FormControlLabel, Radio, Avatar, Tooltip, FormLabel,
    FormGroup, Checkbox, InputAdornment, Alert, DialogContentText,
    Skeleton
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import WarningIcon from '@mui/icons-material/Warning';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'; 
import EventNoteIcon from '@mui/icons-material/EventNote';

import StudentLayout from '../../components/layout/StudentLayout';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';
import studentService from '../../services/studentService';
import api, { BASE_URL } from '../../services/api';

const ClassDetail = () => {
    const { id } = useParams();

    // State dữ liệu
    const [classData, setClassData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const [user, setUser] = useState<any>(null);
    const { showSuccess, showError, showWarning } = useAppSnackbar();

    // State Dialog nhập liệu
    const [openMaterial, setOpenMaterial] = useState(false);
    const [openAssignment, setOpenAssignment] = useState(false);
    const [openSubmit, setOpenSubmit] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
    const [originalSubmission, setOriginalSubmission] = useState<{text: string, comment: string} | null>(null);
    const [deleteOldFile, setDeleteOldFile] = useState(false);

    // State Dialog Team
    const [openCreateTeam, setOpenCreateTeam] = useState(false);
    const [openLeaderDialog, setOpenLeaderDialog] = useState(false);
    const [selectedNewLeaderId, setSelectedNewLeaderId] = useState<number | null>(null);
    const [openRegisterProject, setOpenRegisterProject] = useState(false);
    const [openJoinDialog, setOpenJoinDialog] = useState(false);
    const [joinCode, setJoinCode] = useState("");

    // Form Data & Search
    const [formData, setFormData] = useState({ title: '', description: '', url: '', deadline: '' });

    // State lưu file được chọn từ máy tính
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [myTeam, setMyTeam] = useState<any>(null);
    const [availableTeams, setAvailableTeams] = useState<any[]>([]);
    const [teamName, setTeamName] = useState("");
    const [studentsNoTeam, setStudentsNoTeam] = useState<any[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [projectForm, setProjectForm] = useState({ projectName: '', description: ''});
    const [isLeader, setIsLeader] = useState(false);

    const [teamLoading, setTeamLoading] = useState(false);

    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean, title: string, content: string, onConfirm: () => void }>({
        open: false,
        title: '',
        content: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
        fetchData();
    }, [id]);

    // Hàm reset form để xóa dữ liệu cũ khi mở Dialog
    const resetForm = () => {
        setFormData({ title: '', description: '', url: '', deadline: '' });
        setSelectedFile(null);
    };

    const fetchData = async () => {
        if (!id) return;
        try {
            const response = await api.get(`/classes/${id}/details`);
            const data = response.data;
            // Xử lý dữ liệu trả về linh hoạt (dù là object lồng hay phẳng)
            if (data.classInfo) {
                setClassData({
                    classInfo: data.classInfo,
                    materials: data.materials || [],
                    assignments: data.assignments || []
                });
            } else {
                setClassData({
                    classInfo: data,
                    materials: data.materials || [],
                    assignments: data.assignments || []
                });
            }
        } catch (error) {
            console.error("Lỗi tải lớp:", error);
            showError("Không thể tải thông tin lớp học");
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamData = async () => {
        if (!id || !user) return;
        try {
            setTeamLoading(true);
            const team = await studentService.getMyTeam(id);
            const teams = await studentService.getTeamsInClass(id);
            setAvailableTeams(teams);
            if (team && team.id) {
                setMyTeam(team);
                const currentUserMember = team.members.find((m: any) => m.student?.email === user.email);
                setIsLeader(currentUserMember?.role === 'LEADER');
            } else {
                setMyTeam(null);
                setIsLeader(false);
            }
        } catch (error) {
            console.error("Lỗi tải thông tin nhóm:", error);
        } finally {
            setTeamLoading(false);
        }
    };

    useEffect(() => {
        if (tabIndex === 2) fetchTeamData();
    }, [tabIndex, id]);

    const isLecturer = user?.role === 'LECTURER';

    // --- HÀM UPLOAD TÀI LIỆU (Đã thêm logic File) ---
    const handleCreateMaterial = async () => {
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);

            if (selectedFile) {
                data.append('file', selectedFile);
            } else {
                // Tạo file giả nếu không chọn file (để tránh lỗi Backend)
                const dummyFile = new File([""], "empty.txt", { type: "text/plain" });
                data.append('file', dummyFile);
            }

            if(isLecturer) {
                await api.post(`/lecturer/classes/${id}/materials`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                showWarning("Sinh viên không có quyền upload.");
                return;
            }

            setOpenMaterial(false);
            fetchData();
            showSuccess("Tạo tài liệu thành công!");
        } catch (error: any) {
            showError("Lỗi tạo tài liệu: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    // --- HÀM GIAO BÀI TẬP (Đã thêm logic File + Type) ---
    const handleCreateAssignment = async () => {
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('deadline', formData.deadline);
            data.append('type', 'HOMEWORK'); // Quan trọng: Khớp với Backend

            if (selectedFile) {
                data.append('file', selectedFile);
            }

            if (isLecturer) {
                await api.post(`/lecturer/classes/${id}/assignments`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                showWarning("Bạn không có quyền giao bài tập.");
                return;
            }

            setOpenAssignment(false);
            fetchData();
            showSuccess("Giao bài tập thành công!");
        } catch (error: any) {
            console.error(error);
            showError("Lỗi giao bài tập: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    // --- HÀM NỘP BÀI  ---
    const handleSubmitAssignment = async () => {
        if (!selectedAssignmentId) return;
        try {
            const data = new FormData();
            data.append('submissionText', formData.url || '');
            data.append('comment', formData.description || '');
            data.append('deleteOldFile', deleteOldFile.toString());

            if (selectedFile) {
                data.append('file', selectedFile);
            }

            await api.post(`/classes/assignments/${selectedAssignmentId}/submit`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showSuccess(originalSubmission ? "Cập nhật thành công!" : "Nộp bài thành công!");
            setOpenSubmit(false);
            resetForm();
            fetchData();
        } catch (error) {
            showError("Lỗi nộp bài");
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB tính bằng bytes

        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                alert("File quá lớn! Vui lòng chọn file dưới 10MB.");
                
                event.target.value = ''; 
                return;
            }

            setSelectedFile(file);
        }
    };

    // Mở Dialog nộp bài và điền dữ liệu cũ nếu đã nộp
    const handleOpenSubmitDialog = (ass: any) => {
        setSelectedAssignmentId(ass.id);
        setDeleteOldFile(false);
        setSelectedFile(null);
        if (ass.submission) {
            setFormData({
                ...formData,
                url: ass.submission.submissionText || '',
                description: ass.submission.studentComment || ''
            });
            setOriginalSubmission({
                text: ass.submission.submissionText || '',
                comment: ass.submission.studentComment || ''
            });
        } else {
            resetForm();
            setOriginalSubmission(null);
        }
        setOpenSubmit(true);
    };

    // Logic kiểm tra xem có sự thay đổi nào không
    const hasChanges = () => {
        // 1. Nếu chọn file mới -> Chắc chắn có thay đổi
        if (selectedFile || deleteOldFile) return true;
        
        // 2. Nếu không có bài nộp cũ mà giờ có nhập text -> Có thay đổi
        if (!originalSubmission) {
            return formData.url.trim() !== '' || formData.description.trim() !== '';
        }

        // 3. So sánh text hiện tại với bản gốc
        const isTextChanged = formData.url.trim() !== originalSubmission.text;
        const isCommentChanged = formData.description.trim() !== originalSubmission.comment;

        return isTextChanged || isCommentChanged;
    };

    // ... (CÁC HÀM XỬ LÝ NHÓM - GIỮ NGUYÊN KHÔNG ĐỤNG CHẠM) ...
    const handleOpenCreateTeam = async () => {
        setSearchTerm("");
        setOpenCreateTeam(true);
        try {
            const students = await studentService.getStudentsNoTeam(id!);
            const otherStudents = students.filter((s: any) => s.id != user?.id && s.id != user?.user?.id);
            setStudentsNoTeam(otherStudents);
        } catch (error) {
            console.error("Lỗi lấy danh sách sinh viên:", error);
        }
    };

    const handleToggleStudent = (studentId: number) => {
        setSelectedMemberIds(prev =>
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    const filteredStudents = studentsNoTeam
        .filter((st) => {
            const lowerSearch = searchTerm.toLowerCase();
            return (st.fullName?.toLowerCase().includes(lowerSearch) || st.email?.toLowerCase().includes(lowerSearch));
        })
        .sort((a, b) => {
            const aSelected = selectedMemberIds.includes(a.id);
            const bSelected = selectedMemberIds.includes(b.id);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
        });

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            showWarning("Vui lòng nhập tên nhóm!");
            return;
        }
        try {
            await studentService.createTeam({
                teamName,
                classId: Number(id),
                memberIds: selectedMemberIds
            });
            showSuccess("Tạo nhóm thành công!");
            setOpenCreateTeam(false);
            setTeamName("");
            setSelectedMemberIds([]);
            fetchTeamData();
        } catch (error: any) {
            showError(error.response?.data?.message || "Lỗi tạo nhóm");
        }
    };

    const handleJoinByCode = async () => {
        if (!joinCode.trim()) {
            showWarning("Vui lòng nhập mã nhóm!");
            return;
        }
        try {
            await studentService.joinTeam(joinCode.trim());
            showSuccess("Tham gia nhóm thành công!");
            setOpenJoinDialog(false);
            setJoinCode("");
            fetchData();
            fetchTeamData();
        } catch (error: any) {
            showError(error.response?.data?.message || "Lỗi tham gia nhóm");
        }
    };

    const handleRegisterProject = async () => {
        try {
            await studentService.registerProject({
                classId: Number(id),
                projectName: projectForm.projectName,
                description: projectForm.description
            });
            showSuccess("Đăng ký đề tài thành công! Chờ giảng viên duyệt.");
            setOpenRegisterProject(false);
            fetchTeamData();
        } catch (error: any) {
            showError(error.response?.data?.message || "Lỗi đăng ký đề tài");
        }
    };

    const handleJoinTeam = (team: any) => {
        setConfirmDialog({
            open: true,
            title: "Xác nhận tham gia",
            content: "Bạn có chắc chắn muốn tham gia nhóm này không?",
            onConfirm: async () => {
                try {
                    await studentService.joinTeam(team.joinCode);
                    showSuccess("Tham gia thành công!");
                    fetchTeamData();
                } catch (error: any) {
                    showError(error.response?.data?.message || "Lỗi tham gia");
                }
            }
        });
    };

    const handleLeaveTeamProcess = async () => {
        if (!myTeam || !user) return;
        const currentUserId = user.id || user.user?.id;
        const myMemberInfo = myTeam.members.find((m: any) => m.student?.id == currentUserId);

        if (!myMemberInfo) {
            showError(`Không tìm thấy thông tin thành viên! (ID: ${currentUserId})`);
            return;
        }

        if (myMemberInfo.role !== 'LEADER') {
            setConfirmDialog({
                open: true,
                title: "Rời nhóm",
                content: "Bạn có chắc chắn muốn rời nhóm này?",
                onConfirm: () => executeLeaveTeam()
            });
        } else {
            const otherMembers = myTeam.members.filter((m: any) => m.student?.id != currentUserId);
            if (otherMembers.length === 0) {
                setConfirmDialog({
                    open: true,
                    title: "Giải tán nhóm",
                    content: "Nhóm chỉ còn mình bạn. Hành động này sẽ giải tán nhóm vĩnh viễn. Bạn chắc chứ?",
                    onConfirm: () => executeLeaveTeam()
                });
            } else {
                setOpenLeaderDialog(true);
            }
        }
    };

    const executeLeaveTeam = async () => {
        try {
            await studentService.leaveTeam({ teamId: myTeam.id });
            showSuccess("Đã rời nhóm thành công!");
            setMyTeam(null);
            fetchTeamData();
            setOpenLeaderDialog(false);
        } catch (error: any) {
            showError(error.response?.data?.message || "Lỗi khi rời nhóm");
        }
    };

    const handleConfirmTransferAndLeave = async () => {
        if (!selectedNewLeaderId) {
            showWarning("Vui lòng chọn thành viên kế nhiệm!");
            return;
        }
        try {
            await studentService.assignLeader({ teamId: myTeam.id, newLeaderId: selectedNewLeaderId });
            await executeLeaveTeam();
        } catch (error: any) {
            showError(error.response?.data?.message || "Lỗi khi chuyển quyền");
        }
    };

    const TeamSkeleton = () => (
        <Box>
            <Skeleton variant="rounded" height={200} sx={{ mb: 4, borderRadius: 2 }} />
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
            <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                    <Grid size={{ xs: 12, md: 6, lg: 3 }} key={i}>
                        <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const pageTitle = loading || !classData
        ? "Chi Tiết Lớp Học"
        : `Lớp Học: ${classData.classInfo.name}`;

    const breadcrumbs = [
        { label: 'Lớp Học Của Tôi', path: '/student/classes' }
    ];

    const handleViewMaterial = (fileUrl: string) => {
        if (!fileUrl) {
            showError("Tài liệu này không có đường dẫn hợp lệ");
            return;
        }

        // Nếu là link ngoài (Google Drive, v.v.) thì mở luôn
        if (fileUrl.startsWith('http')) {
            window.open(fileUrl, '_blank');
            return;
        }

        // Xử lý chuỗi để lấy đúng tên file, loại bỏ các tiền tố thừa thường gặp do lỗi code cũ
        const fileName = fileUrl
            .replace(/^\/?api\//, '')      // Xóa /api/ hoặc api/ ở đầu
            .replace(/^\/?uploads\//, '')  // Xóa /uploads/ hoặc uploads/ ở đầu
            .replace(/^\//, '');           // Xóa dấu / ở đầu nếu còn

        const finalUrl = `${BASE_URL}/uploads/${fileName}`;

        console.log("Đang mở tài liệu tại:", encodeURI(finalUrl));
        window.open(encodeURI(finalUrl), '_blank');
    };

    return (
        <StudentLayout title={pageTitle} breadcrumbs={breadcrumbs}>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress color="success" />
                </Box>
            ) : (
                <Box>
                    <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="subtitle1" color="textSecondary">
                                <b>Giảng viên:</b> {classData?.classInfo?.lecturerName || classData?.classInfo?.lecturer?.fullName || "Chưa phân công"}
                            </Typography>
                            <Typography variant="subtitle2" color="textSecondary">
                                <b>Học kỳ:</b> {classData?.classInfo?.semester}
                            </Typography>
                        </Box>
                    </Box>

                    <Paper sx={{ mb: 3 }} elevation={2}>
                        <Tabs
                            value={tabIndex}
                            onChange={(e, v) => setTabIndex(v)}
                            centered
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab label="Tài Liệu Học Tập" icon={<LibraryBooksIcon />} iconPosition="start" />
                            <Tab label="Bài Tập & Deadline" icon={<EventNoteIcon />} iconPosition="start" />
                            <Tab label="Hoạt động Nhóm" icon={<GroupsIcon />} iconPosition="start" />
                        </Tabs>
                    </Paper>

                    {/* TAB 1: TÀI LIỆU */}
                    {tabIndex === 0 && (
                        <Box>
                            {isLecturer && (
                                <Box mb={2} display="flex" justifyContent="flex-end">
                                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpenMaterial(true); }}>
                                        Thêm Tài Liệu
                                    </Button>
                                </Box>
                            )}
                            <Paper elevation={1}>
                                <List>
                                    {(!classData?.materials || classData.materials.length === 0) && (
                                        <ListItem><ListItemText primary="Chưa có tài liệu nào" sx={{ color: 'text.secondary', textAlign: 'center' }} /></ListItem>
                                    )}
                                    {classData?.materials?.map((mat: any, index: number) => (
                                        <Box key={mat.id}>
                                            <ListItem>
                                                <ListItemIcon><DescriptionIcon color="primary" /></ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography
                                                            variant="body1"
                                                            sx={{ 
                                                                cursor: 'pointer', 
                                                                fontWeight: 'bold', 
                                                                color: '#1976d2',
                                                                '&:hover': { textDecoration: 'underline', color: '#115293' } 
                                                            }}
                                                            onClick={() => handleViewMaterial(mat.fileUrl)}
                                                        >
                                                            {mat.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box component="span" display="flex" flexDirection="column">
                                                            <Typography variant="body2" color="textPrimary">{mat.description}</Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {mat.uploadDate ? `Ngày đăng: ${new Date(mat.uploadDate).toLocaleDateString()}` : 'Tài liệu hệ thống'}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            {index < classData.materials.length - 1 && <Divider variant="inset" component="li" />}
                                        </Box>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    )}

                    {/* TAB 2: BÀI TẬP */}
                    {tabIndex === 1 && (
                        <Box>
                            {isLecturer && (
                                <Box mb={2} display="flex" justifyContent="flex-end">
                                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpenAssignment(true); }}>
                                        Giao Bài Tập
                                    </Button>
                                </Box>
                            )}
                            <Paper elevation={1}>
                                <List>
                                    {(!classData?.assignments || classData.assignments.length === 0) && (
                                        <ListItem><ListItemText primary="Chưa có bài tập nào" sx={{ color: 'text.secondary', textAlign: 'center' }} /></ListItem>
                                    )}
                                    {classData?.assignments?.map((ass: any, index: number) => {

                                        const isOverdue = ass.deadline ? new Date(ass.deadline) < new Date() : false;
                                        const hasSubmitted = !!ass.submission;
                                        const hasScore = ass.score !== null && ass.score !== undefined;
                                        
                                        return (
                                            <Box key={ass.id}>
                                                <ListItem
                                                    alignItems="flex-start"
                                                    sx={{
                                                        '& .MuiListItemSecondaryAction-root': {
                                                            top: 16,
                                                            transform: 'none',
                                                            right: 16
                                                        }
                                                    }}
                                                    secondaryAction={
                                                        !isLecturer && (
                                                            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                                                                {hasScore ? (
                                                                    <Chip
                                                                        label={`Điểm: ${ass.score}`}
                                                                        color="success"
                                                                        variant="filled"
                                                                        sx={{ fontWeight: 'bold' }}
                                                                    />
                                                                ) : (
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        color={hasSubmitted ? "success" : "warning"}
                                                                        onClick={() => handleOpenSubmitDialog(ass)}
                                                                        disabled={isOverdue}
                                                                        sx={{ textTransform: 'none', minWidth: '90px' }}
                                                                    >
                                                                        {isOverdue 
                                                                            ? (hasSubmitted ? "Hết hạn sửa" : "Quá hạn nộp") 
                                                                            : (hasSubmitted ? "Chỉnh sửa" : "Nộp bài")
                                                                        }
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                        )
                                                    }
                                                >
                                                    <ListItemIcon sx={{ mt: 1 }}>
                                                        <AssignmentIcon color={ass.score != null ? "success" : "error"} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                                    {ass.title}
                                                                </Typography>
                                                                {ass.submission && <Chip label="Đã nộp" color="success" size="small" variant="outlined" />}
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box component="span" display="flex" flexDirection="column" gap={0.5} mt={0.5}>
                                                                {/* Hiển thị Title của bài tập */}
                                                                
                                                                {/* Hiển thị Description gốc (không bao gồm phần File đính kèm để tránh lặp) */}
                                                                {ass.description.includes("File đính kèm:") ? (
                                                                    <Typography variant="body2" component="span" color="text.primary">
                                                                        <Typography variant="body2" component="span" color="text.primary">
                                                                            {ass.description.split("File đính kèm")[0].slice(0, -1)}
                                                                        </Typography>
                                                                        <Typography 
                                                                            variant="caption" 
                                                                            sx={{ 
                                                                                color: 'green', 
                                                                                display: 'flex', 
                                                                                alignItems: 'center', 
                                                                                gap: 0.5,
                                                                                cursor: 'pointer',
                                                                                fontWeight: 'bold',
                                                                                '&:hover': { textDecoration: 'underline', color: '#2e7d32' }
                                                                            }}
                                                                            onClick={() => {
                                                                                const rawPart = ass.description.split("File đính kèm:")[1];
                                                                                const fileName = rawPart ? rawPart.trim().slice(0, -1) : "";
                                                                                handleViewMaterial(fileName);
                                                                            }}
                                                                        >
                                                                            <AttachFileIcon sx={{ fontSize: 14 }} /> 
                                                                            {ass.description.split("File đính kèm:")[1].trim().slice(0, -1)}
                                                                        </Typography>
                                                                    </Typography>
                                                                ): (
                                                                    <Typography variant="body2" component="span" color="text.primary">
                                                                        {ass.description}
                                                                    </Typography>
                                                                )}
                                                                {/*  */}
                                                                {ass.submission && (
                                                                    <Paper 
                                                                        variant="outlined" 
                                                                        sx={{ 
                                                                            p: 2, 
                                                                            bgcolor: '#f1f8e9', 
                                                                            borderLeft: '4px solid #4caf50',
                                                                            borderRadius: '4px'
                                                                        }}
                                                                    >
                                                                        <Typography variant="caption" fontWeight="bold" color="success.dark" display="block" gutterBottom>
                                                                            NỘI DUNG BÀI LÀM:
                                                                        </Typography>

                                                                        {/* Hiển thị Text/Link đã nộp */}
                                                                        {ass.submission.submissionText && (
                                                                            <Box sx={{ mb: ass.submission.fileUrl ? 1 : 0 }}>
                                                                                <Typography 
                                                                                    variant="body2" 
                                                                                    sx={{ 
                                                                                        whiteSpace: 'pre-wrap', 
                                                                                        wordBreak: 'break-all',
                                                                                        fontStyle: ass.submission.submissionText.startsWith('http') ? 'italic' : 'normal',
                                                                                        color: ass.submission.submissionText.startsWith('http') ? '#1976d2' : 'inherit',
                                                                                        textDecoration: ass.submission.submissionText.startsWith('http') ? 'underline' : 'none',
                                                                                        cursor: ass.submission.submissionText.startsWith('http') ? 'pointer' : 'default'
                                                                                    }}
                                                                                    onClick={() => ass.submission.submissionText.startsWith('http') && window.open(ass.submission.submissionText, '_blank')}
                                                                                >
                                                                                    {ass.submission.submissionText}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}

                                                                        {/* Hiển thị File đã nộp */}
                                                                        {ass.submission.fileUrl && (
                                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                                <Chip
                                                                                    icon={<AttachFileIcon />}
                                                                                    label={ass.submission.fileUrl.split('_').pop()}
                                                                                    onClick={() => handleViewMaterial(ass.submission.fileUrl)}
                                                                                    color="primary"
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                                                                />
                                                                            </Box>
                                                                        )}

                                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                                            Nộp lúc: {
                                                                                        new Date(ass.submission.submittedAt).toLocaleTimeString('vi-VN', { 
                                                                                            hour: '2-digit', 
                                                                                            minute: '2-digit' 
                                                                                        })
                                                                                    } - {
                                                                                        new Date(ass.submission.submittedAt).toLocaleDateString('vi-VN')
                                                                                    }
                                                                        </Typography>
                                                                    </Paper>
                                                                )}

                                                                {/* Hiển thị lời nhận xét của GV */}
                                                                {ass.feedback && (
                                                                    <Typography variant="caption" color="primary" sx={{fontStyle: 'italic'}}>
                                                                        ✍️ GV nhận xét: "{ass.feedback}"
                                                                    </Typography>
                                                                )}

                                                                {ass.deadline && (
                                                                    <Chip
                                                                        label={`Deadline: ${new Date(ass.deadline).toLocaleString()}`}
                                                                        size="small"
                                                                        color={ass.score != null ? "default" : "error"}
                                                                        variant="outlined"
                                                                        sx={{ width: 'fit-content' }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < classData.assignments.length - 1 && <Divider variant="inset" component="li" />}
                                            </Box>
                                        )
                                    })}
                                </List>
                            </Paper>
                        </Box>
                    )}

                    {/* TAB 3: HOẠT ĐỘNG NHÓM (GIỮ NGUYÊN) */}
                    {tabIndex === 2 && (
                        <Box mt={3}>
                            {teamLoading ? (
                                <TeamSkeleton />
                            ): (
                                <>
                                    {/* (Phần render Team giữ nguyên như cũ - Đã copy đầy đủ logic nhóm của bạn) */}
                                    {myTeam && (
                                        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                <Box>
                                                    <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                                                        🏡 Nhóm Của Bạn: {myTeam.teamName || myTeam.name}
                                                    </Typography>
                                                    <Chip
                                                        label={`Mã tham gia: ${myTeam.joinCode}`}
                                                        color="info"
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </Box>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<LogoutIcon />}
                                                    onClick={handleLeaveTeamProcess}
                                                >
                                                    Rời nhóm
                                                </Button>
                                            </Box>

                                            <Divider sx={{ my: 2 }} />

                                            <Grid container spacing={3}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <Grid size={{ xs: 12, md: 8 }}>
                                                        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                                                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                                <FactCheckIcon color="secondary" />
                                                                <Typography variant="h6" fontWeight="bold">Thông Tin Đề Tài</Typography>
                                                            </Box>
                                                            <Divider sx={{ mb: 2 }} />

                                                            {myTeam.project ? (
                                                                <Box>
                                                                    <Typography variant="h5" color="secondary.main" fontWeight="bold" gutterBottom>
                                                                        {myTeam.project.name}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={myTeam.project.status === 'APPROVED' ? "Đã Duyệt" : "Đang Chờ Duyệt"}
                                                                        color={myTeam.project.status === 'APPROVED' ? "success" : "warning"}
                                                                        variant="outlined"
                                                                        sx={{ mb: 2 }}
                                                                    />
                                                                    <Typography variant="body1" paragraph>
                                                                        {myTeam.project.description}
                                                                    </Typography>
                                                                </Box>
                                                            ) : (
                                                                <Box textAlign="center" py={4}>
                                                                    <Typography variant="body1" color="textSecondary" paragraph>
                                                                        Nhóm chưa đăng ký đề tài nào.
                                                                    </Typography>
                                                                    {isLeader ? (
                                                                        <Button variant="contained" color="secondary" onClick={() => setOpenRegisterProject(true)}>
                                                                            Đăng Ký Đề Tài Ngay
                                                                        </Button>
                                                                    ) : (
                                                                        <Alert severity="warning">Vui lòng nhắc Nhóm trưởng đăng ký đề tài.</Alert>
                                                                    )}
                                                                </Box>
                                                            )}
                                                        </Paper>
                                                    </Grid>
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <Grid size={{ xs: 12, md: 8 }}>
                                                        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                                                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                                <GroupsIcon color="action"/>
                                                                <Typography variant="h6" fontWeight="bold">
                                                                    Thành viên ({myTeam.members?.length || 0})
                                                                </Typography>
                                                            </Box>
                                                            <Divider sx={{ mb: 2 }} />
                                                            <List dense sx={{ bgcolor: '#fff'}}>
                                                                <Chip label={isLeader ? "Bạn là Nhóm Trưởng" : "Thành viên"} color={isLeader ? "error" : "default"} size="small" sx={{mb: 2}} />
                                                                {myTeam.members
                                                                    ?.sort((a: any, b: any) => (a.role === 'LEADER' ? -1 : b.role === 'LEADER' ? 1 : 0))
                                                                    .map((mem: any) => (
                                                                        <ListItem key={mem.id}>
                                                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                                                <Avatar sx={{ width: 32, height: 32, bgcolor: mem.role === 'LEADER' ? '#ff9800' : '#bdbdbd' }}>
                                                                                    {mem.student?.fullName?.charAt(0)}
                                                                                </Avatar>
                                                                            </ListItemIcon>
                                                                            <ListItemText
                                                                                primary={
                                                                                    <Box display="flex" alignItems="center" gap={1}>
                                                                                        <Typography variant="body1" fontWeight={mem.student?.id === user?.id ? 'bold' : 'normal'}>
                                                                                            {mem.student?.fullName}
                                                                                        </Typography>
                                                                                        {mem.role === 'LEADER' && (
                                                                                            <Tooltip title="Nhóm trưởng">
                                                                                                <StarIcon fontSize="small" sx={{ color: '#ff9800' }} />
                                                                                            </Tooltip>
                                                                                        )}
                                                                                    </Box>
                                                                                }
                                                                            />
                                                                        </ListItem>
                                                                    ))}
                                                            </List>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    )}
                                    {/* (Render List các nhóm khác) */}
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                        <Typography variant="h5" fontWeight="bold" sx={{ borderLeft: '5px solid #1976d2', pl: 2 }}>
                                            Danh Sách Các Nhóm Trong Lớp
                                        </Typography>
                                        {!myTeam && (
                                            <Box>
                                                <Alert severity="info" sx={{ mb: 2 }}>Bạn chưa tham gia nhóm nào. Hãy chọn nhóm hoặc tạo mới.</Alert>
                                                <Box display="flex" justifyContent="flex-end" mb={2}>
                                                    <Box display="flex" gap={2}>
                                                        <Button variant="outlined" color="primary" startIcon={<LoginIcon />} onClick={() => setOpenJoinDialog(true)}>
                                                            Tham Gia Bằng Mã
                                                        </Button>
                                                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateTeam}>
                                                            Tạo Nhóm Mới
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>

                                    <Grid container spacing={3}>
                                        {(!availableTeams || availableTeams.length === 0) && (
                                            <Grid size={{ xs: 12 }}>
                                                <Typography align="center" color="textSecondary" py={5}>
                                                    Lớp học chưa có nhóm nào được tạo.
                                                </Typography>
                                            </Grid>
                                        )}
                                        {Array.isArray(availableTeams) && availableTeams
                                            .sort((a, b) => {
                                                if (myTeam && a.id === myTeam.id) return -1;
                                                if (myTeam && b.id === myTeam.id) return 1;
                                                return 0;
                                            })
                                            .map((team) => {
                                                const isMyTeamCard = myTeam && myTeam.id === team.id;
                                                return (
                                                    <Grid size={{ xs: 12, md: 6, lg: 3 }} key={team.id}>
                                                        <Card elevation={3} sx={{ 
                                                            width: '100%', 
                                                            height: '100%', 
                                                            display: 'flex', 
                                                            flexDirection: 'column', 
                                                            border: isMyTeamCard ? '2px solid #2196f3' : 'none', 
                                                            position: 'relative' 
                                                        }}>
                                                            <CardContent sx={{ flexGrow: 1 }}>
                                                                <Tooltip title={team.teamName || team.name} placement="top" arrow>
                                                                    <Box>
                                                                        <Typography variant="h6" fontWeight="bold" color="primary" sx={{ 
                                                                            display: '-webkit-box', 
                                                                            WebkitLineClamp: 1, 
                                                                            WebkitBoxOrient: 'vertical', 
                                                                            overflow: 'hidden' 
                                                                        }}>
                                                                            {team.teamName || team.name}
                                                                        </Typography>
                                                                        <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                                                            Mã: {team.joinCode || 'null'}
                                                                        </Typography>
                                                                    </Box>
                                                                </Tooltip>

                                                                <Divider sx={{ my: 1.5 }} />

                                                                {/* --- PHẦN HIỂN THỊ THÀNH VIÊN --- */}
                                                                <Box mb={1.5}>
                                                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={1}>
                                                                        Thành viên ({team.members?.length || 0}):
                                                                    </Typography>

                                                                    <Box display="flex" flexDirection="column" gap={1.2}>
                                                                        {team.members?.map((mem: any) => {
                                                                            // Kiểm tra dữ liệu fullName từ API của bạn
                                                                            const fullName = mem.fullName || mem.student?.fullName || "Thành viên";
                                                                            const isLeader = mem.role === 'LEADER';

                                                                            return (
                                                                                <Box 
                                                                                    key={mem.id} 
                                                                                    display="flex" 
                                                                                    alignItems="center" 
                                                                                    gap={1.5}
                                                                                    sx={{cursor: 'default'}}
                                                                                >
                                                                                    <Avatar 
                                                                                        sx={{ 
                                                                                            width: 24, 
                                                                                            height: 24, 
                                                                                            fontSize: '0.7rem', 
                                                                                            bgcolor: isLeader ? '#ff9800' : '#bdbdbd',
                                                                                            fontWeight: 'bold'
                                                                                        }}
                                                                                    >
                                                                                        {fullName.charAt(0).toUpperCase()}
                                                                                    </Avatar>
                                                                                    
                                                                                    <Typography 
                                                                                        variant="body2" 
                                                                                        sx={{ 
                                                                                            fontSize: '0.85rem', 
                                                                                            color: 'text.primary',
                                                                                            fontWeight: isLeader ? 'bold' : 'normal',
                                                                                            whiteSpace: 'nowrap',
                                                                                            overflow: 'hidden',
                                                                                            textOverflow: 'ellipsis'
                                                                                        }}
                                                                                    >
                                                                                        {fullName}
                                                                                        {isLeader && (
                                                                                            <Typography 
                                                                                                component="span" 
                                                                                                sx={{ 
                                                                                                    color: '#ff9800', 
                                                                                                    fontSize: '0.7rem', 
                                                                                                    ml: 0.5,
                                                                                                    fontStyle: 'italic'
                                                                                                }}
                                                                                            >
                                                                                                (Leader)
                                                                                            </Typography>
                                                                                        )}
                                                                                    </Typography>
                                                                                </Box>
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                </Box>
                                                                {/* -------------------------------- */}

                                                            </CardContent>
                                                            
                                                            {!myTeam && (
                                                                <CardActions sx={{ bgcolor: '#f5f5f5', p: 1 }}>
                                                                    <Button size="small" variant="contained" onClick={() => handleJoinTeam(team)} fullWidth>
                                                                        Tham Gia Nhóm
                                                                    </Button>
                                                                </CardActions>
                                                            )}
                                                            {isMyTeamCard && (
                                                                <Box sx={{ bgcolor: '#e3f2fd', p: 0.5, textAlign: 'center' }}>
                                                                    <Typography variant="caption" color="primary" fontWeight="bold">Nhóm của bạn</Typography>
                                                                </Box>
                                                            )}
                                                        </Card>
                                                    </Grid>
                                                )
                                            })}
                                    </Grid>
                                </>
                            )}
                        </Box>
                    )}
                </Box>
            )}

            {/* --- DIALOG UPLOAD TÀI LIỆU  --- */}
            <Dialog open={openMaterial} onClose={() => setOpenMaterial(false)} fullWidth maxWidth="sm">
                <DialogTitle>Upload Tài Liệu Mới</DialogTitle>
                <DialogContent>
                    <TextField label="Tiêu đề" fullWidth margin="normal" onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    <TextField label="Mô tả" fullWidth margin="normal" onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

                    {/* Input chọn file */}
                    <Box mt={2} p={2} border="1px dashed #ccc" borderRadius={2}>
                        <Typography variant="subtitle2" gutterBottom><AttachFileIcon sx={{verticalAlign: 'middle'}}/> Đính kèm file</Typography>
                        <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                            style={{ width: '100%' }}
                        />
                        {selectedFile && <Typography variant="caption" color="primary">Đã chọn: {selectedFile.name}</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMaterial(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleCreateMaterial}>Lưu & Upload</Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG TẠO BÀI TẬP  --- */}
            <Dialog open={openAssignment} onClose={() => setOpenAssignment(false)} fullWidth maxWidth="sm">
                <DialogTitle>Tạo Bài Tập Mới</DialogTitle>
                <DialogContent>
                    <TextField label="Tên bài tập" fullWidth margin="normal" onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    <TextField label="Yêu cầu chi tiết" fullWidth margin="normal" multiline rows={3} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    <TextField label="Hạn nộp" type="datetime-local" fullWidth margin="normal" InputLabelProps={{ shrink: true }} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />

                    {/* Input chọn file (nếu có đề bài) */}
                    <Box mt={2} p={2} border="1px dashed #ccc" borderRadius={2}>
                        <Typography variant="subtitle2" gutterBottom><AttachFileIcon sx={{verticalAlign: 'middle'}}/> File đề bài (Nếu có)</Typography>
                        <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                            style={{ width: '100%' }}
                        />
                        {selectedFile && <Typography variant="caption" color="primary">Đã chọn: {selectedFile.name}</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAssignment(false)}>Hủy</Button>
                    <Button variant="contained" color="secondary" onClick={handleCreateAssignment}>Giao Bài</Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG NỘP BÀI TẬP --- */}
            <Dialog open={openSubmit} onClose={() => setOpenSubmit(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>Nộp Bài Tập</DialogTitle>
                <DialogContent dividers>
                    {/* Phần 1: Nộp nội dung Text/Link */}
                    <Box mb={3}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StarIcon fontSize="small" color="primary" /> Nội dung bài làm (Text/Link)
                        </Typography>
                        <TextField 
                            placeholder="Nhập link Github, Drive hoặc nội dung trả lời..." 
                            fullWidth 
                            multiline 
                            rows={4}
                            variant="outlined"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })} 
                        />
                    </Box>

                    <Divider sx={{ my: 2 }}>HOẶC / VÀ</Divider>

                    {/* Phần 2: Upload File */}
                    <Box sx={{ mt: 2 }}>
                    {/* Tiêu đề bên ngoài Box nộp bài */}
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CloudUploadIcon fontSize="small" color="primary" /> Đính kèm file bài làm
                    </Typography>

                    {/* Box bao quanh khu vực upload */}
                    <Box 
                        sx={{ 
                            border: '2px dashed #ccc', 
                            borderRadius: 2, 
                            bgcolor: selectedFile ? '#f0f9ff' : '#fafafa',
                            transition: 'all 0.3s',
                            '&:hover': { borderColor: 'primary.main', bgcolor: '#f5faff' },
                            position: 'relative'
                        }}
                    >
                        {/* Nhãn ẩn bao phủ toàn bộ vùng để click chọn file */}
                        <label style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            padding: '24px', 
                            cursor: 'pointer' 
                        }}>
                            <input
                                type="file"
                                hidden
                                onChange={(e) => handleFileChange(e)}
                            />
                            <CloudUploadIcon sx={{ fontSize: 40, color: selectedFile ? 'primary.main' : 'text.secondary', mb: 1 }} />
                            <Typography variant="body2" color="textPrimary" textAlign="center" sx={{ fontWeight: selectedFile ? 'bold' : 'normal' }}>
                                {selectedFile ? (
                                    `File mới chọn: ${selectedFile.name}`
                                ) : (originalSubmission && !deleteOldFile && classData.assignments.find((a:any)=>a.id === selectedAssignmentId)?.submission?.fileUrl) ? (
                                    `File hiện tại: ${classData.assignments.find((a:any)=>a.id === selectedAssignmentId).submission.fileUrl.split('_').pop()}`
                                ) : (
                                    "Nhấn để chọn file bài làm (Tối đa 10MB)"
                                )}
                            </Typography>
                        </label>

                        {/* Nút xóa file để riêng biệt bên ngoài thẻ label nhưng vẫn trong Box border */}
                        {(selectedFile || (originalSubmission && !deleteOldFile && classData.assignments.find((a:any)=>a.id === selectedAssignmentId)?.submission?.fileUrl)) && (
                            <Box sx={{ pb: 2, textAlign: 'center' }}>
                                <Button 
                                    size="small" 
                                    color="error" 
                                    variant="outlined"
                                    onClick={() => {
                                        if (selectedFile) {
                                            setSelectedFile(null);
                                        } else {
                                            setDeleteOldFile(true);
                                        }
                                    }}
                                >
                                    {selectedFile ? "Bỏ chọn file này" : "Xóa file cũ"}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>

                    <TextField 
                        label="Ghi chú thêm cho giảng viên" 
                        fullWidth 
                        margin="normal" 
                        variant="standard"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenSubmit(false)} color="inherit">Hủy</Button>
                    <Button 
                        variant="contained" 
                        startIcon={<CloudUploadIcon />} 
                        onClick={handleSubmitAssignment}
                        disabled={!hasChanges()}
                    >
                        {originalSubmission ? "Cập nhật bài làm" : "Nộp bài ngay"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG CHUYỂN TRƯỞNG NHÓM VÀ RỜI NHÓM --- */}
            <Dialog open={openLeaderDialog} onClose={() => setOpenLeaderDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle>Chọn Trưởng Nhóm Mới</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" gutterBottom>
                        Bạn cần chuyển quyền trưởng nhóm cho thành viên khác trước khi rời đi.
                    </Typography>

                    <FormControl component="fieldset">
                        <RadioGroup
                            value={selectedNewLeaderId}
                            onChange={(e) => setSelectedNewLeaderId(Number(e.target.value))}
                        >
                            {myTeam?.members
                                ?.filter((m: any) => m.student.id != user?.id)
                                .map((mem: any) => (
                                    <FormControlLabel
                                        key={mem.id}
                                        value={mem.id}
                                        control={<Radio />}
                                        label={`${mem.student.fullName} (${mem.student.email})`}
                                    />
                                ))
                            }
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLeaderDialog(false)}>Hủy</Button>
                    <Button variant="contained" color="primary" onClick={handleConfirmTransferAndLeave} disabled={!selectedNewLeaderId}>
                        Chuyển & Rời Nhóm
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* --- DIALOG TẠO NHÓM MỚI --- */}
            <Dialog open={openCreateTeam} onClose={() => setOpenCreateTeam(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ pb: 1 }}>Tạo Nhóm Mới</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" label="Tên Nhóm" fullWidth variant="outlined"
                        value={teamName} onChange={(e) => setTeamName(e.target.value)}
                        sx={{ mb: 3, mt: 1 }}
                    />

                    <Divider sx={{ mb: 2 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>
                            Thêm thành viên ({selectedMemberIds.length} đã chọn)
                        </FormLabel>
                    </Box>

                    <TextField
                        placeholder="Tìm theo tên hoặc email..." fullWidth size="small"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
                        }}
                        sx={{ mb: 2 }}
                    />

                    <Paper variant="outlined" sx={{ height: 250, overflow: 'auto', p: 1, bgcolor: '#f9f9f9' }}>
                        {studentsNoTeam.length === 0 ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <Typography variant="body2" color="textSecondary">Không có sinh viên nào chưa có nhóm.</Typography>
                            </Box>
                        ) : filteredStudents.length === 0 ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <Typography variant="body2" color="textSecondary">Không tìm thấy kết quả phù hợp.</Typography>
                            </Box>
                        ) : (
                            <FormGroup>
                                {filteredStudents.map((st) => {
                                    const isSelected = selectedMemberIds.includes(st.id);
                                    return (
                                        <FormControlLabel
                                            key={st.id}
                                            sx={{
                                                m: 0, p: 1, borderRadius: 1,
                                                bgcolor: isSelected ? '#e3f2fd' : 'transparent',
                                                transition: '0.2s',
                                                '&:hover': { bgcolor: isSelected ? '#bbdefb' : '#eee' }
                                            }}
                                            control={<Checkbox size="small" checked={isSelected} onChange={() => handleToggleStudent(st.id)} />}
                                            label={
                                                <Box>
                                                    <Typography variant="body2" fontWeight={isSelected ? 'bold' : 'normal'}>{st.fullName}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{st.email}</Typography>
                                                </Box>
                                            }
                                        />
                                    );
                                })}
                            </FormGroup>
                        )}
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenCreateTeam(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleCreateTeam} variant="contained" disabled={!teamName.trim()}>
                        Tạo Nhóm {selectedMemberIds.length > 0 && `(+${selectedMemberIds.length})`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG THAM GIA NHÓM BẰNG MÃ --- */}
            <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle>Tham Gia Nhóm</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Nhập mã nhóm (Join Code) để tham gia.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="normal"
                        label="Mã Nhóm"
                        fullWidth
                        variant="outlined"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="VD: A1B2C3"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenJoinDialog(false)}>Hủy</Button>
                    <Button
                        onClick={handleJoinByCode}
                        variant="contained"
                        disabled={!joinCode.trim()}
                    >
                        Tham Gia
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG XÁC NHẬN CHUNG --- */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
                <DialogTitle display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="warning" /> {confirmDialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText color="text.primary">
                        {confirmDialog.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} color="inherit">
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={() => {
                            confirmDialog.onConfirm();
                            setConfirmDialog({ ...confirmDialog, open: false });
                        }}
                        variant="contained"
                        color="primary"
                        autoFocus
                    >
                        Đồng ý
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG ĐĂNG KÝ ĐỀ TÀI DỰ ÁN --- */}
            <Dialog open={openRegisterProject} onClose={() => setOpenRegisterProject(false)} fullWidth maxWidth="sm">
                <DialogTitle>Đăng Ký Đề Tài Dự Án</DialogTitle>
                <DialogContent>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                        Lưu ý: Chỉ nhóm trưởng mới được phép đăng ký.
                    </Typography>
                    <TextField
                        label="Tên Đề Tài"
                        fullWidth margin="normal"
                        value={projectForm.projectName}
                        onChange={(e) => setProjectForm({...projectForm, projectName: e.target.value})}
                    />
                    <TextField
                        label="Mô tả chi tiết / Yêu cầu"
                        fullWidth margin="normal"
                        multiline rows={4}
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRegisterProject(false)}>Hủy</Button>
                    <Button onClick={handleRegisterProject} variant="contained" color="secondary">Đăng Ký</Button>
                </DialogActions>
            </Dialog>

        </StudentLayout>
    );
};

export default ClassDetail;