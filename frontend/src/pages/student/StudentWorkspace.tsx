// File: frontend/src/pages/student/StudentWorkspace.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Tabs, Tab, Paper, CircularProgress, Fab, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import ChatIcon from '@mui/icons-material/Chat';
import TaskBoard from './tabs/TaskBoard'; 
import MilestoneTab from './tabs/MilestoneTab';
import CheckpointTab from './tabs/CheckpointTab';
import ResourceTab from './tabs/ResourceTab';
import StudentLayout from '../../components/layout/StudentLayout';
import studentService from '../../services/studentService'; // Import service để lấy data
import DraggableChat from './components/DraggableChat';

const StudentWorkspace = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const [tabIndex, setTabIndex] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const { data: teamDetail, isLoading } = useQuery({
        queryKey: ['joinedTeams', teamId],  
        queryFn: async () => {
            const teams = await studentService.getAllJoinedTeams();
            return teams.find((t: any) => t.id === Number(teamId));
        },
        enabled: !!teamId, 
        staleTime: 1000 * 5,
    });

    const dynamicTitle = teamDetail 
        ? `Không gian làm việc: ${teamDetail.teamName} - ${teamDetail.classRoom?.name || 'Lớp học'}` 
        : "Không gian làm việc nhóm";

    const breadcrumbs = [
        { label: 'Danh sách nhóm', path: '/student/my-teams' }
    ];

    if (isLoading && !teamDetail) {
        return (
            <StudentLayout title="Đang tải...">
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <CircularProgress />
                </Box>
            </StudentLayout>
        );
    }

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

            {!isChatOpen && (
                <Tooltip title="Mở thảo luận nhóm" arrow placement="right">
                    <Fab 
                        color="primary" 
                        sx={{ 
                            position: 'fixed', 
                            bottom: 20, 
                            left: 20, 
                            zIndex: 2000 
                        }} 
                        onClick={() => setIsChatOpen(true)}
                    >
                        <ChatIcon />
                    </Fab>
                </Tooltip>
            )}

            {teamId && (
                <DraggableChat 
                    teamId={Number(teamId)} 
                    isVisible={isChatOpen} 
                    onClose={() => setIsChatOpen(false)} 
                />
            )}
        </StudentLayout>
    );
};

export default StudentWorkspace;