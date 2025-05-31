import axios from "axios"

const API_BASE_URL = "http://localhost:5001"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("farmville_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: async (username: string, password: string, email: string) => {
    const response = await api.post("/api/auth/register", {
      username,
      password,
      email,
    })
    return response.data
  },

  login: async (username: string, password: string) => {
    const response = await api.post("/api/auth/login", {
      username,
      password,
    })
    return response.data
  },

  getProfile: async () => {
    const response = await api.get("/api/auth/profile")
    return response.data
  },
}

export default api
