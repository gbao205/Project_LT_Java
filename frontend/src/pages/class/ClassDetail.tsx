import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Tabs, Tab, Paper, Button,
    List, ListItem, ListItemText, ListItemIcon, Divider,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip,
    CircularProgress, Grid, Card, CardContent, CardActions
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsIcon from '@mui/icons-material/Groups';
import studentService from '../../services/studentService';
import { getClassDetails, createMaterial, createAssignment, submitAssignment } from '../../services/classService';
import AdminLayout from '../../components/layout/AdminLayout';
import PersonIcon from "@mui/icons-material/Person"; // Import AdminLayout

const ClassDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State dữ liệu
    const [classData, setClassData] = useState<any>(null);
    const [loading, setLoading] = useState(true); // State loading giống MyClasses
    const [tabIndex, setTabIndex] = useState(0);
    const [user, setUser] = useState<any>(null);

    // State Dialog
    const [openMaterial, setOpenMaterial] = useState(false);
    const [openAssignment, setOpenAssignment] = useState(false);
    const [openSubmit, setOpenSubmit] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);

    // Form Data
    const [formData, setFormData] = useState({ title: '', description: '', url: '', deadline: '' });

    const [myTeam, setMyTeam] = useState<any>(null);
    const [availableTeams, setAvailableTeams] = useState<any[]>([]);
    const [teamName, setTeamName] = useState("");
    const [openCreateTeam, setOpenCreateTeam] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
        fetchData();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        try {
            // Reset loading true mỗi khi fetch lại (nếu cần)
            // setLoading(true); 
            const data = await getClassDetails(id);
            setClassData(data);
        } catch (error) {
            console.error("Lỗi tải lớp:", error);
        } finally {
            setLoading(false); // Tắt loading khi xong
        }
    };

    const fetchTeamData = async () => {
        if (!id) return;
        try {
            // Kiểm tra xem mình có nhóm chưa
            const team = await studentService.getMyTeam(id);
            if (team && team.id) {
                setMyTeam(team);
            } else {
                setMyTeam(null);
                // Nếu chưa có nhóm thì tải danh sách nhóm để xin vào
                const teams = await studentService.getTeamsInClass(id);
                setAvailableTeams(teams);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (tabIndex === 2) { // Giả sử Tab 2 là tab "Hoạt động Nhóm"
            fetchTeamData();
        }
    }, [tabIndex, id]);

    const isLecturer = user?.role === 'LECTURER';

    // --- CÁC HÀM XỬ LÝ (Giữ nguyên logic cũ) ---
    const handleCreateMaterial = async () => {
        await createMaterial(id!, {
            title: formData.title,
            description: formData.description,
            fileUrl: formData.url
        });
        setOpenMaterial(false);
        fetchData();
    };

    const handleCreateAssignment = async () => {
        await createAssignment(id!, {
            title: formData.title,
            description: formData.description,
            deadline: formData.deadline
        });
        setOpenAssignment(false);
        fetchData();
    };

    const handleSubmitAssignment = async () => {
        if (!selectedAssignmentId) return;
        await submitAssignment(selectedAssignmentId, {
            fileUrl: formData.url,
            comment: formData.description
        });
        alert("Nộp bài thành công!");
        setOpenSubmit(false);
    };

    // Xử lý tạo nhóm
    const handleCreateTeam = async () => {
        try {
            await studentService.createTeam({ teamName, classId: Number(id) });
            alert("Tạo nhóm thành công!");
            setOpenCreateTeam(false);
            fetchTeamData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi tạo nhóm");
        }
    };

    // Xử lý tham gia nhóm
    const handleJoinTeam = async (teamId: number) => {
        if (!confirm("Bạn muốn tham gia nhóm này?")) return;
        try {
            await studentService.joinTeam({ teamId });
            alert("Tham gia thành công!");
            fetchTeamData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi tham gia");
        }
    };

    // Tiêu đề trang (Dynamic theo tên lớp nếu đã load xong)
    const pageTitle = loading || !classData 
        ? "Chi Tiết Lớp Học" 
        : `${classData.classInfo.name} - ${classData.classInfo.subject?.name}`;

    return (
        <AdminLayout title={pageTitle} showBack={true} backPath="/student/classes">
            
            {loading ? (
                // --- HIỆU ỨNG LOADING GIỐNG MYCLASSES ---
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress color="success" />
                </Box>
            ) : (
                // --- NỘI DUNG CHÍNH ---
                <Box>
                    {/* Header thông tin bổ sung */}
                    <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="subtitle1" color="textSecondary">
                                <b>Giảng viên:</b> {classData.classInfo.com.cosre.backend.dto.lecturer?.fullName}
                            </Typography>
                            <Typography variant="subtitle2" color="textSecondary">
                                <b>Học kỳ:</b> {classData.classInfo.semester}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Tabs chuyển đổi */}
                    <Paper sx={{ mb: 3 }} elevation={2}>
                        <Tabs 
                            value={tabIndex} 
                            onChange={(e, v) => setTabIndex(v)} 
                            centered
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab label="Tài Liệu Học Tập" />
                            <Tab label="Bài Tập & Deadline" />
                            <Tab label="Hoạt động Nhóm" icon={<GroupsIcon />} iconPosition="start"/>
                        </Tabs>
                    </Paper>

                    {/* TAB 1: TÀI LIỆU */}
                    {tabIndex === 0 && (
                        <Box>
                            {isLecturer && (
                                <Box mb={2} display="flex" justifyContent="flex-end">
                                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenMaterial(true)}>
                                        Thêm Tài Liệu
                                    </Button>
                                </Box>
                            )}
                            <Paper elevation={1}>
                                <List>
                                    {classData.materials.length === 0 && (
                                        <ListItem><ListItemText primary="Chưa có tài liệu nào" sx={{color: 'text.secondary', textAlign: 'center'}} /></ListItem>
                                    )}
                                    {classData.materials.map((mat: any, index: number) => (
                                        <Box key={mat.id}>
                                            <ListItem>
                                                <ListItemIcon><DescriptionIcon color="primary" /></ListItemIcon>
                                                <ListItemText 
                                                    primary={
                                                        <a href={mat.fileUrl} target="_blank" rel="noreferrer" style={{textDecoration:'none', fontWeight:'bold', color: '#1976d2'}}>
                                                            {mat.title}
                                                        </a>
                                                    }
                                                    secondary={mat.description} 
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
                                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setOpenAssignment(true)}>
                                        Giao Bài Tập
                                    </Button>
                                </Box>
                            )}
                            <Paper elevation={1}>
                                <List>
                                    {classData.assignments.length === 0 && (
                                        <ListItem><ListItemText primary="Chưa có bài tập nào" sx={{color: 'text.secondary', textAlign: 'center'}} /></ListItem>
                                    )}
                                    {classData.assignments.map((ass: any, index: number) => (
                                        <Box key={ass.id}>
                                            <ListItem 
                                                alignItems="flex-start"
                                                secondaryAction={
                                                    !isLecturer && (
                                                        <Button variant="contained" size="small" color="warning" onClick={() => { setSelectedAssignmentId(ass.id); setOpenSubmit(true); }}>
                                                            Nộp Bài
                                                        </Button>
                                                    )
                                                }
                                            >
                                                <ListItemIcon sx={{mt: 1}}><AssignmentIcon color="error" /></ListItemIcon>
                                                <ListItemText 
                                                    primary={<Typography variant="subtitle1" fontWeight="bold">{ass.title}</Typography>}
                                                    secondary={
                                                        <Box component="span" display="flex" flexDirection="column" gap={0.5} mt={0.5}>
                                                            <Typography variant="body2" component="span" color="text.primary">{ass.description}</Typography>
                                                            <Chip 
                                                                label={`Deadline: ${new Date(ass.deadline).toLocaleString()}`} 
                                                                size="small" 
                                                                color="error" 
                                                                variant="outlined" 
                                                                sx={{width: 'fit-content'}}
                                                            />
                                                        </Box>
                                                    } 
                                                />
                                            </ListItem>
                                            {index < classData.assignments.length - 1 && <Divider variant="inset" component="li" />}
                                        </Box>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    )}

                    {/* TAB 3: Nhóm */}
                    {tabIndex === 2 && (
                        <Box mt={2}>
                            {myTeam ? (
                                <Paper elevation={3} sx={{ p: 3, bgcolor: '#e3f2fd' }}>
                                    <Typography variant="h5" color="primary" fontWeight="bold">
                                        Nhóm: {myTeam.name}
                                    </Typography>
                                    <Typography variant="subtitle1">Mã tham gia: <b>{myTeam.joinCode}</b></Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6">Thành viên:</Typography>
                                    <List>
                                        {/* Cần API lấy danh sách thành viên chi tiết nếu myTeam chưa có đủ info */}
                                        {myTeam.members?.map((mem: any) => (
                                            <ListItem key={mem.id}>
                                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                                <ListItemText
                                                    primary={mem.student?.fullName}
                                                    secondary={mem.role}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            ) : (
                                <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6">Bạn chưa có nhóm. Hãy chọn nhóm để tham gia:</Typography>
                                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateTeam(true)}>
                                            Tạo Nhóm Mới
                                        </Button>
                                    </Box>

                                    <Grid container spacing={2}>
                                        {availableTeams.map((team) => (
                                            <Grid item xs={12} sm={6} md={4} key={team.id}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6" fontWeight="bold">{team.name}</Typography>
                                                        <Typography color="textSecondary">Số lượng: {team.members?.length || 0} thành viên</Typography>
                                                    </CardContent>
                                                    <CardActions>
                                                        <Button size="small" variant="outlined" onClick={() => handleJoinTeam(team.id)}>
                                                            Tham Gia
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {/* Modal Tạo Nhóm */}
                                    <Dialog open={openCreateTeam} onClose={() => setOpenCreateTeam(false)}>
                                        <DialogTitle>Tạo Nhóm Mới</DialogTitle>
                                        <DialogContent>
                                            <TextField
                                                autoFocus margin="dense" label="Tên Nhóm" fullWidth
                                                value={teamName} onChange={(e) => setTeamName(e.target.value)}
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => setOpenCreateTeam(false)}>Hủy</Button>
                                            <Button onClick={handleCreateTeam} variant="contained">Tạo</Button>
                                        </DialogActions>
                                    </Dialog>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            )}

            {/* --- CÁC MODAL (DIALOG) GIỮ NGUYÊN --- */}
            
            <Dialog open={openMaterial} onClose={() => setOpenMaterial(false)} fullWidth maxWidth="sm">
                <DialogTitle>Upload Tài Liệu Mới</DialogTitle>
                <DialogContent>
                    <TextField label="Tiêu đề" fullWidth margin="normal" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    <TextField label="Mô tả" fullWidth margin="normal" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    <TextField label="Link file (Google Drive/URL)" fullWidth margin="normal" onChange={(e) => setFormData({...formData, url: e.target.value})} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMaterial(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleCreateMaterial}>Lưu</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAssignment} onClose={() => setOpenAssignment(false)} fullWidth maxWidth="sm">
                <DialogTitle>Tạo Bài Tập Mới</DialogTitle>
                <DialogContent>
                    <TextField label="Tên bài tập" fullWidth margin="normal" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    <TextField label="Yêu cầu chi tiết" fullWidth margin="normal" multiline rows={3} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    <TextField label="Hạn nộp" type="datetime-local" fullWidth margin="normal" InputLabelProps={{ shrink: true }} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAssignment(false)}>Hủy</Button>
                    <Button variant="contained" color="secondary" onClick={handleCreateAssignment}>Giao Bài</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openSubmit} onClose={() => setOpenSubmit(false)} fullWidth maxWidth="sm">
                <DialogTitle>Nộp Bài Tập</DialogTitle>
                <DialogContent>
                    <TextField label="Link bài làm (Github/Drive)" fullWidth margin="normal" onChange={(e) => setFormData({...formData, url: e.target.value})} />
                    <TextField label="Ghi chú cho giảng viên" fullWidth margin="normal" multiline rows={2} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSubmit(false)}>Hủy</Button>
                    <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={handleSubmitAssignment}>Nộp Ngay</Button>
                </DialogActions>
            </Dialog>

        </AdminLayout>
    );
};

export default ClassDetail;