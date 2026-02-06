import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  TextField,
  CircularProgress,
  Avatar,
  Pagination,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // [MỚI] Import icon Back

import { staffService } from "../../services/staffService";
import { useAppSnackbar } from "../../hooks/useAppSnackbar";

// --- Định nghĩa Interfaces ---
interface ClassData {
  id: number;
  classCode: string;
  name: string;
  semester: string;
  subjectName: string;
  lecturerName: string;
  studentCount: number;
  maxCapacity: number;
  registrationOpen: boolean;
  startDate?: string;
  endDate?: string;
}

interface ApiResponseWrapper {
  data: {
    content: ClassData[];
    totalPages: number;
  };
}

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const ClassManager = () => {
  const { showSuccess, showError } = useAppSnackbar();
  const navigate = useNavigate();

  // --- 1. LẤY ROLE ĐỂ CẤU HÌNH MÀU SẮC ---
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isHead = user.role === "HEAD_DEPARTMENT";

  // Cấu hình Theme động
  const theme = {
    primary: isHead ? "#ea580c" : "#9c27b0",
    headerBg: isHead ? "#fff7ed" : "#f3e5f5", // Màu nền header bảng
    headerText: isHead ? "#9a3412" : "#4a148c", // Màu chữ header bảng
    avatarBg: isHead ? "#ffedd5" : "#f3e5f5", // Màu nền icon/avatar
  };

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // --- States cho Dialog Sinh viên ---
  const [openStudentModal, setOpenStudentModal] = useState(false);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedClassCode, setSelectedClassCode] = useState("");

  const [searchInputs, setSearchInputs] = useState({
    classCode: "",
    name: "",
    semester: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    classCode: "",
    name: "",
    semester: "",
  });
  const [openTimetableModal, setOpenTimetableModal] = useState(false);
  const [timetableList, setTimetableList] = useState<any[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  const [openDateModal, setOpenDateModal] = useState(false);
  const [newStartDate, setNewStartDate] = useState("");
  const [processingDate, setProcessingDate] = useState(false);

  // 1. Logic lấy thời khóa biểu
  const handleViewTimetable = async (classCode: string) => {
    setSelectedClassCode(classCode);
    setOpenTimetableModal(true);
    setLoadingTimetable(true);
    try {
      const res = await staffService.getClassTimeTable(classCode);
      setTimetableList(res.data);
    } catch {
      showError("Không thể tải thời khóa biểu");
    } finally {
      setLoadingTimetable(false);
    }
  };

  // 2. Logic cập nhật ngày bắt đầu
  const handleUpdateDate = async () => {
    if (!newStartDate) return showError("Vui lòng chọn ngày bắt đầu");

    setProcessingDate(true);
    try {
      await staffService.updateClassDates(selectedClassCode, {
        startDate: newStartDate,
      });
      showSuccess(
        "Cập nhật ngày thành công! Ngày kết thúc đã được tự động tính toán.",
      );
      setOpenDateModal(false);
      loadData();
    } catch {
      showError("Lỗi khi cập nhật ngày học");
    } finally {
      setProcessingDate(false);
    }
  };
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await staffService.getClasses({
        page,
        size: pageSize,
        classCode: appliedFilters.classCode || undefined,
        name: appliedFilters.name || undefined,
        semester: appliedFilters.semester || undefined,
      });
      const response = res as unknown as ApiResponseWrapper;
      if (response.data?.content) {
        setClasses(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch {
      showError("Lỗi tải danh sách lớp học");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, appliedFilters]);

  // --- Logic xem sinh viên ---
  const handleViewStudents = async (classCode: string) => {
    setSelectedClassCode(classCode);
    setOpenStudentModal(true);
    setLoadingStudents(true);
    try {
      const res = await staffService.getStudentsInClass(classCode);
      setStudentList(res.data);
    } catch {
      showError("Không thể tải danh sách sinh viên");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await staffService.status(id);
      const updatedData = response.data;

      setClasses((prevClasses) =>
        prevClasses.map((cls) => {
          if (Number(cls.id) === Number(id)) {
            return {
              ...cls,
              registrationOpen: updatedData.registrationOpen,
            };
          }
          return cls;
        }),
      );

      const statusText = updatedData.registrationOpen ? "Mở" : "Khóa";
      showSuccess(`${statusText} đăng ký lớp học thành công!`);
    } catch (err: unknown) {
      const error = err as AxiosErrorResponse;
      showError(error.response?.data?.message || "Lỗi cập nhật");
    }
  };

  const handleSearch = () => {
    setAppliedFilters(searchInputs);
    setPage(0);
  };
  const handleReset = () => {
    const empty = { classCode: "", name: "", semester: "" };
    setSearchInputs(empty);
    setAppliedFilters(empty);
    setPage(0);
  };

  return (
    // Áp dụng màu nền động theo Role
    <Box
      sx={{ minHeight: "100vh", bgcolor: theme.lightBg, py: isHead ? 0 : 4 }}
    >
      {/* --- BANNER ĐỘNG (CAM HOẶC TÍM) --- */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={5}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: "#fff",
              border: "1px solid #e2e8f0",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            <ArrowBackIcon sx={{ color: "#64748b" }} />
          </IconButton>

          <Avatar
            sx={{
              bgcolor: theme.avatarBg, // Dùng màu nhạt đã định nghĩa trong theme mới
              color: theme.primary,
              width: 56,
              height: 56,
            }}
          >
            <SchoolIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              fontWeight="900"
              color="#1e293b"
              sx={{ letterSpacing: -1 }}
            >
              Quản Lý Lớp Học
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              {isHead
                ? "Theo dõi tiến độ và sĩ số các lớp"
                : "Quản lý mở lớp và xếp lịch học"}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2}>
          {!isHead && (
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => navigate("/staff/import")}
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                color: theme.primary,
                borderColor: theme.primary,
                textTransform: "none",
                px: 3,
              }}
            >
              Đến Trung Tâm Import
            </Button>
          )}
        </Stack>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Paper
          sx={{ p: 2.5, mb: 4, borderRadius: 4, border: "1px solid #f1f5f9" }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <TextField
                label="Mã lớp"
                size="small"
                fullWidth
                value={searchInputs.classCode}
                onChange={(e) =>
                  setSearchInputs({
                    ...searchInputs,
                    classCode: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <TextField
                label="Tên lớp"
                size="small"
                fullWidth
                value={searchInputs.name}
                onChange={(e) =>
                  setSearchInputs({ ...searchInputs, name: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <TextField
                label="Học kỳ"
                size="small"
                fullWidth
                value={searchInputs.semester}
                onChange={(e) =>
                  setSearchInputs({ ...searchInputs, semester: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<SearchIcon />}
                  sx={{ bgcolor: theme.primary, fontWeight: 700 }} // Màu nút tìm kiếm động
                >
                  Tìm kiếm
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  sx={{
                    fontWeight: 700,
                    color: "#64748b",
                    borderColor: "#e2e8f0",
                  }}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 5, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}
        >
          <Table>
            {/* Header Table đổi màu theo Role */}
            <TableHead sx={{ bgcolor: isHead ? "#fff7ed" : "#f3e5f5" }}>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 800, color: theme.headerText }}
                >
                  MÃ LỚP
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: theme.headerText }}>
                  TÊN LỚP
                </TableCell>

                {/* [SỬA] Bỏ align="center" để căn trái cột Giảng viên */}
                <TableCell sx={{ fontWeight: 800, color: theme.headerText }}>
                  GIẢNG VIÊN
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: theme.headerText }}>
                  MÔN HỌC
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 800, color: theme.headerText }}
                >
                  HỌC KỲ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 800, color: theme.headerText }}
                >
                  SĨ SỐ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 800, color: theme.headerText }}
                >
                  TRẠNG THÁI
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 800, color: theme.headerText }}
                >
                  THAO TÁC
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: theme.primary }} />
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls.id} hover>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 800, color: theme.primary }} // Màu mã lớp động
                    >
                      {cls.classCode}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{cls.name}</TableCell>

                    {/* [SỬA] Bỏ justifyContent="center" để nội dung căn trái */}
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        // justifyContent="center" <-- Đã xóa dòng này
                      >
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: isHead ? "#ffedd5" : "#f3e5f5", // Màu avatar động
                            color: theme.primary,
                            fontSize: "0.875rem",
                          }}
                        >
                          {cls.lecturerName ? cls.lecturerName.charAt(0) : "?"}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {cls.lecturerName || "Chưa phân công"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{cls.subjectName}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`HK ${cls.semester}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          borderColor: isHead ? "#fed7aa" : undefined,
                          color: isHead ? "#9a3412" : undefined,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700}>
                        {cls.studentCount} / {cls.maxCapacity}
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          mt: 0.5,
                          height: 4,
                          bgcolor: "#e2e8f0",
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${(cls.studentCount / cls.maxCapacity) * 100}%`,
                            height: "100%",
                            bgcolor:
                              cls.studentCount >= cls.maxCapacity
                                ? "#ef4444"
                                : theme.primary, // Thanh tiến độ màu động
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={cls.registrationOpen ? "Đang mở" : "Đã khóa"}
                        color={cls.registrationOpen ? "success" : "error"}
                        size="small"
                        sx={{ fontWeight: 700, minWidth: 80 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                      >
                        {/* 1. NÚT XEM SINH VIÊN */}
                        <Tooltip title="Danh sách sinh viên">
                          <IconButton
                            onClick={() => handleViewStudents(cls.classCode)}
                            sx={{
                              width: 40,
                              height: 40,
                              color: "#10b981",
                              bgcolor: "#ecfdf5",
                              "&:hover": { bgcolor: "#d1fae5" },
                            }}
                          >
                            <PeopleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* HEAD CHỈ XEM, STAFF MỚI SỬA ĐƯỢC CÁC NÚT DƯỚI ĐÂY */}
                        {!isHead && (
                          <>
                            {/* 2. NÚT GÁN NHÂN SỰ */}
                            <Tooltip
                              title={
                                cls.registrationOpen
                                  ? "Gán nhân sự"
                                  : "Lớp đã khóa gán"
                              }
                            >
                              <span>
                                <IconButton
                                  disabled={!cls.registrationOpen}
                                  onClick={() =>
                                    navigate(
                                      `/staff/classes/assign/${cls.classCode}`,
                                    )
                                  }
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    color: cls.registrationOpen
                                      ? "#9c27b0"
                                      : "rgba(0, 0, 0, 0.26)",
                                    bgcolor: cls.registrationOpen
                                      ? "#f3e5f5"
                                      : "#f5f5f5",
                                    "&.Mui-disabled": {
                                      color: "rgba(0, 0, 0, 0.26)",
                                      bgcolor: "#f5f5f5",
                                    },
                                    "&:hover": {
                                      bgcolor: cls.registrationOpen
                                        ? "#e1bee7"
                                        : "#f5f5f5",
                                    },
                                  }}
                                >
                                  <AssignmentIndIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            {/* 3. NÚT STATUS */}
                            <Tooltip
                              title={
                                cls.registrationOpen
                                  ? "Khóa đăng ký"
                                  : "Mở đăng ký"
                              }
                            >
                              <IconButton
                                onClick={() => handleToggleStatus(cls.id)}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  color: cls.registrationOpen
                                    ? "#10b981"
                                    : "#ef4444",
                                  bgcolor: cls.registrationOpen
                                    ? "#ecfdf5"
                                    : "#fef2f2",
                                  "&:hover": {
                                    bgcolor: cls.registrationOpen
                                      ? "#d1fae5"
                                      : "#fee2e2",
                                  },
                                }}
                              >
                                {cls.registrationOpen ? (
                                  <ToggleOnIcon sx={{ fontSize: 28 }} />
                                ) : (
                                  <ToggleOffIcon sx={{ fontSize: 28 }} />
                                )}
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {/* 4. NÚT XEM THỜI KHÓA BIỂU (Ai cũng xem được) */}
                        <Tooltip title="Xem thời khóa biểu">
                          <IconButton
                            onClick={() => handleViewTimetable(cls.classCode)}
                            sx={{
                              width: 40,
                              height: 40,
                              color: "#3b82f6",
                              bgcolor: "#eff6ff",
                              "&:hover": { bgcolor: "#dbeafe" },
                            }}
                          >
                            <CalendarMonthIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* 5. NÚT SỬA NGÀY NHẬP HỌC (Chỉ Staff) */}
                        {!isHead && (
                          <Tooltip
                            title={
                              cls.registrationOpen
                                ? "Cập nhật ngày nhập học"
                                : "Lớp đã khóa, không thể sửa ngày"
                            }
                          >
                            <span>
                              <IconButton
                                disabled={!cls.registrationOpen}
                                onClick={() => {
                                  setSelectedClassCode(cls.classCode);
                                  setNewStartDate(cls.startDate || "");
                                  setOpenDateModal(true);
                                }}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  color: cls.registrationOpen
                                    ? "#f59e0b"
                                    : "rgba(0, 0, 0, 0.26)",
                                  bgcolor: cls.registrationOpen
                                    ? "#fffbeb"
                                    : "#f5f5f5",
                                  "&:hover": {
                                    bgcolor: cls.registrationOpen
                                      ? "#fef3c7"
                                      : "#f5f5f5",
                                  },
                                  "&.Mui-disabled": {
                                    color: "rgba(0, 0, 0, 0.26)",
                                    bgcolor: "#f5f5f5",
                                  },
                                }}
                              >
                                <EditCalendarIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="center" py={4}>
          <Pagination
            count={totalPages}
            page={page + 1}
            color="secondary"
            shape="rounded"
            onChange={(_, v) => setPage(v - 1)}
            sx={{
              "& .Mui-selected": { bgcolor: theme.primary + " !important" },
            }}
          />
        </Box>
        {/* DIALOG (TRANG NỔI) HIỂN THỊ SINH VIÊN */}
        <Dialog
          open={openStudentModal}
          onClose={() => setOpenStudentModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              color: theme.headerText,
              bgcolor: theme.lightBg,
            }}
          >
            Sinh viên lớp:{" "}
            <span style={{ color: theme.primary }}>{selectedClassCode}</span>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {loadingStudents ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress size={40} sx={{ color: theme.primary }} />
              </Box>
            ) : studentList.length > 0 ? (
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>
                      MSSV
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>
                      Họ Tên
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>
                      Email
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentList.map((st: any, idx: number) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ color: theme.primary, fontWeight: 700 }}>
                        {st.studentId}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          minWidth: "200px",
                        }}
                      >
                        {st.fullName}
                      </TableCell>

                      <TableCell sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                        {st.email}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <Typography color="text.secondary">
                  Lớp này hiện chưa có sinh viên đăng ký.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: "#f8fafc" }}>
            <Button
              onClick={() => setOpenStudentModal(false)}
              variant="contained"
              color="inherit"
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openTimetableModal}
          onClose={() => setOpenTimetableModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 800 }}>
            Thời khóa biểu: {selectedClassCode}
          </DialogTitle>
          <DialogContent>
            {loadingTimetable ? (
              <CircularProgress sx={{ color: theme.primary }} />
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell>Ngày</TableCell>
                      <TableCell>Thứ</TableCell>
                      <TableCell>Ca</TableCell>
                      <TableCell>Phòng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timetableList.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>Thứ {item.dayOfWeek}</TableCell>
                        <TableCell>Ca {item.slot}</TableCell>
                        <TableCell>{item.room}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={openDateModal} onClose={() => setOpenDateModal(false)}>
          <DialogTitle sx={{ fontWeight: 800 }}>Cập nhật ngày học</DialogTitle>
          <DialogContent sx={{ minWidth: 300, pt: 2 }}>
            <Typography variant="body2" mb={2} color="text.secondary">
              Chọn ngày bắt đầu mới, hệ thống sẽ tự động tính toán lại ngày kết
              thúc dựa trên thời khóa biểu đã import.
            </Typography>
            <TextField
              fullWidth
              type="date"
              label="Ngày bắt đầu mới"
              InputLabelProps={{ shrink: true }}
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDateModal(false)} color="inherit">
              Hủy
            </Button>
            <Button
              onClick={handleUpdateDate}
              variant="contained"
              disabled={processingDate}
              sx={{ bgcolor: theme.primary }}
            >
              {processingDate ? <CircularProgress size={24} /> : "Lưu thay đổi"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ClassManager;
