// frontend/src/components/layout/StudentLayout.tsx
import type { ReactNode } from 'react'; // Sửa lỗi: thêm 'type' ở đây
import { Container, Box, Typography, Breadcrumbs, Link, Paper } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

interface BreadcrumbItem {
    label: string;
    path: string;
}

interface StudentLayoutProps {
    title: string;
    children: ReactNode;
    backPath?: string;
    showBack?: boolean;
    breadcrumbs?: BreadcrumbItem[];
}
const StudentLayout = ({ 
    title, 
    children,
    breadcrumbs = []
}: StudentLayoutProps) => {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#e8f5e9' }}>
            <Header />

            <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
                <Box 
                    sx={{ 
                        position: 'sticky', 
                        top: '72px',
                        zIndex: 99,
                        pt: 1,        
                        pb: 2,        
                        mb: 1         
                    }}
                >
                    <Breadcrumbs 
                        separator={<NavigateNextIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />} 
                        sx={{ 
                            mb: 1,
                            '& .MuiBreadcrumbs-li': {
                                display: 'flex',
                                alignItems: 'center'
                            }
                        }}
                    >
                        <Link 
                            underline="none" 
                            color="text.secondary" 
                            sx={{ 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                fontSize: '0.85rem',
                                transition: 'color 0.2s',
                                '&:hover': { color: '#2e7d32' }
                            }} 
                            onClick={() => navigate('/home')}
                        >
                            <HomeIcon sx={{ fontSize: '1.1rem' }} />
                            Trang chủ
                        </Link>

                        {breadcrumbs.map((item, index) => (
                            <Link
                                key={index}
                                underline="none"
                                color="text.secondary"
                                sx={{ 
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    transition: 'color 0.2s',
                                    '&:hover': { color: '#2e7d32' }
                                }}
                                onClick={() => navigate(item.path)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        
                        <Typography 
                            sx={{ 
                                cursor: 'default',
                                fontWeight: 700,           
                                fontSize: '1.1rem',       
                                color: '#2e7d32',    
                                letterSpacing: '-0.01em',
                                lineHeight: 1.2
                            }}
                        >
                            {title}
                        </Typography>
                    </Breadcrumbs>
                </Box>

                <Box>
                    {children}
                </Box>
            </Container>
        </Box>
    );
};

export default StudentLayout;