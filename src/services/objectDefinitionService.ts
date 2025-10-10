import { authenticatedFetch } from '@/lib/apiInterceptor'

const apiUrl = process
  .env
  .NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface PropertyDefinition {
  name: string
  label: string
  component: string
  required: boolean
  summaryOrder?: number
}

export interface KanbanStage {
  id: string
  label: string
  totalizerField?: string
}

export interface PropertyBehaviors {
  [stageId: string]: {
    [propertyName: string]: 'editable' | 'visible' | 'invisible'
  }
}

export interface KanbanDefinition {
  stages: KanbanStage[]
  propertyBehaviors: PropertyBehaviors
}

export interface ObjectDefinitionData {
  objectType: string
  label: string
  properties: PropertyDefinition[]
  kanban: KanbanDefinition
}

export interface ObjectDefinition {
  id: string
  objectType: string
  label: string
  definition: ObjectDefinitionData
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateObjectDefinitionRequest {
  objectType: string
  label: string
  properties: PropertyDefinition[]
  kanban: KanbanDefinition
  isActive?: boolean
}

export interface UpdateObjectDefinitionRequest {
  label?: string
  properties?: PropertyDefinition[]
  kanban?: KanbanDefinition
  isActive?: boolean
}

export interface ListObjectDefinitionsResponse {
  definitions: ObjectDefinition[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class ObjectDefinitionService {
  private baseUrl: string

  constructor() {
    this.baseUrl = apiUrl
  }

  async createObjectDefinition(
    data: CreateObjectDefinitionRequest,
    accessToken: string,
  ): Promise<ObjectDefinition> {
    const url = `${this.baseUrl}/api/object-definition`

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
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to create object definition' }))

      throw new Error(errorData.message || 'Failed to create object definition')
    }

    return await response
      .json()
  }

  async listObjectDefinitions(
    params: { page?: number; limit?: number; activeOnly?: boolean },
    accessToken: string,
  ): Promise<ListObjectDefinitionsResponse> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams
      .append('page', params.page.toString())
    if (params.limit) queryParams
      .append('limit', params.limit.toString())
    if (params.activeOnly !== undefined) queryParams
      .append('activeOnly', params.activeOnly.toString())

    const url = `${this.baseUrl}/api/object-definition?${queryParams}`

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch object definitions' }))

      throw new Error(errorData.message || 'Failed to fetch object definitions')
    }

    return await response
      .json()
  }

  async getObjectDefinition(
    id: string,
    accessToken: string,
  ): Promise<ObjectDefinition> {
    const url = `${this.baseUrl}/api/object-definition/${id}`

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch object definition' }))

      throw new Error(errorData.message || 'Failed to fetch object definition')
    }

    return await response
      .json()
  }

  async getObjectDefinitionByType(
    objectType: string,
    accessToken: string,
  ): Promise<ObjectDefinition> {
    const url = `${this.baseUrl}/api/object-definition/type/${objectType}`

    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch object definition' }))

      throw new Error(errorData.message || 'Failed to fetch object definition')
    }

    return await response
      .json()
  }

  async updateObjectDefinition(
    id: string,
    data: UpdateObjectDefinitionRequest,
    accessToken: string,
  ): Promise<ObjectDefinition> {
    const url = `${this.baseUrl}/api/object-definition/${id}`

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
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to update object definition' }))

      throw new Error(errorData.message || 'Failed to update object definition')
    }

    return await response
      .json()
  }
}

export const objectDefinitionService = new ObjectDefinitionService()
