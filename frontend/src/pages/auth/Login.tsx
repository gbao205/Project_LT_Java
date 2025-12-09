import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Container, TextField, Button, Typography, Paper, Box, Alert
} from '@mui/material';
import { loginUser, type LoginRequest } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
    const [loginError, setLoginError] = useState<string>('');
    const navigate = useNavigate(); // Dùng để chuyển trang

    const onSubmit = async (data: LoginRequest) => {
        setLoginError(''); // Reset lỗi cũ
        try {
            await loginUser(data);
            // Đăng nhập thành công -> Chuyển hướng sang trang quản lý môn học
            navigate('/admin/subjects');
        } catch (error: any) {
            // Xử lý lỗi từ Backend trả về
            setLoginError("Đăng nhập thất bại! Vui lòng kiểm tra Email hoặc Mật khẩu.");
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Đăng Nhập
                </Typography>

                {loginError && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{loginError}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Email Address"
                        autoComplete="email"
                        autoFocus
                        {...register("email", {
                            required: "Email không được để trống",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Email không đúng định dạng"
                            }
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        {...register("password", { required: "Mật khẩu không được để trống" })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
                    >
                        Đăng Nhập
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;