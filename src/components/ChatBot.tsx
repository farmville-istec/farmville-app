/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { MessageCircle, X, Bot, Wifi, WifiOff, Sprout } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useWebSocket } from '../hooks/useWebSocket'

interface ChatBotProps {
  terrains: any[]
  weatherData?: Record<string, any>
  agroSuggestions?: Record<string, any>
}

export default function ChatBot({ 
  terrains, 
  weatherData = {}, 
  agroSuggestions = {} 
}: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const { connected: websocketConnected } = useWebSocket()

  const createRichContext = () => {
    const enrichedTerrains = terrains.map(terrain => ({
      ...terrain,
      weather: weatherData[terrain.id],
      agro_suggestions: agroSuggestions[terrain.id]
    }))

    const contextObj = {
      user: {
        username: user?.username,
        email: user?.email
      },
      websocket_connected: websocketConnected,
      timestamp: new Date().toISOString(),
      terrains: enrichedTerrains
    }

    console.log('AI Context being sent:', contextObj)
    return JSON.stringify(contextObj)
  }

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: 'http://localhost:3001/api/chat',
    body: {
      data: {
        context: createRichContext()
      }
    },
    onError: (error: unknown) => {
      console.error('Chat error:', error)
    },
    onFinish: (message: { id: string; role: string; content: string }) => {
      console.log('AI Response finished:', message)
    }
  })

  const quickPrompts = [
    "What's the current status of all my terrains?",
    "Which terrain needs attention right now?", 
    "What are today's weather conditions?",
    "Give me farming recommendations",
    "Any urgent agricultural alerts?"
  ]

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 relative"
          title="Open Agricultural AI Assistant"
        >
          <MessageCircle className="h-6 w-6" />
          {websocketConnected && (
            <span className="absolute -bottom-1 -left-1 bg-green-400 rounded-full h-3 w-3"></span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white border border-gray-200 rounded-lg shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Sprout className="h-5 w-5 text-green-600" />
          <div>
            <span className="font-semibold text-gray-800">Farmville Assistant</span>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              {websocketConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span>Live Data</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span>Offline</span>
                </>
              )}
              <span>• {terrains.length} terrains</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Farmville AI
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              I have access to your {terrains.length} terrain(s), weather data, and AI farming insights.
            </p>
            
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-3">Quick questions:</p>
              {quickPrompts.slice(0, 3).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleInputChange({ target: { value: prompt } } as any)
                    setTimeout(() => {
                      handleSubmit({ preventDefault: () => {} } as any)
                    }, 100)
                  }}
                  className="block w-full text-left text-xs bg-gray-50 hover:bg-green-50 p-2 rounded border border-gray-200 hover:border-green-300 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-1 mb-1">
                  <Bot className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Farmville AI</span>
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm max-w-[85%]">
              <div className="flex items-center space-x-2">
                <Bot className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Farm AI</span>
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex space-x-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about your terrains, weather, or farming advice..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Send
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center">
            AI has live access to {terrains.length} terrain(s) + weather + farming insights
          </div>
        </form>
      </div>
    </div>
  )
}