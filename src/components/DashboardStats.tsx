import { MapPin, RefreshCw, BarChart3, Settings } from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    totalTerrains: number
    urgentAlerts: number
    avgConfidence: number
    lastUpdate: Date
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      icon: MapPin,
      label: 'Total Terrains',
      value: stats.totalTerrains,
      color: 'text-green-600'
    },
    {
      icon: RefreshCw,
      label: 'Active Monitoring',
      value: stats.totalTerrains,
      color: 'text-blue-600'
    },
    {
      icon: BarChart3,
      label: 'Avg Confidence',
      value: `${stats.avgConfidence}%`,
      color: 'text-yellow-600'
    },
    {
      icon: Settings,
      label: 'Last Update',
      value: stats.lastUpdate.toLocaleTimeString(),
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statItems.map((item, index) => {
        const IconComponent = item.icon
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IconComponent className={`h-8 w-8 ${item.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}