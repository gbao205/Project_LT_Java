import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
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
  TextField,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  getAllClasses,
  createClass,
  type ClassRoom,
} from "../../services/classService.ts";
import { getSubjects } from "../../services/subjectService.ts";
import { getAllUsers } from "../../services/userService.tsx";
import AdminLayout from "../../components/layout/AdminLayout.tsx";

const ClassManager = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Load dữ liệu (Lớp, Môn, Giảng viên)
  const fetchData = async () => {
    try {
      const [classRes, subRes, userRes] = await Promise.all([
        getAllClasses(),
        getSubjects(),
        getAllUsers(),
      ]);

      setClasses(classRes);
      setSubjects(subRes);
      // Lọc user để lấy danh sách Giảng viên (LECTURER)
      const lecturerList = userRes.data.filter(
        (u: any) => u.role === "LECTURER"
      );
      setLecturers(lecturerList);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await createClass({
        ...data,
        subjectId: Number(data.subjectId),
        lecturerId: Number(data.lecturerId),
      });
      alert("Tạo lớp thành công!");
      setOpen(false);
      reset();
      fetchData(); // Reload lại bảng
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <AdminLayout title="Quản Lý Lớp Học">
      {/* THANH CÔNG CỤ (Nút Tạo mới) */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Tạo Lớp Mới
        </Button>
      </Box>

      {/* BẢNG DỮ LIỆU */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Tên Lớp</TableCell>
              <TableCell>Học Kỳ</TableCell>
              <TableCell>Môn Học</TableCell>
              <TableCell>Giảng Viên</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id} hover>
                <TableCell>{cls.id}</TableCell>
                <TableCell sx={{ color: "red", fontWeight: "bold" }}>
                  {cls.name}
                </TableCell>
                <TableCell>{cls.semester}</TableCell>
                <TableCell>
                  {cls.subject
                    ? `${cls.subject.name} (${cls.subject.subjectCode})`
                    : "---"}
                </TableCell>
                <TableCell>
                  {cls.lecturer ? (
                    cls.lecturer.fullName
                  ) : (
                    <span style={{ color: "gray" }}>Chưa phân công</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {classes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 3, color: "text.secondary" }}
                >
                  Chưa có lớp học nào được tạo
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIALOG FORM TẠO LỚP */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Mở Lớp Học Mới</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="Tên lớp (VD: SE1702)"
                fullWidth
                {...register("name", { required: "Nhập tên lớp" })}
                error={!!errors.name}
              />

              <TextField
                label="Học kỳ (VD: Spring 2025)"
                fullWidth
                {...register("semester", { required: "Nhập học kỳ" })}
                error={!!errors.semester}
              />

              {/* Select Môn Học */}
              <TextField
                select
                label="Chọn Môn Học"
                fullWidth
                defaultValue=""
                inputProps={register("subjectId", { required: "Chọn môn học" })}
                error={!!errors.subjectId}
              >
                {subjects.map((sub) => (
                  <MenuItem key={sub.id} value={sub.id}>
                    {sub.subjectCode} - {sub.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Select Giảng Viên */}
              <TextField
                select
                label="Chọn Giảng Viên"
                fullWidth
                defaultValue=""
                inputProps={register("lecturerId", {
                  required: "Chọn giảng viên",
                })}
                error={!!errors.lecturerId}
              >
                {lecturers.map((lec) => (
                  <MenuItem key={lec.id} value={lec.id}>
                    {lec.fullName} ({lec.email})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AdminLayout>
  );
};

export default ClassManager;
