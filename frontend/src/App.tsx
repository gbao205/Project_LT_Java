import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import ChangePassword from "./pages/auth/ChangePassword";
import UserManager from "./pages/admin/UserManager";
import SubjectManager from './pages/staff/SubjectManager';
import StaffClassManager from "./pages/staff/ClassManager.tsx";
import StudentWorkspace from "./pages/student/StudentWorkspace";
import CourseRegistration from "./pages/student/CourseRegistration";
import MyClasses from "./pages/student/MyClasses";
import ClassDetail from "./pages/class/ClassDetail";
import ReportManager from './pages/admin/ReportManager';
import ReportDialog from './components/common/ReportDialog';
import StudentProfile from './pages/student/StudentProfile';
import ChatWidget from "./components/common/ChatWidget.tsx";
import AIChat from "./pages/student/AIChatWidget.tsx";

// --- SỬA LẠI IMPORT LECTURER (Quan trọng) ---
import ProposalApproval from './pages/lecturer/ProposalApproval';
import TeamDetail from './pages/lecturer/TeamDetail';
import LecturerClassManager from './pages/lecturer/ClassManager';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import DetailedTeachingSchedule from './pages/lecturer/DetailedTeachingSchedule';

function App() {
    return (
        <Router>
            <ReportDialog />
            <ChatWidget />
            <AIChat />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/change-password" element={<ChangePassword />} />

                {/* Admin & Staff */}
                <Route path="/admin/users" element={<UserManager />} />
                <Route path="/admin/reports" element={<ReportManager />} />
                <Route path="/admin/subjects" element={<SubjectManager />} />
                <Route path="/admin/classes" element={<StaffClassManager />} />

                {/* Student */}
                <Route path="/student/workspace" element={<StudentWorkspace />} />
                <Route path="/student/registration" element={<CourseRegistration />} />
                <Route path="/student/classes" element={<MyClasses />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/class/:id" element={<ClassDetail />} />


                {/* 1. Dashboard */}
                <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />

                {/* 2. Quản lý lớp */}
                <Route path="/lecturer/classes" element={<LecturerClassManager />} />

                {/* 3. Chi tiết nhóm */}
                <Route path="/lecturer/teams/:teamId" element={<TeamDetail />} />

                {/* 4. Lịch dạy chi tiết */}
                <Route path="/lecturer/schedule" element={<DetailedTeachingSchedule />} />

                {/* 5. Duyệt đề tài (Đã OK) */}
                <Route path="/lecturer/proposals" element={<ProposalApproval />} />

            </Routes>
        </Router>
    );
}
export default App;