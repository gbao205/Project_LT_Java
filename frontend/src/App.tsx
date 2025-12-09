import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/auth/Login";
import SubjectManager from "./pages/admin/SubjectManager";

function App() {
    return (
        <Router>
            <Routes>
                {/* Mặc định vào trang Login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Trang Login */}
                <Route path="/login" element={<Login />} />

                {/* Trang Quản lý  */}
                <Route path="/admin/subjects" element={<SubjectManager />} />
            </Routes>
        </Router>
    );
}

export default App;