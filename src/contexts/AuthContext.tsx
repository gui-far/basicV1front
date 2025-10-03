'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, SignUpRequest, SignInRequest } from '@/services/authService'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  signUp: (data: SignUpRequest) => Promise<void>
  signIn: (data: SignInRequest) => Promise<void>
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedAccessToken = localStorage
      .getItem('accessToken')

    const storedRefreshToken = localStorage
      .getItem('refreshToken')

    if (storedAccessToken) {
      setAccessToken(storedAccessToken)
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
