import { RefreshCw } from 'lucide-react'
import TerrainWidget from './TerrainWidget'
import type { Terrain } from '../types/agro'

interface TerrainGridProps {
  terrains: Terrain[]
  onUpdate: (terrain: Terrain) => void
  onDelete: (terrainId: string) => void
  loading?: boolean
  onRefresh?: () => void
}

export default function TerrainGrid({ 
  terrains, 
  onUpdate, 
  onDelete, 
  loading = false,
  onRefresh 
}: TerrainGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading terrains...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Your Terrains ({terrains.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor weather conditions and get AI-powered farming suggestions
          </p>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Refresh all terrain data"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {terrains.map((terrain) => (
          <TerrainWidget
            key={terrain.id}
            terrain={terrain}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>

      {terrains.length > 0 && (
        <div className="text-center py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Real-time updates are active for all terrains. Data refreshes automatically via WebSocket connection.
          </p>
        </div>
      )}
    </div>
  )
}