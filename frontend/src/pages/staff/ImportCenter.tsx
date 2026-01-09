import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Hook này phải được dùng bên dưới
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
  Avatar,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";

const ImportCenter = () => {
  // 1. Khởi tạo navigate để hết lỗi ESLint "defined but never used"
  const navigate = useNavigate();

  // 2. Lấy user từ localStorage để hiển thị tên
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [importType, setImportType] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [admissionDate, setAdmissionDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const commonFont = { fontFamily: "'Inter', sans-serif !important" };

  const handleImport = async () => {
    if (!file || !importType) {
      setMessage({
        type: "error",
        text: "Vui lòng chọn loại dữ liệu và file!",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    let url = "";

    // LOGIC ĐIỀU HƯỚNG API
    switch (importType) {
      case "USER":
        url = "http://localhost:8080/api/staff/import-user";
        formData.append("role", role);
        if (role === "STUDENT" && admissionDate) {
          formData.append("admissionDate", admissionDate);
        }
        break;
      case "CLASS":
        url = "http://localhost:8080/api/staff/import-classes";
        break;
      case "SUBJECT":
        url = "http://localhost:8080/api/staff/import-subject";
        break;
      case "SYLLABUS":
        url = "http://localhost:8080/api/staff/import-syllabus";
        break;
      default:
        setLoading(false);
        return;
    }

    try {
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage({ type: "success", text: response.data.message });
      setFile(null); // Reset file sau khi thành công
    } catch (error: unknown) {
      // Vì error là unknown, chúng ta cần kiểm tra xem nó có phải lỗi từ Axios không
      if (axios.isAxiosError(error)) {
        // Bây giờ TypeScript đã biết 'error' là AxiosError, con có thể truy cập data an toàn
        const errorMsg =
          error.response?.data?.message || "Lỗi hệ thống khi import";
        setMessage({ type: "error", text: errorMsg });
      } else {
        // Trường hợp lỗi không phải từ API (lỗi code, lỗi mạng...)
        setMessage({ type: "error", text: "Đã có lỗi xảy ra ngoài dự kiến" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 10, ...commonFont }}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)",
          pt: 4,
          pb: 6,
          mb: 8,
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/home")}
            sx={{ color: "white", mb: 2, opacity: 0.8, textTransform: "none" }}
          >
            Quay lại Dashboard
          </Button>
          <Typography
            variant="h3"
            fontWeight="900"
            color="white"
            sx={{ letterSpacing: -1 }}
          >
            Trung Tâm Dữ Liệu
          </Typography>
          <Typography color="white" sx={{ opacity: 0.85 }}>
            Tối ưu hóa quy trình nhập liệu hàng loạt | Xin chào,{" "}
            {user?.fullName || "Staff"}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Container Grid chính */}
        <Grid container spacing={4} sx={{ justifyContent: "center" }}>
          {/* Dùng size thay vì item/xs/md để diệt lỗi Overload */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 5,
                border: "1px solid #e2e8f0",
                bgcolor: "white",
              }}
            >
              {message.text && (
                <Alert
                  severity={(message.type as "success" | "error") || "info"}
                  onClose={() => setMessage({ type: "", text: "" })}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    "& .MuiAlert-message": { whiteSpace: "pre-line" },
                  }}
                >
                  {message.text}
                </Alert>
              )}

              <Typography variant="h6" fontWeight="800" mb={4}>
                Cấu Hình Nhập Liệu
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Loại dữ liệu</InputLabel>
                    <Select
                      value={importType}
                      label="Loại dữ liệu"
                      onChange={(e) => setImportType(e.target.value)}
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="USER">
                        Người dùng (Sinh viên/Giảng viên)
                      </MenuItem>
                      <MenuItem value="CLASS">Lớp học</MenuItem>
                      <MenuItem value="SYLLABUS">Đề cương môn học</MenuItem>
                      <MenuItem value="SUBJECT">Môn học</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {importType === "USER" && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Vai trò</InputLabel>
                        <Select
                          value={role}
                          label="Vai trò"
                          onChange={(e) => setRole(e.target.value)}
                          sx={{ borderRadius: 3 }}
                        >
                          <MenuItem value="STUDENT">Sinh viên</MenuItem>
                          <MenuItem value="LECTURER">Giảng viên</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {role === "STUDENT" && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Ngày nhập học"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          onChange={(e) => setAdmissionDate(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 3 },
                          }}
                        />
                      </Grid>
                    )}
                  </>
                )}

                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      border: "2px dashed #9c27b0",
                      borderRadius: 5,
                      p: 5,
                      textAlign: "center",
                      bgcolor: "#f3e5f533",
                    }}
                  >
                    <Avatar
                      sx={{
                        m: "auto",
                        bgcolor: "#9c27b0",
                        width: 56,
                        height: 56,
                        mb: 2,
                      }}
                    >
                      <CloudUploadIcon />
                    </Avatar>
                    <input
                      type="file"
                      id="file-upload"
                      hidden
                      onChange={(e) =>
                        setFile(e.target.files ? e.target.files[0] : null)
                      }
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="contained"
                        component="span"
                        sx={{
                          borderRadius: 3,
                          bgcolor: "#9c27b0",
                          px: 4,
                          fontWeight: 700,
                        }}
                      >
                        Chọn File Excel/CSV
                      </Button>
                    </label>
                    {file && (
                      <Typography
                        sx={{ mt: 2, fontWeight: 600, color: "#9c27b0" }}
                      >
                        📄 {file.name}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={!importType || !file || loading}
                    onClick={handleImport}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <RocketLaunchIcon />
                      )
                    }
                    sx={{
                      borderRadius: 4,
                      py: 2,
                      fontWeight: 800,
                      background:
                        "linear-gradient(135deg, #ed6c02 0%, #e65100 100%)",
                      boxShadow: "0 8px 20px rgba(237, 108, 2, 0.3)",
                      color: "white",
                    }}
                  >
                    {loading ? "ĐANG XỬ LÝ..." : "BẮT ĐẦU IMPORT"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ImportCenter;
