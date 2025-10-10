import { authenticatedFetch } from '@/lib/apiInterceptor'
import { handleApiError } from '@/lib/errorFormatter'

const apiUrl = process
  .env
  .NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface GenericObject {
  id: string
  objectDefinitionId: string
  currentStageId: string
  properties: Record<string, any>
  createdById: string | null
  visibility: string
  createdAt: string
  updatedAt: string
}

export interface GenericObjectWithBehavior extends GenericObject {
  propertyBehaviors: Record<string, 'editable' | 'visible' | 'invisible'>
  objectDefinition: {
    id: string
    objectType: string
    label: string
  }
}

export interface CreateGenericObjectRequest {
  objectType: string
  initialStageId: string
  properties: Record<string, any>
  visibility?: string
  sharedWithGroupIds?: string[]
  sharedWithUserIds?: string[]
}

export interface UpdateGenericObjectRequest {
  properties: Record<string, any>
}

export interface UpdateObjectStageRequest {
  newStageId: string
}

export interface ListGenericObjectsResponse {
  objects: GenericObject[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ObjectHistoryEntry {
  id: string
  objectId: string
  previousStageId: string | null
  newStageId: string
  changedById: string | null
  changeType: string
  changes: Record<string, any> | null
  createdAt: string
  changedBy: {
    id: string
    email: string
  } | null
}

class GenericObjectService {
  private baseUrl: string

  constructor() {
    this.baseUrl = apiUrl
  }

  async createObject(
    data: CreateGenericObjectRequest,
    accessToken: string,
  ): Promise<GenericObject> {
    const url = `${this.baseUrl}/api/object`

    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON
        .stringify(data),
    })

    if (!response.ok) {
      await handleApiError(response, 'Failed to create object')
    }

    return await response
      .json()
  }

  async updateObject(
    id: string,
    data: UpdateGenericObjectRequest,
    accessToken: string,
  ): Promise<GenericObject> {
    const url = `${this.baseUrl}/api/object/${id}`

    const response = await authenticatedFetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON
        .stringify(data),
    })

    if (!response.ok) {
      await handleApiError(response, 'Failed to update object')
    }

    return await response
      .json()
  }

  async updateObjectStage(
    id: string,
    data: UpdateObjectStageRequest,
    accessToken: string,
  ): Promise<GenericObject> {
    const url = `${this.baseUrl}/api/object/${id}/stage`

    const response = await authenticatedFetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON
        .stringify(data),
    })

    if (!response.ok) {
      await handleApiError(response, 'Failed to update object stage')
    }

    return await response
      .json()
  }

  async deleteObject(id: string, accessToken: string): Promise<void> {
    const url = `${this.baseUrl}/api/object/${id}`

    const response = await authenticatedFetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      await handleApiError(response, 'Failed to delete object')
    }
  }

  async getObject(
    id: string,
    accessToken: string,
  ): Promise<GenericObjectWithBehavior> {
    const url = `${this.baseUrl}/api/object/${id}`

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch object')
    }

    return await response
      .json()
  }

  async listObjects(
    params: {
      page?: number
      limit?: number
      objectType?: string
      stageId?: string
      createdById?: string
    },
    accessToken: string,
  ): Promise<ListGenericObjectsResponse> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams
      .append('page', params.page.toString())
    if (params.limit) queryParams
      .append('limit', params.limit.toString())
    if (params.objectType) queryParams
      .append('objectType', params.objectType)
    if (params.stageId) queryParams
      .append('stageId', params.stageId)
    if (params.createdById) queryParams
      .append('createdById', params.createdById)

    const url = `${this.baseUrl}/api/object?${queryParams}`

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch objects')
    }

    return await response
      .json()
  }

  async getObjectHistory(
    objectId: string,
    accessToken: string,
  ): Promise<ObjectHistoryEntry[]> {
    const url = `${this.baseUrl}/api/object/${objectId}/history`

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch object history')
    }

    return await response
      .json()
  }

  async updateObjectSharing(
    objectId: string,
    data: {
      visibility: string
      sharedWithGroupIds?: string[]
      sharedWithUserIds?: string[]
    },
    accessToken: string,
  ): Promise<GenericObject> {
    const url = `${this.baseUrl}/api/object/${objectId}/sharing`

    const response = await authenticatedFetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON
        .stringify(data),
    })

    if (!response.ok) {
      await handleApiError(response, 'Failed to update object sharing')
    }

    return await response
      .json()
  }
}

export const genericObjectService = new GenericObjectService()
