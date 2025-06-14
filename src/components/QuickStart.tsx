import { MapPin, Plus, Sprout } from 'lucide-react'
import { DEFAULT_LOCATIONS } from '../types/agro'

interface QuickStartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onQuickAdd: (location: any) => void
  onAddTerrain: () => void
  showQuickLocations?: boolean
}

export default function QuickStart({ 
  onQuickAdd, 
  onAddTerrain, 
  showQuickLocations = true 
}: QuickStartProps) {
  return (
    <div className="text-center py-12">
      <Sprout className="mx-auto h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to Your Agricultural Dashboard</h3>
      <p className="text-gray-500 mb-6">Get started by adding your first terrain to begin monitoring.</p>
      
      <div className="max-w-md mx-auto space-y-4">
        <button
          onClick={onAddTerrain}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Your First Terrain
        </button>

        {showQuickLocations && (
          <div className="pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Or try these popular locations in Portugal:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DEFAULT_LOCATIONS.map((location, index) => (
                <button
                  key={index}
                  onClick={() => onQuickAdd(location)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  {location.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}