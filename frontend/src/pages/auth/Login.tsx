import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    TextField, Button, Typography, Paper, Box, Alert,
    CssBaseline, Avatar, Link, InputAdornment, IconButton,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Services
import { loginUser, type LoginRequest } from '../../services/authService';
import api from '../../services/api';

// Icons
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LockResetIcon from '@mui/icons-material/LockReset';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';      
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const BACKGROUND_URL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
    const [loginError, setLoginError] = useState<string>('');
    const navigate = useNavigate();

    // State logic
    const [supportEmail, setSupportEmail] = useState("admin@collabsphere.edu.vn");
    const [openForgot, setOpenForgot] = useState(false);

    // State hiển thị mật khẩu
    const [showPassword, setShowPassword] = useState(false);

    // Load Config
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/configs');
                if (res.data?.SUPPORT_EMAIL) {
                    setSupportEmail(res.data.SUPPORT_EMAIL);
                }
            } catch (err) {
                console.warn("Dùng email hỗ trợ mặc định.");
            }
        };
        fetchConfig();
    }, []);

    const onSubmit = async (data: LoginRequest) => {
        setLoginError('');
        try {
            const response = await loginUser(data);
            localStorage.setItem('user', JSON.stringify(response));
            localStorage.setItem('token', response.token);
            navigate('/home');
        } catch (error: any) {
            const message = (error as any).response?.data?.message || "Đăng nhập thất bại!";
            setLoginError(message);
        }
    };

    const handleSupport = () => {
        const subject = encodeURIComponent("[CollabSphere] Yêu cầu hỗ trợ kỹ thuật");
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}&su=${subject}`;
        window.open(gmailUrl, '_blank');
    };

    return (
        <Box
            component="main"
            sx={{
                height: '100vh', width: '100vw',
                backgroundImage: `url(${BACKGROUND_URL})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                '&::before': {
                    content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(3px)',
                }
            }}
        >
            <CssBaseline />

            <Paper
                elevation={24}
                sx={{
                    position: 'relative', zIndex: 2, padding: '40px 50px',
                    width: '500px', borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': { transform: 'scale(1.01)' }
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: '#1976d2', width: 70, height: 70, boxShadow: '0px 4px 10px rgba(25, 118, 210, 0.4)' }}>
                    <LockOutlinedIcon fontSize="large" />
                </Avatar>

                <Typography component="h1" variant="h4" sx={{ fontWeight: '800', mt: 2, color: '#1a237e' }}>
                    COLLAB SPHERE
                </Typography>

                <Typography variant="body1" sx={{ mb: -1, color: '#555', fontStyle: 'italic', textAlign: 'center' }}>
                    Hệ thống hỗ trợ việc học theo phương pháp Project-Based Learning (PBL)
                </Typography>

                {loginError && (
                    <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
                        {loginError}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal" fullWidth id="email" label="Địa chỉ Email" placeholder="@gmail.com" autoComplete="email" autoFocus
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><EmailOutlinedIcon color="action" /></InputAdornment>),
                        }}
                        sx={{ mb: 3 }}
                        {...register("email", {
                            required: "Vui lòng nhập Email",
                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email không đúng định dạng" }
                        })}
                        error={!!errors.email} helperText={errors.email?.message}
                    />

                    {/* Thêm nút xem mật khẩu */}
                    <TextField
                        margin="normal" fullWidth label="Mật khẩu" id="password" placeholder="••••••" autoComplete="current-password"

                        // 1. Loại input thay đổi theo state showPassword
                        type={showPassword ? "text" : "password"}

                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><VpnKeyOutlinedIcon color="action" /></InputAdornment>),

                            // 2. Thêm nút bấm vào cuối ô input
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{ mb: 4 }}
                        {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                        error={!!errors.password} helperText={errors.password?.message}
                    />

                    <Button
                        type="submit" fullWidth variant="contained" size="large"
                        sx={{
                            py: 1.8, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '50px', textTransform: 'none',
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                            '&:hover': { background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)', boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .4)' }
                        }}
                    >
                        Đăng Nhập Hệ Thống
                    </Button>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Link
                            component="button" type="button" variant="body2"
                            onClick={() => setOpenForgot(true)}
                            sx={{ textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, color: '#1976d2' }}
                        >
                            <LockResetIcon fontSize="small" /> Quên mật khẩu?
                        </Link>
                        <Link
                            component="button" type="button" variant="body2"
                            onClick={handleSupport}
                            sx={{ textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, color: '#ed6c02' }}
                        >
                            <ContactSupportIcon fontSize="small" /> Hỗ trợ kỹ thuật
                        </Link>
                    </Box>
                </Box>
            </Paper>

            <Dialog open={openForgot} onClose={() => setOpenForgot(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 'bold' }}>
                    <LockResetIcon /> Cấp Lại Mật Khẩu
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#333' }}>
                        Vui lòng liên hệ <b>Phòng Đào Tạo</b> hoặc gửi email yêu cầu cấp lại mật khẩu tới:
                    </DialogContentText>
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center', border: '1px dashed #999' }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                            {supportEmail}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenForgot(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Đóng</Button>
                    <Button onClick={handleSupport} variant="contained" startIcon={<GoogleIcon />} sx={{ fontWeight: 'bold', bgcolor: '#db4437' }}>
                        Mở Gmail
                    </Button>
                </DialogActions>
            </Dialog>

            <Typography variant="caption" sx={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
                © Lap trinh Java
            </Typography>
        </Box>
    );
};

export default Login;
