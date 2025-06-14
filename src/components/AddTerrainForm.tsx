import { useState } from 'react'
import { X, Save } from 'lucide-react'

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
    latitude: 41.1579,
    longitude: -8.6291,
    crop_type: '',
    area_hectares: 0,
    notes: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TerrainFormData, string>>>({})

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

  const formFields = [
    {
      label: 'Terrain Name',
      key: 'name' as const,
      type: 'text',
      placeholder: 'e.g., North Field',
      required: true
    },
    {
      label: 'Latitude',
      key: 'latitude' as const,
      type: 'number',
      step: '0.0001',
      required: true
    },
    {
      label: 'Longitude',
      key: 'longitude' as const,
      type: 'number',
      step: '0.0001',
      required: true
    },
    {
      label: 'Crop Type',
      key: 'crop_type' as const,
      type: 'text',
      placeholder: 'e.g., Wheat, Corn, Vegetables'
    },
    {
      label: 'Area (hectares)',
      key: 'area_hectares' as const,
      type: 'number',
      min: '0',
      step: '0.1'
    }
  ]

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={field.type}
                value={formData[field.key]}
                onChange={(e) => updateField(field.key, 
                  field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                )}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors[field.key] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={field.placeholder}
                step={field.step}
                min={field.min}
              />
              {errors[field.key] && (
                <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
              )}
            </div>
          ))}
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