import api from './index';

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

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<{ user: any }> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<{ message: string }> => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const testApiConnection = async (): Promise<boolean> => {
  try {
    await api.get('/test');
    return true;
  } catch {
    return false;
  }
};

export const authApi = {
  login,
  register,
  getCurrentUser,
  changePassword,
  setAuthToken,
  testApiConnection
};

export default authApi;
