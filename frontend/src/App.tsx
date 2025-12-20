import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import ChangePassword from "./pages/auth/ChangePassword";
import UserManager from "./pages/admin/UserManager";
import SubjectManager from './pages/staff/SubjectManager';
// 1. ĐỔI TÊN IMPORT STAFF
import StaffClassManager from "./pages/staff/ClassManager.tsx";
import StudentWorkspace from "./pages/student/StudentWorkspace";
import CourseRegistration from "./pages/student/CourseRegistration";
import MyClasses from "./pages/student/MyClasses";
import ClassDetail from "./pages/class/ClassDetail";
import ReportManager from './pages/admin/ReportManager';
import ReportDialog from './components/common/ReportDialog';

// 2. IMPORT CỦA GIẢNG VIÊN (ĐÚNG ĐƯỜNG DẪN)
import TeamDetail from './pages/lecturer/TeamDetail';
import LecturerClassManager from './pages/lecturer/ClassManager';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';

function App() {
    return (
        <Router>
            <ReportDialog />
            <Routes>
                {/* --- CÁC ROUTE CŨ GIỮ NGUYÊN --- */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/change-password" element={<ChangePassword />} />

                {/* ADMIN & STAFF */}
                <Route path="/admin/users" element={<UserManager />} />
                <Route path="/admin/reports" element={<ReportManager />} />
                <Route path="/admin/subjects" element={<SubjectManager />} />
                <Route path="/admin/classes" element={<StaffClassManager />} /> {/* Dùng tên mới */}

                {/* STUDENT */}
                <Route path="/student/workspace" element={<StudentWorkspace />} />
                <Route path="/student/registration" element={<CourseRegistration />} />
                <Route path="/student/classes" element={<MyClasses />} />
                <Route path="/class/:id" element={<ClassDetail />} />

                {/* --- ROUTE GIẢNG VIÊN (MỚI) --- */}
                <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
                <Route path="/lecturer/classes" element={<LecturerClassManager />} /> {/* Dùng tên mới */}
                <Route path="/lecturer/teams/:teamId" element={<TeamDetail />} />

            </Routes>
        </Router>
    );
}

export default App;