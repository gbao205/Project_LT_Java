import { Card, CardContent, Box, Typography } from '@mui/material';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => (
    <Card elevation={0} sx={{
        height: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: `${color}40`,
        background: `linear-gradient(135deg, #ffffff 60%, ${color}10 100%)`,
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 10px 20px ${color}30`,
            borderColor: color
        }
    }}>
        <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: color }}>
                    {value}
                </Typography>
                {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </Box>

            <Box sx={{
                width: 56, height: 56, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: `${color}15`, color: color,
                boxShadow: `0 4px 10px ${color}40`
            }}>
                {icon}
            </Box>
        </CardContent>
    </Card>
);

export default StatCard;