export interface WeatherData {
  location: string
  latitude: number
  longitude: number
  temperature: number
  humidity: number
  pressure: number
  description: string
  timestamp: string
  is_complete: boolean
}

export interface AgroSuggestion {
  location: string
  suggestions: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  confidence: number
  reasoning: string
  weather_context: WeatherData
  timestamp: string
  suggestion_count: number
}

export interface Terrain {
  id: string
  user_id?: number
  name: string
  latitude: number
  longitude: number
  crop_type?: string
  area_hectares?: number
  notes?: string
  created_at: string
  updated_at?: string
}

export interface AgroAnalysisResponse {
  success: boolean
  weather?: WeatherData
  agro_suggestions?: AgroSuggestion
  terrain?: Terrain
  error?: string
}

export interface TerrainStatsResponse {
  success: boolean
  stats: {
    total_terrains: number
    total_area_hectares: number
    crop_types: string[]
    avg_area: number
  }
}

export interface TerrainResponse {
  success: boolean
  terrain?: Terrain
  terrains?: Terrain[]
  count?: number
  message?: string
  terrain_id?: number
}

export type PriorityColor = {
  low: string
  medium: string
  high: string
  urgent: string
}

export const PRIORITY_COLORS: PriorityColor = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
}

export const DEFAULT_LOCATIONS = [
  { name: 'Porto', latitude: 41.1579, longitude: -8.6291, country: 'Portugal' },
  { name: 'Lisboa', latitude: 38.7223, longitude: -9.1393, country: 'Portugal' },
  { name: 'Braga', latitude: 41.5518, longitude: -8.4229, country: 'Portugal' },
  { name: 'Coimbra', latitude: 40.2033, longitude: -8.4103, country: 'Portugal' },
]