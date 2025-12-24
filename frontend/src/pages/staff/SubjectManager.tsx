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
  Tooltip,
  TextField,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
// 1. Import API Service và Type
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../services/subjectService";
import type { Subject } from "../../types/Subject";

const SubjectManager = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE QUẢN LÝ MODAL ---
  const [openImport, setOpenImport] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  // --- STATE QUẢN LÝ FORM THÊM MỚI ---
  const [newSubject, setNewSubject] = useState<Omit<Subject, "id">>({
    subjectCode: "",
    name: "",
    specialization: "",
    description: "",
  });
  // --- STATE CHO CẬP NHẬT ---
  const [openEdit, setOpenEdit] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // --- STATE CHO XÓA ---
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState<number | null>(
    null
  );

  // 2. HÀM LẤY DỮ LIỆU TỪ BACKEND
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách môn học:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động chạy khi load trang
  useEffect(() => {
    loadData();
  }, []);

  // 3. HÀM XỬ LÝ THÊM MÔN HỌC
  const handleAddSubject = async () => {
    if (!newSubject.subjectCode || !newSubject.name) {
      alert("Vui lòng nhập đủ Mã môn và Tên môn!");
      return;
    }
    const result = await createSubject(newSubject);
    if (result) {
      setOpenAdd(false); // Đóng form
      setNewSubject({
        subjectCode: "",
        name: "",
        specialization: "",
        description: "",
      }); // Reset form
      loadData(); // Tải lại bảng để thấy môn mới
    }
  };
  // --- HÀM XỬ LÝ SỬA ---
  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject);
    setOpenEdit(true);
  };

  const handleUpdateSubject = async () => {
    if (editingSubject) {
      const result = await updateSubject(editingSubject.id, editingSubject);
      if (result) {
        setOpenEdit(false);
        loadData(); // Load lại danh sách mới
      }
    }
  };

  // --- HÀM XỬ LÝ XÓA ---
  const handleDeleteSubject = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa môn học này không?")) {
      try {
        await deleteSubject(id);
        loadData(); // Load lại bảng sau khi xóa
      } catch (error) {
        alert("Không thể xóa môn học này (có thể do đang có lớp học sử dụng).");
      }
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography variant="h4" fontWeight="800" color="#1e293b">
              Quản Lý Môn Học
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý danh sách môn học và chuyên ngành hệ thống
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => setOpenImport(true)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Import Syllabus
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAdd(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#f59e0b",
                "&:hover": { bgcolor: "#d97706" },
              }}
            >
              Thêm Môn Học
            </Button>
          </Stack>
        </Box>

        {/* Table Section */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#fffbeb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Mã Môn</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tên Môn Học</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Chuyên Ngành</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Mô Tả</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Thao Tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress
                      size={24}
                      sx={{ color: "#f59e0b", mr: 1 }}
                    />
                    Đang tải dữ liệu từ Backend...
                  </TableCell>
                </TableRow>
              ) : subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    Chưa có môn học nào. Hãy bấm "Thêm Môn Học"!
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject) => (
                  <TableRow key={subject.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: "#b45309" }}>
                      {subject.subjectCode}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {subject.name}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          bgcolor: "#fef3c7",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: "inline-block",
                          color: "#92400e",
                          fontWeight: 600,
                        }}
                      >
                        {subject.specialization || "Đại cương"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Tooltip title={subject.description} arrow>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ color: "text.secondary" }}
                        >
                          {subject.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="info">
                        <InfoIcon fontSize="small" />
                      </IconButton>

                      {/* Nút Sửa: Gọi hàm mở Dialog sửa */}
                      <IconButton
                        size="small"
                        sx={{ color: "#d97706" }}
                        onClick={() => handleEditClick(subject)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>

                      {/* Nút Xóa: Gọi trực tiếp hàm xóa với ID */}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSubject(Number(subject.id))}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* DIALOG THÊM MÔN HỌC MỚI */}
        <Dialog
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>
            Thêm Môn Học Mới
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Mã Môn Học (VD: PRN231)"
                fullWidth
                value={newSubject.subjectCode}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, subjectCode: e.target.value })
                }
              />
              <TextField
                label="Tên Môn Học"
                fullWidth
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, name: e.target.value })
                }
              />
              <TextField
                label="Chuyên Ngành"
                fullWidth
                value={newSubject.specialization}
                onChange={(e) =>
                  setNewSubject({
                    ...newSubject,
                    specialization: e.target.value,
                  })
                }
              />
              <TextField
                label="Mô Tả Chi Tiết"
                multiline
                rows={3}
                fullWidth
                value={newSubject.description}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, description: e.target.value })
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpenAdd(false)}
              sx={{ color: "text.secondary" }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleAddSubject}
              sx={{ bgcolor: "#f59e0b", "&:hover": { bgcolor: "#d97706" } }}
            >
              Lưu Môn Học
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG IMPORT (GIỮ NGUYÊN) */}
        <Dialog
          open={openImport}
          onClose={() => setOpenImport(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>
            Import Môn Học & Syllabus
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                border: "2px dashed #f59e0b",
                borderRadius: 3,
                p: 5,
                textAlign: "center",
                mt: 1,
                bgcolor: "#fffbeb",
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: "#f59e0b", mb: 2 }} />
              <Typography variant="body1" fontWeight="600">
                Chọn file Syllabus (CSV/Excel)
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>
        {/* DIALOG CẬP NHẬT MÔN HỌC */}
        <Dialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>
            Cập Nhật Môn Học
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Mã Môn Học"
                fullWidth
                disabled // Khuyên dùng: Không nên cho sửa mã định danh
                value={editingSubject?.subjectCode || ""}
              />
              <TextField
                label="Tên Môn Học"
                fullWidth
                value={editingSubject?.name || ""}
                onChange={(e) =>
                  setEditingSubject((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
              <TextField
                label="Chuyên Ngành"
                fullWidth
                value={editingSubject?.specialization || ""}
                onChange={(e) =>
                  setEditingSubject((prev) =>
                    prev ? { ...prev, specialization: e.target.value } : null
                  )
                }
              />
              <TextField
                label="Mô Tả"
                multiline
                rows={3}
                fullWidth
                value={editingSubject?.description || ""}
                onChange={(e) =>
                  setEditingSubject((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpenEdit(false)}
              sx={{ color: "text.secondary" }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateSubject}
              sx={{ bgcolor: "#f59e0b", "&:hover": { bgcolor: "#d97706" } }}
            >
              Lưu Thay Đổi
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SubjectManager;
