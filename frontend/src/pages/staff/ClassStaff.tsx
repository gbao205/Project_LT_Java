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
import PeopleIcon from "@mui/icons-material/People"; // Icon mới để xem sinh viên
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

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
    } catch (err) {
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 4 }}>
      <Container maxWidth="xl">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={5}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: "#f3e5f5",
                color: "#9c27b0",
                width: 56,
                height: 56,
              }}
            >
              <SchoolIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ letterSpacing: -1 }}
              >
                Quản Lý Lớp Học
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Danh sách lớp và trạng thái đăng ký học phần
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate("/staff/import")}
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              color: "#9c27b0",
              borderColor: "#9c27b0",
            }}
          >
            Đến Trung Tâm Import
          </Button>
        </Box>

        {/* Search */}
        <Paper
          sx={{ p: 2.5, mb: 4, borderRadius: 4, border: "1px solid #f1f5f9" }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
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
            <Grid item xs={12} sm={4} md={3}>
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
            <Grid item xs={12} sm={4} md={3}>
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
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<SearchIcon />}
                  sx={{ bgcolor: "#9c27b0", fontWeight: 700 }}
                >
                  Tìm kiếm
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  sx={{ fontWeight: 700, color: "#64748b" }}
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
            <TableHead sx={{ bgcolor: "#f3e5f5" }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  MÃ LỚP
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }}>TÊN LỚP</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  GIẢNG VIÊN
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }}>MÔN HỌC</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  HỌC KỲ
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  SĨ SỐ
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  TRẠNG THÁI
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  THAO TÁC
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress color="secondary" />
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls.id} hover>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 800, color: "#6a1b9a" }}
                    >
                      {cls.classCode}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{cls.name}</TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: "#f3e5f5",
                            color: "#9c27b0",
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
                        sx={{ fontWeight: 600 }}
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
                                : "#9c27b0",
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
                        {/* 1. NÚT XEM SINH VIÊN - LUÔN LUÔN CHO XEM */}
                        <Tooltip title="Danh sách sinh viên">
                          <IconButton
                            onClick={() => handleViewStudents(cls.classCode)}
                            sx={{
                              width: 40, // Fix cứng kích thước để đều nhau
                              height: 40,
                              color: "#10b981",
                              bgcolor: "#ecfdf5",
                              "&:hover": { bgcolor: "#d1fae5" },
                            }}
                          >
                            <PeopleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* 2. NÚT GÁN NHÂN SỰ - CHỈ VÔ HIỆU HÓA NÚT NÀY */}
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
                                width: 40, // Fix cứng kích thước
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

                        {/* 3. NÚT STATUS - FIX LẠI KÍCH THƯỚC CHO ĐỀU 2 NÚT TRÊN */}
                        <Tooltip
                          title={
                            cls.registrationOpen ? "Khóa đăng ký" : "Mở đăng ký"
                          }
                        >
                          <IconButton
                            onClick={() => handleToggleStatus(cls.id)}
                            sx={{
                              width: 40, // Đưa về cùng kích thước 40px
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
                              <ToggleOnIcon sx={{ fontSize: 28 }} /> // Chỉnh size icon bên trong cho vừa vặn
                            ) : (
                              <ToggleOffIcon sx={{ fontSize: 28 }} />
                            )}
                          </IconButton>
                        </Tooltip>
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
            sx={{ fontWeight: 800, color: "#1e293b", bgcolor: "#f8fafc" }}
          >
            Sinh viên lớp:{" "}
            <span style={{ color: "#9c27b0" }}>{selectedClassCode}</span>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {loadingStudents ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress size={40} color="secondary" />
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
                      <TableCell sx={{ color: "#9c27b0", fontWeight: 700 }}>
                        {st.studentId}
                      </TableCell>

                      {/* Đã sửa: Thêm dấu ngoặc kép quanh "200px" và xóa comment gây lỗi cú pháp */}
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
      </Container>
    </Box>
  );
};

export default ClassManager;
