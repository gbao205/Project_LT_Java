// src/context/ConfirmContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

interface ConfirmOptions {
    title: string;
    message: string | React.ReactNode;
    onConfirm: () => void;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);

    const confirm = useCallback((opt: ConfirmOptions) => {
        setOptions(opt);
        setOpen(true);
    }, []);

    const handleClose = () => setOpen(false);

    const handleConfirm = () => {
        if (options?.onConfirm) options.onConfirm();
        setOpen(false);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {options?.title}
                </DialogTitle>
                <DialogContent>
                    <Typography>{options?.message}</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} variant="outlined">Hủy bỏ</Button>
                    <Button onClick={handleConfirm} variant="contained" color="error" autoFocus>
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
    return context;
};