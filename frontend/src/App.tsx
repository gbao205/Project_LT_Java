import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/auth/Login";
import SubjectManager from "./pages/admin/SubjectManager";
import Home from "./pages/Home";
import ChangePassword from "./pages/auth/ChangePassword";
import UserManager from "./pages/admin/UserManager";
import ClassManager from "./pages/admin/ClassManager";

function App() {
    return (
        <Router>
            <Routes>
                {/* Chuyển hướng mặc định */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Login */}
                <Route path="/login" element={<Login />} />

                {/* Trang chủ Dashboard */}
                <Route path="/home" element={<Home />} />

                {/* Các trang chức năng */}
                <Route path="/admin/subjects" element={<SubjectManager />} />

                {/* Đổi mật khẩu */}
                <Route path="/change-password" element={<ChangePassword />} />

                {/* Quản lý user */}
                <Route path="/admin/users" element={<UserManager />} />

                {/* Quản lý lớp học */}
                <Route path="/admin/classes" element={<ClassManager />} />
            </Routes>
        </Router>
    );
}

export default App;