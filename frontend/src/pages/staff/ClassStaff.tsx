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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

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
  registrationOpen: boolean; // Tên biến chuẩn từ Server (không có chữ is)
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

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await staffService.status(id);
      // Dữ liệu từ server trả về là: { ..., registrationOpen: true/false }
      const updatedData = response.data;

      setClasses((prevClasses) =>
        prevClasses.map((cls) => {
          if (Number(cls.id) === Number(id)) {
            return {
              ...cls,
              // Cập nhật đúng tên biến registrationOpen
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6 }}>
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
          sx={{
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f3e5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>MÃ LỚP</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>TÊN LỚP</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>HỌC KỲ</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>MÔN HỌC</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>TRẠNG THÁI</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>
                  THAO TÁC
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress color="secondary" />
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: "#6a1b9a" }}>
                      {cls.classCode}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{cls.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={`HK ${cls.semester}`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{cls.subjectName}</TableCell>
                    <TableCell>
                      <Chip
                        label={cls.registrationOpen ? "Đang mở" : "Đã khóa"}
                        color={cls.registrationOpen ? "success" : "error"}
                        size="small"
                        sx={{ fontWeight: 700, minWidth: 80 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleToggleStatus(cls.id)}
                        sx={{
                          color: cls.registrationOpen ? "#10b981" : "#ef4444",
                          bgcolor: cls.registrationOpen ? "#ecfdf5" : "#fef2f2",
                          transition: "all 0.3s ease",
                          "&:hover": { transform: "scale(1.1)" },
                        }}
                      >
                        {cls.registrationOpen ? (
                          <ToggleOnIcon fontSize="large" />
                        ) : (
                          <ToggleOffIcon fontSize="large" />
                        )}
                      </IconButton>
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
      </Container>
    </Box>
  );
};

export default ClassManager;
