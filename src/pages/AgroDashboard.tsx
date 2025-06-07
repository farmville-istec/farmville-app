import { useState, useEffect } from 'react'
import { Plus, Sprout } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import TerrainWidget from '../components/TerrainWidget'
import type { Terrain } from '../types/agro'
import { DEFAULT_LOCATIONS } from '../types/agro'

export default function AgroDashboard() {
  const { user } = useAuth()
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [isAddingTerrain, setIsAddingTerrain] = useState(false)
  const [newTerrain, setNewTerrain] = useState({
    name: '',
    latitude: 41.1579,
    longitude: -8.6291,
    crop_type: '',
    area_hectares: 0
  })

  // Load terrains from localStorage on mount
  useEffect(() => {
    const savedTerrains = localStorage.getItem(`farmville_terrains_${user?.id}`)
    if (savedTerrains) {
      setTerrains(JSON.parse(savedTerrains))
    }
  }, [user?.id])

  // Save terrains to localStorage whenever terrains change
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`farmville_terrains_${user.id}`, JSON.stringify(terrains))
    }
  }, [terrains, user?.id])

  const addTerrain = () => {
    if (!newTerrain.name.trim()) return

    const terrain: Terrain = {
      id: `terrain_${Date.now()}`,
      name: newTerrain.name,
      latitude: newTerrain.latitude,
      longitude: newTerrain.longitude,
      crop_type: newTerrain.crop_type || undefined,
      area_hectares: newTerrain.area_hectares || undefined,
      notes: '',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }

    setTerrains([...terrains, terrain])
    setNewTerrain({
      name: '',
      latitude: 41.1579,
      longitude: -8.6291,
      crop_type: '',
      area_hectares: 0
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quickAddLocation = (location: any) => {
    const terrain: Terrain = {
      id: `terrain_${Date.now()}`,
      name: `${location.name} Farm`,
      latitude: location.latitude,
      longitude: location.longitude,
      crop_type: 'Mixed',
      area_hectares: 10,
      notes: `Farm in ${location.name}`,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }
    setTerrains([...terrains, terrain])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Farm Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Manage your terrains and get AI farming suggestions
                </p>
              </div>
            </div>
            
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-2xl font-bold text-gray-900">{terrains.length}</p>
            <p className="text-sm text-gray-500">Active Terrains</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-2xl font-bold text-green-600">AI Ready</p>
            <p className="text-sm text-gray-500">Smart Suggestions</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-2xl font-bold text-blue-600">Live</p>
            <p className="text-sm text-gray-500">Weather Data</p>
          </div>
        </div>

        {/* Quick Start for empty state */}
        {terrains.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Get Started</h3>
            <p className="text-blue-700 mb-4">Add some farming locations to begin:</p>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_LOCATIONS.map((location, index) => (
                <button
                  key={index}
                  onClick={() => quickAddLocation(location)}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                >
                  {location.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add New Terrain Form */}
        {isAddingTerrain && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Terrain</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newTerrain.name}
                  onChange={(e) => setNewTerrain({ ...newTerrain, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., North Field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                <input
                  type="text"
                  value={newTerrain.crop_type}
                  onChange={(e) => setNewTerrain({ ...newTerrain, crop_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Wheat, Corn"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newTerrain.latitude}
                  onChange={(e) => setNewTerrain({ ...newTerrain, latitude: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newTerrain.longitude}
                  onChange={(e) => setNewTerrain({ ...newTerrain, longitude: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                Add Terrain
              </button>
            </div>
          </div>
        )}

        {/* Terrain Widgets - Simple Grid */}
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
            <p className="mt-1 text-sm text-gray-500">Add your first terrain to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}