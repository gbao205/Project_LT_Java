import api from './api';

export const getSystemConfigs = async () => {
    return api.get('/configs');
};

export const saveSystemConfigs = async (configs: any) => {
    return api.post('/configs', configs);
};