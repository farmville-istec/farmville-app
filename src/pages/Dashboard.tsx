/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import DashboardHeader from '../components/DashboardHeader'
import DashboardStats from '../components/DashboardStats'
import QuickStart from '../components/QuickStart'
import AddTerrainForm from '../components/AddTerrainForm'
import TerrainGrid from '../components/TerrainGrid'
import WebSocketStatus from '../components/WebSocketStatus'
import type { Terrain, AgroSuggestion } from '../types/agro'
import { agroAPI, terrainAPI } from '../services/api'
import ChatBot from '../components/ChatBot'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingTerrain, setIsAddingTerrain] = useState(false)
  const [bulkAnalysis, setBulkAnalysis] = useState<AgroSuggestion[]>([])
  const [weatherData, setWeatherData] = useState<Record<string, any>>({})
  const [agroSuggestions, setAgroSuggestions] = useState<Record<string, any>>({})
  const [dashboardStats, setDashboardStats] = useState({
    totalTerrains: 0,
    urgentAlerts: 0,
    avgConfidence: 85,
    lastUpdate: new Date()
  })

  const collectTerrainContextData = useCallback(async (terrainsToProcess: Terrain[]) => {
    const weatherCache: Record<string, any> = {}
    const agroCache: Record<string, any> = {}

    const promises = terrainsToProcess.map(async (terrain) => {
      try {
        const response = await terrainAPI.getTerrainAgroAnalysis(parseInt(terrain.id))
        if (response.success) {
          if (response.weather) {
            weatherCache[terrain.id] = response.weather
          }
          if (response.agro_suggestions) {
            agroCache[terrain.id] = response.agro_suggestions
          }
        }
      } catch (error) {
        console.error(`Failed to fetch context for terrain ${terrain.id}:`, error)
      }
    })

    await Promise.all(promises)
    
    setWeatherData(weatherCache)
    setAgroSuggestions(agroCache)
  }, [])

  const loadTerrains = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await terrainAPI.getUserTerrains()
      
      if (response.success) {
        setTerrains(response.terrains)
        if (response.terrains.length > 0) {
          await collectTerrainContextData(response.terrains)
        }
        setDashboardStats(prev => ({
          ...prev,
          totalTerrains: response.terrains.length,
          lastUpdate: new Date()
        }))
      } else {
        setError('Failed to load terrains')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load terrains')
      console.error('Error loading terrains:', err)
    } finally {
      setLoading(false)
    }
  }, [ collectTerrainContextData ])

  useEffect(() => {
    const interval = setInterval(() => {
      if (terrains.length > 0) {
        collectTerrainContextData(terrains)
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [terrains, collectTerrainContextData])

  useEffect(() => {
    if (user?.id) {
      loadTerrains()
    }
  }, [user?.id, loadTerrains])

  const handleAddTerrain = async (terrainData: any) => {
    try {
      setLoading(true)
      const response = await terrainAPI.createTerrain(terrainData)
      
      if (response.success) {
        await loadTerrains()
        setIsAddingTerrain(false)
      } else {
        setError(response.message || 'Failed to create terrain')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create terrain')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTerrain = async (updatedTerrain: Terrain) => {
    try {
      const updates = {
        name: updatedTerrain.name,
        latitude: updatedTerrain.latitude,
        longitude: updatedTerrain.longitude,
        crop_type: updatedTerrain.crop_type,
        area_hectares: updatedTerrain.area_hectares,
        notes: updatedTerrain.notes
      }

      const response = await terrainAPI.updateTerrain(parseInt(updatedTerrain.id), updates)
      
      if (response.success) {
        await loadTerrains()
      } else {
        setError(response.message || 'Failed to update terrain')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update terrain')
    }
  }

  const handleDeleteTerrain = async (terrainId: string) => {
    if (!confirm('Are you sure you want to delete this terrain?')) return

    try {
      const response = await terrainAPI.deleteTerrain(parseInt(terrainId))
      
      if (response.success) {
        setWeatherData(prev => {
          const newData = { ...prev }
          delete newData[terrainId]
          return newData
        })
        setAgroSuggestions(prev => {
          const newData = { ...prev }
          delete newData[terrainId]
          return newData
        })
        await loadTerrains()
      } else {
        setError(response.message || 'Failed to delete terrain')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete terrain')
    }
  }

  const handleBulkAnalysis = async () => {
    try {
      const locations = terrains.map(t => ({
        name: t.name,
        latitude: t.latitude,
        longitude: t.longitude
      }))

      const response = await agroAPI.bulkAnalysis(locations)
      if (response.success) {
        setBulkAnalysis(response.suggestions)
        await collectTerrainContextData(terrains)
      }
    } catch (error) {
      console.error('Bulk analysis failed:', error)
      setError('Bulk analysis failed')
    }
  }

  const handleQuickAddLocation = async (location: any) => {
    const terrainData = {
      name: `${location.name} Farm`,
      latitude: location.latitude,
      longitude: location.longitude,
      crop_type: 'Mixed',
      area_hectares: 10,
      notes: `Quick-added farm in ${location.name}`
    }

    await handleAddTerrain(terrainData)
  }

  if (loading && terrains.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        username={user?.username || 'User'}
        onAddTerrain={() => setIsAddingTerrain(true)}
        onBulkAnalysis={handleBulkAnalysis}
        onLogout={logout}
        terrainCount={terrains.length}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 font-bold text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <DashboardStats stats={dashboardStats} />

        <div className="lg:hidden mb-6">
          <WebSocketStatus />
        </div>

        {isAddingTerrain && (
          <AddTerrainForm
            onSubmit={handleAddTerrain}
            onCancel={() => setIsAddingTerrain(false)}
            loading={loading}
          />
        )}

        {terrains.length > 0 ? (
          <TerrainGrid
            terrains={terrains}
            onUpdate={handleUpdateTerrain}
            onDelete={handleDeleteTerrain}
            loading={loading}
            onRefresh={loadTerrains}
          />
        ) : !loading && (
          <QuickStart
            onQuickAdd={handleQuickAddLocation}
            onAddTerrain={() => setIsAddingTerrain(true)}
          />
        )}

        {bulkAnalysis.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Bulk Analysis Results</h3>
            <div className="space-y-4">
              {bulkAnalysis.map((suggestion, index) => (
                <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                  <h4 className="font-medium text-gray-900">{suggestion.location}</h4>
                  <p className="text-sm text-gray-600 mt-1">{suggestion.suggestions[0]}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      suggestion.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      suggestion.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {suggestion.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ChatBot 
        terrains={terrains}
        weatherData={weatherData}
        agroSuggestions={agroSuggestions}
      />
    </div>
  )
}