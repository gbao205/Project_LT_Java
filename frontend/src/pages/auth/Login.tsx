import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    TextField, Button, Typography, Paper, Box, Alert,
    CssBaseline, Avatar, Link, InputAdornment
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { loginUser, type LoginRequest } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const BACKGROUND_URL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
    const [loginError, setLoginError] = useState<string>('');
    const navigate = useNavigate();

    const onSubmit = async (data: LoginRequest) => {
        setLoginError('');
        try {
            await loginUser(data);
            navigate('/admin/subjects');
        } catch (error: any) {
            setLoginError("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
        }
    };

    return (
        <Box
            component="main"
            sx={{
                height: '100vh',
                width: '100vw',
                backgroundImage: `url(${BACKGROUND_URL})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Lớp phủ màu tối để làm nổi bật form
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Mờ đen 40%
                    backdropFilter: 'blur(3px)', // Làm mờ nhẹ background
                }
            }}
        >
            <CssBaseline />

            {/* CARD ĐĂNG NHẬP */}
            <Paper
                elevation={24} // Đổ bóng sâu tạo chiều nổi 3D
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    padding: '40px 50px',
                    width: '500px', // Kích thước cố định, rộng rãi cho Web
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Trắng đục 90%
                    backdropFilter: 'blur(20px)', // Hiệu ứng kính mờ
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.02)' // Hiệu ứng phóng to nhẹ khi di chuột vào
                    }
                }}
            >
                {/* Logo / Icon */}
                <Avatar
                    sx={{
                        m: 1,
                        bgcolor: '#1976d2',
                        width: 70,
                        height: 70,
                        boxShadow: '0px 4px 10px rgba(25, 118, 210, 0.4)'
                    }}
                >
                    <LockOutlinedIcon fontSize="large" />
                </Avatar>

                <Typography component="h1" variant="h4" sx={{ fontWeight: '800', mt: 2, color: '#1a237e' }}>
                    COLLAB SPHERE
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 4, color: '#555', fontStyle: 'italic' }}>
                    Hệ thống quản lý đồ án chuyên nghiệp
                </Typography>

                {loginError && (
                    <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
                        {loginError}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
                    {/* Input Email với Icon */}
                    <TextField
                        margin="normal"
                        fullWidth
                        id="email"
                        label="Địa chỉ Email"
                        placeholder="@gmail.com"
                        autoComplete="email"
                        autoFocus
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailOutlinedIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }} // Khoảng cách rộng rãi
                        {...register("email", {
                            required: "Vui lòng nhập Email",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Email không đúng định dạng"
                            }
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />

                    {/* Input Password với Icon */}
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Mật khẩu"
                        type="password"
                        id="password"
                        placeholder="••••••"
                        autoComplete="current-password"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <VpnKeyOutlinedIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 4 }}
                        {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />

                    {/* Nút Submit Gradient */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                            py: 1.8,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: '50px', // Bo tròn nút kiểu hiện đại
                            textTransform: 'none',
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', // Màu Gradient xanh công nghệ
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                                boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .4)',
                            }
                        }}
                    >
                        Đăng Nhập Hệ Thống
                    </Button>

                    {/* Footer Links */}
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Link href="#" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500 }}>
                            Quên mật khẩu?
                        </Link>
                        <Link href="#" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500 }}>
                            Hỗ trợ kỹ thuật
                        </Link>
                    </Box>
                </Box>
            </Paper>

            {/* Footer bản quyền cố định dưới đáy */}
            <Typography 
                variant="caption" 
                sx={{ 
                    position: 'absolute', 
                    bottom: 20, 
                    color: 'rgba(255,255,255,0.7)',
                    letterSpacing: 1
                }}
            >
                © Lap trinh Java
            </Typography>
        </Box>
    );
};

export default Login;