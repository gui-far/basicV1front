'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { groupService, Group } from '@/services/groupService'
import Link from 'next/link'

export default function GroupsPage() {
  const [groupName, setGroupName] = useState('')
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { accessToken } = useAuth()

  const handleCreateGroup = async (e: React.FormEvent) => {
    e
      .preventDefault()

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      const newGroup = await groupService
        .createGroup({ name: groupName }, accessToken)

      setGroups([...groups, newGroup])
      setGroupName('')
      setSuccess('Group created successfully')
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while creating group'

      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    setError('')
    setSuccess('')

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

      setSuccess('Group deleted successfully')
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while deleting group'

      setError(errorMessage)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Groups Management</h1>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
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
                {error && (
                  <div className="text-sm text-red-600">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-sm text-green-600">
                    {success}
                  </div>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Groups</CardTitle>
              <CardDescription>
                {groups.length === 0 ? 'No groups created yet. Create one above to get started.' : 'Manage your groups below'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groups.length > 0 ? (
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
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No groups to display
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
