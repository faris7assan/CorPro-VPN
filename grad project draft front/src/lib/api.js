// Centralized API URL — uses environment variable for deployment flexibility
// In dev: http://127.0.0.1:3001
// In prod: https://your-backend.onrender.com (or wherever you deploy)
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'

export const AUTH_API   = `${API_BASE}/api/auth`
export const POLICY_API = `${API_BASE}/api/policy`
export const VPN_API    = `${API_BASE}/api/vpn`
