import { useState, useEffect, useCallback } from 'react'
import { Plus, BarChart3, MapPin, Sprout, RefreshCw, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import TerrainWidget from '../components/TerrainWidget'
import type { Terrain, AgroSuggestion } from '../types/agro'
import { DEFAULT_LOCATIONS } from '../types/agro'
import { agroAPI } from '../services/api'

export default function AgroDashboard() {
  const { user } = useAuth()
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [isAddingTerrain, setIsAddingTerrain] = useState(false)
  const [newTerrain, setNewTerrain] = useState({
    name: '',
    latitude: 41.1579,
    longitude: -8.6291,
    crop_type: '',
    area_hectares: 0,
    notes: ''
  })
  const [bulkAnalysis, setBulkAnalysis] = useState<AgroSuggestion[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    totalTerrains: 0,
    urgentAlerts: 0,
    avgConfidence: 0,
    lastUpdate: new Date()
  })

  // Load terrains from localStorage on mount
  useEffect(() => {
    const savedTerrains = localStorage.getItem(`farmville_terrains_${user?.id}`)
    if (savedTerrains) {
      setTerrains(JSON.parse(savedTerrains))
    } else {
      // Initialize with some default terrains
      const defaultTerrains: Terrain[] = DEFAULT_LOCATIONS.map((loc, index) => ({
        id: `terrain_${index}`,
        name: `${loc.name} Farm`,
        latitude: loc.latitude,
        longitude: loc.longitude,
        crop_type: index === 0 ? 'Wheat' : index === 1 ? 'Corn' : 'Vegetables',
        area_hectares: 10 + index * 5,
        notes: `Farm located in ${loc.name}`,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      }))
      setTerrains(defaultTerrains)
    }
  }, [user?.id])

  const updateDashboardStats = useCallback(() => {
    setDashboardStats({
      totalTerrains: terrains.length,
      urgentAlerts: 0, // This would be calculated from actual suggestions
      avgConfidence: 85, // This would be calculated from actual suggestions
      lastUpdate: new Date()
    })
  }, [terrains])

  // Save terrains to localStorage whenever terrains change
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`farmville_terrains_${user.id}`, JSON.stringify(terrains))
    }
    updateDashboardStats()
  }, [terrains, user?.id, updateDashboardStats])

  const addTerrain = () => {
    if (!newTerrain.name.trim()) return

    const terrain: Terrain = {
      id: `terrain_${Date.now()}`,
      name: newTerrain.name,
      latitude: newTerrain.latitude,
      longitude: newTerrain.longitude,
      crop_type: newTerrain.crop_type || undefined,
      area_hectares: newTerrain.area_hectares || undefined,
      notes: newTerrain.notes || undefined,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }

    setTerrains([...terrains, terrain])
    setNewTerrain({
      name: '',
      latitude: 41.1579,
      longitude: -8.6291,
      crop_type: '',
      area_hectares: 0,
      notes: ''
    })
    setIsAddingTerrain(false)
  }

  const updateTerrain = (updatedTerrain: Terrain) => {
    setTerrains(terrains.map(t => 
      t.id === updatedTerrain.id 
        ? { ...updatedTerrain, last_updated: new Date().toISOString() }
        : t
    ))
  }

  const deleteTerrain = (terrainId: string) => {
    if (confirm('Are you sure you want to delete this terrain?')) {
      setTerrains(terrains.filter(t => t.id !== terrainId))
    }
  }

  const runBulkAnalysis = async () => {
    try {
      const locations = terrains.map(t => ({
        name: t.name,
        latitude: t.latitude,
        longitude: t.longitude
      }))

      const response = await agroAPI.bulkAnalysis(locations)
      if (response.success) {
        setBulkAnalysis(response.suggestions)
      }
    } catch (error) {
      console.error('Bulk analysis failed:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quickAddLocation = (location: any) => {
    const terrain: Terrain = {
      id: `terrain_${Date.now()}`,
      name: `${location.name} Farm`,
      latitude: location.latitude,
      longitude: location.longitude,
      crop_type: 'Mixed',
      area_hectares: 10,
      notes: `Quick-added farm in ${location.name}`,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }
    setTerrains([...terrains, terrain])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agricultural Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.username}! Monitor your terrains and get AI-powered farming insights.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={runBulkAnalysis}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Bulk Analysis
              </button>
              
              <button
                onClick={() => setIsAddingTerrain(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Terrain
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Terrains</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalTerrains}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Monitoring</p>
                <p className="text-2xl font-semibold text-gray-900">{terrains.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardStats.avgConfidence}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last Update</p>
                <p className="text-sm font-semibold text-gray-900">
                  {dashboardStats.lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Locations */}
        {terrains.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Quick Start</h3>
            <p className="text-blue-700 mb-4">Get started quickly by adding some popular farming locations in Portugal:</p>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_LOCATIONS.map((location, index) => (
                <button
                  key={index}
                  onClick={() => quickAddLocation(location)}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  {location.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add New Terrain Form */}
        {isAddingTerrain && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Terrain</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newTerrain.name}
                  onChange={(e) => setNewTerrain({ ...newTerrain, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., North Field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newTerrain.latitude}
                  onChange={(e) => setNewTerrain({ ...newTerrain, latitude: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newTerrain.longitude}
                  onChange={(e) => setNewTerrain({ ...newTerrain, longitude: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                <input
                  type="text"
                  value={newTerrain.crop_type}
                  onChange={(e) => setNewTerrain({ ...newTerrain, crop_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Wheat, Corn, Vegetables"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (hectares)</label>
                <input
                  type="number"
                  value={newTerrain.area_hectares}
                  onChange={(e) => setNewTerrain({ ...newTerrain, area_hectares: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingTerrain(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addTerrain}
                disabled={!newTerrain.name.trim()}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Terrain
              </button>
            </div>
          </div>
        )}

        {/* Terrain Widgets Grid */}
        {terrains.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {terrains.map((terrain) => (
              <TerrainWidget
                key={terrain.id}
                terrain={terrain}
                onUpdate={updateTerrain}
                onDelete={deleteTerrain}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sprout className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No terrains yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first terrain.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsAddingTerrain(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Terrain
              </button>
            </div>
          </div>
        )}

        {/* Bulk Analysis Results */}
        {bulkAnalysis.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Bulk Analysis Results</h3>
            <div className="space-y-4">
              {bulkAnalysis.map((suggestion, index) => (
                <div key={index} className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-medium">{suggestion.location}</h4>
                  <p className="text-sm text-gray-600">{suggestion.suggestions[0]}</p>
                  <span className="text-xs text-gray-500">Priority: {suggestion.priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}