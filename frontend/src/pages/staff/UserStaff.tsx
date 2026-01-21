import React, { useState, useEffect } from "react";
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
  Button,
  Avatar,
  Drawer,
  IconButton,
  Grid,
  CircularProgress,
  Pagination,
  Stack,
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group"; // Thay banner bằng icon tiêu đề

import { staffService } from "../../services/staffService";

// --- INTERFACES ---
interface StudentDetail {
  fullName: string;
  email: string;
  studentId: string;
  eduLevel?: string;
  batch?: string;
  faculty?: string;
  specialization?: string;
  trainingType?: string;
  studentStatus?: string;
  dob?: string;
  admissionDate?: string;
}

// --- COMPONENT CON HIỂN THỊ CHI TIẾT ---
const InfoItem = ({
  label,
  value,
  size = 12,
}: {
  label: string;
  value?: any;
  size?: number;
}) => (
  <Grid size={{ xs: 12, sm: size }}>
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: "#f8fafc",
        border: "1px solid #e2e8f0",
        height: "100%",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: "0.65rem",
          display: "block",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: value ? "#1e293b" : "#94a3b8",
          fontStyle: value ? "normal" : "italic",
        }}
      >
        {value || "Chưa cập nhật"}
      </Typography>
    </Box>
  </Grid>
);

