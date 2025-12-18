import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Tabs, Tab, Paper, Button,
    List, ListItem, ListItemText, ListItemIcon, Divider,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip,
    CircularProgress
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getClassDetails, createMaterial, createAssignment, submitAssignment } from '../../services/classService';
import AdminLayout from '../../components/layout/AdminLayout'; // Import AdminLayout

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
                                <b>Giảng viên:</b> {classData.classInfo.lecturer?.fullName}
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