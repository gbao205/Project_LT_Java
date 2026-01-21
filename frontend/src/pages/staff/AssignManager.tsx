import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  Grid,
  CircularProgress,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { staffService } from "../../services/staffService";
import { useAppSnackbar } from "../../hooks/useAppSnackbar";

const AssignManager = () => {
  const { classCode } = useParams<{ classCode: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAppSnackbar();

  // States cho Giảng viên
  const [cccd, setCccd] = useState("");
  const [currentLecturer, setCurrentLecturer] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [fetchingClass, setFetchingClass] = useState(true);

  // States cho Sinh viên
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // 1. Hàm lấy thông tin chi tiết lớp học
  const fetchClassDetail = async () => {
    try {
      const res = await staffService.getClasses({
        page: 0,
        size: 1,
        classCode,
      });
      const classData = res.data.content[0];

      if (
        classData &&
        classData.lecturerName &&
        classData.lecturerName !== "N/A"
      ) {
        setCurrentLecturer(classData.lecturerName);
        setIsEditing(false); // Đã có GV thì hiển thị chế độ xem
      } else {
        setCurrentLecturer(null);
        setIsEditing(true); // Chưa có GV thì hiện ô nhập ngay
      }
    } catch (err) {
      console.error("Lỗi fetch thông tin lớp:", err);
    } finally {
      setFetchingClass(false);
    }
  };

  useEffect(() => {
    fetchClassDetail();
  }, [classCode]);

  // 2. Logic Gán/Đổi Giảng viên
  const handleAssignLecturer = async () => {
    if (!cccd.trim()) return showError("Vui lòng nhập số CCCD");

    setIsAssigning(true);
    try {
      const res = await staffService.assignLecturer(classCode!, cccd);
      showSuccess(res.data.message || "Cập nhật giảng viên thành công");
      await fetchClassDetail(); // Load lại để lấy tên GV mới từ Database
      setCccd("");
    } catch {
      showError("Lỗi khi gán giảng viên");
    } finally {
      setIsAssigning(false);
    }
  };

  // 3. Logic Import Sinh viên
  const handleImportStudents = async () => {
    if (!file) return showError("Vui lòng chọn file Excel");

    setIsImporting(true);
    try {
      const response = await staffService.assignStudents(classCode!, file);
      showSuccess(
        response.data?.message || "Nhập danh sách sinh viên thành công!",
      );
      setFile(null);
      const fileInput = document.getElementById(
        "excel-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      showError(err.response?.data?.message || "Lỗi khi import sinh viên");
    } finally {
      setIsImporting(false);
    }
  };

  if (fetchingClass) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 4 }}>
      <Container maxWidth="md">
        {/* Navigation */}
        <Stack
          direction="row"
          justifyContent="space-between"
          mb={4}
          alignItems="center"
        >
          <Breadcrumbs
            separator={
              <NavigateNextIcon sx={{ fontSize: 14, color: "#cbd5e1" }} />
            }
            sx={{ color: "#94a3b8" }}
          >
            <Link
              underline="none"
              color="inherit"
              onClick={() => navigate("/staff/classes")}
              sx={{ cursor: "pointer", fontSize: "0.8rem" }}
            >
              Quản lý lớp
            </Link>
            <Typography sx={{ fontSize: "0.8rem" }} color="text.secondary">
              Gán nhân sự
            </Typography>
          </Breadcrumbs>
          <Button
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate(-1)}
            sx={{ color: "#94a3b8", textTransform: "none", fontSize: "0.8rem" }}
          >
            Trở lại
          </Button>
        </Stack>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{ color: "#1e293b", fontWeight: 700, mb: 1 }}
          >
            Thiết lập lớp <span style={{ color: "#9c27b0" }}>{classCode}</span>
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Quản lý giảng viên phụ trách và danh sách sinh viên cho lớp học này.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{ p: 4, borderRadius: 3, border: "1px solid #e2e8f0" }}
        >
          <Grid container spacing={6}>
            {/* CỘT GIẢNG VIÊN */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  borderRight: { md: "1px solid #f1f5f9" },
                  pr: { md: 4 },
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "250px",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "#9c27b0",
                    fontWeight: 700,
                    mb: 3,
                    display: "block",
                  }}
                >
                  Giảng viên phụ trách
                </Typography>

                <Box sx={{ flexGrow: 1 }}>
                  {!isEditing && currentLecturer ? (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#f3e5f5",
                        borderRadius: 2,
                        border: "1px solid #e1bee7",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        mb={1}
                      >
                        <LockIcon sx={{ fontSize: 16, color: "#9c27b0" }} />
                        <Typography
                          variant="body2"
                          sx={{ color: "#7b1fa2", fontWeight: 700 }}
                        >
                          {currentLecturer}
                        </Typography>
                      </Stack>
                      <Button
                        startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                        size="small"
                        onClick={() => setIsEditing(true)}
                        sx={{
                          textTransform: "none",
                          p: 0,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "#9c27b0",
                        }}
                      >
                        Thay đổi giảng viên?
                      </Button>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="CCCD Giảng viên"
                        variant="standard"
                        value={cccd}
                        onChange={(e) => setCccd(e.target.value)}
                        placeholder="Nhập 12 số"
                        autoFocus={isEditing}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "#94a3b8", lineHeight: 1.4 }}
                      >
                        Hệ thống sẽ tự động tìm tên giảng viên dựa trên mã số
                        này.
                      </Typography>
                      {isEditing && currentLecturer && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={() => setIsEditing(false)}
                          sx={{
                            width: "fit-content",
                            textTransform: "none",
                            fontSize: "0.7rem",
                          }}
                        >
                          Hủy bỏ
                        </Button>
                      )}
                    </Stack>
                  )}
                </Box>

                <Box sx={{ mt: "auto", pt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAssignLecturer}
                    disabled={isAssigning || !isEditing}
                    sx={{
                      bgcolor: "#9c27b0",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#7b1fa2", boxShadow: "none" },
                      "&.Mui-disabled": {
                        bgcolor: "#f1f5f9",
                        color: "#cbd5e1",
                      },
                    }}
                  >
                    {isAssigning ? "Đang lưu..." : "Xác nhận gán giảng viên"}
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* CỘT SINH VIÊN */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "#10b981",
                    fontWeight: 700,
                    mb: 3,
                    display: "block",
                  }}
                >
                  Danh sách sinh viên
                </Typography>

                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      p: 4,
                      textAlign: "center",
                      border: "1px dashed #cbd5e1",
                      mb: 3,
                      transition: "0.2s",
                      "&:hover": { borderColor: "#10b981", bgcolor: "#f0fdf4" },
                    }}
                  >
                    <CloudUploadIcon
                      sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", mb: 2 }}
                    >
                      {file
                        ? `Đã chọn: ${file.name}`
                        : "Tải lên tệp danh sách sinh viên (.xlsx)"}
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      sx={{
                        textTransform: "none",
                        color: "#10b981",
                        borderColor: "#10b981",
                      }}
                    >
                      Chọn tệp
                      <input
                        id="excel-upload"
                        type="file"
                        hidden
                        accept=".xlsx, .xls"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ mt: "auto" }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    onClick={handleImportStudents}
                    disabled={!file || isImporting}
                    sx={{
                      bgcolor: "#1e293b",
                      borderRadius: 2,
                      textTransform: "none",
                      py: 1.2,
                      fontWeight: 700,
                      "&:hover": { bgcolor: "#0f172a" },
                    }}
                  >
                    {isImporting
                      ? "Đang xử lý..."
                      : "Xác nhận Import Sinh viên"}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AssignManager;
