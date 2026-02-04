import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

console.log('[Auth API] Base URL:', API_BASE_URL);

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// 创建专用axios实例
const authAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 登录
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  console.log('[Auth API] Login request:', { username: data.username });
  try {
    const response = await authAxios.post('/auth/login', data);
    console.log('[Auth API] Login success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Auth API] Login error:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('[Auth API] Error response:', axiosError.response.data);
      console.error('[Auth API] Error status:', axiosError.response.status);
    }
    throw error;
  }
};

// 注册
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  console.log('[Auth API] Register request:', { username: data.username });
  try {
    const response = await authAxios.post('/auth/register', data);
    console.log('[Auth API] Register success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Auth API] Register error:', error);
    throw error;
  }
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<{ user: any }> => {
  const token = localStorage.getItem('token');
  const response = await authAxios.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// 修改密码
export const changePassword = async (data: ChangePasswordRequest): Promise<{ message: string }> => {
  const token = localStorage.getItem('token');
  const response = await authAxios.post('/auth/change-password', data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// 设置 axios 默认请求头
export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
    delete authAxios.defaults.headers.common['Authorization'];
  }
};

// 测试API连接
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await authAxios.get('/test');
    console.log('[Auth API] Test connection success:', response.data);
    return true;
  } catch (error) {
    console.error('[Auth API] Test connection failed:', error);
    return false;
  }
};

// 导出 authApi 对象供 store 使用
export const authApi = {
  login,
  register,
  getCurrentUser,
  changePassword,
  setAuthToken,
  testApiConnection
};

export default authApi;
