import { useAuth } from "../contexts/AuthContext"
import { LogOut, User, Calendar, Sprout, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Dashboard() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">FarmVille Hub</h1>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 overflow-hidden shadow rounded-lg mb-8">
            <div className="px-6 py-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username}! 🌾</h2>
              <p className="text-green-100 text-lg">
                Your intelligent farming assistant is ready to help you optimize your agricultural operations.
              </p>
            </div>
          </div>

          {/* Agricultural Dashboard Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Link
              to="/agro"
              className="group bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <Sprout className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">
                        Agricultural Dashboard
                      </h3>
                      <p className="text-sm text-gray-500">
                        Monitor your terrains, get AI-powered suggestions, and track weather conditions.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">0</p>
                    <p className="text-xs text-gray-500">Terrains</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">AI</p>
                    <p className="text-xs text-gray-500">Suggestions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">Live</p>
                    <p className="text-xs text-gray-500">Weather</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Coming Soon Features */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">More Features</h3>
                    <p className="text-sm text-gray-500">
                      Additional farming tools and analytics coming soon.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Weather alerts and notifications
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Crop yield predictions
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Market price forecasting
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-purple-600 font-medium">
                  🚀 Coming Soon
                </div>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-6 py-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Account Information
              </h3>

              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email || "Not provided"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">#{user?.id}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Last Login
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(user!.last_login)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}