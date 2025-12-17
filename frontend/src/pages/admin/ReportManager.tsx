import { useEffect, useState } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

const ReportManager = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const fetchReports = async () => {
        try {
            const res = await api.get('/reports');
            const sorted = res.data.sort((a: any, b: any) => {
                if (a.resolved === b.resolved) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return a.resolved ? 1 : -1;
            });
            setReports(sorted);
        } catch (error) {
            console.error("Lỗi tải báo cáo:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReports(); }, []);

    const handleResolve = async (id: number) => {
        if(!window.confirm("Xác nhận đã xử lý xong vấn đề này?")) return;
        try {
            await api.put(`/reports/${id}/resolve`);
            fetchReports();
        } catch (error) { alert("Có lỗi xảy ra"); }
    };

    return (
        <AdminLayout title="Quản Lý Báo Cáo">
            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Ngày gửi</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Người báo cáo</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tiêu đề</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nội dung chi tiết</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reports.map((rpt) => (
                                <TableRow key={rpt.id} hover sx={{ bgcolor: rpt.resolved ? '#fcfcfc' : '#fff' }}>
                                    <TableCell>{new Date(rpt.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{rpt.reporterEmail}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>{rpt.title}</TableCell>
                                    <TableCell sx={{ maxWidth: 300, whiteSpace: 'pre-wrap', color: '#555' }}>{rpt.content}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={rpt.resolved ? "Đã xong" : "Chờ xử lý"}
                                            color={rpt.resolved ? "success" : "error"}
                                            size="small" variant={rpt.resolved ? "outlined" : "filled"}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {!rpt.resolved && (
                                            <Tooltip title="Đánh dấu đã xử lý">
                                                <IconButton color="success" onClick={() => handleResolve(rpt.id)}>
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {rpt.resolved && <CheckCircleIcon color="disabled" fontSize="small"/>}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {reports.length === 0 && (
                                <TableRow><TableCell colSpan={6} align="center">Không có báo cáo nào</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </AdminLayout>
    );
};
export default ReportManager;