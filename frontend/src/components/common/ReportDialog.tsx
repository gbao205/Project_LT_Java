import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Fab, Tooltip
} from "@mui/material";
// @ts-ignore
import BugReportIcon from '@mui/icons-material/BugReport';
import api from '../../services/api';

const ReportDialog = () => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/reports/send', { title, content });
            alert("Đã gửi báo cáo cho Admin!");
            setOpen(false);
            setTitle('');
            setContent('');
        } catch (error) {
            alert("Gửi thất bại, vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Tooltip title="Báo cáo sự cố" placement="left">
                <Fab
                    color="error"
                    sx={{ position: 'fixed', bottom: 20, right: 24, zIndex: 9999 }}
                    onClick={() => setOpen(true)}
                >
                    <BugReportIcon />
                </Fab>
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>Báo cáo sự cố hệ thống</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" label="Tiêu đề lỗi" fullWidth
                        value={title} onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense" label="Mô tả chi tiết" fullWidth multiline rows={4}
                        value={content} onChange={(e) => setContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {loading ? "Đang gửi..." : "Gửi Báo Cáo"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ReportDialog;