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

export const weatherAPI = {
  getWeather: async (location: string, latitude?: number, longitude?: number) => {
    const params = new URLSearchParams()
    if (latitude !== undefined) params.append('lat', latitude.toString())
    if (longitude !== undefined) params.append('lon', longitude.toString())
    
    const response = await api.get(`/api/weather/${location}?${params.toString()}`)
    return response.data
  },
}

export const agroAPI = {
  analyzeWeather: async (location: string, latitude: number, longitude: number) => {
    const response = await api.post("/api/agro/analyze", {
      location,
      latitude,
      longitude,
    })
    return response.data
  },

  quickAnalysis: async (temperature: number, humidity: number, description: string, location: string) => {
    const response = await api.post("/api/agro/quick-analyze", {
      temperature,
      humidity,
      description,
      location,
    })
    return response.data
  },

  bulkAnalysis: async (locations: Array<{name: string, latitude: number, longitude: number}>) => {
    const response = await api.post("/api/agro/bulk-analyze", {
      locations,
    })
    return response.data
  },

  getCacheInfo: async () => {
    const response = await api.get("/api/agro/cache-info")
    return response.data
  },

  getObserverStats: async () => {
    const response = await api.get("/api/agro/observer-stats")
    return response.data
  },
}

export const terrainAPI = {
  getUserTerrains: async () => {
    const response = await api.get("/api/terrains")
    return response.data
  },

  createTerrain: async (terrain: {
    name: string
    latitude: number
    longitude: number
    crop_type?: string
    area_hectares?: number
    notes?: string
  }) => {
    const response = await api.post("/api/terrains", terrain)
    return response.data
  },

  getTerrain: async (terrainId: number) => {
    const response = await api.get(`/api/terrains/${terrainId}`)
    return response.data
  },

  updateTerrain: async (terrainId: number, updates: Partial<{
    name: string
    latitude: number
    longitude: number
    crop_type: string
    area_hectares: number
    notes: string
  }>) => {
    const response = await api.put(`/api/terrains/${terrainId}`, updates)
    return response.data
  },

  deleteTerrain: async (terrainId: number) => {
    const response = await api.delete(`/api/terrains/${terrainId}`)
    return response.data
  },

  getTerrainWeather: async (terrainId: number) => {
    const response = await api.get(`/api/terrains/${terrainId}/weather`)
    return response.data
  },

  getTerrainAgroAnalysis: async (terrainId: number) => {
    const response = await api.post(`/api/terrains/${terrainId}/agro-analysis`)
    return response.data
  },

  getTerrainStats: async () => {
    const response = await api.get("/api/terrains/stats")
    return response.data
  }
}

export default api