const StaffUserManager = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [detailData, setDetailData] = useState<StudentDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // State cho tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const pageSize = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      const params = { page, size: pageSize, keyword: appliedKeyword };
      if (activeTab === 0) {
        res = await staffService.getStudents(params);
      } else {
        res = await staffService.getLecturers(params);
      }
      setData(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Lỗi fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, page, appliedKeyword]);

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
    setSearchKeyword("");
    setAppliedKeyword("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedKeyword(searchKeyword);
    setPage(0);
  };

  const handleReset = () => {
    setSearchKeyword("");
    setAppliedKeyword("");
    setPage(0);
  };

  const handleOpenDetail = async (id: number) => {
    setIsDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const res = await staffService.getStudentDetail(id);
      setDetailData(res.data);
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
    } finally {
      setDrawerLoading(false);
    }
  };

  const renderCellText = (text: any) => {
    if (!text)
      return (
        <Typography
          variant="body2"
          sx={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.85rem" }}
        >
          Chưa có
        </Typography>
      );
    return text;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6 }}>
      <Container maxWidth="xl">
        {/* HEADER SECTION - GIỐNG SYLLABUS MANAGER */}
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
              <GroupIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                color="#1e293b"
                sx={{ letterSpacing: -1 }}
              >
                Quản Lý Thành Viên
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="500"
              >
                Tra cứu và xem hồ sơ chi tiết của Sinh viên và Giảng viên
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SEARCH SECTION - ĐỒNG BỘ STYLE PHẲNG */}
        <Paper
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            border: "1px solid #f1f5f9",
          }}
        >
          <form onSubmit={handleSearch}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <TextField
                fullWidth
                size="small"
                placeholder={
                  activeTab === 0
                    ? "Tìm kiếm sinh viên theo tên, MSSV..."
                    : "Tìm kiếm giảng viên theo tên, CCCD..."
                }
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: "#fff", borderRadius: 2 }}
              />
              <Stack
                direction="row"
                spacing={1}
                sx={{ minWidth: "fit-content" }}
              >
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    bgcolor: "#9c27b0",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    "&:hover": { bgcolor: "#7b1fa2" },
                  }}
                >
                  Tìm kiếm
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
          </form>
        </Paper>

        {/* TABLE SECTION - ĐỒNG BỘ STYLE TABLE VỚI SYLLABUS */}
        <Paper
          sx={{
            borderRadius: 5,
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ bgcolor: "#f3e5f5", borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label="DANH SÁCH SINH VIÊN"
              sx={{ fontWeight: 800, color: "#4a148c" }}
            />
            <Tab
              icon={<SchoolIcon />}
              iconPosition="start"
              label="DANH SÁCH GIẢNG VIÊN"
              sx={{ fontWeight: 800, color: "#4a148c" }}
            />
          </Tabs>

          <TableContainer sx={{ minHeight: 400 }}>
            <Table stickyHeader>
              <TableHead sx={{ bgcolor: "#f3e5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                    HỌ VÀ TÊN
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                    EMAIL
                  </TableCell>
                  {activeTab === 0 ? (
                    <>
                      <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                        MSSV
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                        NGÀNH
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 800, color: "#4a148c" }}
                      >
                        THAO TÁC
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                        CCCD
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                        BỘ MÔN
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                        HỌC VỊ
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                      <CircularProgress color="secondary" />
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 10, color: "#94a3b8" }}
                    >
                      Không tìm thấy dữ liệu phù hợp
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow hover key={item.id}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: activeTab === 0 ? "#10b981" : "#3b82f6",
                              fontWeight: 700,
                              width: 32,
                              height: 32,
                              fontSize: "0.85rem",
                            }}
                          >
                            {item.fullName.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={700}>
                            {item.fullName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>
                        {item.email}
                      </TableCell>
                      {activeTab === 0 ? (
                        <>
                          <TableCell sx={{ fontWeight: 700, color: "#6a1b9a" }}>
                            {renderCellText(item.studentId)}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem" }}>
                            {renderCellText(item.major)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleOpenDetail(item.id)}
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                                color: "#9c27b0",
                                borderColor: "#9c27b0",
                              }}
                            >
                              Hồ sơ
                            </Button>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {renderCellText(item.cccd)}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem" }}>
                            {renderCellText(item.department)}
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
                              {item.degree || "N/A"}
                            </Box>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Section */}
          <Box display="flex" justifyContent="center" py={4} bgcolor="white">
            <Pagination
              count={totalPages}
              page={page + 1}
              color="secondary"
              shape="rounded"
              size="large"
              onChange={(_, value) => setPage(value - 1)}
            />
          </Box>
        </Paper>
      </Container>

      {/* DRAWER CHI TIẾT SINH VIÊN */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 550 }, borderRadius: "16px 0 0 16px" },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header Drawer */}
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
              sx={{ position: "absolute", right: 10, top: 10, color: "white" }}
            >
              <CloseIcon />
            </IconButton>
            {detailData && (
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    border: "3px solid rgba(255,255,255,0.3)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                  }}
                >
                  {detailData.fullName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    {detailData.fullName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Mã số sinh viên: {detailData.studentId}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>

          <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
            {drawerLoading ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                pt={10}
              >
                <CircularProgress color="secondary" />
                <Typography sx={{ mt: 2, color: "text.secondary" }}>
                  Đang tải hồ sơ...
                </Typography>
              </Box>
            ) : (
              detailData && (
                <Grid container spacing={2}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      width: "100%",
                      ml: 2,
                      mb: 1,
                      fontWeight: 800,
                      color: "#9c27b0",
                      textTransform: "uppercase",
                    }}
                  >
                    Hồ sơ đào tạo
                  </Typography>
                  <InfoItem
                    label="Email chính thức"
                    value={detailData.email}
                    size={12}
                  />
                  <InfoItem label="Khoa" value={detailData.faculty} size={6} />
                  <InfoItem
                    label="Chuyên ngành"
                    value={detailData.specialization}
                    size={6}
                  />
                  <InfoItem label="Khóa" value={detailData.batch} size={4} />
                  <InfoItem
                    label="Bậc đào tạo"
                    value={detailData.eduLevel}
                    size={4}
                  />
                  <InfoItem
                    label="Loại hình"
                    value={detailData.trainingType}
                    size={4}
                  />

                  <Divider sx={{ width: "100%", my: 2 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      width: "100%",
                      ml: 2,
                      mb: 1,
                      fontWeight: 800,
                      color: "#9c27b0",
                      textTransform: "uppercase",
                    }}
                  >
                    Thông tin cá nhân
                  </Typography>
                  <InfoItem label="Ngày sinh" value={detailData.dob} size={6} />
                  <InfoItem
                    label="Ngày nhập học"
                    value={detailData.admissionDate}
                    size={6}
                  />
                  <InfoItem
                    label="Trạng thái hiện tại"
                    value={detailData.studentStatus}
                    size={12}
                  />
                </Grid>
              )
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default StaffUserManager;
