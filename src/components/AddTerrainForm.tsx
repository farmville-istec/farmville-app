import { useState } from 'react'
import { X, Save, MapPin } from 'lucide-react'
import LocationPicker from './LocationPicker'

interface TerrainFormData {
  name: string
  latitude: number
  longitude: number
  crop_type: string
  area_hectares: number
  notes: string
}

interface AddTerrainFormProps {
  onSubmit: (data: TerrainFormData) => void
  onCancel: () => void
  loading?: boolean
}

export default function AddTerrainForm({ onSubmit, onCancel, loading = false }: AddTerrainFormProps) {
  const [formData, setFormData] = useState<TerrainFormData>({
    name: '',
    latitude: 41.1579, // Default to Porto
    longitude: -8.6291,
    crop_type: '',
    area_hectares: 0,
    notes: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TerrainFormData, string>>>({})
  const [locationName, setLocationName] = useState('')
  const [showLocationPicker, setShowLocationPicker] = useState(true)

  const validateForm = () => {
    const newErrors: Partial<Record<keyof TerrainFormData, string>> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Terrain name is required'
    }
    
    if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90'
    }
    
    if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const updateField = (field: keyof TerrainFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleLocationSelect = (location: { name: string; latitude: number; longitude: number }) => {
    setLocationName(location.name)
    updateField('latitude', location.latitude)
    updateField('longitude', location.longitude)
    
    if (!formData.name) {
      const simpleName = location.name.split(',')[0] + ' Farm'
      updateField('name', simpleName)
    }
  }

  const toggleManualCoordinates = () => {
    setShowLocationPicker(!showLocationPicker)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Add New Terrain</h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Location Selection
            </h4>
            <button
              type="button"
              onClick={toggleManualCoordinates}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showLocationPicker ? 'Enter coordinates manually' : 'Use map/search'}
            </button>
          </div>

          {showLocationPicker ? (
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={{ latitude: formData.latitude, longitude: formData.longitude }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.latitude}
                  onChange={(e) => updateField('latitude', parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.latitude ? 'border-red-300' : 'border-gray-300'
                  }`}
                  step="0.0001"
                  placeholder="41.1579"
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.longitude}
                  onChange={(e) => updateField('longitude', parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.longitude ? 'border-red-300' : 'border-gray-300'
                  }`}
                  step="0.0001"
                  placeholder="-8.6291"
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
                )}
              </div>
            </div>
          )}

          {locationName && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              📍 Selected: {locationName}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terrain Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., North Field, Vineyard Plot A"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crop Type
            </label>
            <input
              type="text"
              value={formData.crop_type}
              onChange={(e) => updateField('crop_type', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="e.g., Wheat, Corn, Grapes, Vegetables"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area (hectares)
            </label>
            <input
              type="number"
              value={formData.area_hectares}
              onChange={(e) => updateField('area_hectares', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              min="0"
              step="0.1"
              placeholder="10.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            rows={3}
            placeholder="Additional information about this terrain..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Adding...' : 'Add Terrain'}
          </button>
        </div>
      </form>
    </div>
  )
}