const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('illazz_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    throw new Error('Unable to connect to the Illazz server. Please make sure the backend is running.');
  }
}

export const api = {
  // Base HTTP helpers
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

  // Auth
  auth: {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    me: () => api.get('/api/auth/me'),
    updateProfile: (data) => api.put('/api/auth/profile', data)
  },

  // Patient Dashboard
  dashboard: {
    getStats: () => api.get('/api/dashboard/stats')
  },

  // Doctors Public Directory
  doctors: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.specialization && params.specialization !== 'All') {
        searchParams.append('specialization', params.specialization);
      }
      const qs = searchParams.toString();
      return api.get(`/api/doctors${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => api.get(`/api/doctors/${id}`),
    getSpecializations: () => api.get('/api/specializations')
  },

  // Symptoms
  symptoms: {
    assess: (symptoms, notes) => api.post('/api/symptoms', { symptoms, notes }),
    getHistory: () => api.get('/api/symptoms/history')
  },

  // Appointments (Patient)
  appointments: {
    getAll: () => api.get('/api/appointments'),
    book: (data) => api.post('/api/appointments', data),
    cancel: (id) => api.patch(`/api/appointments/${id}/cancel`)
  },

  // Prescriptions (Patient)
  prescriptions: {
    getAll: () => api.get('/api/prescriptions')
  },

  // Medical Records (Patient)
  records: {
    getAll: () => api.get('/api/medical-records'),
    create: (data) => api.post('/api/medical-records', data)
  },

  // Doctor Dashboard & Practice Suite
  doctor: {
    getStats: () => api.get('/api/doctor/dashboard-stats'),
    getAppointments: (params = {}) => {
      const sp = new URLSearchParams();
      if (params.status && params.status !== 'all') sp.append('status', params.status);
      if (params.search) sp.append('search', params.search);
      const qs = sp.toString();
      return api.get(`/api/doctor/appointments${qs ? `?${qs}` : ''}`);
    },
    updateAppointment: (id, data) => api.patch(`/api/doctor/appointments/${id}`, data),
    getPatients: (search = '') => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : '';
      return api.get(`/api/doctor/patients${qs}`);
    },
    getPatientDetails: (id) => api.get(`/api/doctor/patients/${id}`),
    getPrescriptions: () => api.get('/api/doctor/prescriptions'),
    createPrescription: (data) => api.post('/api/doctor/prescriptions', data),
    getEarnings: () => api.get('/api/doctor/earnings'),
    getAvailability: () => api.get('/api/doctor/availability'),
    updateAvailability: (data) => api.put('/api/doctor/availability', data),
    getProfile: () => api.get('/api/doctor/profile'),
    updateProfile: (data) => api.put('/api/doctor/profile', data),
    getReviews: () => api.get('/api/doctor/reviews'),
    getAnnouncements: () => api.get('/api/doctor/announcements'),
    createAnnouncement: (data) => api.post('/api/doctor/announcements', data),
    deleteAnnouncement: (id) => api.delete(`/api/doctor/announcements/${id}`),
    getMessages: () => api.get('/api/doctor/messages')
  }
};
