"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"

interface User {
  id: number
  username: string
  email: string
  last_login: string | null
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (username: string, password: string, email: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem("farmville_token")
    if (token) {
      checkAuthStatus()
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getProfile()
      if (response.user) {
        setUser(response.user)
      }
    } catch {
      localStorage.removeItem("farmville_token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password)

      if (response.success) {
        localStorage.setItem("farmville_token", response.token)
        setUser(response.user)
        return { success: true, message: "Login successful!" }
      } else {
        return { success: false, message: response.message }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please try again.",
      }
    }
  }

  const register = async (username: string, password: string, email: string) => {
    try {
      const response = await authAPI.register(username, password, email)

      if (response.success) {
        return { success: true, message: "Registration successful! Please login." }
      } else {
        return { success: false, message: response.message }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again.",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("farmville_token")
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
