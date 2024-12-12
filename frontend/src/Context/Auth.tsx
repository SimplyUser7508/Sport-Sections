import { createContext, useState, Dispatch, SetStateAction, FC, ReactNode, useEffect, useCallback } from "react";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import Cookies from 'js-cookie';
import api from "../api/Axios";

// Интерфейсы и контексты
interface AuthContextType {
    auth: AuthState;
    setAuth: Dispatch<SetStateAction<AuthState>>;
    api: AxiosInstance;
}

interface AuthState {
    email?: string;
    accessToken?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    const [auth, setAuth] = useState<AuthState>({ accessToken: null });

    const refreshAccessToken = useCallback(async (): Promise<string | null> => {
        try {
            const refreshToken = Cookies.get('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post('/auth/issueTokens', { refreshToken }, {
                withCredentials: true
            });

            const { 'accessToken': accessToken, 'refreshToken': newRefreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            Cookies.set('refreshToken', newRefreshToken);

            setAuth({ ...auth, accessToken });
            return accessToken;
        } catch (error) {
            console.error("Failed to refresh access token", error);
            setAuth({ ...auth, accessToken: null });
            return null;
        }
    }, [auth]);

    api.interceptors.response.use(
        (response: AxiosResponse): AxiosResponse => response,
        async (error: AxiosError): Promise<AxiosResponse | Promise<never>> => {
            const originalRequest: (AxiosRequestConfig & { _retry?: boolean }) | undefined = error.config;

            if (!originalRequest) {
                return Promise.reject(error);
            }

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const newAccessToken = await refreshAccessToken();
                    if (!newAccessToken) {
                        throw new Error('Failed to refresh access token');
                    }
                    api.defaults.headers.common['Authorization'] = newAccessToken;
                    originalRequest.headers = { ...originalRequest.headers, 'Authorization': newAccessToken };
                    return api(originalRequest);
                } catch (err) {
                    console.error('Failed to refresh access token', err);
                }
            }
            return Promise.reject(error);
        }
    );

    return (
        <AuthContext.Provider value={{ auth, setAuth, api }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
