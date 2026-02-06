import { useState } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, 
    CardActions, Button, Chip, CircularProgress, 
    Divider, Tooltip, DialogActions,
    Dialog, DialogTitle, DialogContent, TextField,
    FormLabel, FormControl, InputLabel, Select, MenuItem,
    InputAdornment, Paper, FormGroup, FormControlLabel, Checkbox

} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GroupsIcon from '@mui/icons-material/Groups';
import ClassIcon from '@mui/icons-material/Class';
import LoginIcon from '@mui/icons-material/Login';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

import StudentLayout from '../../components/layout/StudentLayout';
import { useAppSnackbar } from '../../hooks/useAppSnackbar';
import studentService from '../../services/studentService';

const MyTeams = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useAppSnackbar();

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser?.id || currentUser?.user?.id;
    
    // --- State cho chức năng Tạo/Tham gia nhóm ---
    const [openCreate, setOpenCreate] = useState(false);
    const [openJoin, setOpenJoin] = useState(false);

    // Form Tạo nhóm
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [teamName, setTeamName] = useState("");
    const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Form Tham gia nhóm
    const [joinCode, setJoinCode] = useState("");
    
    // --- 1. Query: Lấy danh sách nhóm đã tham gia ---
    const { data: teams = [], isLoading: loadingTeams } = useQuery({
        queryKey: ['joinedTeams'],
        queryFn: async () => {
            const data = await studentService.getAllJoinedTeams();
            return data.filter((team: any) => team?.classRoom?.registrationOpen);
        },
        staleTime: 1000, // Dữ liệu được coi là mới trong 1 giây
    });

    // --- 2. Query: Lấy danh sách lớp có thể tạo nhóm (chỉ fetch khi mở Dialog) ---
    const { data: availableClasses = [] } = useQuery({
        queryKey: ['classesWithoutTeam'],
        queryFn: () => studentService.getClassesWithoutTeam(),
        enabled: openCreate, // Chỉ kích hoạt query khi Dialog tạo nhóm mở
    });

    // --- 3. Query: Lấy danh sách sinh viên chưa có nhóm của lớp đã chọn ---
    const { data: studentsNoTeam = [], isLoading: loadingStudents } = useQuery({
        queryKey: ['studentsNoTeam', selectedClassId],
        queryFn: async () => {
            const data = await studentService.getStudentsNoTeam(Number(selectedClassId));
            return data.filter((s: any) => s.id !== currentUserId);
        },
        enabled: !!selectedClassId, // Chỉ fetch khi đã chọn classId
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showSuccess(`Đã sao chép mã nhóm: ${text}`);
    };

    // --- Mutation: TẠO NHÓM MỚI ---
    const createTeamMutation = useMutation({
        mutationFn: (newTeam: any) => studentService.createTeam(newTeam),
        onSuccess: () => {
            showSuccess("Tạo nhóm thành công!");
            queryClient.invalidateQueries({ queryKey: ['joinedTeams'] }); // Làm mới danh sách nhóm
            setOpenCreate(false);
            resetCreateForm();
        },
        onError: (error: any) => {
            showError(error.response?.data?.message || "Lỗi tạo nhóm");
        }
    });

    // --- Mutation: THAM GIA NHÓM ---
    const joinTeamMutation = useMutation({
        mutationFn: (code: string) => studentService.joinTeam(code),
        onSuccess: () => {
            showSuccess("Tham gia nhóm thành công!");
            queryClient.invalidateQueries({ queryKey: ['joinedTeams'] });
            setOpenJoin(false);
            setJoinCode("");
        },
        onError: (error: any) => {
            showError(error.response?.data?.message || "Lỗi tham gia nhóm");
        }
    });

    const resetCreateForm = () => {
        setTeamName("");
        setSelectedClassId("");
        setSelectedMemberIds([]);
    };

    const handleCreateTeam = () => {
        if (!teamName.trim() || !selectedClassId) {
            showError("Vui lòng chọn lớp và nhập tên nhóm!");
            return;
        }
        createTeamMutation.mutate({
            teamName,
            classId: Number(selectedClassId),
            memberIds: selectedMemberIds
        });
    };

    const handleJoinTeam = () => {
        if (!joinCode.trim()) {
            showError("Vui lòng nhập mã nhóm!");
            return;
        }
        joinTeamMutation.mutate(joinCode.trim());
    };

    // Lọc danh sách sinh viên trong Dialog
    const filteredStudents = studentsNoTeam
        .filter((st: any) => {
            const lowerSearch = searchTerm.toLowerCase();
            return ( (st.fullName?.toLowerCase().includes(lowerSearch) || st.email?.toLowerCase().includes(lowerSearch)) && st.id != currentUserId);
        })
        .sort((a: any, b: any) => {
            const aSelected = selectedMemberIds.includes(a.id);
            const bSelected = selectedMemberIds.includes(b.id);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
        });

    const handleToggleStudent = (studentId: number) => {
        setSelectedMemberIds(prev => 
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    return (
        <StudentLayout title="Nhóm Của Tôi">
            {loadingTeams ? (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    <Box mb={3} display="flex" alignItems="center" gap={2}>
                        <GroupsIcon color="primary" fontSize="large" />
                        <Typography variant="h5" fontWeight="bold" color="#1565c0">
                            Danh Sách Nhóm Đang Tham Gia ({teams.length})
                        </Typography>
                        <Box ml="auto" display="flex" gap={1}>
                            <Button 
                                variant="outlined" 
                                color="primary" 
                                startIcon={<LoginIcon />}
                                onClick={() => setOpenJoin(true)}
                            >
                                Tham Gia Bằng Mã
                            </Button>

                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<AddIcon />}
                                onClick={() => setOpenCreate(true)}
                            >
                                Tạo Nhóm Mới
                            </Button>
                        </Box>
                    </Box>
                    {teams.length === 0 ? (
                        <Typography align="center" color="textSecondary" py={5}>
                            Bạn chưa tham gia nhóm nào. Hãy vào lớp học để đăng ký nhóm.
                        </Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {teams.map((team: any) => (
                                <Grid size={{ xs: 12, md: 6, lg: 3 }} key={team.id}>
                                    <Card 
                                        elevation={3} 
                                        sx={{ 
                                            height: '100%', 
                                            display: 'flex', 
                                            cursor: 'default',
                                            flexDirection: 'column',
                                            borderRadius: 2,
                                            transition: '0.3s',
                                            '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            {/* Header Card: Tên lớp */}
                                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                <ClassIcon fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                                    {team.classRoom?.name || "Lớp học không xác định"}
                                                </Typography>
                                            </Box>

                                            <Divider sx={{ mb: 2 }} />

                                            {/* Body Card: Tên nhóm & Mã */}
                                            <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                                                {team.teamName}
                                            </Typography>

                                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                                                <Chip 
                                                    label={`Code: ${team.joinCode}`} 
                                                    size="small" 
                                                    color="default" 
                                                    variant="outlined"
                                                    deleteIcon={<Tooltip title="Sao chép"><ContentCopyIcon style={{fontSize: 14}}/></Tooltip>}
                                                    onDelete={() => copyToClipboard(team.joinCode)}
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                                <Chip 
                                                    label={`${team.members?.length || 0} thành viên`} 
                                                    size="small" 
                                                    color="info" 
                                                    variant="outlined"
                                                />
                                            </Box>

                                            {/* Đề tài (nếu có) */}
                                            <Box mt={2} bgcolor="#f8f9fa" p={1.5} borderRadius={2} border="1px solid #edf2f7">
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                        Đề tài
                                                    </Typography>
                                                    
                                                    {team.project && (
                                                        <Chip 
                                                            label={team.project.status === 'PENDING' ? "Chờ duyệt" : "Đã duyệt"} 
                                                            size="small" 
                                                            variant="outlined" 
                                                            color={team.project.status === 'PENDING' ? "warning" : "success"}
                                                            sx={{ 
                                                                height: 20, 
                                                                fontSize: '0.65rem', 
                                                                fontWeight: 'bold',
                                                                bgcolor: team.project.status === 'PENDING' ? '#fff9db' : '#ebfbee'
                                                            }}
                                                        />
                                                    )}
                                                </Box>

                                                <Typography 
                                                    variant="body2" 
                                                    fontWeight={team.project ? "600" : "400"} 
                                                    color={team.project ? "text.primary" : "text.disabled"}
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        lineHeight: 1.4,
                                                        minHeight: team.project ? 'auto' : '40px'
                                                    }}
                                                >
                                                    {team.project ? team.project.name : "Chưa đăng ký đề tài"}
                                                </Typography>
                                            </Box>
                                        </CardContent>

                                        <CardActions sx={{ p: 2, pt: 0 }}>
                                            <Button 
                                                variant="contained" 
                                                fullWidth 
                                                endIcon={<ArrowForwardIcon />}
                                                onClick={() => navigate(`/student/workspace/${team.id}`)} // Điều hướng đến Workspace
                                            >
                                                Vào Workspace
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    {/* --- DIALOG TẠO NHÓM MỚI --- */}
                    <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
                        <DialogTitle>Tạo Nhóm Mới</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="textSecondary" gutterBottom mb={2}>
                                Chọn lớp học, đặt tên và thêm thành viên (nếu có).
                            </Typography>
                            
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Chọn Lớp Học</InputLabel>
                                <Select
                                    value={selectedClassId}
                                    label="Chọn Lớp Học"
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                >
                                    {availableClasses.map((cls: any) => (
                                        <MenuItem key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.subjectName})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                autoFocus margin="dense" label="Tên Nhóm" fullWidth variant="outlined"
                                value={teamName} onChange={(e) => setTeamName(e.target.value)}
                                sx={{ mt: 2, mb: 3 }}
                            />

                            {selectedClassId && (
                                <>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>
                                            Thêm thành viên ({selectedMemberIds.length})
                                        </FormLabel>
                                    </Box>
                                    <TextField
                                        placeholder="Tìm sinh viên..." fullWidth size="small"
                                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }}
                                        sx={{ mb: 2 }}
                                    />

                                    {loadingStudents ? (
                                        <Box display="flex" justifyContent="center" mt={5}>
                                            <CircularProgress />
                                        </Box>
                                    ) : (
                                        <Paper variant="outlined" sx={{ height: 200, overflow: 'auto', p: 1, bgcolor: '#f9f9f9' }}>
                                            {studentsNoTeam.length === 0 ? (
                                                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                                    <Typography variant="body2" color="textSecondary">Lớp này không còn sinh viên chưa có nhóm.</Typography>
                                                </Box>
                                            ) : (
                                                <FormGroup>
                                                    {filteredStudents.map((st: any) => (
                                                        <FormControlLabel
                                                            key={st.id}
                                                            control={<Checkbox size="small" checked={selectedMemberIds.includes(st.id)} onChange={() => handleToggleStudent(st.id)} />}
                                                            label={`${st.fullName} (${st.email})`}
                                                        />
                                                    ))}
                                                </FormGroup>
                                            )}
                                        </Paper>
                                    )}
                                    
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenCreate(false)}>Hủy</Button>
                            <Button 
                                onClick={handleCreateTeam} 
                                variant="contained" 
                                disabled={createTeamMutation.isPending || !teamName.trim() || !selectedClassId}
                                startIcon={createTeamMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {createTeamMutation.isPending ? "Đang tạo..." : "Tạo Nhóm"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* --- DIALOG JOIN --- */}
                    <Dialog open={openJoin} onClose={() => setOpenJoin(false)} fullWidth maxWidth="xs">
                        <DialogTitle>Tham Gia Nhóm</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="textSecondary" gutterBottom>Nhập mã nhóm (Join Code) để tham gia.</Typography>
                            <TextField
                                autoFocus margin="normal" label="Mã Nhóm" fullWidth
                                value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="VD: A1B2C3"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenJoin(false)}>Hủy</Button>
                            <Button 
                                onClick={() => handleJoinTeam()}
                                variant="contained" 
                                disabled={joinTeamMutation.isPending || !joinCode.trim()}
                                startIcon={joinTeamMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {joinTeamMutation.isPending ? "Đang xử lý..." : "Tham Gia"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}
        </StudentLayout>
    );
};

export default MyTeams;