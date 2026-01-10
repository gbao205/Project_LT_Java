import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { logout } from '../../services/authService';

// --- INTERFACES ---
interface Activity {
    id: number;
    type: 'submit' | 'pending' | 'complete' | 'question';
    student: string;
    action: string;
    class: string;
    time: string;
    color: string;
}

interface Task {
    id: number;
    task: string;
    class: string;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
}

// --- STYLES ---
const styles = {
    header: {
        background: 'white',
        borderBottom: '1px solid #eaeaea',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky' as 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    logo: {
        width: '40px',
        height: '40px',
        background: '#0288d1',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: '#0288d1',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },
    logoutBtn: {
        background: '#ffebee',
        color: '#d32f2f',
        border: 'none',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        marginLeft: '10px'
    },
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: '100vh',
        background: '#f5f5f5'
    }
};

// --- COMPONENTS CON ---

const Header = ({ user, onLogout }: any) => (
    <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={styles.logo}>CS</div>
            <div>
                <div style={{ fontWeight: 'bold' }}>CollabSphere</div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>Giảng Viên Workspace</div>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{user?.fullName}</div>
                <span style={{
                    background: '#e1f5fe', color: '#0288d1', padding: '2px 8px',
                    borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                    display: 'inline-block', marginTop: '2px'
                }}>
                    {user?.role === 'LECTURER' ? 'Giảng Viên' : user?.role}
                </span>
            </div>
            <div style={styles.avatar}>{user?.fullName?.charAt(0)}</div>
            <button style={styles.logoutBtn} onClick={onLogout} title="Đăng xuất">➜</button>
        </div>
    </div>
);

