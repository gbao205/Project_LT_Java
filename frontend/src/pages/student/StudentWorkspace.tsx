// File: frontend/src/pages/student/StudentWorkspace.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Tabs, Tab, Paper, CircularProgress } from '@mui/material';
import TaskBoard from './tabs/TaskBoard'; 
import MilestoneTab from './tabs/MilestoneTab';
import CheckpointTab from './tabs/CheckpointTab';
import ResourceTab from './tabs/ResourceTab';
import StudentLayout from '../../components/layout/StudentLayout';
import studentService from '../../services/studentService'; // Import service để lấy data

const StudentWorkspace = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const [tabIndex, setTabIndex] = useState(0);
    const [teamDetail, setTeamDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeamDetail = async () => {
            try {
                // Lấy danh sách các nhóm sinh viên đã tham gia
                const teams = await studentService.getAllJoinedTeams();
                // Tìm nhóm cụ thể khớp với ID trên URL
                const currentTeam = teams.find((t: any) => t.id === Number(teamId));
                setTeamDetail(currentTeam);
            } catch (error) {
                console.error("Không thể lấy thông tin nhóm:", error);
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTeamDetail();
        }
    }, [teamId]);

    const dynamicTitle = teamDetail 
        ? `Không gian làm việc: ${teamDetail.teamName} - ${teamDetail.classRoom?.name || 'Lớp học'}` 
        : "Không gian làm việc nhóm";

    if (loading) {
        return (
            <StudentLayout title="Đang tải...">
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <CircularProgress />
                </Box>
            </StudentLayout>
        );
    }

    const breadcrumbs = [
        { label: 'Danh sách nhóm', path: '/student/my-teams' }
    ];

    return (
        <StudentLayout title={dynamicTitle} breadcrumbs={breadcrumbs}>
            <Paper sx={{ mb: 2, borderRadius: 2 }}>
                <Tabs 
                    value={tabIndex} 
                    onChange={(_, v) => setTabIndex(v)} 
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Công việc (Tasks)" />
                    <Tab label="Cột mốc (Milestones)" />
                    <Tab label="Điểm kiểm tra" />
                    <Tab label="Tài liệu" />
                </Tabs>
            </Paper>

            <Box>
                {/* Truyền teamId xuống các component con để xử lý dữ liệu đúng nhóm */}
                {tabIndex === 0 && <TaskBoard teamId={Number(teamId)} />}
                {tabIndex === 1 && <MilestoneTab teamId={Number(teamId)} />}
                {tabIndex === 2 && <CheckpointTab teamId={Number(teamId)} />}
                {tabIndex === 3 && <ResourceTab teamId={Number(teamId)} />}
            </Box>
        </StudentLayout>
    );
};

export default StudentWorkspace;