import {BrowserRouter as Router, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import ChangePassword from "./pages/auth/ChangePassword";
import UserManager from "./pages/admin/UserManager";
import SubjectManager from "./pages/staff/SubjectManager";
import ClassManager from "./pages/staff/ClassManager.tsx";
import StudentWorkspace from "./pages/student/StudentWorkspace";
import CourseRegistration from "./pages/student/CourseRegistration";
import MyClasses from "./pages/student/MyClasses";
import ClassDetail from "./pages/class/ClassDetail";
import ReportManager from './pages/admin/ReportManager';
import ReportDialog from './components/common/ReportDialog';
import StudentProfile from './pages/student/StudentProfile';
import ChatWidget from "./components/common/ChatWidget.tsx";
import AIChat from "./pages/student/AIChatWidget.tsx";
import StaffUserManager from "./pages/staff/UserManager";
import ImportCenter from "./pages/staff/ImportCenter";


function GlobalWidgets() {
    const location = useLocation(); // Lấy đường dẫn hiện tại

    // Danh sách các trang KHÔNG muốn hiển thị Chat
    const hideOnRoutes = ['/login'];

    // Nếu đường dẫn hiện tại nằm trong danh sách ẩn thì return null (không vẽ gì cả)
    if (hideOnRoutes.includes(location.pathname)) {
        return null;
    }

    return (
        <>
            <ChatWidget />
            <AIChat />
        </>
    );
}

function App() {
    return (
        <Router>
            <ReportDialog />
            <GlobalWidgets />

            <Routes>
                {/* Chuyển hướng mặc định */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Login */}
                <Route path="/login" element={<Login />} />

                {/* Trang chủ Dashboard */}
                <Route path="/home" element={<Home />} />

                {/* Các trang chức năng */}
                <Route path="/staff/subjects" element={<SubjectManager />} />

                {/* Đổi mật khẩu */}
                <Route path="/change-password" element={<ChangePassword />} />

                {/* Quản lý user */}
                <Route path="/admin/users" element={<UserManager />} />

                {/* Quản lý lớp học */}
                <Route path="/staff/classes" element={<ClassManager />} />

                {/* Route cho Sinh viên */}
                <Route path="/student/workspace" element={<StudentWorkspace />} />

                {/* Route cho sinh viên đăng ký môn */}
                <Route path="/student/registration" element={<CourseRegistration />} />

                {/* Route cho chức năng Lớp học của tôi */}
                <Route path="/student/classes" element={<MyClasses />} />

                <Route path="/class/:id" element={<ClassDetail />} />

                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/staff/users" element={<StaffUserManager />} />
                <Route path="/staff/import" element={<ImportCenter />} />
                {/* Route cho trang Quản lý Báo cáo của Admin */}
                <Route path="/admin/reports" element={<ReportManager />} />

            </Routes>
        </Router>
    );
}

export default App;