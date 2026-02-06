import React, { useState, useMemo, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, TableHead, 
    Table, TableBody, TableCell, TableContainer,
    Button, TextField, CircularProgress, TableRow
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/layout/Header';
import { getMyClasses } from '../../services/classService';

export const SLOT_INFO: Record<number, { text: string; time: string }> = {
    1: { text: "1 - 3", time: "6:45 - 9:15" },
    2: { text: "4 - 6", time: "9:25 - 11:55" },
    3: { text: "7 - 9", time: "12:10 - 14:40" },
    4: { text: "10 - 12", time: "14:50 - 17:20" },
    5: { text: "13 - 15", time: "17:30 - 20:00" },
    6: { text: "16 - 18", time: "20:10 - 22:40" },
};

const StudentCalendar = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Fetch dữ liệu lớp học của sinh viên
    const { 
        data: myClasses = [], 
        isLoading
    } = useQuery({
        queryKey: ['my-classes'], 
        queryFn: getMyClasses,
        staleTime: 1000, // Dữ liệu được coi là "mới" trong 5 phút, không fetch lại khi switch tab
        gcTime: 1000 * 60 * 30,   // Giữ trong bộ nhớ đệm 30 phút
    });

    // 2. Logic tính toán các ngày trong tuần đang xem
    const weekDays = useMemo(() => {
        const start = new Date(selectedDate);
        const day = start.getDay();
        const diff = start.getDate() - (day === 0 ? 6 : day - 1); // Đưa về Thứ 2
        
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(selectedDate);
            d.setDate(diff + i);
            d.setHours(0, 0, 0, 0);
            return d;
        });
    }, [selectedDate]);

    // 3. Logic điều hướng thời gian
    const handlePrevWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 7);
        setSelectedDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 7);
        setSelectedDate(newDate);
    };

    const handleToday = () => setSelectedDate(new Date());

    // 4. Hàm hiển thị dữ liệu thật vào từng ô của bảng
    const renderCell = (dayDate: Date, slot: number) => {
        const dayOfWeek = dayDate.getDay() === 0 ? 8 : dayDate.getDay() + 1; // Quy đổi CN=8, T2=2

        // Tìm lớp học thỏa mãn: nằm trong thời gian bắt đầu-kết thúc và đúng Thứ/Ca
        const classItem = myClasses.find((cls: any) => {
            const start = new Date(cls.startDate);
            const end = new Date(cls.endDate);
            const isInRange = dayDate >= start && dayDate <= end;
            const hasTimetable = cls.timeTables?.some((tt: any) => 
                tt.dayOfWeek === dayOfWeek && tt.slot === slot
            );
            return isInRange && hasTimetable;
        });

        if (!classItem) return <TableCell key={dayDate.toString()} sx={{ border: '1px solid #f0f0f0' }} />;

        const currentTT = classItem.timeTables.find((tt: any) => tt.dayOfWeek === dayOfWeek && tt.slot === slot);

        return (
            <TableCell 
                key={dayDate.toString()} 
                align="left" 
                sx={{ 
                    border: '1px solid #f0f0f0', 
                    p: 0.5,
                    verticalAlign: 'top'
                }}
            >
                <Box 
                    onClick={() => navigate(`/class/${classItem.id}`)}
                    sx={{ 
                        textAlign: 'left',
                        p: 1.5, 
                        bgcolor: '#eef2ff', 
                        borderLeft: '4px solid #3b82f6',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        minHeight: '100px', 
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 0.5,
                        '&:hover': { 
                            bgcolor: '#d6dffd',
                            transform: 'translateY(-2px)', 
                            boxShadow: '0 10px 20px rgba(0,0,0,0.15), 0 6px 6px rgba(0,0,0,0.10)',
                        }
                    }}
                >
                    <Box>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 700, 
                                color: '#2e7d32', 
                                fontSize: '13px',
                                lineHeight: 1.3,
                                mb: 0.5
                            }}
                        >
                            {classItem.name}
                        </Typography>

                        <Typography 
                            variant="caption" 
                            display="block" 
                            sx={{ color: 'rgba(0, 0, 0, 0.65)', fontWeight: 500 }}
                        >
                            <Box component="span" sx={{ fontWeight: 700 }}></Box> {classItem?.classCode}
                        </Typography>

                        {/* TIẾT HỌC */}
                        <Typography 
                            variant="caption" 
                            sx={{ color: 'rgba(0, 0, 0, 1)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <MenuBookIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                            <Box component="span" sx={{ fontWeight: 700 }}>Tiết:</Box> {SLOT_INFO[slot].text}
                        </Typography>

                        {/* GIỜ HỌC */}
                        <Typography 
                            variant="caption" 
                            sx={{ color: 'rgba(0, 0, 0, 1)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <AccessTimeIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                            {SLOT_INFO[slot].time}
                        </Typography>
                        
                        {/* PHÒNG HỌC */}
                        <Typography 
                            variant="caption" 
                            sx={{ color: 'rgba(0, 0, 0, 1)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <MeetingRoomIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                            <Box component="span" sx={{ fontWeight: 700 }}>Phòng:</Box> {currentTT?.room || 'E-Learning'}
                        </Typography>
                        
                        {/* GIẢNG VIÊN */}
                        <Box sx={{ mt: 0.5 }}>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'rgba(0, 0, 0, 1)', 
                                    fontWeight: 700,
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.5 
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                                Giảng viên:
                            </Typography>
                            
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'rgba(0, 0, 0, 1)', 
                                    fontWeight: 500,
                                    display: 'block',
                                    pl: 0.4,
                                    lineHeight: 1.2
                                }}
                            >
                                {classItem?.lecturer?.fullName || 'Chưa phân công'}
                            </Typography>
                        </Box>
                        
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#2e7d32', mt: 1 }}>
                        <SchoolIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>LMS</Typography>
                    </Box>
                </Box>
            </TableCell>
        );
    };

    if (isLoading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f1f8e9" }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e0e0" }}>
                    
                    {/* Toolbar điều khiển */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                        <TextField
                            type="date"
                            size="small"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            sx={{
                                width: '160px',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: '#2e7d32', 
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#2e7d32', 
                                        borderWidth: '2px',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#2e7d32', 
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    cursor: 'default',
                                    fontSize: '14px',
                                    color: 'rgb(26, 60, 52)',
                                    fontWeight: 600,
                                    p: '8.5px 14px',
                                },
                                '& input::-webkit-calendar-picker-indicator': {
                                    cursor: 'pointer',
                                    filter: 'invert(30%) sepia(100%) saturate(500%) hue-rotate(130deg)', // Tùy chỉnh màu icon lịch cho hợp với màu Teal
                                }
                            }}
                        />
                        <Box display="flex" gap={1}>
                            <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={handlePrevWeek} 
                                sx={{ 
                                    bgcolor: '#2e7d32', 
                                    minWidth: '40px',
                                    px: 2, 
                                    py: 1,
                                    borderRadius: '8px',
                                    '&:hover': { bgcolor: '#266528' }
                                }}
                            >
                                <ArrowBackIcon sx={{ color: '#ffffff', fontSize: 20 }} />
                            </Button>
                            <Button variant="contained" size="small" color="success" onClick={handleToday} startIcon={<CalendarMonthIcon />}>Hiện tại</Button>
                            <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={handleNextWeek} 
                                sx={{ 
                                    bgcolor: '#2e7d32', 
                                    minWidth: '40px',
                                    px: 2, 
                                    py: 1,
                                    borderRadius: '8px',
                                    '&:hover': { bgcolor: '#266528' }
                                }}
                            >
                                <ArrowForwardIcon sx={{ color: '#ffffff', fontSize: 20 }} />
                            </Button>
                        </Box>
                    </Box>

                    <TableContainer sx={{ borderRadius: 2, border: '1px solid #eee' }}>
                        <Table size="small"
                            sx={{ 
                                borderCollapse: 'separate', 
                                borderSpacing: 0, 
                                '& .MuiTableCell-root': {
                                    border: '1px solid #eee'
                                }
                            }}
                        >
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#2e7d32' }}>
                                    <TableCell 
                                        colSpan={2} 
                                        align="center" 
                                        sx={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        Ca học
                                    </TableCell>
                                    
                                    {weekDays.map((date, index) => (
                                        <TableCell 
                                            key={index} 
                                            align="center" 
                                            sx={{ 
                                                color: 'white', 
                                                fontWeight: 'bold', 
                                                minWidth: 130,
                                                p: '10px 4px'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                                                    {index === 6 ? 'Chủ nhật' : `Thứ ${index + 2}`}
                                                </Typography>

                                                <Typography 
                                                    sx={{ 
                                                        fontSize: '14px',
                                                        fontWeight: 'bold',
                                                        mt: 0.2, 
                                                        lineHeight: 1
                                                    }}
                                                >
                                                    {date.toLocaleDateString('vi-VN')}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[
                                    { label: 'Sáng', slots: [1, 2] },
                                    { label: 'Chiều', slots: [3, 4] },
                                    { label: 'Tối', slots: [5, 6] }
                                ].map((session) => (
                                    <React.Fragment key={session.label}>
                                        {session.slots.map((slot, sIdx) => (
                                            <TableRow key={slot}>
                                                {sIdx === 0 && (
                                                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', bgcolor: '#2e7d32', color: 'white', width: 60 }}>
                                                        {session.label}
                                                    </TableCell>
                                                )}
                                                <TableCell align="center" sx={{ width: 60, fontWeight: 500, bgcolor: '#2e7d32', color: 'white', whiteSpace: 'nowrap' }}>Ca {slot}</TableCell>
                                                {weekDays.map((date) => renderCell(date, slot))}
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </Box>
    );
};

export default StudentCalendar;