import { ReactNode } from 'react';
import { Container, Box, Typography, IconButton, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
    title: string;          // Tiêu đề trang (VD: Quản Lý Người Dùng)
    children: ReactNode;    // Nội dung riêng của từng trang
    showBack?: boolean;     // Có hiện nút back không? (Mặc định là có)
    backPath?: string;      // Back về đâu? (Mặc định về /home)
}

const AdminLayout = ({ title, children, showBack = true, backPath = '/home' }: AdminLayoutProps) => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* HEADER CHUNG */}
            <Box display="flex" alignItems="center" gap={1} mb={3}>
                {showBack && (
                    <IconButton onClick={() => navigate(backPath)} color="primary">
                        <ArrowBackIcon />
                    </IconButton>
                )}
                <Typography variant="h5" fontWeight="bold" color="primary">
                    {title}
                </Typography>
            </Box>

            {/* NỘI DUNG RIÊNG CỦA TỪNG TRANG */}
            <Box>
                {children}
            </Box>
        </Container>
    );
};

export default AdminLayout;