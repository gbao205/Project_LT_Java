// frontend/src/pages/student/tabs/ResourceTab.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, IconButton, 
    Button, List, ListItem, ListItemText, ListItemIcon, 
    Tooltip, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { workspaceService } from '../../../services/workspaceService';
import { useConfirm } from '../../../context/ConfirmContext';
import { useAppSnackbar } from '../../../hooks/useAppSnackbar';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ResourceTab = ({ teamId }: { teamId: number }) => {
    const [resources, setResources] = useState<any[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { confirm } = useConfirm();
    const { showSuccess, showError } = useAppSnackbar();

    useEffect(() => { loadResources(); }, [teamId]);

    const loadResources = async () => {
        const res = await workspaceService.getResources(teamId);
        setResources(res.data);
    };

    // format dung lượng file (Byte -> KB/MB)
    const formatFileSize = (bytes: number) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileUpload = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        // Kiểm tra dung lượng file trước khi upload
        if (file.size > MAX_FILE_SIZE) {
            showError("Dung lượng file vượt quá giới hạn (Tối đa 10MB)");
            event.target.value = ''; // Reset input file
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            await workspaceService.uploadResource(teamId, formData);
            showSuccess("Tải lên tài liệu thành công!");
            loadResources();
        } catch (error: any) {
            // Xử lý lỗi bảo mật hoặc lỗi dung lượng
            const message = error.response?.data?.message || "Lỗi khi tải lên tài liệu";
            showError(error.response?.data?.message || "Lỗi khi tải lên");
            console.error("Upload error:", error);
        }
    };

    const handleDelete = (res: any) => {
        confirm({
            title: "Xóa tài liệu?",
            // Hiển thị tên tài liệu ngay trong lời nhắn
            message: (
                <>
                    Bạn có chắc chắn muốn xóa tài liệu <strong>{res.title}</strong>? 
                    Hành động này không thể hoàn tác.
                </>
            ),
            onConfirm: async () => {
                try {
                    await workspaceService.deleteResource(res.id);
                    showSuccess("Xóa tài liệu thành công!");
                    loadResources();
                } catch (error: any) {
                    showError("Lỗi khi xóa tài liệu");
                }
            }
        });
    };

    const isPreviewable = (fileType: string) => {
        const type = fileType.toLowerCase();
        return type.includes('pdf') || type.includes('image') || type.includes('png') || type.includes('jpeg');
    };


    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h6" sx={{ alignSelf: "center" }}>Tài nguyên nhóm</Typography>
                <Box display="flex" flexDirection="column" alignItems="flex-end">
                    <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                        Tải lên tài liệu
                        <input type="file" hidden onChange={handleFileUpload} />
                    </Button>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                        Dung lượng tối đa: 10MB
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={2}>
                {resources.map((res) => (
                    <Grid item xs={12} sm={6} md={4} key={res.id}>
                        <Card variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                <ListItemIcon><InsertDriveFileIcon color="primary" /></ListItemIcon>
                                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                    <Typography variant="body2" noWrap fontWeight="bold">{res.title}</Typography>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        {res.fileType.split('/')[1]?.toUpperCase() || 'FILE'} • {formatFileSize(res.fileSize)}
                                    </Typography>
                                </Box>
                                
                                <Box display="flex">
                                    {/* Nút Xem trước (Preview) */}
                                    {isPreviewable(res.fileType) && (
                                        <Tooltip title="Xem nhanh">
                                            <IconButton 
                                                href={encodeURI(`http://localhost:8080${res.fileUrl}`)} 
                                                target="_blank">
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}


                                    {!isPreviewable(res.fileType) && (
                                        <Tooltip title="Tải xuống">
                                            <IconButton 
                                                href={encodeURI(`http://localhost:8080${res.fileUrl}`)} 
                                                target="_blank" 
                                                download
                                            >
                                                <DownloadIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    
                                    {/* Nút Xóa */}
                                    <Tooltip title="Xóa">
                                        <IconButton onClick={() => handleDelete(res)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>


            {/* Dialog Xem trước tài liệu */}
            <Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} maxWidth="lg" fullWidth>
                <DialogTitle>Xem trước tài liệu</DialogTitle>
                <DialogContent sx={{ height: '80vh', p: 0 }}>
                    {previewUrl && (
                        <iframe 
                            src={previewUrl} 
                            title="Preview" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 'none' }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};
export default ResourceTab;