import { useEffect, useState, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  CircularProgress,
  Avatar,
  Pagination,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import { staffService } from "../../services/staffService";
import {
  getSyllabusList,
  getSyllabusDetail,
} from "../../services/syllabusService";
import { useAppSnackbar } from "../../hooks/useAppSnackbar";

import type { SyllabusList, SyllabusDetail } from "../../types/Syllabus";

const SyllabusManager = () => {
  const { showSnackbar } = useAppSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data states
  const [data, setData] = useState<SyllabusList[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Dialog states
  const [openDetail, setOpenDetail] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [detail, setDetail] = useState<SyllabusDetail | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Search states
  const [searchInputs, setSearchInputs] = useState({
    id: "",
    subjectName: "",
    year: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    id: "",
    subjectName: "",
    year: "",
  });

  // ================= LOAD LIST =================
  const loadData = async () => {
    setLoading(true);
    try {
      const filterId = appliedFilters.id
        ? Number(appliedFilters.id)
        : undefined;
      const filterYear = appliedFilters.year
        ? Number(appliedFilters.year)
        : undefined;

      const res = await getSyllabusList(
        page,
        pageSize,
        filterId,
        appliedFilters.subjectName,
        filterYear
      );

      if (res && res.content) {
        setData(res.content);
        setTotalPages(res.totalPages);
      } else {
        setData([]);
        setTotalPages(0);
      }
    } catch (error) {
      showSnackbar("Không thể tải danh sách chương trình học", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, appliedFilters]);

  // ================= SEARCH HANDLERS =================
  const handleSearch = () => {
    setAppliedFilters(searchInputs);
    setPage(0);
  };

  const handleReset = () => {
    const empty = { id: "", subjectName: "", year: "" };
    setSearchInputs(empty);
    setAppliedFilters(empty);
    setPage(0);
  };

  // ================= VIEW DETAIL =================
  const handleViewDetail = async (id: number) => {
    try {
      const res = await getSyllabusDetail(id);
      setDetail(res);
      setOpenDetail(true);
    } catch (error) {
      showSnackbar("Không thể tải chi tiết Syllabus", "error");
    }
  };

  // ================= IMPORT LOGIC (GIỐNG IMPORT CENTER) =================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setImporting(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Gọi hàm từ service, không dùng link trực tiếp nữa
      const response = await staffService.importSyllabus(formData);

      showSnackbar(response.data.message || "Import thành công", "success");
      setOpenImport(false);
      loadData();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || "Lỗi import", "error");
    } finally {
      setImporting(false);
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
                fontWeight={900}
                color="#1e293b"
                sx={{ letterSpacing: -1 }}
              >
                Quản Lý Chương Trình Học
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Danh sách chi tiết chương trình đào tạo theo năm
              </Typography>
            </Box>
          </Box>

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
              label="ID Syllabus"
              size="small"
              fullWidth
              value={searchInputs.id}
              onChange={(e) =>
                setSearchInputs({ ...searchInputs, id: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <TextField
              label="Tên môn học"
              size="small"
              fullWidth
              value={searchInputs.subjectName}
              onChange={(e) =>
                setSearchInputs({
                  ...searchInputs,
                  subjectName: e.target.value,
                })
              }
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <TextField
              label="Năm áp dụng"
              size="small"
              fullWidth
              value={searchInputs.year}
              onChange={(e) =>
                setSearchInputs({ ...searchInputs, year: e.target.value })
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
                  ID
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                  TÊN MÔN HỌC
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                  NĂM
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 800, color: "#4a148c" }}
                >
                  THAO TÁC
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <CircularProgress color="secondary" />
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                data.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: "#6a1b9a" }}>
                      #{s.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {s.subjectName}
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
                        {s.year}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetail(s.id)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                          color: "#9c27b0",
                          borderColor: "#9c27b0",
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    Không tìm thấy dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box display="flex" justifyContent="center" py={4}>
          <Pagination
            count={totalPages}
            page={page + 1}
            color="secondary"
            shape="rounded"
            size="large"
            onChange={(_, value) => setPage(value - 1)}
          />
        </Box>

        {/* ================= DETAIL DIALOG ================= */}
        <Dialog
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle
            sx={{ fontWeight: 800, bgcolor: "#f3e5f5", color: "#4a148c" }}
          >
            Chi tiết Syllabus
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {detail && (
              <Stack spacing={3} mt={2}>
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                  <TextField
                    label="Tên môn học"
                    value={detail.subjectName}
                    fullWidth
                    disabled
                  />
                  <TextField
                    label="Năm áp dụng"
                    value={detail.year}
                    fullWidth
                    disabled
                  />
                </Box>
                <TextField
                  label="Mô tả"
                  value={detail.description}
                  multiline
                  rows={3}
                  fullWidth
                  disabled
                />
                <TextField
                  label="Mục tiêu"
                  value={detail.objectives}
                  multiline
                  rows={3}
                  fullWidth
                  disabled
                />
                <TextField
                  label="Lộ trình (Outline)"
                  value={detail.outline}
                  multiline
                  rows={5}
                  fullWidth
                  disabled
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpenDetail(false)}
              variant="contained"
              sx={{ bgcolor: "#9c27b0" }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* ================= IMPORT DIALOG (Xử lý giống Import Center) ================= */}
        <Dialog
          open={openImport}
          onClose={() => !importing && setOpenImport(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>Import Syllabus</DialogTitle>
          <DialogContent>
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
            />
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "2px dashed #9c27b0",
                borderRadius: 3,
                p: 5,
                textAlign: "center",
                mt: 1,
                bgcolor: selectedFile ? "#f3e5f5" : "#fafafa",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { bgcolor: "#f3e5f5" },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: "#9c27b0", mb: 2 }} />
              <Typography variant="body1" fontWeight="600">
                {selectedFile
                  ? selectedFile.name
                  : "Chọn file Syllabus (Excel/CSV)"}
              </Typography>
              {selectedFile && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Kích thước: {(selectedFile.size / 1024).toFixed(1)} KB
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenImport(false)} disabled={importing}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || importing}
              sx={{ bgcolor: "#9c27b0" }}
            >
              {importing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "BẮT ĐẦU TẢI LÊN"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SyllabusManager;
