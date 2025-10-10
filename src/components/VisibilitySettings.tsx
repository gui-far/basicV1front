import { useState, useEffect } from 'react'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { groupService, Group } from '@/services/groupService'
import { userService, User } from '@/services/userService'

interface VisibilitySettingsProps {
  visibility: 'private' | 'public' | 'shared'
  selectedGroupIds: string[]
  selectedUserIds: string[]
  onVisibilityChange: (visibility: 'private' | 'public' | 'shared') => void
  onGroupsChange: (groupIds: string[]) => void
  onUsersChange: (userIds: string[]) => void
}

export function VisibilitySettings({
  visibility,
  selectedGroupIds,
  selectedUserIds,
  onVisibilityChange,
  onGroupsChange,
  onUsersChange,
}: VisibilitySettingsProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    loadGroupsAndUsers()
  }, [])

  const loadGroupsAndUsers = async () => {
    setLoadingData(true)
    try {
      const accessToken = localStorage
        .getItem('accessToken')

      if (accessToken) {
        const [groupsData, usersData] = await Promise
          .all([
            groupService
              .listGroups(accessToken),
            userService
              .listUsers(accessToken),
          ])

        setGroups(groupsData)
        setUsers(usersData)
      }
    } catch (err) {
      console
        .error('Failed to load groups and users:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const toggleGroupSelection = (groupId: string) => {
    const newSelection = selectedGroupIds
      .includes(groupId)
      ? selectedGroupIds
        .filter((id) => id !== groupId)
      : [...selectedGroupIds, groupId]
    onGroupsChange(newSelection)
  }

  const toggleUserSelection = (userId: string) => {
    const newSelection = selectedUserIds
      .includes(userId)
      ? selectedUserIds
        .filter((id) => id !== userId)
      : [...selectedUserIds, userId]
    onUsersChange(newSelection)
  }

  return (
    <div className="space-y-4">
      {visibility !== 'shared' && (
        <div className="space-y-2">
          <Label htmlFor="visibility" className="text-sm font-medium">
            Visibility
          </Label>
          <Select value={visibility} onValueChange={(value: any) => onVisibilityChange(value)}>
            <SelectTrigger id="visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">🔒 Private (Only me)</SelectItem>
              <SelectItem value="public">🌐 Public (Everyone)</SelectItem>
              <SelectItem value="shared">👥 Shared (Specific groups/users)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {visibility === 'shared' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Share with Groups</Label>
            <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
              {loadingData ? (
                <div className="text-sm text-gray-500">Loading groups...</div>
              ) : groups.length === 0 ? (
                <div className="text-sm text-gray-500">No groups available</div>
              ) : (
                groups
                  .map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => toggleGroupSelection(group.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroupIds
                          .includes(group.id)}
                        onChange={() => toggleGroupSelection(group.id)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">{group.name}</span>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Share with Users</Label>
            <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
              {loadingData ? (
                <div className="text-sm text-gray-500">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-sm text-gray-500">No users available</div>
              ) : (
                users
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds
                          .includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  ))
              )}
            </div>
          </div>

          {visibility === 'shared' && selectedGroupIds.length === 0 && selectedUserIds.length === 0 && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              Please select at least one group or user to share with
            </div>
          )}
        </div>
      )}
    </div>
  )
}
