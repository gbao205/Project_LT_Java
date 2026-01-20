import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Dialog, Box, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create'; // Bút
import { Client } from '@stomp/stompjs';

interface WhiteboardProps {
    open: boolean;
    onClose: () => void;
    myEmail: string;
    targetEmail: string;
    stompClient: Client | null;
    incomingAction?: any; // Nét vẽ nhận được từ WebSocket
}

const WhiteboardWindow = ({ open, onClose, myEmail, targetEmail, stompClient, incomingAction }: WhiteboardProps) => {
    const [lines, setLines] = useState<any[]>([]); // Lưu danh sách các nét vẽ
    const isDrawing = useRef(false);
    const [color, setColor] = useState('#df4b26');
    const [strokeWidth, setStrokeWidth] = useState(5);

    // 1. Xử lý khi nhận được nét vẽ từ người kia (thông qua props từ ChatWidget)
    useEffect(() => {
        if (incomingAction && incomingAction.type === 'DRAW') {
            const newLine = {
                tool: 'pen',
                points: incomingAction.points,
                color: incomingAction.color,
                strokeWidth: incomingAction.strokeWidth
            };
            setLines(prev => [...prev, newLine]);
        } else if (incomingAction && incomingAction.type === 'CLEAR') {
            setLines([]);
        }
    }, [incomingAction]);

    // 2. Gửi nét vẽ đi
    const sendDrawAction = (type: string, points: number[], colorStr: string) => {
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

    const handleMouseDown = (e: any) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        // Tạo nét vẽ mới
        setLines([...lines, { tool: 'pen', points: [pos.x, pos.y], color, strokeWidth }]);
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing.current) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        // Cập nhật nét vẽ cuối cùng
        let lastLine = lines[lines.length - 1];
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        // Update state để render local
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
        // Khi nhả chuột mới gửi toàn bộ nét vẽ đi (để tối ưu performance thay vì gửi liên tục)
        const lastLine = lines[lines.length - 1];
        if (lastLine) {
            sendDrawAction("DRAW", lastLine.points, lastLine.color);
        }
    };

    const handleClear = () => {
        setLines([]);
        sendDrawAction("CLEAR", [], "");
    };

    return (
        <Dialog fullScreen open={open} onClose={onClose}>
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f0f0f0' }}>

                {/* TOOLBAR */}
                <Box sx={{ p: 1, bgcolor: 'white', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" gap={2}>
                        <CreateIcon color="primary" />
                        <span style={{fontWeight: 'bold'}}>Bảng Trắng Tương Tác</span>

                        {/* Chọn màu */}
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

                        <Tooltip title="Xóa tất cả">
                            <IconButton onClick={handleClear} size="small" color="error">
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* CANVAS AREA */}
                <Box sx={{ flexGrow: 1, cursor: 'crosshair', overflow: 'hidden' }}>
                    <Stage
                        width={window.innerWidth}
                        height={window.innerHeight}
                        onMouseDown={handleMouseDown}
                        onMousemove={handleMouseMove}
                        onMouseup={handleMouseUp}
                        onTouchStart={handleMouseDown} // Hỗ trợ cảm ứng
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