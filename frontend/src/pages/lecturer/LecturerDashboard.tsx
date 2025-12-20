import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  MessageSquare,
  ClipboardList,
  Key,
  LogOut,
  GraduationCap,
  FileText,
  Users
} from 'lucide-react';

const LecturerDashboard = () => {
  const navigate = useNavigate();

  // Dữ liệu thống kê (Mock data)
  const stats = [
    { label: 'Lớp Đang Dạy', value: 3, icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
    { label: 'Yêu Cầu Duyệt Đề Tài', value: 5, icon: FileText, color: 'bg-red-100 text-red-600' },
    { label: 'Sinh Viên Phụ Trách', value: 120, icon: Users, color: 'bg-purple-100 text-purple-600' },
  ];

  // Danh sách Menu chức năng
  const menuItems = [
    {
      title: 'Lớp Học Phụ Trách',
      desc: 'Quản lý sinh viên & Nhóm.',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
      // Chuyển hướng đến trang Quản lý lớp học của Giảng viên
      action: () => navigate('/lecturer/classes')
    },
    {
      title: 'Duyệt Đề Tài (GV)',
      desc: 'Xem và phê duyệt đề tài SV.',
      icon: MessageSquare,
      color: 'bg-pink-50 text-pink-600',
      action: () => alert("Tính năng đang phát triển")
    },
    {
      title: 'Chấm Điểm Hội Đồng',
      desc: 'Nhập điểm bảo vệ đồ án.',
      icon: ClipboardList,
      color: 'bg-yellow-50 text-yellow-600',
      // Chuyển hướng đến trang Chấm điểm (Demo Team ID 1)
      action: () => navigate('/lecturer/teams/1')
    },
    {
      title: 'Đổi Mật Khẩu',
      desc: 'Bảo mật tài khoản.',
      icon: Key,
      color: 'bg-gray-100 text-gray-600',
      action: () => navigate('/change-password')
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50/30 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">CS</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">CollabSphere</h1>
              <p className="text-xs text-gray-500">Giảng Viên Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-700">Nguyễn Mạnh Cường</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Giảng Viên</span>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              N
            </div>
            <button
                onClick={() => navigate('/login')}
                className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition"
                title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-blue-800 mb-8">Khu Vực Giảng Viên</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={32} />
              </div>
              <div>
                <h3 className="text-4xl font-extrabold text-gray-800">{stat.value}</h3>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                  <ChevronRightIcon />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

// Icon mũi tên nhỏ
const ChevronRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default LecturerDashboard;