'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { endpointService } from '@/services/endpointService'
import { groupService } from '@/services/groupService'
import Link from 'next/link'

export default function PermissionsPage() {
  const [endpointId, setEndpointId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [userId, setUserId] = useState('')
  const [userGroupId, setUserGroupId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { accessToken } = useAuth()

  const handleAddEndpointToGroup = async (e: React.FormEvent) => {
    e
      .preventDefault()

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await endpointService
        .addEndpointToGroup({ endpointId, groupId }, accessToken)

      setEndpointId('')
      setGroupId('')
      setSuccess('Endpoint added to group successfully')
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while adding endpoint to group'

      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveEndpointFromGroup = async (e: React.FormEvent) => {
    e
      .preventDefault()

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await endpointService
        .removeEndpointFromGroup({ endpointId, groupId }, accessToken)

      setEndpointId('')
      setGroupId('')
      setSuccess('Endpoint removed from group successfully')
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while removing endpoint from group'

      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddUserToGroup = async (e: React.FormEvent) => {
    e
      .preventDefault()

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await groupService
        .addUserToGroup({ userId, groupId: userGroupId }, accessToken)

      setUserId('')
      setUserGroupId('')
      setSuccess('User added to group successfully')
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while adding user to group'

      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveUserFromGroup = async (e: React.FormEvent) => {
    e
      .preventDefault()

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await groupService
        .removeUserFromGroup({ userId, groupId: userGroupId }, accessToken)

      setUserId('')
      setUserGroupId('')
      setSuccess('User removed from group successfully')
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while removing user from group'

      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Permissions Management</h1>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 text-sm text-green-600 bg-green-50 rounded">
              {success}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Endpoint-Group Permissions</CardTitle>
              <CardDescription>Manage which endpoints are accessible by which groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAddEndpointToGroup} className="space-y-4">
                <h3 className="text-lg font-semibold">Add Endpoint to Group</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endpointId">Endpoint ID</Label>
                    <Input
                      id="endpointId"
                      type="text"
                      placeholder="Enter endpoint ID"
                      value={endpointId}
                      onChange={(e) => setEndpointId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupId">Group ID</Label>
                    <Input
                      id="groupId"
                      type="text"
                      placeholder="Enter group ID"
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Add Endpoint to Group'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={handleRemoveEndpointFromGroup}
                  >
                    {isSubmitting ? 'Processing...' : 'Remove Endpoint from Group'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User-Group Permissions</CardTitle>
              <CardDescription>Manage which users belong to which groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAddUserToGroup} className="space-y-4">
                <h3 className="text-lg font-semibold">Add User to Group</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      type="text"
                      placeholder="Enter user ID"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userGroupId">Group ID</Label>
                    <Input
                      id="userGroupId"
                      type="text"
                      placeholder="Enter group ID"
                      value={userGroupId}
                      onChange={(e) => setUserGroupId(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Add User to Group'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={handleRemoveUserFromGroup}
                  >
                    {isSubmitting ? 'Processing...' : 'Remove User from Group'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Get IDs</CardTitle>
              <CardDescription>Instructions for finding resource IDs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Endpoint IDs:</strong> Create an endpoint on the Endpoints page and copy its ID from the table.</p>
              <p><strong>Group IDs:</strong> Create a group on the Groups page and copy its ID from the table.</p>
              <p><strong>User IDs:</strong> User IDs are available in the JWT token payload after signin, or from the signin response.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
