const apiUrl = process
  .env
  .NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface SignUpRequest {
  email: string
  password: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface SignInResponse {
  accessToken: string
  refreshToken: string
}

export interface AuthError {
  message: string
  statusCode: number
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

class AuthService {
  private baseUrl: string

  constructor() {
    this.baseUrl = apiUrl
  }

  async signUp(data: SignUpRequest): Promise<void> {
    const url = `${this.baseUrl}/api/auth/signup`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON
        .stringify(data),
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Signup failed' }))

      throw new Error(errorData.message || 'Signup failed')
    }
  }

  async signIn(data: SignInRequest): Promise<SignInResponse> {
    const url = `${this.baseUrl}/api/auth/signin`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON
        .stringify(data),
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Signin failed' }))

      throw new Error(errorData.message || 'Signin failed')
    }

    const responseData = await response
      .json()

    return responseData
  }

  async signOut(accessToken: string): Promise<void> {
    const url = `${this.baseUrl}/api/auth/signout`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return
      }

      const errorData = await response
        .json()
        .catch(() => ({ message: 'Signout failed' }))

      throw new Error(errorData.message || 'Signout failed')
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const url = `${this.baseUrl}/api/auth/password-email`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON
        .stringify({ email }),
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to send password reset email' }))

      throw new Error(errorData.message || 'Failed to send password reset email')
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const url = `${this.baseUrl}/api/auth/password-reset`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON
        .stringify({ token, newPassword }),
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to reset password' }))

      throw new Error(errorData.message || 'Failed to reset password')
    }
  }
}

export const authService = new AuthService()
