import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  Tooltip,
  Drawer,
  IconButton,
  Divider,
  Grid,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import CakeIcon from "@mui/icons-material/Cake";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

// --- 1. ĐỊNH NGHĨA INTERFACE (Diệt lỗi Unexpected any) ---
interface StudentInfo {
  studentId?: string;
  dob?: string;
  major?: string;
  faculty?: string;
  admissionDate?: string;
  eduLevel?: string;
  batch?: string;
}

interface LecturerInfo {
  cccd?: string;
  degree?: string;
  department?: string;
}

interface UserAccount {
  id: number;
  fullName: string;
  email: string;
  role: "STUDENT" | "LECTURER";
  student?: StudentInfo;
  com.cosre.backend.dto.lecturer?: LecturerInfo;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  size?: number;
}

const StaffUserManager = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Student, 1: Lecturer
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const commonFont = { fontFamily: "'Inter', sans-serif !important" };

  const handleOpenDetail = (user: UserAccount) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 10, ...commonFont }}>
      {/* Banner Tím đặc trưng của con */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)",
          pt: 6,
          pb: 10,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            fontWeight="900"
            color="white"
            sx={{ letterSpacing: -1 }}
          >
            Quản Lý Thành Viên
          </Typography>
          <Typography color="white" sx={{ opacity: 0.85 }}>
            Tra cứu và quản lý hồ sơ chi tiết của hệ thống
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Paper
          sx={{
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Tabs chuyển đổi */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              bgcolor: "white",
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                fontWeight: 800,
                py: 2.5,
                fontSize: "0.9rem",
              },
            }}
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label="DANH SÁCH SINH VIÊN"
            />
            <Tab
              icon={<SchoolIcon />}
              iconPosition="start"
              label="DANH SÁCH GIẢNG VIÊN"
            />
          </Tabs>

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      bgcolor: "#f1f5f9",
                      fontWeight: 800,
                      color: "#475569",
                    },
                  }}
                >
                  <TableCell>HỌ VÀ TÊN</TableCell>
                  <TableCell>EMAIL</TableCell>
                  {activeTab === 0 ? (
                    <>
                      <TableCell>MSSV</TableCell>
                      <TableCell>NGÀNH</TableCell>
                      <TableCell>TRẠNG THÁI</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>HỌC VỊ</TableCell>
                      <TableCell>BỘ MÔN</TableCell>
                    </>
                  )}
                  <TableCell align="center">THAO TÁC</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: activeTab === 0 ? "#10b981" : "#3b82f6",
                          fontWeight: 700,
                        }}
                      >
                        {activeTab === 0 ? "S" : "L"}
                      </Avatar>
                      <Typography sx={{ fontWeight: 700 }}>
                        Nguyễn Văn A
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#64748b" }}>
                    anv@collabsphere.edu.vn
                  </TableCell>

                  {activeTab === 0 ? (
                    <>
                      {/* SỬA LỖI TableCell: Dùng sx thay vì prop trực tiếp */}
                      <TableCell sx={{ fontWeight: 600 }}>SV2024001</TableCell>
                      <TableCell>Kỹ thuật phần mềm</TableCell>
                      <TableCell>
                        <Chip
                          label="Đang học"
                          size="small"
                          sx={{
                            bgcolor: "#dcfce7",
                            color: "#166534",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>Thạc sĩ</TableCell>
                      <TableCell>Hệ thống thông tin</TableCell>
                    </>
                  )}

                  <TableCell align="center">
                    <Tooltip title="Xem chi tiết hồ sơ">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() =>
                          handleOpenDetail({
                            id: 1,
                            fullName: "Nguyễn Văn A",
                            email: "anv@collabsphere.edu.vn",
                            role: activeTab === 0 ? "STUDENT" : "LECTURER",
                            student: {
                              studentId: "SV2024001",
                              major: "Kỹ thuật phần mềm",
                              faculty: "CNTT",
                              dob: "2002-10-20",
                            },
                          })
                        }
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                          bgcolor: "#9c27b0",
                          "&:hover": { bgcolor: "#6a1b9a" },
                        }}
                      >
                        Chi tiết
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* --- DRAWER CHI TIẾT (Trang nổi lên) --- */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 650 }, borderRadius: "20px 0 0 20px" }, // Tăng chiều rộng lên 650px cho thoáng
        }}
      >
        {selectedUser && (
          <Box
            sx={{
              ...commonFont,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header Banner - Giữ nguyên phong cách của con */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)",
                p: 4,
                color: "white",
                position: "relative",
              }}
            >
              <IconButton
                onClick={() => setIsDrawerOpen(false)}
                sx={{
                  position: "absolute",
                  right: 10,
                  top: 10,
                  color: "white",
                }}
              >
                <CloseIcon />
              </IconButton>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    border: "4px solid rgba(255,255,255,0.3)",
                    fontSize: "2rem",
                    fontWeight: 800,
                  }}
                >
                  {selectedUser.fullName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="900">
                    {selectedUser.fullName.toUpperCase()}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip
                      label={selectedUser.role}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label={selectedUser.student?.studentStatus || "Đang học"}
                      size="small"
                      sx={{
                        bgcolor: "#10b981",
                        color: "white",
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Body hồ sơ - Dùng Box có overflow để cuộn */}
            <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
              {selectedUser.role === "STUDENT" ? (
                <>
                  {/* PHẦN 1: THÔNG TIN HỌC VẤN */}
                  <Typography
                    variant="subtitle1"
                    fontWeight="800"
                    color="#9c27b0"
                    mb={3}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <SchoolIcon fontSize="small" /> THÔNG TIN HỌC VẤN
                  </Typography>
                  <Grid container spacing={2} rowSpacing={2}>
                    <InfoItem
                      label="Mã số sinh viên"
                      value={selectedUser.student?.studentId}
                      size={6}
                    />
                    <InfoItem
                      label="Khóa / Bậc"
                      value={`${selectedUser.student?.batch} - ${selectedUser.student?.eduLevel}`}
                      size={6}
                    />
                    <InfoItem
                      label="Khoa"
                      value={selectedUser.student?.faculty}
                      size={6}
                    />
                    <InfoItem
                      label="Ngành học"
                      value={selectedUser.student?.major}
                      size={6}
                    />
                    <InfoItem
                      label="Chuyên ngành"
                      value={selectedUser.student?.specialization}
                      size={12}
                    />
                    <InfoItem
                      label="Loại hình đào tạo"
                      value={selectedUser.student?.trainingType}
                      size={6}
                    />
                    <InfoItem
                      label="Ngày nhập học"
                      value={selectedUser.student?.admissionDate}
                      size={6}
                    />
                  </Grid>

                  <Divider sx={{ mb: 4 }} />

                  {/* PHẦN 2: THÔNG TIN CÁ NHÂN (STUDENT PROFILE) */}
                  <Typography
                    variant="subtitle1"
                    fontWeight="800"
                    color="#9c27b0"
                    mb={3}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <PersonIcon fontSize="small" /> HỒ SƠ CÁ NHÂN
                  </Typography>
                  <Grid container spacing={2} mb={4}>
                    <InfoItem
                      label="Giới tính"
                      value={selectedUser.student?.profile?.gender}
                      size={4}
                    />
                    <InfoItem
                      label="Ngày sinh"
                      value={selectedUser.student?.dob}
                      size={4}
                    />
                    <InfoItem
                      label="Dân tộc / Tôn giáo"
                      value={`${selectedUser.student?.profile?.ethnicity} / ${selectedUser.student?.profile?.religion}`}
                      size={4}
                    />
                    <InfoItem
                      label="Số điện thoại"
                      value={selectedUser.student?.profile?.phoneNumber}
                      size={6}
                    />
                    <InfoItem
                      label="Email cá nhân"
                      value={selectedUser.email}
                      size={6}
                    />
                    <InfoItem
                      label="Nguyên quán"
                      value={selectedUser.student?.profile?.nativePlace}
                      size={12}
                    />
                    <InfoItem
                      label="Địa chỉ thường trú"
                      value={selectedUser.student?.profile?.permanentAddress}
                      size={12}
                    />
                    <InfoItem
                      label="Địa chỉ tạm trú"
                      value={selectedUser.student?.profile?.temporaryAddress}
                      size={12}
                    />
                  </Grid>

                  <Divider sx={{ mb: 4 }} />

                  {/* PHẦN 3: ĐỊNH DANH & ĐOÀN ĐẢNG */}
                  <Typography
                    variant="subtitle1"
                    fontWeight="800"
                    color="#9c27b0"
                    mb={3}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <BadgeIcon fontSize="small" /> ĐỊNH DANH & TỔ CHỨC
                  </Typography>
                  <Grid container spacing={2}>
                    <InfoItem
                      label="Số CCCD"
                      value={selectedUser.student?.profile?.idCardNumber}
                      size={6}
                    />
                    <InfoItem
                      label="Nơi cấp"
                      value={selectedUser.student?.profile?.idCardIssuePlace}
                      size={6}
                    />
                    <InfoItem
                      label="Mã bảo hiểm"
                      value={selectedUser.student?.profile?.insuranceCode}
                      size={6}
                    />
                    <InfoItem
                      label="Ngày vào Đoàn"
                      value={selectedUser.student?.profile?.unionDate}
                      size={6}
                    />
                  </Grid>
                </>
              ) : (
                /* PHẦN GIẢNG VIÊN - GIỮ NGUYÊN HOẶC THÊM TƯƠNG TỰ */
                <Grid container spacing={2}>
                  <InfoItem
                    label="Học vị"
                    value={selectedUser.com.cosre.backend.dto.lecturer?.degree}
                    size={6}
                  />
                  <InfoItem
                    label="Bộ môn"
                    value={selectedUser.com.cosre.backend.dto.lecturer?.department}
                    size={6}
                  />
                  <InfoItem
                    label="Số CCCD"
                    value={selectedUser.com.cosre.backend.dto.lecturer?.cccd}
                    size={12}
                  />
                </Grid>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

// Component InfoItem dùng cho Drawer
const InfoItem = ({ icon, label, value, size = 12 }: InfoItemProps) => (
  <Grid size={{ xs: 12, sm: size }}>
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: "#f1f5f9",
        border: "1px solid #e2e8f0",
        height: "100%", // Đảm bảo các ô cao bằng nhau nếu cùng hàng
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
        {icon}
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: "0.65rem",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b" }}>
        {value || "---"}
      </Typography>
    </Box>
  </Grid>
);

export default StaffUserManager;
