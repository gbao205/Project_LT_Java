import { useEffect, useState } from 'react';
// @ts-ignore
import {
    Container, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import { getSubjects } from '../../services/subjectService';
import type {Subject} from '../../types/Subject';

const SubjectManager = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Hàm này chạy ngay khi mở trang web
    useEffect(() => {
        const fetchData = async () => {
            const data = await getSubjects();
            setSubjects(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;

    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
    Danh sách Môn học (Từ Backend)
    </Typography>

    <TableContainer component={Paper} elevation={3}>
    <Table>
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
    <TableRow>
        <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
    <TableCell sx={{ fontWeight: 'bold' }}>Mã môn</TableCell>
    <TableCell sx={{ fontWeight: 'bold' }}>Tên môn học</TableCell>
    <TableCell sx={{ fontWeight: 'bold' }}>Mô tả</TableCell>
    </TableRow>
    </TableHead>
    <TableBody>
    {subjects.map((sub) => (
            <TableRow key={sub.id} hover>
    <TableCell>{sub.id}</TableCell>
    <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>{sub.subjectCode}</TableCell>
    <TableCell>{sub.name}</TableCell>
    <TableCell>{sub.description}</TableCell>
    </TableRow>
))}
    </TableBody>
    </Table>
    </TableContainer>
    </Container>
);
};

export default SubjectManager;