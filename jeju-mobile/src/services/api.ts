import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post, User, Notification, ApiKey, SearchResult, SearchFilters } from '../types';

const API_BASE_URL = 'http://localhost:3004';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: async (email: string, password: string) => {
    const response = await api.post('/test-login', { email, password });
    return response.data;
  },

  // 회원가입
  signup: async (email: string, password: string, username: string) => {
    const response = await api.post('/test-signup', { email, password, username });
    return response.data;
  },

  // 소셜 로그인
  socialLogin: async (idToken: string) => {
    const response = await api.post('/auth/social-login', { idToken });
    return response.data;
  },

  // 프로필 조회
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // 프로필 수정
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.post('/auth/profile', data);
    return response.data;
  },
};

// 게시글 관련 API
export const postsAPI = {
  // 게시글 목록 조회
  getPosts: async (): Promise<Post[]> => {
    const response = await api.get('/posts');
    return response.data;
  },

  // 게시글 상세 조회
  getPost: async (id: number): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // 게시글 작성
  createPost: async (data: FormData): Promise<Post> => {
    const response = await api.post('/posts', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 게시글 삭제
  deletePost: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  // 게시글 좋아요
  likePost: async (id: number): Promise<any> => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  // 기본 검색
  searchPosts: async (filters: SearchFilters): Promise<SearchResult> => {
    const params = new URLSearchParams();
    if (filters.query) params.append('query', filters.query);
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/posts/search?${params}`);
    return response.data;
  },
};

// 고급 검색 API
export const searchAPI = {
  // 고급 검색
  advancedSearch: async (filters: SearchFilters): Promise<SearchResult> => {
    const params = new URLSearchParams();
    if (filters.query) params.append('query', filters.query);
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.tags) params.append('tags', filters.tags.join(','));
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/search/advanced?${params}`);
    return response.data;
  },

  // 검색어 제안
  getSuggestions: async (query: string): Promise<string[]> => {
    const response = await api.get(`/search/suggestions?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // 인기 검색어
  getPopularSearches: async (): Promise<string[]> => {
    const response = await api.get('/search/popular');
    return response.data;
  },

  // 관련 게시글
  getRelatedPosts: async (postId: number, limit: number = 5): Promise<Post[]> => {
    const response = await api.get(`/search/related/${postId}?limit=${limit}`);
    return response.data;
  },

  // 트렌딩 게시글
  getTrendingPosts: async (period: 'day' | 'week' | 'month' = 'week'): Promise<Post[]> => {
    const response = await api.get(`/search/trending?period=${period}`);
    return response.data;
  },
};

// 알림 관련 API
export const notificationsAPI = {
  // 알림 목록 조회
  getNotifications: async (): Promise<{ notifications: Notification[] }> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // 읽지 않은 알림 개수
  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // 알림 읽음 처리
  markAsRead: async (id: number): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/mark-all-read');
  },

  // 알림 삭제
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

// API 키 관련 API
export const apiKeysAPI = {
  // API 키 목록 조회
  getApiKeys: async (): Promise<ApiKey[]> => {
    const response = await api.get('/api-keys');
    return response.data;
  },

  // API 키 발급
  createApiKey: async (name: string): Promise<ApiKey> => {
    const response = await api.post('/api-keys', { name });
    return response.data;
  },

  // API 키 폐기
  deleteApiKey: async (id: number): Promise<void> => {
    await api.delete(`/api-keys/${id}`);
  },
};

export default api; 