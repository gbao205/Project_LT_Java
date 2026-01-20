import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA (Giữ nguyên dữ liệu hiển thị) ---
const scheduleData: any = {
  '2026-01-06': {
    morning: { ca1: [], ca2: [{ id: 1, name: 'Xử lý ảnh nâng cao', code: '010112201008', sessions: '4-6', time: '09:25 - 11:55', room: 'H105', location: 'CS3 (PTrung Mỹ Tây)', platform: 'LMS' }] },
    afternoon: { ca3: [], ca4: [{ id: 2, name: 'Quản trị dự án CNTT', code: '010112301509', sessions: '10-12', time: '14:50 - 17:20', room: 'H102', location: 'CS3 (PTrung Mỹ Tây)', platform: 'LMS' }] },
    evening: { ca5: [] }
  },
  '2026-01-07': {
    morning: { ca1: [], ca2: [] },
    afternoon: { ca3: [{ id: 3, name: 'Quản trị mạng', code: '010112305503', sessions: '4-6', time: '09:25 - 11:55', room: 'H201', location: 'CS3 (PTrung Mỹ Tây)', platform: 'LMS' }], ca4: [] },
    evening: { ca5: [] }
  },
  '2026-01-08': {
    morning: { ca1: [], ca2: [] },
    afternoon: { ca3: [{ id: 4, name: 'Chuyên đề hệ thống giao thông', code: '010112203813', sessions: '7-9', time: '12:10 - 14:40', room: 'H204', location: 'CS3 (PTrung Mỹ Tây)', platform: 'LMS' }], ca4: [] },
    evening: { ca5: [] }
  },
  '2026-01-09': {
    morning: { ca1: [], ca2: [{ id: 5, name: 'Lập trình Java', code: '010112213693', sessions: '4-6', time: '09:25 - 11:55', room: 'H206', location: 'CS3 (PTrung Mỹ Tây)', platform: 'LMS' }] },
    afternoon: { ca3: [{ id: 6, name: 'Quản trị doanh nghiệp CNTT', code: '010112113704', sessions: '7-9', time: '12:10 - 14:40', room: 'H207', location: 'CS3 (PTrung Mỹ Tây)', platform: 'LMS' }], ca4: [] },
    evening: { ca5: [] }
  },
  '2026-01-10': {
    morning: { ca1: [], ca2: [] },
    afternoon: { ca3: [{ id: 7, name: 'Quản trị doanh nghiệp CNTT', code: '010112113704', sessions: '7-9', time: '12:10 - 14:40', room: 'H103', location: 'CS3 (PTrung Mỹ Tây)', platform: 'LMS', note: 'Lịch học bù cho ngày 24/01/2025', isSpecial: true }], ca4: [] },
    evening: { ca5: [{ id: 8, name: 'Lập trình Java', code: '010112213693', sessions: '16-18', time: '20:10 - 22:40', room: 'E-Learning', location: 'Online', platform: '' }] }
  },
  '2026-01-11': {
    morning: { ca1: [], ca2: [] },
    afternoon: { ca3: [], ca4: [] },
    evening: { ca5: [] }
  }
};

// --- COMPONENTS HEADER & CARD (Giữ nguyên giao diện đẹp) ---

const Header = ({ user, onBack }: any) => (
  <div style={{
    background: 'linear-gradient(135deg, #0288d1 0%, #0097a7 100%)',
    borderBottom: '3px solid #01579b',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
      <button
        onClick={onBack}
        style={{
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white',
          border: '1px solid rgba(255,255,255,0.3)', width: '40px', height: '40px',
          borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'translateX(-5px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateX(0)'; }}
      >
        ←
      </button>

      <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0288d1', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>CS</div>

      <div>
        <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>CollabSphere</div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginTop: '2px' }}>Giảng Viên Workspace</div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{user.fullName}</div>
        <span style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block', marginTop: '4px', border: '1px solid rgba(255,255,255,0.3)' }}>Giảng Viên</span>
      </div>
      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'white', color: '#0288d1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '3px solid rgba(255,255,255,0.3)' }}>{user.fullName.charAt(0)}</div>
    </div>
  </div>
);

const CourseCard = ({ course }: any) => (
  <div style={{
    background: course.isSpecial ? '#fff3e0' : '#f8f9fa',
    border: course.isSpecial ? '2px solid #ff9800' : '1px solid #e0e0e0',
    borderLeft: `3px solid ${course.isSpecial ? '#ff9800' : '#0288d1'}`,
    borderRadius: '6px', padding: '8px', marginBottom: '8px', fontSize: '0.75rem',
    position: 'relative', transition: 'all 0.2s ease', cursor: 'pointer'
  }}
  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
    <div style={{ fontWeight: 'bold', color: '#0288d1', marginBottom: '4px', fontSize: '0.8rem', lineHeight: '1.3' }}>{course.name}</div>
    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '6px' }}>{course.code}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#444', fontSize: '0.7rem' }}><span>📚</span><span>Tiết: {course.sessions}</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#444', fontSize: '0.7rem' }}><span>🕐</span><span>{course.time}</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#444', fontSize: '0.7rem' }}><span>📍</span><span>{course.room} - {course.location}</span></div>
    </div>
    {course.note && <div style={{ marginTop: '6px', padding: '4px 6px', background: '#ffebee', borderRadius: '4px', fontSize: '0.65rem', color: '#d32f2f', fontWeight: '500' }}>💡 {course.note}</div>}
    {course.platform && <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#f44336', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}><span>●</span><span>{course.platform}</span></div>}
  </div>
);

