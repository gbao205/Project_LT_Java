// src/hooks/useAppSnackbar.ts
import { useSnackbarContext } from '../context/SnackbarContext';

export const useAppSnackbar = () => {
    const { showSnackbar } = useSnackbarContext();

    return {
        showSuccess: (msg: string) => showSnackbar(msg, 'success'),
        showError: (msg: string) => showSnackbar(msg, 'error'),
        showInfo: (msg: string) => showSnackbar(msg, 'info'),
        showWarning: (msg: string) => showSnackbar(msg, 'warning'),
    };
};