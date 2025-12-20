import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import ChangePassword from "./pages/auth/ChangePassword";
import UserManager from "./pages/admin/UserManager";
import SubjectManager from './pages/staff/SubjectManager';
// Đổi tên import để tránh trùng lặp
import StaffClassManager from "./pages/staff/ClassManager";
import StudentWorkspace from "./pages/student/StudentWorkspace";
import CourseRegistration from "./pages/student/CourseRegistration";
import MyClasses from "./pages/student/MyClasses";
import ClassDetail from "./pages/class/ClassDetail";
import ReportManager from './pages/admin/ReportManager';
import ReportDialog from './components/common/ReportDialog';

// --- IMPORT CỦA GIẢNG VIÊN ---
import TeamDetail from './pages/lecturer/TeamDetail';
import LecturerClassManager from './pages/lecturer/ClassManager'; // Đổi tên để không trùng với Staff
import LecturerDashboard from './pages/lecturer/LecturerDashboard';

function App() {
    return (
        <Router>
            <ReportDialog />

            <Routes>
                {/* Chuyển hướng mặc định */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Login */}
                <Route path="/login" element={<Login />} />

                {/* Trang chủ Dashboard chung (Admin/Staff/Student cũ) */}
                <Route path="/home" element={<Home />} />

                {/* --- ROUTE ADMIN & STAFF --- */}
                <Route path="/admin/users" element={<UserManager />} />
                <Route path="/admin/reports" element={<ReportManager />} />
                <Route path="/admin/subjects" element={<SubjectManager />} />
                {/* Sử dụng tên mới đã đổi */}
                <Route path="/admin/classes" element={<StaffClassManager />} />

                {/* --- ROUTE SINH VIÊN --- */}
                <Route path="/student/workspace" element={<StudentWorkspace />} />
                <Route path="/student/registration" element={<CourseRegistration />} />
                <Route path="/student/classes" element={<MyClasses />} />
                <Route path="/class/:id" element={<ClassDetail />} />

                {/* --- ROUTE GIẢNG VIÊN (MỚI) --- */}
                <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
                <Route path="/lecturer/classes" element={<LecturerClassManager />} />
                <Route path="/lecturer/teams/:teamId" element={<TeamDetail />} />

                {/* Đổi mật khẩu chung */}
                <Route path="/change-password" element={<ChangePassword />} />

            </Routes>
        </Router>
    );
}

export default App;