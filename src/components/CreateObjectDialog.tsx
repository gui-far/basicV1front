import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DynamicForm } from './DynamicForm'
import { ObjectDefinition } from '@/services/objectDefinitionService'
import { groupService, Group } from '@/services/groupService'
import { userService, User } from '@/services/userService'

interface CreateObjectDialogProps {
  isOpen: boolean
  onClose: () => void
  objectDefinition: ObjectDefinition
  stageId: string
  onCreate: (properties: Record<string, any>, stageId: string, visibility?: string, sharedWithGroupIds?: string[], sharedWithUserIds?: string[]) => Promise<void>
}

export function CreateObjectDialog({
  isOpen,
  onClose,
  objectDefinition,
  stageId,
  onCreate,
}: CreateObjectDialogProps) {
  const [properties, setProperties] = useState<Record<string, any>>({})
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'public' | 'shared'>('private')
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadGroupsAndUsers()
    }
  }, [isOpen])

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

  const handleCreate = async () => {
    setError('')
    setCreating(true)

    try {
      await onCreate(
        properties,
        stageId,
        visibility,
        visibility === 'shared' ? selectedGroupIds : undefined,
        visibility === 'shared' ? selectedUserIds : undefined,
      )
      setProperties({})
      setVisibility('private')
      setSelectedGroupIds([])
      setSelectedUserIds([])
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create object')
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    setProperties({})
    setError('')
    setVisibility('private')
    setSelectedGroupIds([])
    setSelectedUserIds([])
    onClose()
  }

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev
        .includes(groupId)
        ? prev
          .filter((id) => id !== groupId)
        : [...prev, groupId]
    )
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev
        .includes(userId)
        ? prev
          .filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const stage = objectDefinition
    .definition
    .kanban
    .stages
    .find((s) => s.id === stageId)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Create New {objectDefinition.label}
          </DialogTitle>
          {stage && (
            <div className="text-sm text-gray-500">
              Initial Stage: <span className="font-medium">{stage.label}</span>
            </div>
          )}
        </DialogHeader>

        <div className="py-4 space-y-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4 border-b pb-4">
            <div className="space-y-2">
              <Label htmlFor="visibility" className="text-sm font-medium">
                Visibility
              </Label>
              <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
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

            {visibility === 'shared' && (
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
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

                {selectedGroupIds.length === 0 && selectedUserIds.length === 0 && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ Shared visibility requires at least one group or user
                  </div>
                )}
              </div>
            )}
          </div>

          <DynamicForm
            definition={objectDefinition}
            currentStageId={stageId}
            values={properties}
            onChange={setProperties}
            mode="create"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={creating} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || (visibility === 'shared' && selectedGroupIds.length === 0 && selectedUserIds.length === 0)}
            className="cursor-pointer"
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
