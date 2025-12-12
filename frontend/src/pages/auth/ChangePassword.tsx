import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Container, Typography, Box, TextField, Button, Paper, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../services/authService';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const ChangePassword = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [msg, setMsg] = useState({ type: '', content: '' });
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            setMsg({ type: 'success', content: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });

            // Tự động đăng xuất sau 2 giây
            setTimeout(() => {
                localStorage.clear();
                navigate('/login');
            }, 2000);

        } catch (error: any) {
            setMsg({ type: 'error', content: error.response?.data?.message || 'Có lỗi xảy ra!' });
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                    <VpnKeyIcon sx={{ fontSize: 50, color: '#1976d2', mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">Đổi Mật Khẩu</Typography>
                </Box>

                {msg.content && <Alert severity={msg.type as any} sx={{ mb: 2 }}>{msg.content}</Alert>}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        fullWidth label="Mật khẩu hiện tại" type="password" margin="normal"
                        {...register("currentPassword", { required: "Nhập mật khẩu cũ" })}
                        error={!!errors.currentPassword}
                        helperText={errors.currentPassword?.message as string}
                    />

                    <TextField
                        fullWidth label="Mật khẩu mới" type="password" margin="normal"
                        {...register("newPassword", {
                            required: "Nhập mật khẩu mới",
                            minLength: { value: 6, message: "Tối thiểu 6 ký tự" }
                        })}
                        error={!!errors.newPassword}
                        helperText={errors.newPassword?.message as string}
                    />

                    <TextField
                        fullWidth label="Xác nhận mật khẩu mới" type="password" margin="normal"
                        {...register("confirmPassword", {
                            required: "Nhập lại mật khẩu mới",
                            validate: (val: string) => {
                                if (watch('newPassword') != val) {
                                    return "Mật khẩu xác nhận không khớp";
                                }
                            }
                        })}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message as string}
                    />

                    <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
                        Lưu Thay Đổi
                    </Button>
                    <Button onClick={() => navigate('/home')} fullWidth sx={{ mt: 1 }}>
                        Hủy bỏ
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default ChangePassword;