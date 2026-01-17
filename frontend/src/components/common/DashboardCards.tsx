import { Card, CardContent, Box, Typography, Stack } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export const StatCard = ({ title, value, icon, color }: any) => (
    <Card
            elevation={0}
            sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid #e0e0e0",
                background: `linear-gradient(135deg, #ffffff 0%, ${color}08 100%)`,
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: `0 10px 20px ${color}30`,
                    borderColor: color,
                },
            }}
        >
            <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: "16px",
                        bgcolor: `${color}15`,
                        color: color,
                        mr: 2,
                    }}
                >
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        {value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {title}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
);

export const MenuCard = ({ title, desc, icon, color, onClick }: any) => (
    <Card
        onClick={onClick}
        elevation={0}
        sx={{
            height: "100%",
            cursor: "pointer",
            borderRadius: 3,
            border: "1px solid #f0f0f0",
            transition: "all 0.3s ease",
            "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                borderColor: color,
                "& .icon-box": { bgcolor: color, color: "white" },
            },
        }}
    >
        <CardContent
            sx={{
                p: 3,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
            }}
        >
            <Stack spacing={2}>
                <Box
                    className="icon-box"
                    sx={{
                        width: 50,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px",
                        bgcolor: `${color}15`,
                        color: color,
                        transition: "all 0.3s ease",
                    }}
                >
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ minHeight: 40 }}
                    >
                        {desc}
                    </Typography>
                </Box>
            </Stack>
            <ArrowForwardIosIcon sx={{ fontSize: 16, color: "#e0e0e0", mt: 1 }} />
        </CardContent>
    </Card>
);