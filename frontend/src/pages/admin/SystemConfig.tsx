import { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, Switch, FormControlLabel, TextField, Button, Grid, Divider, Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import AdminLayout from '../../components/layout/AdminLayout';
import { getSystemConfigs, saveSystemConfigs } from '../../services/systemService';

const SystemConfig = () => {
    // State lưu giá trị cấu hình
    const [configs, setConfigs] = useState({
        MAINTENANCE_MODE: "false",
        ALLOW_REGISTRATION: "true",
        CURRENT_SEMESTER: "Spring 2025",
        SUPPORT_EMAIL: "support@cosre.edu.vn"
    });

    // Load cấu hình khi vào trang
    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const res = await getSystemConfigs();
                // Merge dữ liệu từ server vào state mặc định
                setConfigs(prev => ({ ...prev, ...res.data }));
            } catch (error) {
                console.error("Lỗi tải cấu hình", error);
            }
        };
        fetchConfigs();
    }, []);

    // Xử lý thay đổi input/switch
    const handleChange = (key: string, value: string) => {
        setConfigs(prev => ({ ...prev, [key]: value }));
    };

    // Lưu cấu hình
    const handleSave = async () => {
        try {
            await saveSystemConfigs(configs);
            alert("Lưu cấu hình thành công!");
        } catch (error) {
            alert("Lỗi khi lưu!");
        }
    };

    return (
        <AdminLayout title="Cấu Hình Hệ Thống">

            <Box mb={3}>
                <Alert severity="info">
                    Các thiết lập tại đây sẽ ảnh hưởng toàn bộ hệ thống. Vui lòng cân nhắc trước khi thay đổi.
                </Alert>
            </Box>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                    <SettingsSuggestIcon color="primary" /> Thiết Lập Chung
                </Typography>

                <Grid container spacing={4}>
                    {/* Cột 1: Các nút gạt (Switch) */}
                    <Grid xs={12} md={6}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={configs.MAINTENANCE_MODE === "true"}
                                        onChange={(e) => handleChange("MAINTENANCE_MODE", String(e.target.checked))}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography fontWeight="bold">Chế độ bảo trì</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Chỉ cho phép Admin đăng nhập. Sinh viên và GV sẽ bị chặn.
                                        </Typography>
                                    </Box>
                                }
                            />

                            <Divider />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={configs.ALLOW_REGISTRATION === "true"}
                                        onChange={(e) => handleChange("ALLOW_REGISTRATION", String(e.target.checked))}
                                        color="success"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography fontWeight="bold">Cho phép đăng ký tự do</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Hiển thị nút "Đăng ký" ở trang Login.
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Box>
                    </Grid>

                    {/* Cột 2: Các ô nhập liệu (Input) */}
                    <Grid xs={12} md={6}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            <TextField
                                label="Niên khóa / Học kỳ hiện tại"
                                value={configs.CURRENT_SEMESTER}
                                onChange={(e) => handleChange("CURRENT_SEMESTER", e.target.value)}
                                fullWidth
                                helperText="Sẽ được dùng làm mặc định khi mở lớp mới."
                            />

                            <TextField
                                label="Email hỗ trợ kỹ thuật"
                                value={configs.SUPPORT_EMAIL}
                                onChange={(e) => handleChange("SUPPORT_EMAIL", e.target.value)}
                                fullWidth
                                placeholder="admin@domain.com"
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Box mt={5} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}
                    >
                        Lưu Thay Đổi
                    </Button>
                </Box>
            </Paper>
        </AdminLayout>
    );
};

export default SystemConfig;