const apiUrl = process
  .env
  .NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface Endpoint {
  id: string
  description: string
  path: string
  method: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEndpointRequest {
  description: string
  path: string
  method: string
  isPublic: boolean
}

export interface AddEndpointToGroupRequest {
  endpointId: string
  groupId: string
}

export interface RemoveEndpointFromGroupRequest {
  endpointId: string
  groupId: string
}

class EndpointService {
  private baseUrl: string

  constructor() {
    this.baseUrl = apiUrl
  }

  async createEndpoint(data: CreateEndpointRequest, accessToken: string): Promise<Endpoint> {
    const url = `${this.baseUrl}/endpoint/create`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON
        .stringify(data),
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to create endpoint' }))

      throw new Error(errorData.message || 'Failed to create endpoint')
    }

    const responseData = await response
      .json()

    return responseData
  }

  async deleteEndpoint(endpointId: string, accessToken: string): Promise<void> {
    const url = `${this.baseUrl}/endpoint/${endpointId}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to delete endpoint' }))

      throw new Error(errorData.message || 'Failed to delete endpoint')
    }
  }

  async addEndpointToGroup(data: AddEndpointToGroupRequest, accessToken: string): Promise<void> {
    const url = `${this.baseUrl}/endpoint/add-to-group`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON
        .stringify(data),
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to add endpoint to group' }))

      throw new Error(errorData.message || 'Failed to add endpoint to group')
    }
  }

  async removeEndpointFromGroup(data: RemoveEndpointFromGroupRequest, accessToken: string): Promise<void> {
    const url = `${this.baseUrl}/endpoint/remove-from-group`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON
        .stringify(data),
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to remove endpoint from group' }))

      throw new Error(errorData.message || 'Failed to remove endpoint from group')
    }
  }

  async listEndpoints(accessToken: string): Promise<Endpoint[]> {
    const url = `${this.baseUrl}/endpoint`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch endpoints' }))

      throw new Error(errorData.message || 'Failed to fetch endpoints')
    }

    const responseData = await response
      .json()

    return responseData
  }
}

export const endpointService = new EndpointService()
