import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Components & Auth
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import ChangePassword from "./pages/auth/ChangePassword";
import ReportDialog from "./components/common/ReportDialog";
import ChatWidget from "./components/common/ChatWidget";
import AIChat from "./pages/student/AIChatWidget";

// Các trang quản lý...
import UserManager from "./pages/admin/UserManager";
import ReportManager from "./pages/admin/ReportManager";
import SubjectManager from "./pages/staff/SubjectManager";
import StaffClassManager from "./pages/staff/ClassManager";
import ImportCenter from "./pages/staff/ImportCenter";
// Các trang sinh viên...
import StudentWorkspace from "./pages/student/StudentWorkspace";
import CourseRegistration from "./pages/student/CourseRegistration";
import MyClasses from "./pages/student/MyClasses";
import StudentProfile from "./pages/student/StudentProfile";
import ClassDetail from "./pages/class/ClassDetail";
import MyTeams from "./pages/student/MyTeams";

// Các trang giảng viên...
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerClassManager from "./pages/lecturer/ClassManager";
import TeamDetail from "./pages/lecturer/TeamDetail";
import ProposalApproval from "./pages/lecturer/ProposalApproval";
import DetailedTeachingSchedule from "./pages/lecturer/DetailedTeachingSchedule";

// --- COMPONENT BỌC CHAT ---
// Tách ra một component con để có thể sử dụng hook useLocation()
const ChatWrapper = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Danh sách các trang KHÔNG muốn hiện Chat (Login, Root, v.v.)
  const hiddenPaths = ["/login", "/"];
  const isHidden = hiddenPaths.includes(location.pathname);

  // Chỉ hiện Chat khi: Đã đăng nhập (có token) VÀ không phải trang login
  if (!token || isHidden) {
    return null;
  }

  return (
      <>
        <ChatWidget />
        <AIChat />
      </>
  );
};

function App() {
  return (
      <Router>
        <ReportDialog />

        {/* Sử dụng Wrapper ở đây */}
        <ChatWrapper />

        <Routes>
          {/* Public & Auth */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<UserManager />} />
          <Route path="/admin/reports" element={<ReportManager />} />
          <Route path="/admin/subjects" element={<SubjectManager />} />
          <Route path="/admin/classes" element={<StaffClassManager />} />

          {/* Staff Routes */}
          <Route path="/staff/import" element={<ImportCenter />} />
          <Route path="/staff/users" element={<UserManager />} />
          <Route path="/staff/reports" element={<ReportManager />} />
          <Route path="/staff/subjects" element={<SubjectManager />} />
          <Route path="/staff/classes" element={<StaffClassManager />} />

          {/* Student Routes */}
          <Route path="/student/workspace" element={<StudentWorkspace />} />
          <Route path="/student/registration" element={<CourseRegistration />} />
          <Route path="/student/classes" element={<MyClasses />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/class/:id" element={<ClassDetail />} />
          <Route path="student/my-teams" element={<MyTeams />} />

          {/* Lecturer Routes */}
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer/classes" element={<LecturerClassManager />} />
          <Route path="/lecturer/teams/:teamId" element={<TeamDetail />} />
          <Route path="/lecturer/schedule" element={<DetailedTeachingSchedule />} />
          <Route path="/lecturer/proposals" element={<ProposalApproval />} />
        </Routes>
      </Router>
  );
}

export default App;