'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { objectDefinitionService, ObjectDefinition, ObjectDefinitionGroup } from '@/services/objectDefinitionService'
import { groupService, Group } from '@/services/groupService'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export default function ObjectDefinitionGroupsPage() {
  const params = useParams()
  const router = useRouter()
  const objectDefinitionId = params
    .id as string

  const [objectDefinition, setObjectDefinition] = useState<ObjectDefinition | null>(null)
  const [assignedGroups, setAssignedGroups] = useState<ObjectDefinitionGroup[]>([])
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [selectedGroupToAssign, setSelectedGroupToAssign] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { accessToken } = useAuth()
  const { toast } = useToast()

  const fetchData = async () => {
    if (!accessToken) {
      setIsLoading(false)
      return
    }

    try {
      const [definition, groups, allGroupsList] = await Promise
        .all([
          objectDefinitionService
            .getObjectDefinition(objectDefinitionId, accessToken),
          objectDefinitionService
            .listObjectDefinitionGroups(objectDefinitionId, accessToken),
          groupService
            .listGroups(accessToken),
        ])

      setObjectDefinition(definition)
      setAssignedGroups(groups)
      setAllGroups(allGroupsList)
    } catch (err) {
      console
        .error('Failed to fetch data:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load data',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [accessToken, objectDefinitionId])

  const handleAssignGroup = async (e: React.FormEvent) => {
    e
      .preventDefault()

    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await objectDefinitionService
        .assignGroupToObjectDefinition(
          objectDefinitionId,
          selectedGroupToAssign,
          accessToken
        )

      setSelectedGroupToAssign('')
      toast({
        title: 'Success',
        description: 'Group assigned successfully',
      })
      await fetchData()
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while assigning group'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveGroup = async (groupId: string) => {
    const confirmed = confirm('Are you sure you want to remove this group?')

    if (!confirmed) {
      return
    }

    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await objectDefinitionService
        .removeGroupFromObjectDefinition(
          objectDefinitionId,
          groupId,
          accessToken
        )

      toast({
        title: 'Success',
        description: 'Group removed successfully',
      })
      await fetchData()
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while removing group'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableGroups = allGroups
    .filter(
      (group) => !assignedGroups
        .some((ag) => ag.groupId === group.id)
    )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {isLoading
                  ? 'Loading...'
                  : objectDefinition
                  ? `Manage Groups for ${objectDefinition.label}`
                  : 'Object Definition Not Found'}
              </h1>
              {objectDefinition && (
                <Breadcrumbs
                  items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Object Definitions', href: '/object-definitions' },
                    { label: objectDefinition.label, href: `/objects/${objectDefinition.objectType}` },
                    { label: 'Groups' },
                  ]}
                />
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/object-definitions')}
              className="cursor-pointer"
            >
              Back to Object Definitions
            </Button>
          </div>

          {objectDefinition && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Groups</CardTitle>
                  <CardDescription>
                    {assignedGroups.length === 0
                      ? 'No groups assigned to this object definition yet'
                      : `${assignedGroups.length} group(s) currently assigned`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleAssignGroup} className="flex gap-2">
                    {isLoading ? (
                      <p className="text-sm text-gray-500">Loading data...</p>
                    ) : (
                      <>
                        <div className="flex-1">
                          <Select
                            value={selectedGroupToAssign}
                            onValueChange={setSelectedGroupToAssign}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableGroups
                                .map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="submit"
                          disabled={isSubmitting || !selectedGroupToAssign}
                          className="cursor-pointer"
                        >
                          {isSubmitting ? 'Assigning...' : 'Assign Group'}
                        </Button>
                      </>
                    )}
                  </form>

                  {assignedGroups.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Group Name</TableHead>
                          <TableHead>Assigned Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedGroups
                          .map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell className="font-medium">
                                {assignment
                                  .group
                                  .name}
                              </TableCell>
                              <TableCell>
                                {new Date(assignment.createdAt)
                                  .toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/object-definitions/${objectDefinitionId}/groups/${assignment.groupId}/permissions`)}
                                    className="cursor-pointer"
                                  >
                                    Manage Stage Permissions
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRemoveGroup(assignment.groupId)}
                                    disabled={isSubmitting}
                                    className="cursor-pointer"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No groups assigned yet. Use the form above to assign groups.
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
