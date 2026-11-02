// Centralized API Client with JWT authorization & error handling

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('parkflow_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Handle 401 unauthorized
    if (response.status === 401) {
      if (token && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('parkflow_token');
        localStorage.removeItem('parkflow_user');
        window.location.href = '/login';
      }
    }

    const resData = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = resData?.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = resData;
      throw err;
    }

    // ApiResponse has format { success: true, message: "...", data: ... }
    return resData?.data !== undefined ? resData.data : resData;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
}

// Authentication APIs
export const authApi = {
  login: async (username, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  me: async () => {
    return request('/auth/me');
  },
};

// Parking Slots APIs
export const slotsApi = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
    if (params.slotType && params.slotType !== 'ALL') searchParams.append('slotType', params.slotType);
    if (params.floor && params.floor !== 'ALL') searchParams.append('floor', params.floor);
    if (params.zone && params.zone !== 'ALL') searchParams.append('zone', params.zone);
    if (params.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    return request(`/slots${query ? `?${query}` : ''}`);
  },
  getAvailable: async (slotType) => {
    return request(`/slots/available${slotType ? `?slotType=${slotType}` : ''}`);
  },
  getMetadata: async () => {
    return request('/slots/metadata');
  },
  getById: async (id) => {
    return request(`/slots/${id}`);
  },
  create: async (data) => {
    return request('/slots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id, data) => {
    return request(`/slots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id) => {
    return request(`/slots/${id}`, {
      method: 'DELETE',
    });
  },
};

// Vehicle Operations APIs
export const vehiclesApi = {
  entry: async (entryData) => {
    return request('/vehicles/entry', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  },
  exit: async (exitData) => {
    return request('/vehicles/exit', {
      method: 'PUT',
      body: JSON.stringify(exitData),
    });
  },
  exitById: async (recordId, exitData = {}) => {
    return request(`/vehicles/${recordId}/exit`, {
      method: 'PUT',
      body: JSON.stringify(exitData),
    });
  },
  getCurrent: async (search) => {
    return request(`/vehicles/current${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  },
  getHistory: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (params.timeRange && params.timeRange !== 'ALL') searchParams.append('timeRange', params.timeRange);
    searchParams.append('page', params.page || 0);
    searchParams.append('size', params.size || 10);

    return request(`/vehicles/history?${searchParams.toString()}`);
  },
};

// Reservations APIs
export const reservationsApi = {
  getAll: async (status) => {
    return request(`/reservations${status && status !== 'ALL' ? `?status=${status}` : ''}`);
  },
  getById: async (id) => {
    return request(`/reservations/${id}`);
  },
  create: async (data) => {
    return request('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  cancel: async (id) => {
    return request(`/reservations/${id}/cancel`, {
      method: 'PUT',
    });
  },
  checkIn: async (id) => {
    return request(`/reservations/${id}/checkin`, {
      method: 'POST',
    });
  },
};

// Dashboard Analytics APIs
export const dashboardApi = {
  getStats: async () => {
    return request('/dashboard/stats');
  },
  getOccupancy: async () => {
    return request('/dashboard/occupancy');
  },
  getTraffic: async () => {
    return request('/dashboard/traffic');
  },
  getActivities: async () => {
    return request('/dashboard/activities');
  },
};

// Users APIs (Admin only)
export const usersApi = {
  getAll: async () => {
    return request('/users');
  },
  getById: async (id) => {
    return request(`/users/${id}`);
  },
  create: async (data) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id, data) => {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  toggleStatus: async (id) => {
    return request(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },
};
