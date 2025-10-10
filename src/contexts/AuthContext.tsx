'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, SignUpRequest, SignInRequest } from '@/services/authService'
import { useRouter } from 'next/navigation'
import { setUnauthorizedCallback } from '@/lib/apiInterceptor'

interface User {
  userId: string
  email: string
  isAdmin: boolean
}

interface AuthContextType {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  signUp: (data: SignUpRequest) => Promise<void>
  signIn: (data: SignInRequest) => Promise<void>
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeToken(token: string): User | null {
  try {
    const base64Url = token
      .split('.')[1]
    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    const payload = JSON
      .parse(jsonPayload)
    return {
      userId: payload.userId,
      email: payload.email,
      isAdmin: payload.isAdmin,
    }
  } catch (error) {
    console
      .error('Error decoding token:', error)
    return null
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token
      .split('.')[1]
    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    const payload = JSON
      .parse(jsonPayload)

    if (!payload.exp) {
      return false
    }

    const currentTime = Math
      .floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console
      .error('Error checking token expiration:', error)
    return true
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const handleUnauthorized = () => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)

    localStorage
      .removeItem('accessToken')

    localStorage
      .removeItem('refreshToken')

    router
      .push('/signin')
  }

  useEffect(() => {
    setUnauthorizedCallback(handleUnauthorized)
  }, [])

  useEffect(() => {
    const storedAccessToken = localStorage
      .getItem('accessToken')

    const storedRefreshToken = localStorage
      .getItem('refreshToken')

    if (storedAccessToken) {
      if (isTokenExpired(storedAccessToken)) {
        localStorage
          .removeItem('accessToken')
        localStorage
          .removeItem('refreshToken')
        setIsLoading(false)
        return
      }

      setAccessToken(storedAccessToken)
      const decodedUser = decodeToken(storedAccessToken)
      setUser(decodedUser)
    }

    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken)
    }

    setIsLoading(false)
  }, [])

  const signUp = async (data: SignUpRequest) => {
    await authService
      .signUp(data)

    router
      .push('/signin')
  }

  const signIn = async (data: SignInRequest) => {
    const response = await authService
      .signIn(data)

    setAccessToken(response.accessToken)
    setRefreshToken(response.refreshToken)

    const decodedUser = decodeToken(response.accessToken)
    setUser(decodedUser)

    localStorage
      .setItem('accessToken', response.accessToken)

    localStorage
      .setItem('refreshToken', response.refreshToken)

    router
      .push('/dashboard')
  }

  const signOut = async () => {
    if (accessToken) {
      try {
        await authService
          .signOut(accessToken)
      } catch (error) {
        console
          .error('Signout error:', error)
      }
    }

    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)

    localStorage
      .removeItem('accessToken')

    localStorage
      .removeItem('refreshToken')

    router
      .push('/signin')
  }

  const isAuthenticated = !!accessToken

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        isAuthenticated,
        signUp,
        signIn,
        signOut,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
