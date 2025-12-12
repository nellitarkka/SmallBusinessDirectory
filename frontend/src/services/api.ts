import axios from 'axios';

// Configure the API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Export API endpoints
export const messageAPI = {
  // Get all messages for current user
  async getAll() {
    const response = await apiClient.get('/messages');
    return response.data.data;
  },

  // Get received messages
  async getReceived() {
    const response = await apiClient.get('/messages/received');
    return response.data.data;
  },

  // Get sent messages
  async getSent() {
    const response = await apiClient.get('/messages/sent');
    return response.data.data;
  },

  // Get conversation between two users
  async getConversation(otherUserId: number, listingId: number) {
    const response = await apiClient.get(`/messages/conversation/${otherUserId}/${listingId}`);
    return response.data.data;
  },

  // Create a new message
  async create(data: {
    receiverUserId: number;
    listingId: number;
    subject?: string;
    body: string;
  }) {
    const response = await apiClient.post('/messages', data);
    return response.data.data;
  },

  // Get single message
  async getOne(id: number) {
    const response = await apiClient.get(`/messages/${id}`);
    return response.data.data;
  },

  // Mark message as read
  async markAsRead(id: number) {
    const response = await apiClient.patch(`/messages/${id}/read`);
    return response.data.data;
  },

  // Mark all messages as read
  async markAllAsRead() {
    const response = await apiClient.patch('/messages/read/all');
    return response.data.data;
  },

  // Get unread count
  async getUnreadCount() {
    const response = await apiClient.get('/messages/unread/count');
    return response.data.data.unreadCount;
  },

  // Delete a message
  async delete(id: number) {
    const response = await apiClient.delete(`/messages/${id}`);
    return response.data.data;
  },
};

export const listingAPI = {
  // Get all listings
  async getAll(filters?: { city?: string; category?: string; search?: string }) {
    const response = await apiClient.get('/listings', { params: filters });
    return response.data.data;
  },

  // Get single listing
  async getOne(id: number) {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data.data;
  },

  // Create listing (vendor only)
  async create(data: any) {
    const response = await apiClient.post('/listings', data);
    return response.data.data;
  },

  // Update listing (vendor only)
  async update(id: number, data: any) {
    const response = await apiClient.patch(`/listings/${id}`, data);
    return response.data.data;
  },

  // Delete listing (vendor only)
  async delete(id: number) {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data.data;
  },

  // Get my listings (vendor only)
  async getMine() {
    const response = await apiClient.get('/listings/vendor/my-listings');
    return response.data.data;
  },
};

export const favoriteAPI = {
  // Get all favorites for current user
  async getAll() {
    const response = await apiClient.get('/favorites');
    return response.data.data;
  },

  // Add favorite
  async add(listingId: number) {
    const response = await apiClient.post(`/favorites/${listingId}`);
    return response.data.data.favorite;
  },

  // Remove favorite
  async remove(listingId: number) {
    await apiClient.delete(`/favorites/${listingId}`);
    return { listingId };
  },

  // Check if listing is favorited
  async isFavorite(listingId: number) {
    const response = await apiClient.get(`/favorites/${listingId}/check`);
    return response.data.data.isFavorite;
  },
};

export const authAPI = {
  // Register
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'vendor' | 'admin';
    businessName?: string;
  }) {
    const response = await apiClient.post('/auth/register', data);
    // Backend returns { user, token }
    if (response.data && response.data.data && response.data.data.token) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    return response.data.data;
  },

  // Login
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.data.token) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    return response.data.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('authToken');
  },

  // Get current user
  async getCurrentUser() {
    const response = await apiClient.get('/auth/profile');
    return response.data.data.user;
  },
};

export const categoryAPI = {
  // Get all categories
  async getAll() {
    const response = await apiClient.get('/categories');
    return response.data.data;
  },

  // Get single category
  async getOne(id: number) {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data.data;
  },

  // Create category (admin only)
  async create(data: { name: string; isActive?: boolean }) {
    const response = await apiClient.post('/categories', data);
    return response.data.data;
  },

  // Update category (admin only)
  async update(id: number, data: { name?: string; isActive?: boolean }) {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data.data;
  },

  // Delete category (admin only)
  async delete(id: number) {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data.data;
  },
};

export default apiClient;
