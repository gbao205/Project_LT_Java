import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Grid, TextField,
    Button, Avatar, Divider, Chip, Alert, Stack, type AlertColor, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AdminLayout from '../../components/layout/AdminLayout';
// Import studentService mới
import studentService, {type Student, type StudentProfileData } from '../../services/studentService';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

const OPTIONS = {
    gender: ['Nam', 'Nữ'],
    ethnicity: ['Kinh', 'Tày', 'Thái', 'Mường', 'Khơ Me', 'Hmong', 'Nùng', 'Hoa', 'Dao', 'Khác'],
    religion: ['Không', 'Phật giáo', 'Thiên Chúa giáo (Công giáo)', 'Tin lành', 'Cao đài', 'Phật giáo Hòa Hảo', 'Hồi giáo', 'Khác'],
    nationality: ['Việt Nam', 'Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Ấn Độ', 'Indonesia', 'Thái Lan', 'Đức', 'Pháp', 'Anh', 'Ý', 'Tây Ban Nha', 'Mỹ', 'Nga', 'Khác'],
    idCardIssuePlace: [
        'Bộ Công an',
        'Cục Cảnh sát đăng ký quản lý cư trú và dữ liệu quốc gia về dân cư',
        'Cục Cảnh sát quản lý hành chính về trật tự xã hội'
    ]
};

const isEqual = (obj1: unknown, obj2: unknown): boolean => {
    const replacer = (_key: string, value: unknown) =>
        (value === null || value === undefined ? "" : value);

    return JSON.stringify(obj1, replacer) === JSON.stringify(obj2, replacer);
};

