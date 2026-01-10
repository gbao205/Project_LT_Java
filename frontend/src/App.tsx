import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Components & Auth
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import ChangePassword from "./pages/auth/ChangePassword";
import ReportDialog from "./components/common/ReportDialog";
import ChatWidget from "./components/common/ChatWidget";
import AIChat from "./pages/student/AIChatWidget";

// Admin & Staff
import UserManager from "./pages/admin/UserManager";
import ReportManager from "./pages/admin/ReportManager";
import SubjectManager from "./pages/staff/SubjectManager";
import StaffClassManager from "./pages/staff/ClassManager";
import ImportCenter from "./pages/staff/ImportCenter";

// Student
import StudentWorkspace from "./pages/student/StudentWorkspace";
import CourseRegistration from "./pages/student/CourseRegistration";
import MyClasses from "./pages/student/MyClasses";
import StudentProfile from "./pages/student/StudentProfile";
import ClassDetail from "./pages/class/ClassDetail";

// Lecturer
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerClassManager from "./pages/lecturer/ClassManager";
import TeamDetail from "./pages/lecturer/TeamDetail";
import ProposalApproval from "./pages/lecturer/ProposalApproval";
import DetailedTeachingSchedule from "./pages/lecturer/DetailedTeachingSchedule";

function App() {
  return (
    <Router>
      <ReportDialog />
      <ChatWidget />
      <AIChat />
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