// --- MAIN PAGE ---
const DetailedTeachingSchedule = () => {
  // 1. Sử dụng useNavigate để điều hướng
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 6));
  const [user] = useState({ fullName: 'Nguyễn Mạnh Cường', role: 'LECTURER' });

  // Helpers
  const formatDate = (date: Date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  const getWeekDates = (date: Date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay() + 1;
    const dates = [];
    for (let i = 0; i < 7; i++) { const d = new Date(curr.setDate(first + i)); dates.push(d); }
    return dates;
  };
  const weekDates = getWeekDates(selectedDate);
  const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  const formatDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const changeWeek = (delta: number) => { const newDate = new Date(selectedDate); newDate.setDate(newDate.getDate() + (delta * 7)); setSelectedDate(newDate); };

  // 2. Sửa hàm xử lý quay lại
  const handleBack = () => {
    navigate('/lecturer/dashboard'); // Quay về Dashboard
  };

  const periods = [
    { name: 'Sáng', sessions: ['ca1', 'ca2'], color: '#0288d1' },
    { name: 'Chiều', sessions: ['ca3', 'ca4'], color: '#0097a7' },
    { name: 'Tối', sessions: ['ca5'], color: '#00796b' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)' }}>
      <Header user={user} onBack={handleBack} />

      <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Controls */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 25px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e0e0e0' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#0288d1', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'linear-gradient(135deg, #0288d1 0%, #0097a7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.8rem' }}>📅</span>
              <span>Lịch Dạy Chi Tiết</span>
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📚 Học kỳ 1 - Năm học 2025-2026</span>
              <span style={{ background: '#e3f2fd', color: '#0288d1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>Đang hoạt động</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => changeWeek(-1)} style={{ background: 'linear-gradient(135deg, #0288d1 0%, #0097a7 100%)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(2,136,209,0.3)' }}>← Tuần trước</button>
            <div style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #b3e5fc 100%)', padding: '8px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', color: '#0277bd', display: 'flex', alignItems: 'center', gap: '8px', border: '2px solid #81d4fa', boxShadow: '0 2px 8px rgba(2,136,209,0.15)' }}>
              <span style={{ fontSize: '1.1rem' }}>📆</span><span>{formatDate(selectedDate)}</span>
            </div>
            <button onClick={() => changeWeek(1)} style={{ background: 'linear-gradient(135deg, #0288d1 0%, #0097a7 100%)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(2,136,209,0.3)' }}>Tuần sau →</button>
            <button onClick={() => setSelectedDate(new Date(2026, 0, 6))} style={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(76,175,80,0.3)' }}>🎯 Hôm nay</button>
          </div>
        </div>

        {/* Schedule Table */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr>
                  <th style={{ background: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)', color: 'white', padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', width: '80px', fontSize: '0.85rem', position: 'sticky', left: 0, zIndex: 10, boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>Ca học</th>
                  {weekDates.map((date, idx) => {
                    const isToday = date.getDate() === 6 && date.getMonth() === 0;
                    return (
                      <th key={idx} style={{ background: isToday ? 'linear-gradient(135deg, #ff6f00 0%, #ff9800 100%)' : 'linear-gradient(135deg, #0288d1 0%, #0097a7 100%)', color: 'white', padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', minWidth: '130px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ marginBottom: '4px' }}>{weekDays[idx]}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.95 }}>{formatDate(date)}</div>
                        {isToday && <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 'normal', opacity: 0.95, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px', display: 'inline-block' }}>● Hôm nay</div>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {periods.map((period, periodIdx) => (
                  <React.Fragment key={periodIdx}>
                    {period.sessions.map((sessionKey, sessionIdx) => (
                      <tr key={sessionKey}>
                        {sessionIdx === 0 && (
                          <td rowSpan={period.sessions.length} style={{ background: `linear-gradient(135deg, ${period.color} 0%, ${period.color}dd 100%)`, color: 'white', padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', verticalAlign: 'middle', position: 'sticky', left: 0, zIndex: 5, borderBottom: '2px solid white', boxShadow: '2px 0 5px rgba(0,0,0,0.05)' }}>
                            {period.name}
                          </td>
                        )}
                        {weekDates.map((date, dateIdx) => {
                          const dateKey = formatDateKey(date);
                          let courses = [];
                          if (periodIdx === 0) courses = scheduleData[dateKey]?.morning?.[sessionKey] || [];
                          else if (periodIdx === 1) courses = scheduleData[dateKey]?.afternoon?.[sessionKey] || [];
                          else courses = scheduleData[dateKey]?.evening?.[sessionKey] || [];

                          return (
                            <td key={dateIdx} style={{ padding: '8px', background: courses.length > 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #e0e0e0', borderLeft: '1px solid #e0e0e0', verticalAlign: 'top', minHeight: '70px' }}>
                              {courses.map((course: any) => <CourseCard key={course.id} course={course} />)}
                              {courses.length === 0 && <div style={{ textAlign: 'center', color: '#bbb', fontSize: '0.7rem', padding: '20px 0' }}>Trống</div>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop: '15px', background: 'white', borderRadius: '10px', padding: '12px 15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 'bold', color: '#666' }}>Chú thích:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#f44336', borderRadius: '3px' }}></div><span>LMS (Học trực tuyến)</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#ff9800', borderRadius: '3px' }}></div><span>Lịch học bù</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#0288d1', borderRadius: '3px' }}></div><span>Lịch học bình thường</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedTeachingSchedule;