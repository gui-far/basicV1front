import { authenticatedFetch } from '@/lib/apiInterceptor'

const apiUrl = process
  .env
  .NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface User {
  id: string
  email: string
}

class UserService {
  private baseUrl: string

  constructor() {
    this.baseUrl = apiUrl
  }

  async listUsers(accessToken: string): Promise<User[]> {
    const url = `${this.baseUrl}/api/user`

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch users' }))

      throw new Error(errorData.message || 'Failed to fetch users')
    }

    const responseData = await response
      .json()

    return responseData
  }
}

export const userService = new UserService()
