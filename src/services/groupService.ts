const apiUrl = process
  .env
  .NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface Group {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface GroupUser {
  id: string
  email: string
}

export interface GroupEndpoint {
  id: string
  description: string
  path: string
  method: string
}

export interface GroupDetails {
  id: string
  name: string
  createdAt: string
  users: GroupUser[]
  endpoints: GroupEndpoint[]
}

export interface CreateGroupRequest {
  name: string
}

export interface AddUserToGroupRequest {
  userId: string
  groupId: string
}

export interface RemoveUserFromGroupRequest {
  userId: string
  groupId: string
}

class GroupService {
  private baseUrl: string

  constructor() {
    this.baseUrl = apiUrl
  }

  async createGroup(data: CreateGroupRequest, accessToken: string): Promise<Group> {
    const url = `${this.baseUrl}/api/group`

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
        .catch(() => ({ message: 'Failed to create group' }))

      throw new Error(errorData.message || 'Failed to create group')
    }

    const responseData = await response
      .json()

    return responseData
  }

  async deleteGroup(groupId: string, accessToken: string): Promise<void> {
    const url = `${this.baseUrl}/api/group/${groupId}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to delete group' }))

      throw new Error(errorData.message || 'Failed to delete group')
    }
  }

  async addUserToGroup(data: AddUserToGroupRequest, accessToken: string): Promise<void> {
    const url = `${this.baseUrl}/api/group/${data.groupId}/user/${data.userId}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to add user to group' }))

      throw new Error(errorData.message || 'Failed to add user to group')
    }
  }

  async removeUserFromGroup(data: RemoveUserFromGroupRequest, accessToken: string): Promise<void> {
    const url = `${this.baseUrl}/api/group/${data.groupId}/user/${data.userId}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to remove user from group' }))

      throw new Error(errorData.message || 'Failed to remove user from group')
    }
  }

  async listGroups(accessToken: string): Promise<Group[]> {
    const url = `${this.baseUrl}/api/group`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch groups' }))

      throw new Error(errorData.message || 'Failed to fetch groups')
    }

    const responseData = await response
      .json()

    return responseData
  }

  async getGroupDetails(groupId: string, accessToken: string): Promise<GroupDetails> {
    const url = `${this.baseUrl}/api/group/${groupId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch group details' }))

      throw new Error(errorData.message || 'Failed to fetch group details')
    }

    const responseData = await response
      .json()

    return responseData
  }
}

export const groupService = new GroupService()
