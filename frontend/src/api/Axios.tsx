import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: '/api',
});

const accessToken = localStorage.getItem('accessToken');
if (accessToken) {
    api.defaults.headers.common['Authorization'] = accessToken;
}

export default api;