const StatCard = ({ title, value, icon, color, bgColor, linkText, onLinkClick }: any) => (
    <div style={{
        background: 'white', borderRadius: '12px', padding: '1.2rem',
        border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                {title}
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: bgColor, color: color }}>
                {icon}
            </div>
        </div>
        <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color, marginBottom: '0.5rem' }}>{value}</div>
            {linkText && (
                <div
                    onClick={onLinkClick}
                    style={{ color: color, fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {linkText}
                </div>
            )}
        </div>
    </div>
);

const RecentActivities = ({ activities }: { activities: Activity[] }) => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f0f0f0', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📌</span><span>Hoạt động gần đây</span>
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#0288d1', cursor: 'pointer', fontWeight: '500' }}>Xem tất cả</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {activities.length === 0 ? <p style={{color: '#999', fontSize: '0.9rem'}}>Chưa có hoạt động mới.</p> :
            activities.map(activity => (
                <div key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '0.8rem', background: '#f9f9f9', borderRadius: '8px', borderLeft: `3px solid ${activity.color}` }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activity.color, marginTop: '0.3rem', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}><strong>{activity.student}</strong> {activity.action}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{activity.class} • {activity.time}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const UpcomingTasks = ({ tasks }: { tasks: Task[] }) => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f0f0f0', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✓</span><span>Công việc sắp tới</span>
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#0288d1', cursor: 'pointer', fontWeight: '500' }}>Thêm mới</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {tasks.length === 0 ? <p style={{color: '#999', fontSize: '0.9rem'}}>Không có công việc sắp tới.</p> :
            tasks.map(task => {
                const priorityColors: any = {
                    high: { bg: '#ffebee', color: '#d32f2f', label: 'Cao' },
                    medium: { bg: '#fff3e0', color: '#f57c00', label: 'Trung bình' },
                    low: { bg: '#e8f5e9', color: '#388e3c', label: 'Thấp' }
                };
                const priority = priorityColors[task.priority];
                return (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', background: '#f9f9f9', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                        <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: '500' }}>{task.task}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem', color: '#666' }}>
                                <span>📚 {task.class}</span><span>📅 {task.deadline}</span>
                                <span style={{ background: priority.bg, color: priority.color, padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' }}>{priority.label}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const CompactCalendar = ({ scheduleData }: any) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const changeMonth = (delta: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        const days = [];
        const today = new Date();

        for (let i = 0; i < startDayOfWeek; i++) days.push(<div key={`empty-${i}`}></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const events = scheduleData[dateKey] || [];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            days.push(
                <div key={day} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', cursor: events.length > 0 ? 'pointer' : 'default', background: events.length > 0 ? '#b2dfdb' : 'transparent', border: isToday ? '2px solid #00796b' : 'none' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: isToday ? 'bold' : 'normal', color: isToday ? '#00796b' : 'inherit' }}>{day}</div>
                    {events.length > 0 && (
                        <div style={{ display: 'flex', gap: '2px', marginTop: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {events.map((event: any, idx: number) => <div key={idx} style={{ width: '4px', height: '4px', borderRadius: '50%', background: event.color }} />)}
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem', border: '1px solid #f0f0f0', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: '#0097a7', fontSize: '0.9rem' }}><span>📅</span><span>Lịch Dạy</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <button style={{ background: '#f5f5f5', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }} onClick={() => changeMonth(-1)}>◀</button>
                    <div style={{ background: '#f5f5f5', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '600', fontSize: '0.75rem' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
                    <button style={{ background: '#f5f5f5', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }} onClick={() => changeMonth(1)}>▶</button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.2rem', marginBottom: '0.3rem' }}>
                {weekDays.map((day, idx) => <div key={day} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 'bold', color: idx === 0 ? '#ff5722' : '#666', padding: '0.2rem 0' }}>{day}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.2rem' }}>{renderCalendar()}</div>
        </div>
    );
};

const MenuCard = ({ title, desc, icon, color, bgColor, onClick }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transform: isHovered ? 'translateY(-5px)' : 'translateY(0)', boxShadow: isHovered ? '0 10px 30px rgba(0,0,0,0.08)' : 'none' }} onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div style={{ flex: 1 }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '1.5rem', background: bgColor, color: isHovered ? 'white' : color, transition: 'all 0.3s ease' }}>{icon}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</div>
                <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>{desc}</div>
            </div>
            <div style={{ color: '#e0e0e0', fontSize: '0.8rem', marginTop: '0.5rem' }}>›</div>
        </div>
    );
};

// --- MAIN PAGE ---
const LecturerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        activeClasses: 0,
        pendingRequests: 0,
        totalStudents: 0
    });

    const [scheduleData, setScheduleData] = useState<any>({
        '2025-12-28': [{ color: '#f44336' }],
        '2025-12-29': [{ color: '#4caf50' }],
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        } else {
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                const data = res.data;
                setStats({
                    activeClasses: data.totalClasses || 0,
                    pendingRequests: data.pendingRequests || 0,
                    totalStudents: data.totalStudents || 0
                });
            } catch (error) {
                console.error("Lỗi lấy dữ liệu Dashboard:", error);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => { logout(); navigate('/login'); };
    if (!user) return <div style={{padding: '2rem'}}>Đang tải thông tin...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Header user={user} onLogout={handleLogout} />

            <div style={styles.container}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0288d1', marginBottom: '2rem' }}>
                    Khu Vực Giảng Viên
                </h1>

                {/* 1. Dashboard Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                    <StatCard
                        title="LỚP ĐANG DẠY"
                        value={stats.activeClasses}
                        icon="🎓" color="#0288d1" bgColor="#e3f2fd"
                        // 👇 Link đúng: Quản lý lớp
                        onLinkClick={() => navigate('/lecturer/classes')}
                        linkText="Xem chi tiết"
                    />
                    <StatCard
                        title="YÊU CẦU DUYỆT"
                        value={stats.pendingRequests}
                        icon="📝" color="#d32f2f" bgColor="#ffebee"
                        // 👇 Link đúng: Duyệt đề tài
                        onLinkClick={() => navigate('/lecturer/proposals')}
                        linkText="Xem danh sách"
                    />
                    <StatCard title="SINH VIÊN" value={stats.totalStudents} icon="👥" color="#7b1fa2" bgColor="#f3e5f5" />

                    <StatCard
                        title="LỊCH DẠY TUẦN"
                        value="12"
                        icon="📆" color="#0097a7" bgColor="#e0f7fa"
                        linkText="Xem chi tiết"
                        // 👇 Link đúng: Lịch dạy
                        onLinkClick={() => navigate('/lecturer/schedule')}
                    />
                </div>

                {/* 2. Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                    <RecentActivities activities={activities} />
                    <UpcomingTasks tasks={tasks} />
                    <CompactCalendar scheduleData={scheduleData} />
                </div>

                <div style={{ height: '1px', background: '#e0e0e0', margin: '2rem 0' }} />

                {/* 3. Menu Functions (ĐÃ SỬA LINK) */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#424242' }}>Chức Năng Quản Lý</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>

                    {/* ✅ SỬA 1: Link quản lý lớp */}
                    <MenuCard
                        title="Lớp Học Phụ Trách"
                        desc="Quản lý sinh viên & Nhóm."
                        icon="📚" color="#0277bd" bgColor="#e3f2fd"
                        onClick={() => navigate('/lecturer/classes')}
                    />

                    {/* ✅ SỬA 2: Link duyệt đề tài */}
                    <MenuCard
                        title="Duyệt Đề Tài (GV)"
                        desc="Xem và phê duyệt đề tài SV."
                        icon="✓" color="#c2185b" bgColor="#fff3e0"
                        onClick={() => navigate('/lecturer/proposals')}
                    />

                    {/* ✅ SỬA 3: Link Chấm điểm (Ví dụ: ID=1) */}
                    <MenuCard
                        title="Chấm Điểm Hội Đồng"
                        desc="Nhập điểm bảo vệ đồ án."
                        icon="📊" color="#fbc02d" bgColor="#fff9c4"
                        onClick={() => navigate('/lecturer/teams/1')}
                    />

                    <MenuCard
                        title="Đổi Mật Khẩu"
                        desc="Bảo mật tài khoản."
                        icon="🔑" color="#455a64" bgColor="#eceff1"
                        onClick={() => navigate('/change-password')}
                    />
                </div>
            </div>
        </div>
    );
};

export default LecturerDashboard;