/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { MapPin, Thermometer, Droplets, RefreshCw, Trash2, Edit, Wifi } from 'lucide-react'
import type { Terrain, WeatherData, AgroSuggestion } from '../types/agro'
import { PRIORITY_COLORS } from '../types/agro'
import { terrainAPI } from '../services/api'
import { useWebSocket } from '../hooks/useWebSocket'

interface TerrainWidgetProps {
  terrain: Terrain
  onUpdate?: (terrain: Terrain) => void
  onDelete?: (terrainId: string) => void
}

function WeatherDisplay({ weather }: { weather: WeatherData }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Weather</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center space-x-2">
          <Thermometer className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">{weather.temperature.toFixed(1)}°C</span>
        </div>
        <div className="flex items-center space-x-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{weather.humidity.toFixed(0)}%</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <p>{weather.description} • {weather.pressure.toFixed(0)} hPa</p>
        <p>Updated: {new Date(weather.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  )
}

function SuggestionsDisplay({ suggestions }: { suggestions: AgroSuggestion }) {
  const [showAll, setShowAll] = useState(false)
  const visibleSuggestions = showAll ? suggestions.suggestions : suggestions.suggestions.slice(0, 2)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">AI Suggestions</h4>
        <span className={`px-2 py-1 rounded text-xs ${PRIORITY_COLORS[suggestions.priority]}`}>
          {suggestions.priority.toUpperCase()}
        </span>
      </div>
      
      <div className="space-y-2">
        {visibleSuggestions.map((suggestion, index) => (
          <div key={index} className="bg-green-50 border-l-4 border-green-400 p-2 rounded-r">
            <p className="text-sm text-green-800">{suggestion}</p>
          </div>
        ))}
        
        {suggestions.suggestions.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-green-600 hover:text-green-800 font-medium"
          >
            {showAll ? 'Show less' : `+${suggestions.suggestions.length - 2} more suggestions`}
          </button>
        )}
      </div>
      
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        <span>Confidence: {(suggestions.confidence * 100).toFixed(0)}%</span>
        <span>{new Date(suggestions.timestamp).toLocaleTimeString()}</span>
      </div>

      {suggestions.reasoning && (
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            View AI reasoning
          </summary>
          <p className="text-xs text-gray-600 mt-1 italic pl-2 border-l-2 border-gray-200">
            {suggestions.reasoning}
          </p>
        </details>
      )}
    </div>
  )
}

function TerrainInfo({ terrain, isEditing, editData, onEditChange }: {
  terrain: Terrain
  isEditing: boolean
  editData: any
  onEditChange: (field: string, value: any) => void
}) {
  if (isEditing) {
    return (
      <div className="mb-4 space-y-2">
        <input
          type="text"
          value={editData.crop_type}
          onChange={(e) => onEditChange('crop_type', e.target.value)}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
          placeholder="Crop type (e.g., Wheat, Corn)"
        />
        <input
          type="number"
          value={editData.area_hectares}
          onChange={(e) => onEditChange('area_hectares', parseFloat(e.target.value))}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
          placeholder="Area in hectares"
          min="0"
          step="0.1"
        />
        <textarea
          value={editData.notes}
          onChange={(e) => onEditChange('notes', e.target.value)}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
          rows={2}
          placeholder="Notes..."
        />
      </div>
    )
  }

  return (
    <div className="mb-4 space-y-1">
      <p className="text-sm text-gray-600">
        📍 {terrain.latitude.toFixed(4)}, {terrain.longitude.toFixed(4)}
      </p>
      {terrain.crop_type && (
        <p className="text-sm text-gray-600">🌾 {terrain.crop_type}</p>
      )}
      {terrain.area_hectares && (
        <p className="text-sm text-gray-600">📏 {terrain.area_hectares} hectares</p>
      )}
      {terrain.notes && (
        <p className="text-sm text-gray-600">📝 {terrain.notes}</p>
      )}
    </div>
  )
}

export default function TerrainWidget({ terrain, onUpdate, onDelete }: TerrainWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [suggestions, setSuggestions] = useState<AgroSuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: terrain.name,
    crop_type: terrain.crop_type || '',
    area_hectares: terrain.area_hectares || 0,
    notes: terrain.notes || ''
  })
  
  const { connected, subscribeToTerrain, unsubscribeFromTerrain, agroUpdates } = useWebSocket()
  const terrainId = `${terrain.latitude}_${terrain.longitude}`

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await terrainAPI.getTerrainAgroAnalysis(parseInt(terrain.id))
      
      if (response.success) {
        setWeather(response.weather || null)
        setSuggestions(response.agro_suggestions || null)
      } else {
        setError(response.error || 'Failed to fetch data')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Network error')
    } finally {
      setLoading(false)
    }
  }, [terrain.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (connected) {
      subscribeToTerrain(terrainId)
    }
    return () => {
      if (connected) {
        unsubscribeFromTerrain(terrainId)
      }
    }
  }, [connected, terrainId, subscribeToTerrain, unsubscribeFromTerrain])

  useEffect(() => {
    const latestUpdate = agroUpdates.find(update => 
      update.terrain_id === terrainId && 
      update.type === 'agro_suggestion_update'
    )
    
    if (latestUpdate) {
      fetchData()
    }
  }, [agroUpdates, terrainId, fetchData])

  const handleEdit = () => {
    setIsEditing(true)
    setEditData({
      name: terrain.name,
      crop_type: terrain.crop_type || '',
      area_hectares: terrain.area_hectares || 0,
      notes: terrain.notes || ''
    })
  }

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...terrain,
        name: editData.name,
        crop_type: editData.crop_type || undefined,
        area_hectares: editData.area_hectares || undefined,
        notes: editData.notes || undefined
      })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleEditChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <input
            type="text"
            value={editData.name}
            onChange={(e) => handleEditChange('name', e.target.value)}
            className="text-lg font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1 flex-1 mr-2"
          />
        ) : (
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-green-600" />
            {terrain.name}
            {connected && (
              <span title="Real-time updates active">
                <Wifi className="h-3 w-3 ml-2 text-green-500" />
              </span>
            )}
          </h3>
        )}
        
        <div className="flex items-center space-x-1">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={isEditing ? handleSave : handleEdit}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title={isEditing ? "Save changes" : "Edit terrain"}
          >
            {isEditing ? '✓' : <Edit className="h-4 w-4" />}
          </button>

          {isEditing && (
            <button
              onClick={handleCancel}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Cancel editing"
            >
              ✕
            </button>
          )}
          
          <button
            onClick={() => onDelete?.(terrain.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete terrain"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <TerrainInfo
        terrain={terrain}
        isEditing={isEditing}
        editData={editData}
        onEditChange={handleEditChange}
      />

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600 text-sm">Loading...</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-800 text-sm">⚠️ {error}</p>
        </div>
      )}

      {weather && !loading && <WeatherDisplay weather={weather} />}

      {suggestions && !loading && <SuggestionsDisplay suggestions={suggestions} />}
    </div>
  )
}