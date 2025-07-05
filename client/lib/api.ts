import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wishshare.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: { email: string; password: string; displayName: string }) => {
    console.log('📡 authAPI.signup called with:', { ...data, password: '***' });
    console.log('🌐 API_URL:', API_URL);
    console.log('🎯 Full URL will be:', `${API_URL}/api/auth/signup`);
    return api.post('/auth/signup', data);
  },
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  me: () => api.get('/auth/me'),
};

// Wishlists API
export const wishlistsAPI = {
  getAll: () => api.get('/wishlists'),
  
  getById: (id: string) => api.get(`/wishlists/${id}`),
  
  create: (data: { name: string; description?: string; isPublic?: boolean; color?: string }) =>
    api.post('/wishlists', data),
  
  update: (id: string, data: { name?: string; description?: string; isPublic?: boolean; color?: string }) =>
    api.put(`/wishlists/${id}`, data),
  
  delete: (id: string) => api.delete(`/wishlists/${id}`),
  
  invite: (id: string, email: string) =>
    api.post(`/wishlists/${id}/invite`, { email }),
};

// Items API
export const itemsAPI = {
  getAll: (wishlistId: string) => api.get(`/wishlists/${wishlistId}/items`),
  
  create: (wishlistId: string, data: {
    name: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    url?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => api.post(`/wishlists/${wishlistId}/items`, data),
  
  update: (wishlistId: string, itemId: string, data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    url?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'available' | 'claimed' | 'purchased';
  }) => api.put(`/wishlists/${wishlistId}/items/${itemId}`, data),
  
  delete: (wishlistId: string, itemId: string) =>
    api.delete(`/wishlists/${wishlistId}/items/${itemId}`),
  
  claim: (wishlistId: string, itemId: string) =>
    api.post(`/wishlists/${wishlistId}/items/${itemId}/claim`),

  // Comments API
  addComment: (wishlistId: string, itemId: string, data: { text: string }) =>
    api.post(`/wishlists/${wishlistId}/items/${itemId}/comments`, data),

  deleteComment: (wishlistId: string, itemId: string, commentId: string) =>
    api.delete(`/wishlists/${wishlistId}/items/${itemId}/comments/${commentId}`),

  // Reactions API
  addReaction: (wishlistId: string, itemId: string, data: { emoji: string }) =>
    api.post(`/wishlists/${wishlistId}/items/${itemId}/reactions`, data),

  removeReaction: (wishlistId: string, itemId: string) =>
    api.delete(`/wishlists/${wishlistId}/items/${itemId}/reactions`),
};

export default api;