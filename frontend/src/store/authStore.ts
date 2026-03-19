import { create } from 'zustand';
import { type User, type AuthState } from '../types'; 


const parseJwt = (token: string | null): User | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: Number(payload.id || payload.sub), 
      name: payload.name || payload.username || 'User',
      email: payload.email || ''
    };
  } catch (e) {
    return null;
  }
};

const initialToken = localStorage.getItem('access_token');

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  isAuthenticated: !!initialToken,
  user: parseJwt(initialToken),
  
  login: (token: string) => {
    localStorage.setItem('access_token', token);
    set({ 
      token, 
      isAuthenticated: true, 
      user: parseJwt(token) 
    });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    set({ token: null, isAuthenticated: false, user: null });
  },
}));