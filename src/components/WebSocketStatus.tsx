import { Wifi, WifiOff, Activity, Bell, Zap } from 'lucide-react'
import { useWebSocket, useNotificationPermission } from '../hooks/useWebSocket'

interface WebSocketStatusProps {
  showRecentUpdates?: boolean
  className?: string
}

export default function WebSocketStatus({ showRecentUpdates = true, className = '' }: WebSocketStatusProps) {
  const { 
    connected, 
    lastMessage, 
    weatherUpdates, 
    agroUpdates, 
    sendMessage 
  } = useWebSocket()
  
  useNotificationPermission()

  const testConnection = () => {
    sendMessage('ping', { timestamp: new Date().toISOString() })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 p-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {connected ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            Real-time Updates
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <button
          onClick={testConnection}
          disabled={!connected}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Test connection"
        >
          <Activity className="h-4 w-4" />
        </button>
      </div>

      {/* Last Message */}
      {lastMessage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-800">
              Latest Update
            </span>
            <span className="text-xs text-blue-600">
              {formatTime(lastMessage.timestamp)}
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {lastMessage.event_type.replace('_', ' ').toUpperCase()}
            {lastMessage.source && ` from ${lastMessage.source}`}
          </p>
        </div>
      )}

      {/* Recent Updates */}
      {showRecentUpdates && (
        <div className="space-y-3">
          {/* Weather Updates */}
          {weatherUpdates.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Weather Updates ({weatherUpdates.length})
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {weatherUpdates.slice(0, 3).map((update, index) => (
                  <div key={index} className="text-xs p-2 bg-gray-50 rounded border-l-2 border-blue-400">
                    <div className="flex justify-between">
                      <span className="font-medium">{update.type}</span>
                      <span className="text-gray-500">{formatTime(update.timestamp)}</span>
                    </div>
                    {update.location && (
                      <p className="text-gray-600">📍 {update.location}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agro Updates */}
          {agroUpdates.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                <Bell className="h-3 w-3 mr-1" />
                Agro Updates ({agroUpdates.length})
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {agroUpdates.slice(0, 3).map((update, index) => (
                  <div key={index} className={`text-xs p-2 rounded border-l-2 border-green-400 ${getPriorityColor(update.priority)}`}>
                    <div className="flex justify-between">
                      <span className="font-medium">{update.type}</span>
                      <span className="text-gray-500">{formatTime(update.timestamp)}</span>
                    </div>
                    {update.terrain_id && (
                      <p className="text-gray-600">🌾 Terrain {update.terrain_id}</p>
                    )}
                    {update.suggestions && update.suggestions.length > 0 && (
                      <p className="text-gray-600 truncate">
                        💡 {update.suggestions[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No updates */}
          {weatherUpdates.length === 0 && agroUpdates.length === 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-gray-500">No recent updates</p>
              <p className="text-xs text-gray-400">
                {connected ? 'Waiting for real-time data...' : 'Connect to receive updates'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}