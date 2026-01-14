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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Pagination from "@mui/material/Pagination";

import {
  getStaffSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../services/subjectService";
import type { Subject } from "../../types/Subject";

const SubjectManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openImport, setOpenImport] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const [newSubject, setNewSubject] = useState<Omit<Subject, "id">>({
    subjectCode: "",
    name: "",
    specialization: "",
    description: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const pageData = await getStaffSubjects(page, pageSize);
      setSubjects(pageData.content);
      setTotalPages(pageData.totalPages);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleAddSubject = async () => {
    if (!newSubject.subjectCode || !newSubject.name)
      return alert("Vui lòng nhập đủ thông tin!");
    const result = await createSubject(newSubject);
    if (result) {
      setOpenAdd(false);
      setNewSubject({
        subjectCode: "",
        name: "",
        specialization: "",
        description: "",
      });
      loadData();
    }
  };

  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject);
    setOpenEdit(true);
  };

  const handleUpdateSubject = async () => {
    if (editingSubject) {
      const result = await updateSubject(editingSubject.id, editingSubject);
      if (result) {
        setOpenEdit(false);
        loadData();
      }
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa môn học này không?")) {
      try {
        await deleteSubject(id);
        loadData();
      } catch (error) {
        alert("Lỗi khi xóa!");
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
              onClick={() => setOpenImport(true)}
              sx={{
                borderRadius: 3,
                px: 3,
                textTransform: "none",
                fontWeight: 700,
                color: "#9c27b0",
                borderColor: "#9c27b0",
                "&:hover": { borderColor: "#7b1fa2", bgcolor: "#f3e5f5" },
              }}
            >
              Import Syllabus
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAdd(true)}
              sx={{
                borderRadius: 3,
                px: 3,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#9c27b0",
                "&:hover": { bgcolor: "#7b1fa2" },
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
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress color="secondary" />
                  </TableCell>
                </TableRow>
              ) : (
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
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteSubject(Number(subject.id))
                          }
                          sx={{ color: "#ef4444", bgcolor: "#fef2f2" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
            onChange={(_, value) => setPage(value - 1)}
            color="secondary"
            shape="rounded"
            size="large"
          />
        </Box>

        {/* Dialog Add */}
        <Dialog
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{ fontWeight: 800, bgcolor: "#f3e5f5", color: "#4a148c" }}
          >
            Thêm Môn Học Mới
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Mã Môn Học"
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
                label="Mô Tả"
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
            <Button onClick={() => setOpenAdd(false)}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleAddSubject}
              sx={{ bgcolor: "#9c27b0" }}
            >
              Lưu Môn Học
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Edit */}
        <Dialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{ fontWeight: 800, bgcolor: "#f3e5f5", color: "#4a148c" }}
          >
            Cập Nhật Môn Học
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Mã Môn Học"
                fullWidth
                disabled
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
            <Button onClick={() => setOpenEdit(false)}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleUpdateSubject}
              sx={{ bgcolor: "#9c27b0" }}
            >
              Cập Nhật
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Import */}
        <Dialog
          open={openImport}
          onClose={() => setOpenImport(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 800 }}>Import Syllabus</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                border: "2px dashed #9c27b0",
                borderRadius: 3,
                p: 5,
                textAlign: "center",
                mt: 1,
                bgcolor: "#f3e5f5",
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: "#9c27b0", mb: 2 }} />
              <Typography variant="body1" fontWeight="600">
                Chọn file Syllabus (CSV/Excel)
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenImport(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SubjectManager;
