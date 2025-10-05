const apiUrl = process
  .env
  .NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface UserProfile {
  id: string
  email: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

export interface Analytics {
  totalUsers: number
  activeUsers: number
  revenue: number
  conversionRate: number
  lastUpdated: string
}

export interface Health {
  status: string
  uptime: number
  timestamp: string
  version: string
}

class DashboardService {
  private baseUrl: string

  constructor() {
    this.baseUrl = apiUrl
  }

  async getUserProfile(accessToken: string): Promise<UserProfile> {
    const url = `${this.baseUrl}/api/users/profile`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch user profile' }))

      throw new Error(errorData.message || 'Failed to fetch user profile')
    }

    const responseData = await response
      .json()

    return responseData
  }

  async getAnalytics(accessToken: string): Promise<Analytics> {
    const url = `${this.baseUrl}/api/analytics`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch analytics' }))

      throw new Error(errorData.message || 'Failed to fetch analytics')
    }

    const responseData = await response
      .json()

    return responseData
  }

  async getHealth(accessToken: string): Promise<Health> {
    const url = `${this.baseUrl}/api/health`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch health status' }))

      throw new Error(errorData.message || 'Failed to fetch health status')
    }

    const responseData = await response
      .json()

    return responseData
  }
}

export const dashboardService = new DashboardService()
