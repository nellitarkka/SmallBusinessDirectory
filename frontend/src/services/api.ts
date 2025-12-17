const API_BASE_URL = 'http://localhost:3000/api';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add any custom headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // Add authorization token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// ==================== AUTH API ====================
export const authAPI = {
  register: async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    businessName?: string;
    city?: string;
    vatNumber?: string;
  }) => {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    // Save token to localStorage
    if (data.status === 'success' && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  },

  login: async (email: string, password: string, role?: string) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    
    // Save token to localStorage
    if (data.status === 'success' && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  },

  getProfile: async () => {
    return await apiCall('/auth/profile');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// ==================== LISTINGS API (Vendors) ====================
export const listingsAPI = {
  // Get all listings with optional filters
  getAll: async (filters?: { city?: string; category?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    return await apiCall(`/listings${queryString ? `?${queryString}` : ''}`);
  },

  // Get single listing by ID
  getById: async (id: number | string) => {
    return await apiCall(`/listings/${id}`);
  },

  // Create new listing (vendors only)
  create: async (listingData: {
    title: string;
    description: string;
    city: string;
    contactPhone?: string;
    contactEmail?: string;
    openingHours?: string;
    categoryIds?: number[];
  }) => {
    return await apiCall('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  },

  // Update listing (vendors only, must own the listing)
  update: async (id: number | string, updates: Partial<{
    title: string;
    description: string;
    city: string;
    contactPhone: string;
    contactEmail: string;
    openingHours: string;
  }>) => {
    return await apiCall(`/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Delete listing (vendors only, must own the listing)
  delete: async (id: number | string) => {
    return await apiCall(`/listings/${id}`, {
      method: 'DELETE',
    });
  },

  // Get vendor's own listings
  getMine: async () => {
    return await apiCall('/listings/vendor/my-listings');
  },

  // Get all listings for admin moderation (all statuses)
  getAllAdmin: async () => {
    return await apiCall('/listings/admin/all');
  },

  // Update listing status (admin only)
  updateStatusAdmin: async (id: number | string, status: 'active' | 'rejected') => {
    return await apiCall(`/listings/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ==================== VENDOR API ====================
export const vendorAPI = {
  // Get vendor profile
  getProfile: async () => {
    return await apiCall('/vendor/profile');
  },
};

// ==================== CATEGORIES API ====================
export const categoriesAPI = {
  getAll: async () => {
    return await apiCall('/categories');
  },

  getById: async (id: number | string) => {
    return await apiCall(`/categories/${id}`);
  },
};

// ==================== FAVORITES API ====================
export const favoritesAPI = {
  // Add a listing to favorites
  add: async (listingId: number | string) => {
    return await apiCall(`/favorites/${listingId}`, {
      method: 'POST',
    });
  },

  // Get all user's favorites
  getAll: async () => {
    return await apiCall('/favorites');
  },

  // Check if a listing is favorited
  check: async (listingId: number | string) => {
    return await apiCall(`/favorites/${listingId}/check`);
  },

  // Remove a listing from favorites
  remove: async (listingId: number | string) => {
    return await apiCall(`/favorites/${listingId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== MESSAGES API ====================
export const messagesAPI = {
  send: (recipientId: number, content: string, listingId?: number, subject?: string) =>
    apiCall('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId, content, listing_id: listingId, subject }),
    }),

  getInbox: () => apiCall('/messages/inbox'),
  getSent: () => apiCall('/messages/sent'),
  getConversation: (otherUserId: number) => apiCall(`/messages/conversation/${otherUserId}`),
    markAsRead: (messageId: number) => apiCall(`/messages/${messageId}/read`, { method: 'PUT' }),
  delete: (messageId: number) => apiCall(`/messages/${messageId}`, { method: 'DELETE' }),
  getUnreadCount: () => apiCall('/messages/unread-count'),
};