const StudentProfile: React.FC = () => {
    // State quản lý đối tượng Student thay vì UserProfile cũ
    const [student, setStudent] = useState<Student | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState<Student | null>(null);
    const [message, setMessage] = useState<{ type: AlertColor | undefined, text: string }>({
        type: undefined,
        text: ''
    });
    const hasChanges = student && formData ? !isEqual(student, formData) : false;

    // Tải dữ liệu từ Backend khi vào trang
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await studentService.getProfile();
                setStudent(data);
                setFormData(data);
            } catch (error: unknown) {
                console.error("Lỗi tải hồ sơ:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const { name, value } = e.target;

        // Xử lý cập nhật cho cấu trúc dữ liệu lồng nhau
        // 1. Nếu trường thuộc profile (Thông tin cá nhân)
        if (formData.profile && name in formData.profile) {
            setFormData({
                ...formData,
                profile: { ...formData.profile, [name as keyof StudentProfileData]: value }
            });
        }
        // 2. Nếu trường là fullName (Nằm trong user)
        else if (name === 'fullName') {
            setFormData({
                ...formData,
                user: { ...formData.user, fullName: value }
            });
        }
        // 3. Các trường học vấn nằm ở root của Student (studentId, dob, batch...)
        else {
            setFormData({ ...formData, [name as keyof Student]: value });
        }
    };

    const handleSave = async () => {
        if (!formData) return;
        try {
            // Gửi toàn bộ formData lên API updateProfile
            const updatedData = await studentService.updateProfile(formData);
            setStudent(updatedData);
            setFormData(updatedData);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
        } catch (error: unknown) {
            const err = error as ApiError;
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra';
            setMessage({ type: 'error', text: errorMessage });
        }
    };

    const formatDateDisplay = (dateString: string | undefined) => {
        if (!dateString) return '---';
        try {
            // Chuyển từ YYYY-MM-DD sang DD/MM/YYYY
            const [year, month, day] = dateString.split('-');
            if (!year || !month || !day) return dateString; // Trả về gốc nếu không đúng format
            return `${day}/${month}/${year}`;
        } catch {
            return dateString;
        }
    };

    const renderField = (label: string, name: string, type: string = 'text', readOnly: boolean = false) => {
        if (!formData || !student) return null;

        const selectFields = ['gender', 'ethnicity', 'religion', 'nationality', 'idCardIssuePlace'];
        const isSelect = selectFields.includes(name);

        // Logic lấy giá trị hiện tại để hiển thị trong TextField hoặc Typography
        let value = '';
        if (name === 'email') value = formData.user.email;
        else if (name === 'fullName') value = formData.user.fullName;
        else if (formData.profile && name in formData.profile) {
            value = (formData.profile[name as keyof StudentProfileData] as string) || '';
        } else {
            value = (formData[name as keyof Student] as string) || '';
        }

        // Lấy giá trị để hiển thị (Typography)
        let rawDisplayValue = '';
        if (name === 'email') rawDisplayValue = student.user.email;
        else if (student.profile && name in student.profile) {
            rawDisplayValue = (student.profile[name as keyof StudentProfileData] as string) || '';
        } else {
            rawDisplayValue = (student[name as keyof Student] as string) || '';
        }

        return (
            <Grid size={{ xs: 12, md: 4 }} key={name}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="subtitle1" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        {label}
                    </Typography>
                    {isEditing && !readOnly ? (
                        <TextField
                            select={isSelect}
                            fullWidth
                            name={name}
                            type={type}
                            value={value}
                            onChange={handleInputChange}
                            size="small"
                            slotProps={{
                                select: {
                                    MenuProps: {
                                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                                        transformOrigin: { vertical: 'top', horizontal: 'left' },
                                    }
                                }
                            }}
                        >
                            {isSelect && (OPTIONS[name as keyof typeof OPTIONS] || []).map((option) => (
                                <MenuItem key={option} value={option} >
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <Typography variant="body1" fontWeight="500">
                            {type === 'date' ? formatDateDisplay(rawDisplayValue) : (rawDisplayValue || '---')}
                        </Typography>
                    )}
                </Box>
            </Grid>
        );
    };

    if (!student) return null;

    return (
        <AdminLayout title="Hồ Sơ Cá Nhân">
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

                    <Box display="flex" alignItems="center" mb={4}>
                        <Avatar sx={{ width: 100, height: 100, bgcolor: '#1976d2', fontSize: '2.5rem', mr: 3 }}>
                            {student.user.fullName?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">{student.user.fullName}</Typography>
                            {/* Sử dụng mã sinh viên từ thực thể Student */}
                            <Typography color="textSecondary">MSSV: {student.studentId || 'Chưa cập nhật'}</Typography>
                            <Chip label="Sinh Viên" color="primary" sx={{ mt: 1 }} />
                        </Box>
                    </Box>

                    {/* PHẦN 1: THÔNG TIN HỌC VẤN */}
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 4 }}>
                        THÔNG TIN HỌC VẤN
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container columnSpacing={4} rowSpacing={2}>
                        {renderField('Email sinh viên', 'email', 'text', true)}
                        {renderField('Khóa học', 'batch', 'text', true)}
                        {renderField('Ngày nhập học', 'admissionDate', 'date', true)}
                        {renderField('Bậc đào tạo', 'eduLevel', 'text', true)}
                        {renderField('Loại hình đào tạo', 'trainingType', 'text', true)}
                        {renderField('Trạng thái sinh viên', 'studentStatus', 'text', true)}
                        {renderField('Khoa', 'faculty', 'text', true)}
                        {renderField('Ngành', 'major', 'text', true)}
                        {renderField('Chuyên ngành', 'specialization','text', true)}
                    </Grid>

                    {/* PHẦN 2: THÔNG TIN CÁ NHÂN */}
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 6 }}>
                        THÔNG TIN CÁ NHÂN
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                        {renderField('Ngày sinh', 'dob', 'date')}
                        {renderField('Giới tính', 'gender')}
                        {renderField('Nguyên quán', 'nativePlace')}
                        {renderField('Dân tộc', 'ethnicity')}
                        {renderField('Tôn giáo', 'religion')}
                        {renderField('Quốc tịch', 'nationality')}
                        {renderField('Ngày vào Đoàn', 'unionDate', 'date')}
                        {renderField('Ngày vào Đảng', 'partyDate', 'date')}
                        {renderField('Số điện thoại', 'phoneNumber')}
                        {renderField('Số CCCD', 'idCardNumber')}
                        {renderField('Ngày cấp', 'idCardIssueDate', 'date')}
                        {renderField('Ngày hết hạn', 'idCardExpiryDate', 'date')}
                        {renderField('Nơi cấp', 'idCardIssuePlace')}
                        {renderField('Mã BHXH/BHYT', 'insuranceCode')}
                        {renderField('Nơi sinh', 'placeOfBirth')}
                        {renderField('Quê quán', 'homeTown')}
                        {renderField('Địa chỉ thường trú', 'permanentAddress')}
                        {renderField('Địa chỉ tạm trú', 'temporaryAddress')}
                    </Grid>

                    <Box mt={6} display="flex" justifyContent="center">
                        {isEditing ? (
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CloseIcon />}
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData(student);
                                    }}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} disabled={!hasChanges}>Lưu thay đổi</Button>
                            </Stack>
                        ) : (
                            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>Cập nhật hồ sơ</Button>
                        )}
                    </Box>
                </Paper>
            </Container>
        </AdminLayout>
    );
};

export default StudentProfile;