import { Box, Typography, Paper, Chip, Avatar, IconButton, Container } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

const Header = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const config = { label: "Sinh Viên", color: "#2e7d32", bg: "#e8f5e9" };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                bgcolor: "white",
                borderBottom: "1px solid #eaeaea",
                position: "sticky",
                top: 0,
                zIndex: 1000,
            }}
        >
            <Container maxWidth="lg">
                <Box 
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.5,
                        px: 0 
                    }}
                >
                    <Box display="flex" alignItems="center"  gap={2} sx={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
                        <Box sx={{
                            width: 40, height: 40, bgcolor: config.color,
                            borderRadius: 1, display: "flex", alignItems: "center",
                            justifyContent: "center", color: "white", fontWeight: "bold",
                            }}
                        >CS</Box>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>CollabSphere</Typography>
                            <Typography variant="caption" color="text.secondary">{config.label} Workspace</Typography>
                        </Box>
                    </Box>
                
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                            <Typography variant="subtitle2" fontWeight="bold">{user.fullName}</Typography>
                            <Chip label={config.label} size="small" sx={{ bgcolor: config.bg, color: config.color, fontWeight: "bold", height: 20, fontSize: 10 }} />
                        </Box>
                        <Avatar sx={{ bgcolor: config.color }}>{user.fullName?.charAt(0)}</Avatar>
                        <IconButton size="small" onClick={handleLogout} sx={{ bgcolor: "#ffebee", color: "#d32f2f", '&:hover': { bgcolor: '#ffcdd2' } }}>
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </Container>
        </Paper>
    );
};

export default Header;