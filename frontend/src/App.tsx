import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { SnackbarProvider } from './context/SnackbarContext';
import { ConfirmProvider } from './context/ConfirmContext';

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
import StaffClassManager from "./pages/staff/ClassStaff";
import ImportCenter from "./pages/staff/ImportCenter";

// Các trang sinh viên...
import StudentWorkspace from "./pages/student/StudentWorkspace";
import CourseRegistration from "./pages/student/CourseRegistration";
import MyClasses from "./pages/student/MyClasses";
import StudentProfile from "./pages/student/StudentProfile";
import ClassDetail from "./pages/class/ClassDetail";
import MyTeams from "./pages/student/MyTeams";
import ProjectRegistration from './pages/student/ProjectRegistration';

// Các trang giảng viên...
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerClassManager from "./pages/lecturer/ClassManager";
import TeamDetail from "./pages/lecturer/TeamDetail";
import ProposalApproval from "./pages/lecturer/ProposalApproval";
import DetailedTeachingSchedule from "./pages/lecturer/DetailedTeachingSchedule";
import ReviewProjects from "./pages/lecturer/ReviewProjects";
import LecturerProposalManager from "./pages/lecturer/LecturerProposalManager";
// Các trang Staff...
import UserStaff from "./pages/staff/UserStaff";
import ClassStaff from "./pages/staff/ClassStaff";
import SyllabusStaff from "./pages/staff/SyllabusStaff";

// ---  Các trang Trưởng bộ môn (Head) ---
import HeadProposalApproval from './pages/head/HeadProposalApproval';
import HeadLecturerManager from "./pages/head/HeadLecturerManager";
import HeadDashboard from "./pages/head/HeadDashboard";

// --- COMPONENT BỌC CHAT ---
const ChatWrapper = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  const hiddenPaths = ["/login", "/"];
  const isHidden = hiddenPaths.includes(location.pathname);

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
    <SnackbarProvider>
      <ConfirmProvider>
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
            <Route path="/staff/users" element={<UserStaff />} />
            <Route path="/staff/reports" element={<ReportManager />} />
            <Route path="/staff/subjects" element={<SubjectManager />} />
            <Route path="/staff/classes" element={<ClassStaff />} />
            <Route path="/staff/syllabus" element={<SyllabusStaff />} />
    
            {/* Student Routes */}
            <Route path="/student/workspace/:teamId" element={<StudentWorkspace />} />
            <Route path="/student/registration" element={<CourseRegistration />} />
            <Route path="/student/classes" element={<MyClasses />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/class/:id" element={<ClassDetail />} />
            <Route path="student/my-teams" element={<MyTeams />} />
            <Route path="/student/project-registration" element={<ProjectRegistration />} />
    
            {/* Lecturer Routes */}
            <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
            <Route path="/lecturer/classes" element={<LecturerClassManager />} />
            <Route path="/lecturer/teams/:teamId" element={<TeamDetail />} />
            <Route path="/lecturer/schedule" element={<DetailedTeachingSchedule />} />
            <Route path="/lecturer/proposals" element={<ProposalApproval />} />
            <Route path="/lecturer/reviews" element={<ReviewProjects />} />
            <Route path="/lecturer/manage-proposals" element={<LecturerProposalManager />} />
            {/* ---  HEAD DEPARTMENT ROUTES --- */}
            <Route path="/head/dashboard" element={<HeadDashboard />} /> {/* <--- Route Tổng quan */}
            <Route path="/head/approval" element={<HeadProposalApproval />} /> {/* Sửa lại path cho ngắn gọn khớp với dashboard */}
            <Route path="/head/proposal-approval" element={<HeadProposalApproval />} /> {/* Giữ cả path cũ để tránh lỗi */}
            <Route path="/head/lecturers" element={<HeadLecturerManager />} />

          </Routes>
        </Router>
      </ConfirmProvider>
    </SnackbarProvider>
  );
}

export default App;