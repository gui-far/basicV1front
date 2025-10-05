'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { groupService, GroupDetails, GroupUser, GroupEndpoint } from '@/services/groupService'
import { endpointService, Endpoint } from '@/services/endpointService'
import { userService, User } from '@/services/userService'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'

export default function EditGroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params
    .id as string

  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null)
  const [allEndpoints, setAllEndpoints] = useState<Endpoint[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedEndpointToAdd, setSelectedEndpointToAdd] = useState('')
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { accessToken } = useAuth()
  const { toast } = useToast()

  const fetchGroupDetails = async () => {
    if (!accessToken) {
      setIsLoading(false)
      return
    }

    try {
      const [details, fetchedEndpoints, fetchedUsers] = await Promise
        .all([
          groupService
            .getGroupDetails(groupId, accessToken),
          endpointService
            .listEndpoints(accessToken),
          userService
            .listUsers(accessToken),
        ])

      setGroupDetails(details)
      setAllEndpoints(fetchedEndpoints)
      setAllUsers(fetchedUsers)
    } catch (err) {
      console
        .error('Failed to fetch data:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load data. Please check your permissions.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroupDetails()
  }, [accessToken, groupId])

  const handleAddEndpointToGroup = async (e: React.FormEvent) => {
    e
      .preventDefault()

    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await endpointService
        .addEndpointToGroup(
          { endpointId: selectedEndpointToAdd, groupId },
          accessToken
        )

      setSelectedEndpointToAdd('')
      toast({
        title: 'Success',
        description: 'Endpoint added to group successfully',
      })
      await fetchGroupDetails()
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while adding endpoint to group'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveEndpointFromGroup = async (endpointId: string) => {
    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await endpointService
        .removeEndpointFromGroup(
          { endpointId, groupId },
          accessToken
        )

      toast({
        title: 'Success',
        description: 'Endpoint removed from group successfully',
      })
      await fetchGroupDetails()
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while removing endpoint from group'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddUserToGroup = async (e: React.FormEvent) => {
    e
      .preventDefault()

    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await groupService
        .addUserToGroup(
          { userId: selectedUserToAdd, groupId },
          accessToken
        )

      setSelectedUserToAdd('')
      toast({
        title: 'Success',
        description: 'User added to group successfully',
      })
      await fetchGroupDetails()
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while adding user to group'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveUserFromGroup = async (userId: string) => {
    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await groupService
        .removeUserFromGroup(
          { userId, groupId },
          accessToken
        )

      toast({
        title: 'Success',
        description: 'User removed from group successfully',
      })
      await fetchGroupDetails()
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while removing user from group'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {isLoading ? 'Loading...' : groupDetails ? `Edit Group: ${groupDetails.name}` : 'Group Not Found'}
            </h1>
            <Button variant="outline" onClick={() => router.push('/groups')}>
              Back to Groups
            </Button>
          </div>

          {groupDetails && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Group Details</CardTitle>
                  <CardDescription>Information about this group</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Name:</span> {groupDetails.name}
                    </div>
                    <div>
                      <span className="font-semibold">Created:</span> {new Date(groupDetails.createdAt)
                        .toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Endpoints</CardTitle>
                  <CardDescription>
                    {groupDetails.endpoints.length === 0
                      ? 'No endpoints assigned to this group yet'
                      : `${groupDetails.endpoints.length} endpoint(s) currently assigned`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleAddEndpointToGroup} className="flex gap-2">
                    {isLoading ? (
                      <p className="text-sm text-gray-500">Loading data...</p>
                    ) : (
                      <>
                        <div className="flex-1">
                          <Select value={selectedEndpointToAdd} onValueChange={setSelectedEndpointToAdd} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an endpoint" />
                            </SelectTrigger>
                            <SelectContent>
                              {allEndpoints
                                .map((endpoint) => (
                                  <SelectItem key={endpoint.id} value={endpoint.id}>
                                    {endpoint.description} ({endpoint.path})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" disabled={isSubmitting || !selectedEndpointToAdd}>
                          {isSubmitting ? 'Adding...' : 'Add Endpoint'}
                        </Button>
                      </>
                    )}
                  </form>

                  {groupDetails.endpoints.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Path</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupDetails
                          .endpoints
                          .map((endpoint) => (
                            <TableRow key={endpoint.id}>
                              <TableCell className="font-medium">{endpoint.description}</TableCell>
                              <TableCell>{endpoint.path}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                                  {endpoint.method}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveEndpointFromGroup(endpoint.id)}
                                  disabled={isSubmitting}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No endpoints assigned yet. Use the form above to add endpoints.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Users</CardTitle>
                  <CardDescription>
                    {groupDetails.users.length === 0
                      ? 'No users assigned to this group yet'
                      : `${groupDetails.users.length} user(s) currently assigned`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleAddUserToGroup} className="flex gap-2">
                    {isLoading ? (
                      <p className="text-sm text-gray-500">Loading data...</p>
                    ) : (
                      <>
                        <div className="flex-1">
                          <Select value={selectedUserToAdd} onValueChange={setSelectedUserToAdd} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                              {allUsers
                                .map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.email}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" disabled={isSubmitting || !selectedUserToAdd}>
                          {isSubmitting ? 'Adding...' : 'Add User'}
                        </Button>
                      </>
                    )}
                  </form>

                  {groupDetails.users.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupDetails
                          .users
                          .map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveUserFromGroup(user.id)}
                                  disabled={isSubmitting}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No users assigned yet. Use the form above to add users.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
