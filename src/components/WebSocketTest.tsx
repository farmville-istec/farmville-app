import { Play, Zap, Bell } from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'

export default function WebSocketTest() {
  const { connected, sendMessage } = useWebSocket()

  const testPing = () => {
    sendMessage('ping', { test: true, timestamp: new Date().toISOString() })
    console.log('Ping sent!')
  }

  const testTerrainSubscription = () => {
    const testTerrainId = 'test_terrain_123'
    sendMessage('subscribe_terrain', { terrain_id: testTerrainId })
    console.log(`Subscribed to terrain: ${testTerrainId}`)
  }

  const requestWeatherUpdate = () => {
    sendMessage('request_weather_update', { terrain_id: 'porto_farm' })
    console.log('Requested weather update!')
  }

  if (!connected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          WebSocket not connected. Start the backend server to test real-time features.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Zap className="h-5 w-5 mr-2 text-blue-600" />
        WebSocket Test Panel
      </h3>

      <div className="space-y-3">
        <button
          onClick={testPing}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Play className="h-4 w-4 mr-2" />
          Test Ping/Pong
        </button>

        <button
          onClick={testTerrainSubscription}
          className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Bell className="h-4 w-4 mr-2" />
          Test Terrain Subscription
        </button>

        <button
          onClick={requestWeatherUpdate}
          className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          <Zap className="h-4 w-4 mr-2" />
          Request Weather Update
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
        <p className="text-gray-600">
          <strong>Tip:</strong> Open browser console (F12) to see WebSocket messages and events.
        </p>
      </div>
    </div>
  )
}