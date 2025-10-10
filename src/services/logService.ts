import { authenticatedFetch } from '@/lib/apiInterceptor'

const apiUrl = process
  .env
  .NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface LogEntity {
  id: string
  message: string
  stack: string | null
  userId: string | null
  method: string | null
  path: string | null
  statusCode: number | null
  createdAt: string
  user?: {
    id: string
    email: string
  } | null
}

export interface ListLogsResponse {
  logs: LogEntity[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class LogService {
  private baseUrl: string

  constructor() {
    this.baseUrl = apiUrl
  }

  async getPermissionErrorLogs(
    accessToken: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ListLogsResponse> {
    const url = `${this.baseUrl}/api/log?page=${page}&limit=${limit}&statusCode=403`

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch permission error logs' }))

      throw new Error(errorData.message || 'Failed to fetch permission error logs')
    }

    const responseData = await response
      .json()

    return responseData
  }

  async getGeneralErrorLogs(
    accessToken: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ListLogsResponse> {
    const url = `${this.baseUrl}/api/log?page=${page}&limit=${limit}&statusCodeMin=400&statusCodeMax=599&statusCodeExclude=403`

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch general error logs' }))

      throw new Error(errorData.message || 'Failed to fetch general error logs')
    }

    const responseData = await response
      .json()

    return responseData
  }

  async getLogById(logId: string, accessToken: string): Promise<LogEntity> {
    const url = `${this.baseUrl}/api/log/${logId}`

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch log details' }))

      throw new Error(errorData.message || 'Failed to fetch log details')
    }

    const responseData = await response
      .json()

    return responseData
  }
}

export const logService = new LogService()
