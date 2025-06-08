import { useState, useEffect, useCallback } from 'react'
import { MapPin, Thermometer, Droplets, RefreshCw, Trash2 } from 'lucide-react'
import type { Terrain, WeatherData, AgroSuggestion } from '../types/agro'
import { PRIORITY_COLORS } from '../types/agro'
import { agroAPI } from '../services/api'
import { useWebSocket } from '../hooks/useWebSocket'

interface TerrainWidgetProps {
  terrain: Terrain
  onUpdate?: (terrain: Terrain) => void
  onDelete?: (terrainId: string) => void
}

export default function TerrainWidget({ terrain, onDelete }: TerrainWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [suggestions, setSuggestions] = useState<AgroSuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // WebSocket integration
  const { connected, subscribeToTerrain, unsubscribeFromTerrain, agroUpdates } = useWebSocket()
  const terrainId = `${terrain.latitude}_${terrain.longitude}`

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await agroAPI.analyzeWeather(terrain.name, terrain.latitude, terrain.longitude)
      
      if (response.success) {
        setWeather(response.weather || null)
        setSuggestions(response.agro_suggestions || null)
      } else {
        setError(response.error || 'Failed to fetch data')
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Network error occurred')
    } finally {
      setLoading(false)
    }
  }, [terrain.name, terrain.latitude, terrain.longitude])

  useEffect(() => {
    fetchData()
  }, [fetchData, terrain.latitude, terrain.longitude])

  // WebSocket subscription effect
  useEffect(() => {
    if (connected) {
      subscribeToTerrain(terrainId)
      console.log(`🌾 Subscribed to terrain updates: ${terrainId}`)
    }
    
    return () => {
      if (connected) {
        unsubscribeFromTerrain(terrainId)
        console.log(`🌾 Unsubscribed from terrain: ${terrainId}`)
      }
    }
  }, [connected, terrainId, subscribeToTerrain, unsubscribeFromTerrain])

  // Handle real-time agro updates
  useEffect(() => {
    const latestUpdate = agroUpdates.find(update => 
      update.terrain_id === terrainId && 
      update.type === 'agro_suggestion_update'
    )
    
    if (latestUpdate && latestUpdate.suggestions) {
      console.log(`🔄 Real-time update received for ${terrain.name}`)
      // You could update suggestions here if needed
      // setSuggestions(prev => ({ ...prev, suggestions: latestUpdate.suggestions }))
    }
  }, [agroUpdates, terrainId, terrain.name])

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-green-600" />
          {terrain.name}
          {/* WebSocket connection indicator */}
          {connected && (
            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Real-time updates active"></span>
          )}
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => onDelete?.(terrain.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete terrain"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Terrain Info */}
      <div className="mb-4 space-y-1">
        <p className="text-sm text-gray-600">
          📍 {terrain.latitude.toFixed(4)}, {terrain.longitude.toFixed(4)}
        </p>
        {terrain.crop_type && (
          <p className="text-sm text-gray-600">🌾 {terrain.crop_type}</p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600 text-sm">Loading...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-800 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Weather Data */}
      {weather && !loading && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Weather</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <span className="text-sm">{weather.temperature.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{weather.humidity.toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {weather.description}
          </p>
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions && !loading && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">AI Suggestions</h4>
            <span className={`px-2 py-1 rounded text-xs ${PRIORITY_COLORS[suggestions.priority]}`}>
              {suggestions.priority.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-2">
            {suggestions.suggestions.slice(0, 2).map((suggestion, index) => (
              <div key={index} className="bg-green-50 border-l-4 border-green-400 p-2 rounded-r">
                <p className="text-sm text-green-800">{suggestion}</p>
              </div>
            ))}
            
            {suggestions.suggestions.length > 2 && (
              <p className="text-xs text-gray-500">
                +{suggestions.suggestions.length - 2} more suggestions
              </p>
            )}
          </div>
          
          {suggestions.confidence > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Confidence: {(suggestions.confidence * 100).toFixed(0)}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}