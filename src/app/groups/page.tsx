'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { groupService, Group } from '@/services/groupService'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function GroupsPage() {
  const router = useRouter()
  const [groupName, setGroupName] = useState('')
  const [groups, setGroups] = useState<Group[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { accessToken } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchGroups = async () => {
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        setFetchError(null)
        const fetchedGroups = await groupService
          .listGroups(accessToken)

        setGroups(fetchedGroups)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load groups'
        setFetchError(errorMessage)
        console
          .error('Failed to fetch groups:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [accessToken])

  const handleCreateGroup = async () => {
    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      const newGroup = await groupService
        .createGroup({ name: groupName }, accessToken)

      setGroups([...groups, newGroup])
      setGroupName('')
      setShowCreateForm(false)
      toast({
        title: 'Success',
        description: 'Group created successfully',
      })
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while creating group'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    const confirmed = confirm('Are you sure you want to delete this group?')

    if (!confirmed) {
      return
    }

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await groupService
        .deleteGroup(groupId, accessToken)

      setGroups(groups
        .filter(g => g.id !== groupId))

      toast({
        title: 'Success',
        description: 'Group deleted successfully',
      })
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while deleting group'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Groups Management</h1>
            <Link href="/dashboard" className="cursor-pointer">
              <Button variant="outline" className="cursor-pointer">Back to Dashboard</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Existing Groups</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? 'Loading...'
                      : fetchError
                      ? 'Error loading data'
                      : groups.length === 0
                      ? 'No groups created yet. Create one to get started.'
                      : 'Manage your groups below'}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCreateForm(true)} className="cursor-pointer">
                  Create Group
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : fetchError ? (
                <div className="flex items-start gap-3 p-4 rounded-lg border-yellow-200 bg-yellow-50">
                  <svg
                    className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">Unable to load data</p>
                    <p className="text-xs text-yellow-700 mt-1">{fetchError}</p>
                  </div>
                </div>
              ) : groups.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No groups created yet. Create one to get started.
                </p>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups
                    .map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>{new Date(group.createdAt)
                          .toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/groups/${group.id}`)}
                              className="cursor-pointer"
                            >
                              Manage Group
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteGroup(group.id)}
                              className="cursor-pointer"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>

          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setGroupName('')
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={isSubmitting || !groupName}
                    className="cursor-pointer"
                  >
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  )
}
