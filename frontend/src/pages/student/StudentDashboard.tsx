import { useEffect, useState, useMemo } from "react";
import { 
    Container, Typography, Box, Grid, Divider, Paper,
    Avatar, Button, IconButton, Dialog,  DialogContent,
    Tooltip, Popover, Grid as MuiGrid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Client } from '@stomp/stompjs';
import SockJS from "sockjs-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ClassIcon from "@mui/icons-material/Class";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LeftIcon from '@mui/icons-material/ChevronLeft';
import RightIcon from '@mui/icons-material/ChevronRight';

import Header from "../../components/layout/Header";
import { StatCard, MenuCard } from "../../components/common/DashboardCards";
import { getMyClasses } from "../../services/classService";
import studentService from "../../services/studentService";
import { getNotifications } from "../../services/notificationService";
import { BASE_URL } from '../../services/api';
import taskService from "../../services/taskService";
import { SLOT_INFO } from './StudentCalendar';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateEvents, setSelectedDateEvents] = useState<{ classes: any[], deadlines: any[] }>({ classes: [], deadlines: [] });
    const [openEventDialog, setOpenEventDialog] = useState(false);
    const [selectedDateLabel, setSelectedDateLabel] = useState("");
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

    // Lấy Profile
    const { data: profile } = useQuery({
        queryKey: ['studentProfile'],
        queryFn: () => studentService.getProfile(),
        staleTime: 1000 * 60 * 5, // Dữ liệu cá nhân coi như "mới" trong 5 phút
    });

    // Lấy Lớp học
    const { data: myClasses = [] } = useQuery({
        queryKey: ['myClasses'],
        queryFn: getMyClasses,
        staleTime: 1000, // Lớp học cập nhật mỗi 1 giây
    });

    // Lấy Task/Deadline
    const { data: activeTasks = [] } = useQuery({
        queryKey: ['activeTasks'],
        queryFn: taskService.getMyActiveTasks,
        staleTime: 1000, // Task cập nhật mỗi 1 giây
    });

    // Lấy Thông báo
    const { data: initialNotifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await getNotifications();
            return res.data;
        },
        enabled: !!profile?.user?.id, // Chỉ chạy khi đã có profile
    });

    useEffect(() => {
        let client: Client | null = null;

        if (profile?.user?.id) {
            client = new Client({
                brokerURL: `${BASE_URL.replace('http', 'ws')}/ws`,
                webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
                onConnect: () => {
                    client?.subscribe(`/topic/notifications/${profile.user.id}`, (msg) => {
                        const newNotify = JSON.parse(msg.body);
                        queryClient.setQueryData(['notifications'], (oldData: any) => {
                            return oldData ? [newNotify, ...oldData] : [newNotify];
                        });
                    });
                },
            });
            client.activate();
        }

        return () => {
            if (client) client.deactivate();
        };
    }, [profile?.user?.id, queryClient]);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
                        "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"];

    // Lấy danh sách ngày trong tháng hiện tại
    const days = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        
        const daysArr = [];
        for (let i = 0; i < firstDay; i++) {
            daysArr.push(null);
        }
        for (let i = 1; i <= totalDays; i++) {
            daysArr.push(new Date(year, month, i));
        }
        
        const totalCellsNeeded = daysArr.length > 35 ? 42 : 35;
        while (daysArr.length < totalCellsNeeded) {
            daysArr.push(null);
        }
        
        return daysArr;
    }, [currentDate]);

    // Hàm lấy sự kiện trong ngày
    const getDayEvents = (date: Date) => {
        if (!date) return { dayClasses: [], dayDeadlines: [] };

        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        const dateString = checkDate.toISOString().split('T')[0];
        const dayOfWeek = date.getDay() === 0 ? 8 : date.getDay() + 1;

        // Lọc tất cả các lớp có lịch vào ngày này
        const dayClasses = myClasses.filter((cls: any) => {
            const start = new Date(cls.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(cls.endDate);
            end.setHours(0, 0, 0, 0);

            const isInRange = checkDate >= start && checkDate <= end;
            return isInRange && cls.timeTables?.some((tt: any) => tt.dayOfWeek === dayOfWeek);
        });

        // Lọc tất cả các deadline vào ngày này
        const dayDeadlines = activeTasks.filter(task => task.dueDate?.startsWith(dateString));

        return { dayClasses, dayDeadlines };
    };

    // Tính tổng số buổi học trong tuần hiện tại
    const weeklyClassCount = useMemo(() => {
        // 1. Xác định ngày bắt đầu (Thứ 2) và kết thúc (Chủ nhật) của tuần hiện tại
        const now = new Date();
        const day = now.getDay();
        const diffToMonday = now.getDate() - (day === 0 ? 6 : day - 1);
        const startOfWeek = new Date(now.setDate(diffToMonday));
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        let totalSessions = 0;

        // 2. Duyệt qua từng lớp học của sinh viên
        myClasses.forEach((cls: any) => {
            const classStart = new Date(cls.startDate);
            const classEnd = new Date(cls.endDate);

            // 3. Duyệt qua 7 ngày trong tuần hiện tại
            for (let i = 0; i < 7; i++) {
                const currentCheckDate = new Date(startOfWeek);
                currentCheckDate.setDate(startOfWeek.getDate() + i);

                // Kiểm tra ngày này có nằm trong thời gian bắt đầu/kết thúc của môn học không
                if (currentCheckDate >= classStart && currentCheckDate <= classEnd) {
                    const dayOfWeek = currentCheckDate.getDay() === 0 ? 8 : currentCheckDate.getDay() + 1;
                    
                    // Kiểm tra xem môn học này có lịch (timetable) vào thứ này không
                    const hasClass = cls.timeTables?.some((tt: any) => tt.dayOfWeek === dayOfWeek);
                    if (hasClass) {
                        totalSessions++;
                    }
                }
            }
        });

        return totalSessions;
    }, [myClasses]);

    // Hàm xử lý chuyển tháng
    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    // Hàm xử lý chuyển tháng
    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Xử lý khi click vào ngày trong lịch
    const handleDateClick = (date: Date) => {
        if (!date) return;
        const { dayClasses, dayDeadlines } = getDayEvents(date);
        if (dayClasses.length === 0 && dayDeadlines.length === 0) return;

        const dayOfWeekStr = date.getDay() === 0 ? "chủ nhật" : `thứ ${
            date.getDay() === 1 ? "hai" : 
            date.getDay() === 2 ? "ba" : 
            date.getDay() === 3 ? "tư" : 
            date.getDay() === 4 ? "năm" : 
            date.getDay() === 5 ? "sáu" : "bảy"
        }`;
        
        const label = `${dayOfWeekStr}, ngày ${date.toLocaleDateString('vi-VN')}`;
        setSelectedDateLabel(label);

        setSelectedDateEvents({ classes: dayClasses, deadlines: dayDeadlines });
        setOpenEventDialog(true);
    };

    // Xử lý mở Popover chọn tháng
    const handleOpenPicker = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    // Xử lý đóng Popover chọn tháng
    const handleClosePicker = () => {
        setAnchorEl(null);
    };

    // Xử lý chọn tháng
    const handleSelectMonth = (monthIndex: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
        handleClosePicker();
    };

    // Xử lý thay đổi năm
    const handleYearChange = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear() + offset, currentDate.getMonth(), 1));
    };

    // Tính số lượng deadline chưa quá hạn
    const upcomingDeadlinesCount = useMemo(() => {
        const now = new Date();
        return activeTasks.filter(task => {
            if (!task.dueDate) return false;
            return new Date(task.dueDate) > now;
        }).length;
    }, [activeTasks]);

    const open = Boolean(anchorEl);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f1f8e9" }}>
            <Header />

            <Container maxWidth="lg" sx={{ py: 4 }}>

                <Grid container spacing={2.4} sx={{ mb: 4 }}>

                    <Grid size={{ xs: 12, md: 7.5 }}>
                        <Grid container spacing={2.4}>
                            
                            {/* THÔNG TIN SINH VIÊN */}
                            <Grid size={{ xs: 12 }}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e0e0", height: '100%' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight="bold" color="#2e7d32" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccountBoxIcon /> Thông tin sinh viên
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                    
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: 'center' }}>
                                            <Avatar 
                                                src={profile?.avatarUrl}
                                                variant="rounded"
                                                sx={{ width: 132, height: 172, mx: "auto", borderRadius: 2, border: "1px solid #2e7d32", cursor: "pointer" }}
                                                onClick={() => navigate('/student/profile')}
                                            >
                                                {profile?.fullName?.charAt(0)}
                                            </Avatar>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 9 }} sx={{display: 'flex', alignItem: 'center'}}>
                                            <Grid container spacing={2}>
                                                {[
                                                    { label: "MSSV", value: profile?.studentId },
                                                    { label: "Khóa học", value: profile?.batch },
                                                    { label: "Họ tên", value: profile?.user?.fullName },
                                                    { label: "Giới tính", value: profile?.profile?.gender},
                                                    { label: "Ngày sinh", value: profile?.dob ? profile.dob.split('-').reverse().join('-') : "" },
                                                    { label: "Bậc đào tạo", value: profile?.eduLevel },
                                                    { label: "Nơi sinh", value: profile?.profile?.placeOfBirth },
                                                    { label: "Loại hình đào tạo", value: profile?.trainingType },
                                                    { label: "Ngành", value: profile?.major },
                                                    { label: "Chuyên ngành", value: profile?.specialization },
                                                ].map((item, index) => (
                                                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                                        <Typography variant="body2">
                                                            <strong>{item.label}: </strong> {item.value}
                                                        </Typography>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            {/* NHẮC NHỞ */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Paper elevation={0} sx={{ 
                                    p: 3, borderRadius: 4, 
                                    background: "white", 
                                    color: "text.primary", position: "relative", overflow: "hidden",
                                    height: '100%', 
                                }}>
                                    <Box sx={{ position: "relative", zIndex: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Thông báo mới</Typography>
                                        <Typography variant="h5" fontWeight="800" sx={{ my: 1 }}>{initialNotifications.length}</Typography>
                                        <Button onClick={() => navigate('/notedetail')} sx={{ color: "red", p: 0, textTransform: 'none' }}>
                                            Xem chi tiết
                                        </Button>
                                    </Box>
                                    <NotificationsIcon sx={{ 
                                            position: "absolute", 
                                            right: 16, 
                                            bottom: 58, 
                                            fontSize: 28, 
                                            color: initialNotifications.length ? "red" : "#2e7d32",
                                            transition: 'color 0.3s ease'
                                        }}
                                    />
                                </Paper>
                            </Grid>

                            {/* LỊCH HỌC TUẦN NÀY */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Paper elevation={0} sx={{ 
                                    p: 3, borderRadius: 3, 
                                    background: "#2e7d32", 
                                    color: "white", position: "relative", overflow: "hidden",
                                    height: '100%',

                                }}>
                                    <Box sx={{ position: "relative", zIndex: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Lịch học tuần này</Typography>
                                        <Typography variant="h5" fontWeight="800" sx={{ my: 1 }}>{weeklyClassCount}</Typography>
                                        <Button onClick={() => navigate('/calendar')} sx={{ color: "rgba(255,255,255,1)", p: 0, textTransform: 'none' }}>
                                            Xem chi tiết
                                        </Button>
                                    </Box>
                                    <EventIcon sx={{ position: "absolute", right: 16, bottom: 58, fontSize: 28, color: "#fff" }} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* LỊCH THÁNG */}
                    <Grid size={{ xs: 12, md: 4.5 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e0e0", height: '100%', bgcolor: '#fcfcfc' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                <Typography variant="subtitle1" fontWeight="bold" color="#2e7d32">
                                    Lịch theo tháng
                                </Typography>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <IconButton size="small" onClick={handlePrevMonth} sx={{ color: '#1A3C34' }}>
                                        <LeftIcon fontSize="small" />
                                    </IconButton>
                                    
                                    {/* Ant Design Style Picker Input */}
                                    <Box 
                                        onClick={handleOpenPicker}
                                        sx={{
                                            fontSize: '13.5px',
                                            fontWeight: 600,
                                            color: 'rgb(26, 60, 52)',
                                            border: '1px solid rgb(209, 213, 219)',
                                            borderRadius: '4px',
                                            bgcolor: '#fff',
                                            px: 1.5, py: 0.5,
                                            width: '140px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            '&:hover': { borderColor: '#2e7d32' }
                                        }}
                                    >
                                        {`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                                        <CalendarMonthIcon sx={{ fontSize: '16px', color: '#999' }} />
                                    </Box>

                                    <Popover
                                        open={open}
                                        anchorEl={anchorEl}
                                        onClose={handleClosePicker}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        PaperProps={{
                                            sx: { mt: 1, p: 0, borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', width: '280px' }
                                        }}
                                    >
                                        {/* Header của bảng chọn */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderBottom: '1px solid #f0f0f0' }}>
                                            <IconButton size="small" onClick={() => handleYearChange(-1)}><LeftIcon fontSize="small" /></IconButton>
                                            <Typography sx={{ fontWeight: 700, fontSize: '14px', cursor: 'default' }}>
                                                {currentDate.getFullYear()}
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleYearChange(1)}><RightIcon fontSize="small" /></IconButton>
                                        </Box>

                                        <Box sx={{ p: 1 }}>
                                            <MuiGrid container spacing={1}>
                                                {monthNames.map((month, index) => {
                                                    const isSelected = index === currentDate.getMonth();
                                                    return (
                                                        <MuiGrid key={month} size={4}> 
                                                            <Box
                                                                onClick={() => handleSelectMonth(index)}
                                                                sx={{
                                                                    py: 1.5,
                                                                    textAlign: 'center',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '13px',
                                                                    transition: 'all 0.2s',
                                                                    bgcolor: isSelected ? '#e6f7ff' : 'transparent',
                                                                    color: isSelected ? '#1677ff' : 'rgba(0,0,0,0.88)',
                                                                    fontWeight: isSelected ? 600 : 400,
                                                                    '&:hover': {
                                                                        bgcolor: isSelected ? '#bae0ff' : '#f5f5f5'
                                                                    }
                                                                }}
                                                            >
                                                                {`Th ${String(index + 1).padStart(2, '0')}`}
                                                            </Box>
                                                        </MuiGrid>
                                                    );
                                                })}
                                            </MuiGrid>
                                        </Box>
                                    </Popover>

                                    <IconButton size="small" onClick={handleNextMonth} sx={{ color: '#1A3C34' }}>
                                        <RightIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Thứ trong tuần */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center'}}>
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, i) => (
                                    <Typography key={day} variant="caption" fontWeight="bold" sx={{ color: i === 0 ? '#ff6600' : 'text.secondary' }}>
                                        {day}
                                    </Typography>
                                ))}
                            </Box>
                            <Divider sx={{ mb: 1 }} />

                           <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(7, 1fr)', 
                                gridTemplateRows: `repeat(${days.length / 7}, 1fr)`, 
                                gap: 0.5,
                                height: 280,      
                                minHeight: 280,  
                                overflow: 'hidden'
                            }}>
                                {days.map((date, index) => {
                                    const isSunday = index % 7 === 0;
                                    if (!date) return (
                                        <Box key={`empty-${index}`} sx={{ 
                                            height: '100%',
                                            bgcolor: '#f9f9f9',
                                            borderRadius: 1.5, 
                                            opacity: 0.3 
                                        }} />
                                    );

                                    const { dayClasses, dayDeadlines } = getDayEvents(date);
                                    const isEvent = dayClasses.length > 0 || dayDeadlines.length > 0;
                                    const isToday = new Date().toDateString() === date.toDateString();

                                    const tooltipContent = (
                                        <Box sx={{ p: 0.5 }}>
                                            {dayClasses.map((cls: any, idx: number) => (
                                                <Typography key={`tt-cls-${idx}`} variant="caption" display="block" sx={{ color: '#b9f6ca', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                    {cls.name}
                                                </Typography>
                                            ))}
                                            {dayDeadlines.map((task, idx) => (
                                                <Typography key={`tt-task-${idx}`} variant="caption" display="block" sx={{ color: '#ffcdd2', display: 'flex', alignItems: 'center', gap: 0.5, mt: dayClasses.length > 0 && idx === 0 ? 0.5 : 0 }}>
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f44336' }} />
                                                    {task.title}
                                                </Typography>
                                            ))}
                                        </Box>
                                    );

                                    const dayBox = (
                                        <Box
                                            onClick={() => handleDateClick(date)}
                                            sx={{
                                                height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 1.5,
                                                bgcolor: isEvent ? '#e8f5e9' : 'white',
                                                color: isSunday ? '#ff6600' : '#000',
                                                border: isToday ? '2px solid #2e7d32' : '1px solid #f0f0f0',
                                                cursor: isEvent ? 'pointer' : 'default',
                                                transition: 'all 0.2s ease',
                                                '&:hover': isEvent ? { 
                                                    bgcolor: '#cef5d1', transform: 'translateY(-2px)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 1
                                                } : 'default'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: isToday ? 'bold' : 500, fontSize: days.length > 35 ? '0.75rem' : '0.85rem', lineHeight: 1 }}>
                                                {date.getDate()}
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', gap: 0.4, mt: 0.5 }}>
                                                {dayClasses.map((_: any, i: number) => (
                                                    <Box key={`c-${i}`} sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                ))}
                                                {dayDeadlines.map((_, i) => (
                                                    <Box key={`d-${i}`} sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#f44336' }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    );

                                    return isEvent ? (
                                        <Tooltip 
                                            key={date.toISOString()} 
                                            title={tooltipContent} 
                                            arrow 
                                            placement="top"
                                            enterDelay={200} // Hiện sau 0.2s để tránh bị rối khi lướt chuột nhanh
                                        >
                                            {dayBox}
                                        </Tooltip>
                                    ) : (
                                        <Box key={date.toISOString()}>{dayBox}</Box>
                                    );
                                })}
                            </Box>

                            <Box mt={3} display="flex"  gap={0.5}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                    <Typography variant="caption">Ngày có lịch học</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336' }} />
                                    <Typography variant="caption">Ngày có deadline</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                </Grid>

                <Box mb={5}>
                    <Typography variant="h4" fontWeight="700" gutterBottom sx={{ color: "#2e7d32" }}>
                        Góc Học Tập
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard title="Lớp Đang Học" value={myClasses.length.toString() || 0} icon={<ClassIcon fontSize="large" />} color="#2e7d32" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard title="Deadline" value={upcomingDeadlinesCount.toString() || "0"} icon={<AccessTimeIcon fontSize="large" />} color="#ed6c02" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard title="Điểm TB Tích Lũy" value="8.5" icon={<SchoolIcon fontSize="large" />} color="#1976d2" />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ mb: 5 }} />
                

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Đăng Ký Môn Học" desc="Đăng ký các lớp tín chỉ." icon={<AppRegistrationIcon />} color="#7b1fa2" onClick={() => navigate("/student/registration")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Lớp Học Của Tôi" desc="Truy cập tài liệu & Bài giảng." icon={<SchoolIcon />} color="#2e7d32" onClick={() => navigate("/student/classes")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Đăng Ký Đề Tài" desc="Chọn đề tài đồ án/tiểu luận." icon={<AssignmentIcon />} color="#ef6c00" onClick={() => navigate("/student/project-registration")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Nhóm Của Tôi" desc="Trao đổi với thành viên nhóm." icon={<GroupsIcon />} color="#0288d1" onClick={() => navigate("/student/my-teams")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Hồ Sơ Cá Nhân" desc="Xem điểm & Thông tin." icon={<PersonIcon />} color="#455a64" onClick={() => navigate("/student/profile")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MenuCard title="Đổi Mật Khẩu" desc="Bảo mật tài khoản." icon={<VpnKeyIcon />} color="#455a64" onClick={() => navigate("/change-password")} />
                    </Grid>
                </Grid>
            </Container>

           <Dialog 
            open={openEventDialog} 
            onClose={() => setOpenEventDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ 
                sx: { 
                    borderRadius: '8px', 
                    width: '520px',
                    position: 'relative',
                    backgroundImage: 'none', 
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
                } 
            }}
        >
            {/* Nút đóng góc trên bên phải */}
            <IconButton
                onClick={() => setOpenEventDialog(false)}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 8,
                    color: 'rgb(1, 145, 128)',
                    zIndex: 2,
                    '&:hover': { color: 'rgb(1, 145, 128)', bgcolor: 'transparent' }
                }}
            >
                <span style={{ fontSize: '18px' }}>✕</span>
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: '24px' }}> 

                    <Box display="flex" flexDirection="column" gap={2}>

                        {/* PHẦN LỊCH HỌC */}
                        {selectedDateEvents.classes.length > 0 && (
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                <Box>
                                    <Typography sx={{ color: 'rgb(0, 134, 137)', fontWeight: 700, fontSize: '16px', pl: 0.5, mb: 1 }}>
                                        Lịch {selectedDateLabel}
                                    </Typography>
                                    <Divider sx={{ borderColor: 'rgb(89, 148, 141)' }} />
                                </Box>
                                
                                {selectedDateEvents.classes.map((cls, idx) => {
                                    const dayOfWeek = new Date(selectedDateEvents.classes[0]?.startDate).getDay() === 0 ? 8 : new Date(selectedDateEvents.classes[0]?.startDate).getDay() + 1;
                                    const tt = cls.timeTables?.find((t: any) => t.dayOfWeek === dayOfWeek) || cls.timeTables?.[0];
                                    const isEven = idx % 2 === 0;
                                    return (
                                        <Box 
                                            key={`cls-${idx}`} 
                                            sx={{ 
                                                p: '16px 8px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(0, 0, 0, 0.09)',
                                                borderLeft: '4px solid #3b82f6',
                                                bgcolor: isEven ? '#e6ffdf' : '#eef2ff',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.5,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigate(`/class/${cls.id}`)}
                                        >
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'rgba(0, 0, 0, 0.88)' }}>
                                                {cls.classCode} - {cls.name}
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Box display="flex" alignItems="center">
                                                    <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 1)', width: '80px', flexShrink: 0, fontWeight: 600 }}>Phòng:</Typography> 
                                                    <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.88)' }}>{tt?.room || 'E-Learning'}</Typography>
                                                </Box>
        
                                                <Box display="flex" alignItems="center">
                                                    <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 1)', width: '80px', flexShrink: 0, fontWeight: 600 }}>Thời gian:</Typography> 
                                                    <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.88)' }}>Tiết {SLOT_INFO[tt?.slot].text} ({SLOT_INFO[tt?.slot].time})</Typography>
                                                </Box>
                                            </Box>
        
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() => navigate(`/class/${cls.id}`)}
                                                sx={{ 
                                                    mt: 0.5,
                                                    p: 0,
                                                    minWidth: 'auto',
                                                    justifyContent: 'flex-start',
                                                    color: 'rgb(0, 134, 137)',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        bgcolor: 'transparent',
                                                        color: 'rgb(0, 100, 102)',
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                Xem chi tiết lớp học
                                            </Button>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        {/* PHẦN DEADLINE */}
                        {selectedDateEvents.deadlines.length > 0 && (
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                <Box>
                                    <Typography sx={{ color: '#d32f2f', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', pl: 0.5, mb: 1 }}>
                                        Hạn nộp bài tập
                                    </Typography>
                                    <Divider sx={{ borderColor: 'rgba(211, 47, 47, 0.2)' }} />
                                </Box>

                                {selectedDateEvents.deadlines.map((task, idx) => {
                                    const isEven = idx % 2 === 0;
                                    
                                    return (
                                        <Box 
                                            key={`task-${idx}`} 
                                            sx={{ 
                                                p: '16px', 
                                                bgcolor: !isEven ? '#fff1f0' : '#ffccc7',
                                                borderRadius: '8px', 
                                                border: '1px solid rgba(255, 77, 79, 0.1)',
                                                borderLeft: '4px solid #ff4d4f',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.5,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigate(`/student/workspace/${task?.team?.id}`)}
                                        >
                                            <Typography sx={{ fontWeight: 700, color: '#cf1322', fontSize: '12px', mb: 0.2 }}>
                                                {task?.team?.teamName || "Nhiệm vụ cá nhân"}
                                            </Typography>
                                            
                                            <Typography sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.88)', fontSize: '14px' }}>
                                                {task.title}
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                <AccessTimeIcon sx={{ fontSize: 14 }} />
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                    Kết thúc: {new Date(task.dueDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() => navigate(`/student/workspace/${task?.team?.id}`)}
                                                sx={{ 
                                                    mt: 0.5,
                                                    p: 0,
                                                    minWidth: 'auto',
                                                    justifyContent: 'flex-start',
                                                    color: '#be0f1e',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    textTransform: 'none', 
                                                    '&:hover': {
                                                        bgcolor: 'transparent',
                                                        color: '#e01223',
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                Xem chi tiết nhiệm vụ
                                            </Button>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        {selectedDateEvents.classes.length === 0 && selectedDateEvents.deadlines.length === 0 && (
                            <Typography sx={{ textAlign: 'center', py: 4, color: 'rgba(0,0,0,0.25)', fontSize: '14px' }}>
                                Không có lịch trình trong ngày này
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
        </Box>                     
    );
};

export default StudentDashboard;