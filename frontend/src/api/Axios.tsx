import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: 'localhost:5000',
});

const accessToken = localStorage.getItem('accessToken');
if (accessToken) {
    api.defaults.headers.common['x-access-token'] = accessToken;
}

export default api;
