export interface User {
  id: number;
  email: string;
  username: string;
  profileImage?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  location?: string;
  category?: string;
  tags?: string[];
  user: User;
  createdAt: string;
  updatedAt: string;
  photos: Photo[];
  likeCount?: number;
  commentCount?: number;
}

export interface Photo {
  id: number;
  url: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
  data?: any;
}

export interface ApiKey {
  id: number;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export interface SearchResult {
  hits: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  aggregations?: any;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  sortBy?: 'relevance' | 'date' | 'popularity';
  page?: number;
  limit?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AppState {
  auth: AuthState;
  notifications: Notification[];
  unreadCount: number;
} 