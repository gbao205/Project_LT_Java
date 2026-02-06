import { useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  CircularProgress,
  Avatar,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SearchIcon from "@mui/icons-material/Search"; // Nhớ import icon này
import Pagination from "@mui/material/Pagination";
import { useNavigate } from "react-router-dom";
import { getStaffSubjects, updateSubject } from "../../services/subjectService";
import type { Subject } from "../../types/Subject";

const SubjectManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openEdit, setOpenEdit] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();
  // 1. State chứa dữ liệu đang nhập trên giao diện (Chưa gọi API)
  const [searchInputs, setSearchInputs] = useState({
    subjectCode: "",
    name: "",
    specialization: "",
  });

  // 2. State chứa dữ liệu thực tế dùng để gọi API (Chỉ cập nhật khi nhấn nút Tìm)
  const [appliedFilters, setAppliedFilters] = useState({
    subjectCode: "",
    name: "",
    specialization: "",
  });

  // Load dữ liệu dựa trên appliedFilters
  const loadData = async () => {
    setIsLoading(true);
    try {
      const pageData = await getStaffSubjects(
        page,
        pageSize,
        appliedFilters.subjectCode,
        appliedFilters.name,
        appliedFilters.specialization,
      );
      if (pageData && pageData.content) {
        setSubjects(pageData.content);
        setTotalPages(pageData.totalPages);
      }
    } catch (error) {
      console.error("Lỗi:", error);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters(searchInputs);
    setPage(0);
  };

  const handleReset = () => {
    const empty = { subjectCode: "", name: "", specialization: "" };
    setSearchInputs(empty);
    setAppliedFilters(empty);
    setPage(0);
  };

  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject);
    setOpenEdit(true);
  };

  const handleUpdateSubject = async () => {
    if (editingSubject) {
      try {
        const result = await updateSubject(editingSubject.subjectCode, {
          name: editingSubject.name,
          specialization: editingSubject.specialization,
          description: editingSubject.description,
        });

        if (result) {
          setSubjects((prevSubjects) =>
            prevSubjects.map((s) =>
              s.subjectCode === editingSubject.subjectCode
                ? { ...s, ...editingSubject }
                : s,
            ),
          );

          setOpenEdit(false);
          alert("Cập nhật thành công!");
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật:", error);
        alert("Cập nhật thất bại!");
      }
    }
  };
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
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
              <AssignmentIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                fontWeight="900"
                color="#1e293b"
                sx={{ letterSpacing: -1 }}
              >
                Quản Lý Môn Học
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="500"
              >
                Thiết lập Syllabus và danh mục đào tạo của hệ thống
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => navigate("/staff/import")}
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                color: "#9c27b0",
                borderColor: "#9c27b0",
                textTransform: "none",
                px: 3,
              }}
            >
              Đến Trung Tâm Import
            </Button>
          </Stack>
        </Box>

        {/* Search Section */}
        <Paper
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            border: "1px solid #f1f5f9",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              label="Mã môn học"
              size="small"
              fullWidth
              value={searchInputs.subjectCode}
              onChange={(e) =>
                setSearchInputs({
                  ...searchInputs,
                  subjectCode: e.target.value,
                })
              }
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <TextField
              label="Tên môn học"
              size="small"
              fullWidth
              value={searchInputs.name}
              onChange={(e) =>
                setSearchInputs({ ...searchInputs, name: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <TextField
              label="Chuyên ngành"
              size="small"
              fullWidth
              value={searchInputs.specialization}
              onChange={(e) =>
                setSearchInputs({
                  ...searchInputs,
                  specialization: e.target.value,
                })
              }
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Stack direction="row" spacing={1} sx={{ minWidth: "fit-content" }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                sx={{
                  bgcolor: "#9c27b0",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  "&:hover": { bgcolor: "#7b1fa2" },
                }}
              >
                Tìm
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: "#64748b",
                  borderColor: "#cbd5e1",
                }}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Table Section */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 5,
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f3e5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                  MÃ MÔN
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                  TÊN MÔN HỌC
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                  CHUYÊN NGÀNH
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 800, color: "#4a148c" }}
                  align="right"
                >
                  THAO TÁC
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <CircularProgress color="secondary" />
                  </TableCell>
                </TableRow>
              ) : subjects.length > 0 ? (
                subjects.map((subject) => (
                  <TableRow key={subject.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: "#6a1b9a" }}>
                      {subject.subjectCode}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {subject.name}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          bgcolor: "#e0f2f1",
                          color: "#00695c",
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          display: "inline-block",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {subject.specialization || "ĐẠI CƯƠNG"}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(subject)}
                          sx={{ color: "#3b82f6", bgcolor: "#eff6ff" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    Không tìm thấy môn học
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="center" py={4}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(_, value) => setPage(value - 1)}
            color="secondary"
            shape="rounded"
            size="large"
          />
        </Box>

        {/* --- Dialogs (Add, Edit, Import) giữ nguyên code cũ của bạn bên dưới này --- */}
        {/* --- Dialog Chỉnh Sửa Môn Học --- */}
        <Dialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { borderRadius: 4, p: 1 },
          }}
        >
          {/* SỬA LỖI: Thẻ đóng phải trùng với thẻ mở DialogTitle */}
          <DialogTitle sx={{ fontWeight: 800, color: "#1e293b", pb: 1 }}>
            Chỉnh Sửa Môn Học
          </DialogTitle>

          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Mã môn học"
                fullWidth
                disabled
                value={editingSubject?.subjectCode || ""}
                variant="filled"
              />
              <TextField
                label="Tên môn học"
                fullWidth
                value={editingSubject?.name || ""}
                onChange={(e) =>
                  setEditingSubject((prev) =>
                    prev ? { ...prev, name: e.target.value } : null,
                  )
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
              />
              <TextField
                label="Chuyên ngành"
                fullWidth
                value={editingSubject?.specialization || ""}
                onChange={(e) =>
                  setEditingSubject((prev) =>
                    prev ? { ...prev, specialization: e.target.value } : null,
                  )
                }
                placeholder="Ví dụ: Kỹ thuật phần mềm"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
              />
              <TextField
                label="Mô tả môn học"
                fullWidth
                multiline
                rows={4}
                value={editingSubject?.description || ""}
                onChange={(e) =>
                  setEditingSubject((prev) =>
                    prev ? { ...prev, description: e.target.value } : null,
                  )
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => setOpenEdit(false)}
              sx={{ color: "#64748b", fontWeight: 700, textTransform: "none" }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateSubject}
              sx={{
                bgcolor: "#9c27b0",
                px: 4,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#7b1fa2" },
              }}
            >
              Lưu thay đổi
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SubjectManager;
