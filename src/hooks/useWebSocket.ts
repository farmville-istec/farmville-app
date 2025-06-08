/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketMessage {
  event_type: string
  timestamp: string
  data: any
  source?: string
}

interface WeatherUpdate {
  type: string
  location?: string
  source?: string
  timestamp: string
}

interface AgroUpdate {
  type: string
  terrain_id?: string
  suggestions?: string[]
  priority?: string
  timestamp: string
}

interface UseWebSocketReturn {
  socket: Socket | null
  connected: boolean
  lastMessage: WebSocketMessage | null
  weatherUpdates: WeatherUpdate[]
  agroUpdates: AgroUpdate[]
  sendMessage: (event: string, data: any) => void
  subscribeToTerrain: (terrainId: string) => void
  unsubscribeFromTerrain: (terrainId: string) => void
}

const WS_SERVER_URL = 'http://localhost:5001'

export function useWebSocket(): UseWebSocketReturn {
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [weatherUpdates, setWeatherUpdates] = useState<WeatherUpdate[]>([])
  const [agroUpdates, setAgroUpdates] = useState<AgroUpdate[]>([])
  
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize WebSocket connection
    console.log('🔌 Connecting to WebSocket server...')
    
    const socket = io(WS_SERVER_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
    })

    socketRef.current = socket

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id)
      setConnected(true)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
      setConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('🔥 WebSocket connection error:', error)
      setConnected(false)
    })

    // Custom event handlers
    socket.on('connection_status', (data) => {
      console.log('🔗 Connection status:', data)
    })

    socket.on('weather_update', (data: WeatherUpdate) => {
      console.log('🌤️ Weather update received:', data)
      setWeatherUpdates(prev => [data, ...prev.slice(0, 9)]) // Keep last 10
      setLastMessage({
        event_type: 'weather_update',
        timestamp: data.timestamp,
        data: data,
        source: 'WeatherService'
      })
    })

    socket.on('agro_update', (data: AgroUpdate) => {
      console.log('🌾 Agro update received:', data)
      setAgroUpdates(prev => [data, ...prev.slice(0, 9)]) // Keep last 10
      setLastMessage({
        event_type: 'agro_update',
        timestamp: data.timestamp,
        data: data,
        source: 'AgroService'
      })
    })

    socket.on('weather_alert', (data) => {
      console.log('🚨 Weather alert received:', data)
      setLastMessage({
        event_type: 'weather_alert',
        timestamp: data.timestamp,
        data: data,
        source: 'WeatherService'
      })
      
      // Show browser notification if possible
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Weather Alert', {
          body: `${data.alert_type} in ${data.location}: ${data.message}`,
          icon: '/favicon.ico'
        })
      }
    })

    socket.on('general_update', (data) => {
      console.log('📢 General update received:', data)
      setLastMessage({
        event_type: 'general_update',
        timestamp: data.timestamp,
        data: data
      })
    })

    // Ping/pong for connection testing
    socket.on('pong', (data) => {
      console.log('🏓 Pong received:', data)
    })

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket connection...')
      socket.disconnect()
    }
  }, [])

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && connected) {
      console.log(`📤 Sending ${event}:`, data)
      socketRef.current.emit(event, data)
    } else {
      console.warn('⚠️ Cannot send message - WebSocket not connected')
    }
  }

  const subscribeToTerrain = (terrainId: string) => {
    sendMessage('subscribe_terrain', { terrain_id: terrainId })
  }

  const unsubscribeFromTerrain = (terrainId: string) => {
    sendMessage('unsubscribe_terrain', { terrain_id: terrainId })
  }

  return {
    socket: socketRef.current,
    connected,
    lastMessage,
    weatherUpdates,
    agroUpdates,
    sendMessage,
    subscribeToTerrain,
    unsubscribeFromTerrain
  }
}

// Helper hook for requesting notification permissions
export function useNotificationPermission() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission)
      })
    }
  }, [])
}