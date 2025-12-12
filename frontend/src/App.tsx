import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/auth/Login";
import SubjectManager from "./pages/admin/SubjectManager";
import Home from "./pages/Home";

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
            </Routes>
        </Router>
    );
}

export default App;