import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Dialog, Box, IconButton, Tooltip, Button, AppBar, Toolbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // Icon thoát đẹp hơn Block
import { Client } from '@stomp/stompjs';

interface WhiteboardWindowProps {
    open: boolean;
    onClose: () => void;      // Đóng tạm thời (ẩn)
    onEndSession: () => void; // [MỚI] Kết thúc phiên (ngắt kết nối cả 2)
    myEmail: string;
    targetEmail: string;
    stompClient: Client | null;
    incomingAction?: any;
}

const WhiteboardWindow = ({
                              open, onClose, onEndSession, myEmail, targetEmail, stompClient, incomingAction
                          }: WhiteboardWindowProps) => {

    const [lines, setLines] = useState<any[]>([]);
    const isDrawing = useRef(false);
    const [color, setColor] = useState('#df4b26');
    const [strokeWidth, setStrokeWidth] = useState(5);

    // 1. Xử lý khi nhận được action từ người kia
    // Lưu ý: Tín hiệu 'EXIT' được xử lý ở ChatWidget (cha) để đóng cửa sổ,
    // nên ở đây chỉ cần xử lý DRAW và CLEAR.
    useEffect(() => {
        if (!incomingAction) return;

        if (incomingAction.type === 'DRAW') {
            const newLine = {
                tool: 'pen',
                points: incomingAction.points,
                color: incomingAction.color,
                strokeWidth: incomingAction.strokeWidth
            };
            setLines(prev => [...prev, newLine]);
        } else if (incomingAction.type === 'CLEAR') {
            setLines([]);
        }
    }, [incomingAction]);

    // 2. Hàm gửi action chung (Vẽ/Xóa)
    const sendDrawAction = (type: string, points: number[] = [], colorStr: string = "") => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: "/app/whiteboard.draw",
                body: JSON.stringify({
                    type: type,
                    sender: myEmail,
                    recipient: targetEmail,
                    points: points,
                    color: colorStr,
                    strokeWidth: strokeWidth
                })
            });
        }
    };

    // 3. Xử lý vẽ hình (Konva)
    const handleMouseDown = (e: any) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        setLines([...lines, { tool: 'pen', points: [pos.x, pos.y], color, strokeWidth }]);
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing.current) return;
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        let lastLine = lines[lines.length - 1];
        // Thêm điểm mới vào đường vẽ hiện tại
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        // Cập nhật state (thay thế line cuối cùng)
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
        const lastLine = lines[lines.length - 1];
        // Chỉ gửi đi khi nhả chuột
        if (lastLine) {
            sendDrawAction("DRAW", lastLine.points, lastLine.color);
        }
    };

    const handleClear = () => {
        setLines([]);
        sendDrawAction("CLEAR");
    };

    // 4. Xử lý nút Kết thúc phiên
    const handleEndClick = () => {
        if (window.confirm("Bạn muốn kết thúc phiên vẽ cho cả hai bên?")) {
            onEndSession(); // Gọi hàm từ ChatWidget truyền xuống
        }
    };

    return (
        <Dialog fullScreen open={open} onClose={onClose}>
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f0f0f0' }}>

                {/* --- TOOLBAR --- */}
                <AppBar position="static" color="default" elevation={1}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
                            Bảng Trắng: {targetEmail}
                        </Typography>

                        <Box display="flex" gap={2} alignItems="center">
                            {/* Chọn màu */}
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }}
                            />

                            {/* Nút Xóa */}
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={handleClear}
                                startIcon={<DeleteIcon />}
                            >
                                Xóa bảng
                            </Button>

                            {/* Nút Kết thúc (Quan trọng) */}
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleEndClick}
                                startIcon={<ExitToAppIcon />}
                            >
                                Kết thúc
                            </Button>

                            {/* Nút Đóng tạm (Chỉ ẩn) */}
                            <Tooltip title="Ẩn cửa sổ (Vẫn giữ kết nối)">
                                <IconButton onClick={onClose}>
                                    <CloseIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* --- CANVAS AREA --- */}
                <Box sx={{ flexGrow: 1, cursor: 'crosshair', overflow: 'hidden', bgcolor: 'white' }}>
                    <Stage
                        width={window.innerWidth}
                        height={window.innerHeight}
                        onMouseDown={handleMouseDown}
                        onMousemove={handleMouseMove}
                        onMouseup={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                    >
                        <Layer>
                            {lines.map((line, i) => (
                                <Line
                                    key={i}
                                    points={line.points}
                                    stroke={line.color}
                                    strokeWidth={line.strokeWidth}
                                    tension={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                            ))}
                        </Layer>
                    </Stage>
                </Box>
            </Box>
        </Dialog>
    );
};

export default WhiteboardWindow;