import { Plus, BarChart3, LogOut, Sprout, User } from 'lucide-react'
import WebSocketStatus from './WebSocketStatus'

interface DashboardHeaderProps {
  username: string
  onAddTerrain: () => void
  onBulkAnalysis: () => void
  onLogout: () => void
  terrainCount: number
  showWebSocketStatus?: boolean
}

export default function DashboardHeader({ 
  username, 
  onAddTerrain, 
  onBulkAnalysis, 
  onLogout, 
  terrainCount,
  showWebSocketStatus = true 
}: DashboardHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agricultural Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {username}!
                </p>
              </div>
            </div>
          </div>

          {showWebSocketStatus && (
            <div className="hidden lg:block">
              <WebSocketStatus showRecentUpdates={false} className="max-w-xs" />
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onBulkAnalysis}
              disabled={terrainCount === 0}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={terrainCount === 0 ? "Add terrains to enable bulk analysis" : "Run bulk analysis"}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Bulk Analysis</span>
            </button>
            
            <button
              onClick={onAddTerrain}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Terrain</span>
            </button>

            <div className="relative">
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                title="Logout"
              >
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <LogOut className="h-3 w-3 ml-1 hidden sm:inline" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}