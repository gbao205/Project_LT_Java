import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Avatar,
    Tooltip,
    Drawer,
    IconButton,
    Divider,
    Grid,
    CircularProgress
} from "@mui/material";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import BadgeIcon from "@mui/icons-material/Badge";

// Services
import { getAllUsers } from "../../services/userService";

// --- 1. ĐỊNH NGHĨA INTERFACE CHUẨN ---
interface StudentProfile {
    gender?: string;
    ethnicity?: string;
    religion?: string;
    phoneNumber?: string;
    nativePlace?: string;
    permanentAddress?: string;
    temporaryAddress?: string;
    idCardNumber?: string;
    idCardIssuePlace?: string;
    insuranceCode?: string;
    unionDate?: string;
}

interface StudentInfo {
    studentId?: string;
    studentStatus?: string;
    dob?: string;
    major?: string;
    specialization?: string;
    faculty?: string;
    admissionDate?: string;
    eduLevel?: string;
    batch?: string;
    trainingType?: string;
    profile?: StudentProfile;
}

interface LecturerInfo {
    cccd?: string;
    degree?: string;
    department?: string;
}

interface UserAccount {
    id: number;
    fullName: string;
    email: string;
    role: "STUDENT" | "LECTURER" | "ADMIN" | "STAFF";
    student?: StudentInfo;
    lecturer?: LecturerInfo;
}

// --- 2. COMPONENT CON & INTERFACE (Đưa lên đầu để tránh lỗi undefined) ---

interface InfoItemProps {
    icon?: React.ReactNode;
    label: string;
    // Cho phép nhiều kiểu dữ liệu hơn để tránh lỗi type
    value?: string | number | React.ReactNode | null | undefined;
    size?: number;
}

const InfoItem = ({ icon, label, value, size = 12 }: InfoItemProps) => {
    return (
        // @ts-ignore: Tắt kiểm tra type strict cho prop sm để tránh lỗi TS2769
        <Grid item xs={12} sm={size}>
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    height: "100%",
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}
            >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    {icon && icon}
                    <Typography
                        variant="caption"
                        sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: "0.65rem",
                        }}
                    >
                        {label}
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    {/* Kiểm tra nullish an toàn, hiển thị "---" nếu không có giá trị */}
                    {value ?? "---"}
                </Typography>
            </Box>
        </Grid>
    );
};

