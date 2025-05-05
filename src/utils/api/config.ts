
// API Configuration
const API_BASE_URL = 'http://localhost:3001/api'; // Update this for production

export const API_ENDPOINTS = {
  // Low stock alerts
  SEND_LOW_STOCK_ALERT: `${API_BASE_URL}/low-stock/send-alert`,
  
  // Users
  CHECK_USERS_TABLE: `${API_BASE_URL}/users/check-users-table`,
  CREATE_USERS_TABLE: `${API_BASE_URL}/users/create-users-table`,
};

export const getAuthHeaders = () => {
  // Get token from localStorage or other storage
  const token = localStorage.getItem('authToken');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};
