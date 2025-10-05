'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DataTableCard } from '@/components/DataTableCard'
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

  const handleCreateGroup = async (e: React.FormEvent) => {
    e
      .preventDefault()

    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      const newGroup = await groupService
        .createGroup({ name: groupName }, accessToken)

      setGroups([...groups, newGroup])
      setGroupName('')
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
              <CardTitle>Create New Group</CardTitle>
              <CardDescription>Add a new group to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <DataTableCard
            title="Existing Groups"
            description="Manage your groups below"
            loading={isLoading}
            error={fetchError}
            data={groups}
            emptyMessage="No groups created yet. Create one above to get started."
            renderTable={(groupsData) => (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupsData
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
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
