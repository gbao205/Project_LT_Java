import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  Container,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  TextField,
  IconButton,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useForm } from "react-hook-form";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getAllUsers,
  toggleUserStatus,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
} from "../../services/userService";

const StaffUserManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"CREATE" | "EDIT" | "RESET">(
    "CREATE"
  );
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Truyền search vào API để tìm kiếm thực tế
      const res = await getAllUsers(search);
      const filtered = res.filter(
        (u: any) => u.role === "STUDENT" || u.role === "LECTURER"
      );
      setUsers(filtered);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động tìm kiếm khi người dùng dừng gõ (Debounce nhẹ)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredData = useMemo(() => {
    const targetRole = tabValue === 0 ? "STUDENT" : "LECTURER";
    return users.filter((u) => u.role === targetRole);
  }, [users, tabValue]);

  const onSubmit = async (data: any) => {
    try {
      if (dialogType === "CREATE") await createUser(data);
      else if (dialogType === "EDIT") await updateUser(selectedUser.id, data);
      else if (dialogType === "RESET")
        await resetUserPassword(selectedUser.id, data.password);

      setOpenDialog(false);
      reset();
      fetchUsers();
      alert("Thao tác thành công!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra!");
    }
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
              <GroupIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                fontWeight="900"
                color="#1e293b"
                sx={{ letterSpacing: -1 }}
              >
                Quản Lý Tài Khoản
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="500"
              >
                Tra cứu và quản lý hồ sơ nhân sự đào tạo
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{
                borderRadius: 3,
                color: "#9c27b0",
                borderColor: "#9c27b0",
                fontWeight: 700,
                px: 3,
              }}
            >
              Import Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogType("CREATE");
                setOpenDialog(true);
              }}
              sx={{
                borderRadius: 3,
                bgcolor: "#9c27b0",
                fontWeight: 700,
                px: 3,
                "&:hover": { bgcolor: "#7b1fa2" },
              }}
            >
              Thêm Tài Khoản
            </Button>
          </Stack>
        </Box>

        {/* Ô TÌM KIẾM - Đã kích hoạt SearchIcon và setSearch */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ bgcolor: "white", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          sx={{ mb: 3 }}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab
            icon={<SchoolIcon />}
            iconPosition="start"
            label="Danh sách Sinh Viên"
          />
          <Tab
            icon={<CastForEducationIcon />}
            iconPosition="start"
            label="Danh sách Giảng Viên"
          />
        </Tabs>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 5,
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f3e5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                  MÃ ĐỊNH DANH
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                  HỌ VÀ TÊN
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#4a148c" }}>
                  EMAIL
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 800, color: "#4a148c" }}
                  align="center"
                >
                  TRẠNG THÁI
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
                filteredData.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: "#6a1b9a" }}>
                      {user.role === "STUDENT"
                        ? user.studentId
                        : user.lecturerId || "---"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {user.fullName}
                    </TableCell>
                    <TableCell color="text.secondary">{user.email}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={Boolean(user.active)}
                        onChange={() => toggleUserStatus(user.id)}
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <IconButton
                          size="small"
                          sx={{ color: "#3b82f6", bgcolor: "#eff6ff" }}
                          onClick={() => {
                            setSelectedUser(user);
                            setDialogType("EDIT");
                            setOpenDialog(true);
                            setValue("fullName", user.fullName);
                            setValue("email", user.email);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: "#ed6c02", bgcolor: "#fff3e0" }}
                          onClick={() => {
                            setSelectedUser(user);
                            setDialogType("RESET");
                            setOpenDialog(true);
                          }}
                        >
                          <LockResetIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: "#ef4444", bgcolor: "#fef2f2" }}
                          onClick={() => deleteUser(user.id)}
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
      </Container>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontWeight: 800, bgcolor: "#f3e5f5", color: "#4a148c" }}
        >
          {dialogType === "CREATE"
            ? "Tạo Tài Khoản"
            : dialogType === "EDIT"
            ? "Sửa Thông Tin"
            : "Cấp Lại Mật Khẩu"}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              {dialogType !== "RESET" && (
                <>
                  <TextField
                    label="Họ và Tên"
                    fullWidth
                    {...register("fullName")}
                  />
                  <TextField label="Email" fullWidth {...register("email")} />
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label="Vai trò"
                    fullWidth
                    {...register("role")}
                  >
                    <option value="STUDENT">Sinh Viên</option>
                    <option value="LECTURER">Giảng Viên</option>
                  </TextField>
                </>
              )}
              <TextField
                label="Mật khẩu"
                type="password"
                fullWidth
                {...register("password")}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button
              variant="contained"
              type="submit"
              sx={{ bgcolor: "#9c27b0" }}
            >
              Lưu dữ liệu
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default StaffUserManager;