// --- 3. MAIN COMPONENT ---
const StaffUserManager = () => {
    // State
    const [activeTab, setActiveTab] = useState(0);
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Common styles
    const commonFont = { fontFamily: "'Inter', sans-serif !important" };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await getAllUsers();
                // Xử lý cả trường hợp trả về mảng hoặc object wrapping
                const userList = Array.isArray(res) ? res : (res as any).data || [];
                setUsers(userList);
            } catch (error) {
                console.error("Lỗi tải danh sách người dùng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers().catch((err) => console.error("Unhandled promise", err));
    }, []);

    // Filter users based on active Tab
    const displayedUsers = users.filter(u =>
        activeTab === 0 ? u.role === "STUDENT" : u.role === "LECTURER"
    );

    const handleOpenDetail = (user: UserAccount) => {
        setSelectedUser(user);
        setIsDrawerOpen(true);
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 10, ...commonFont }}>
            {/* HEADER BANNER */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)",
                    pt: 6,
                    pb: 10,
                    mb: 4,
                }}
            >
                <Container maxWidth="xl">
                    <Typography
                        variant="h3"
                        fontWeight="900"
                        color="white"
                        sx={{ letterSpacing: -1 }}
                    >
                        Quản Lý Thành Viên
                    </Typography>
                    <Typography color="white" sx={{ opacity: 0.85 }}>
                        Tra cứu và quản lý hồ sơ chi tiết của hệ thống
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="xl">
                <Paper
                    sx={{
                        borderRadius: 5,
                        overflow: "hidden",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                        border: "1px solid #e2e8f0",
                    }}
                >
                    {/* TABS */}
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        sx={{
                            bgcolor: "white",
                            borderBottom: 1,
                            borderColor: "divider",
                            "& .MuiTab-root": {
                                fontWeight: 800,
                                py: 2.5,
                                fontSize: "0.9rem",
                            },
                        }}
                    >
                        <Tab
                            icon={<PersonIcon />}
                            iconPosition="start"
                            label={`DANH SÁCH SINH VIÊN (${users.filter(u => u.role === "STUDENT").length})`}
                        />
                        <Tab
                            icon={<SchoolIcon />}
                            iconPosition="start"
                            label={`DANH SÁCH GIẢNG VIÊN (${users.filter(u => u.role === "LECTURER").length})`}
                        />
                    </Tabs>

                    {/* DATA TABLE */}
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        "& th": {
                                            bgcolor: "#f1f5f9",
                                            fontWeight: 800,
                                            color: "#475569",
                                        },
                                    }}
                                >
                                    <TableCell>HỌ VÀ TÊN</TableCell>
                                    <TableCell>EMAIL</TableCell>
                                    {activeTab === 0 ? (
                                        <>
                                            <TableCell>MSSV</TableCell>
                                            <TableCell>NGÀNH</TableCell>
                                            <TableCell>TRẠNG THÁI</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell>HỌC VỊ</TableCell>
                                            <TableCell>BỘ MÔN</TableCell>
                                        </>
                                    )}
                                    <TableCell align="center">THAO TÁC</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{py: 5}}>
                                            <CircularProgress />
                                            <Typography sx={{mt: 1, color: 'gray'}}>Đang tải dữ liệu...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : displayedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{py: 5, color: 'gray'}}>
                                            Không tìm thấy dữ liệu phù hợp.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayedUsers.map((user) => (
                                        <TableRow hover key={user.id}>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: activeTab === 0 ? "#10b981" : "#3b82f6",
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {activeTab === 0 ? "S" : "L"}
                                                    </Avatar>
                                                    <Typography sx={{ fontWeight: 700 }}>
                                                        {user.fullName}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: "#64748b" }}>
                                                {user.email}
                                            </TableCell>

                                            {activeTab === 0 ? (
                                                <>
                                                    <TableCell sx={{ fontWeight: 600 }}>{user.student?.studentId || "---"}</TableCell>
                                                    <TableCell>{user.student?.major || "---"}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={user.student?.studentStatus || "Đang học"}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: "#dcfce7",
                                                                color: "#166534",
                                                                fontWeight: 700,
                                                            }}
                                                        />
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>{user.lecturer?.degree || "---"}</TableCell>
                                                    <TableCell>{user.lecturer?.department || "---"}</TableCell>
                                                </>
                                            )}

                                            <TableCell align="center">
                                                <Tooltip title="Xem chi tiết hồ sơ">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => handleOpenDetail(user)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            fontWeight: 700,
                                                            bgcolor: "#9c27b0",
                                                            "&:hover": { bgcolor: "#6a1b9a" },
                                                        }}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>

            {/* --- DRAWER CHI TIẾT --- */}
            <Drawer
                anchor="right"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                // Sử dụng PaperProps để an toàn với mọi phiên bản MUI v5
                PaperProps={{
                    sx: { width: { xs: "100%", sm: 650 }, borderRadius: "20px 0 0 20px" },
                }}
            >
                {selectedUser && (
                    <Box
                        sx={{
                            ...commonFont,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Header Drawer */}
                        <Box
                            sx={{
                                background: "linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)",
                                p: 4,
                                color: "white",
                                position: "relative",
                            }}
                        >
                            <IconButton
                                onClick={() => setIsDrawerOpen(false)}
                                sx={{ position: "absolute", right: 10, top: 10, color: "white" }}
                            >
                                <CloseIcon />
                            </IconButton>
                            <Box display="flex" alignItems="center" gap={3}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: "4px solid rgba(255,255,255,0.3)",
                                        fontSize: "2rem",
                                        fontWeight: 800,
                                    }}
                                >
                                    {selectedUser.fullName.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="900">
                                        {selectedUser.fullName.toUpperCase()}
                                    </Typography>
                                    <Box display="flex" gap={1} mt={1}>
                                        <Chip
                                            label={selectedUser.role}
                                            size="small"
                                            sx={{
                                                bgcolor: "rgba(255,255,255,0.2)",
                                                color: "white",
                                                fontWeight: 700,
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Body Drawer */}
                        <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
                            {selectedUser.role === "STUDENT" ? (
                                <>
                                    {/* PHẦN 1: THÔNG TIN HỌC VẤN */}
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="800"
                                        color="#9c27b0"
                                        mb={3}
                                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                        <SchoolIcon fontSize="small" /> THÔNG TIN HỌC VẤN
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <InfoItem label="Mã số sinh viên" value={selectedUser.student?.studentId} size={6} />
                                        <InfoItem label="Khóa / Bậc" value={`${selectedUser.student?.batch || ''} - ${selectedUser.student?.eduLevel || ''}`} size={6} />
                                        <InfoItem label="Khoa" value={selectedUser.student?.faculty} size={6} />
                                        <InfoItem label="Ngành học" value={selectedUser.student?.major} size={6} />
                                        <InfoItem label="Chuyên ngành" value={selectedUser.student?.specialization} size={12} />
                                        <InfoItem label="Loại hình đào tạo" value={selectedUser.student?.trainingType} size={6} />
                                        <InfoItem label="Ngày nhập học" value={selectedUser.student?.admissionDate} size={6} />
                                    </Grid>

                                    <Divider sx={{ my: 4 }} />

                                    {/* PHẦN 2: THÔNG TIN CÁ NHÂN */}
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="800"
                                        color="#9c27b0"
                                        mb={3}
                                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                        <PersonIcon fontSize="small" /> HỒ SƠ CÁ NHÂN
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <InfoItem label="Giới tính" value={selectedUser.student?.profile?.gender} size={4} />
                                        <InfoItem label="Ngày sinh" value={selectedUser.student?.dob} size={4} />
                                        <InfoItem label="Dân tộc" value={selectedUser.student?.profile?.ethnicity} size={4} />
                                        <InfoItem label="Số điện thoại" value={selectedUser.student?.profile?.phoneNumber} size={6} />
                                        <InfoItem label="Email cá nhân" value={selectedUser.email} size={6} />
                                        <InfoItem label="Địa chỉ thường trú" value={selectedUser.student?.profile?.permanentAddress} size={12} />
                                    </Grid>

                                    <Divider sx={{ my: 4 }} />

                                    {/* PHẦN 3: ĐỊNH DANH */}
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="800"
                                        color="#9c27b0"
                                        mb={3}
                                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                        <BadgeIcon fontSize="small" /> ĐỊNH DANH
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <InfoItem label="Số CCCD" value={selectedUser.student?.profile?.idCardNumber} size={6} />
                                        <InfoItem label="Mã BHYT" value={selectedUser.student?.profile?.insuranceCode} size={6} />
                                    </Grid>
                                </>
                            ) : (
                                /* PHẦN GIẢNG VIÊN */
                                <Grid container spacing={2}>
                                    <InfoItem label="Học vị" value={selectedUser.lecturer?.degree} size={6} />
                                    <InfoItem label="Bộ môn" value={selectedUser.lecturer?.department} size={6} />
                                    <InfoItem label="Số CCCD" value={selectedUser.lecturer?.cccd} size={12} />
                                </Grid>
                            )}
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
};

export default StaffUserManager;