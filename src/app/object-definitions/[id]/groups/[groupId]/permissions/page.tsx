'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { objectDefinitionService, ObjectDefinition, ObjectDefinitionGroup, GroupPermissions } from '@/services/objectDefinitionService'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export default function ManageStagePermissionsPage() {
  const params = useParams()
  const router = useRouter()
  const objectDefinitionId = params
    .id as string
  const groupId = params
    .groupId as string

  const [objectDefinition, setObjectDefinition] = useState<ObjectDefinition | null>(null)
  const [groupAssignment, setGroupAssignment] = useState<ObjectDefinitionGroup | null>(null)
  const [permissions, setPermissions] = useState<GroupPermissions>({})
  const [stageVisibility, setStageVisibility] = useState<{ [stageId: string]: 'visible' | 'invisible' }>({})
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
      const [definition, groups] = await Promise
        .all([
          objectDefinitionService
            .getObjectDefinition(objectDefinitionId, accessToken),
          objectDefinitionService
            .listObjectDefinitionGroups(objectDefinitionId, accessToken),
        ])

      setObjectDefinition(definition)

      const assignment = groups
        .find(g => g.groupId === groupId)

      if (!assignment) {
        throw new Error('Group assignment not found')
      }

      setGroupAssignment(assignment)
      setPermissions(assignment.permissions || {})

      // Initialize all stages as visible by default
      const initialVisibility: { [stageId: string]: 'visible' | 'invisible' } = {}
      definition
        .definition
        .kanban
        .stages
        .forEach((stage) => {
          initialVisibility[stage.id] = 'visible'
        })
      setStageVisibility(initialVisibility)
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
  }, [accessToken, objectDefinitionId, groupId])

  const getInitialPermission = (stageId: string, propertyName: string): 'editable' | 'visible' | 'invisible' | undefined => {
    if (!objectDefinition) return undefined
    return objectDefinition
      .definition
      .kanban
      .propertyBehaviors[stageId]?.[propertyName]
  }

  const getAvailableOptions = (stageId: string, propertyName: string): ('editable' | 'visible' | 'invisible')[] => {
    const initial = getInitialPermission(stageId, propertyName)

    if (initial === 'editable') {
      return ['editable', 'visible', 'invisible']
    }

    if (initial === 'visible') {
      return ['visible', 'invisible']
    }

    if (initial === 'invisible') {
      return ['invisible']
    }

    return []
  }

  const getCurrentPermission = (stageId: string, propertyName: string): 'editable' | 'visible' | 'invisible' | 'default' => {
    const current = permissions[stageId]?.[propertyName]
    if (current) return current

    const initial = getInitialPermission(stageId, propertyName)
    if (initial) return initial as 'editable' | 'visible' | 'invisible'

    return 'default'
  }

  const handlePermissionChange = (stageId: string, propertyName: string, value: 'editable' | 'visible' | 'invisible') => {
    setPermissions(prev => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        [propertyName]: value,
      },
    }))
  }

  const handleStageVisibilityChange = (stageId: string, value: 'visible' | 'invisible') => {
    setStageVisibility(prev => ({
      ...prev,
      [stageId]: value,
    }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await objectDefinitionService
        .updateObjectDefinitionGroupPermissions(
          objectDefinitionId,
          groupId,
          permissions,
          accessToken
        )

      toast({
        title: 'Success',
        description: 'Stage permissions updated successfully',
      })
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while updating permissions'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const stages = objectDefinition
    ?.definition
    .kanban
    .stages || []

  const properties = objectDefinition
    ?.definition
    .properties || []

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {isLoading
                  ? 'Loading...'
                  : groupAssignment
                  ? `Manage Stage Permissions for ${groupAssignment.group.name}`
                  : 'Group Not Found'}
              </h1>
              {objectDefinition && groupAssignment && (
                <Breadcrumbs
                  items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Object Definitions', href: '/object-definitions' },
                    { label: objectDefinition.label, href: `/objects/${objectDefinition.objectType}` },
                    { label: 'Groups', href: `/object-definitions/${objectDefinitionId}/groups` },
                    { label: groupAssignment.group.name },
                    { label: 'Permissions' },
                  ]}
                />
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/object-definitions/${objectDefinitionId}/groups`)}
              className="cursor-pointer"
            >
              Back to Groups
            </Button>
          </div>

          {objectDefinition && groupAssignment && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Field Permissions by Stage</CardTitle>
                  <CardDescription>
                    Configure which fields are visible or invisible for this group at each Kanban stage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow style={{ borderBottomWidth: '0px' }}>
                              <TableHead style={{ borderBottomWidth: '0px' }}></TableHead>
                              {stages
                                .map((stage) => (
                                  <TableHead key={stage.id} className="text-center" style={{ borderBottomWidth: '0px' }}>
                                    <div className="flex items-center justify-center">
                                      <Select
                                        value={stageVisibility[stage.id] || 'visible'}
                                        onValueChange={(value) => handleStageVisibilityChange(stage.id, value as 'visible' | 'invisible')}
                                      >
                                        <SelectTrigger className="w-40 h-8 text-xs justify-center">
                                          <SelectValue className="text-center" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="visible" className="justify-center">Visible</SelectItem>
                                          <SelectItem value="invisible" className="justify-center">Invisible</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </TableHead>
                                ))}
                            </TableRow>
                            <TableRow>
                              <TableHead className="font-semibold">Property</TableHead>
                              {stages
                                .map((stage) => (
                                  <TableHead key={stage.id} className="text-center font-semibold">
                                    {stage.label}
                                  </TableHead>
                                ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {properties
                              .map((property) => (
                                <TableRow key={property.name}>
                                  <TableCell className="font-medium">
                                    {property.label}
                                    <div className="text-xs text-gray-500 mt-1">
                                      {property.name}
                                    </div>
                                  </TableCell>
                                  {stages
                                    .map((stage) => {
                                      const initial = getInitialPermission(stage.id, property.name)
                                      const options = getAvailableOptions(stage.id, property.name)
                                      const current = getCurrentPermission(stage.id, property.name)

                                      return (
                                        <TableCell key={stage.id} className="text-center">
                                          {initial === 'invisible' ? (
                                            <div className="flex items-center justify-center">
                                              <Select
                                                value={current}
                                                onValueChange={(value) => {
                                                  handlePermissionChange(
                                                    stage.id,
                                                    property.name,
                                                    value as 'editable' | 'visible' | 'invisible'
                                                  )
                                                }}
                                              >
                                                <SelectTrigger className="w-40 h-8 text-xs justify-center">
                                                  <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="invisible" className="justify-center">Invisible (default)</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          ) : initial === 'visible' ? (
                                            <div className="flex items-center justify-center">
                                              <Select
                                                value={current}
                                                onValueChange={(value) => {
                                                  handlePermissionChange(
                                                    stage.id,
                                                    property.name,
                                                    value as 'editable' | 'visible' | 'invisible'
                                                  )
                                                }}
                                              >
                                                <SelectTrigger className="w-40 h-8 text-xs justify-center">
                                                  <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="visible" className="justify-center">Visible (default)</SelectItem>
                                                  <SelectItem value="invisible" className="justify-center">Invisible</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          ) : initial === 'editable' ? (
                                            <div className="flex items-center justify-center">
                                              <Select
                                                value={current}
                                                onValueChange={(value) => {
                                                  handlePermissionChange(
                                                    stage.id,
                                                    property.name,
                                                    value as 'editable' | 'visible' | 'invisible'
                                                  )
                                                }}
                                              >
                                                <SelectTrigger className="w-40 h-8 text-xs justify-center">
                                                  <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="editable" className="justify-center">Editable (default)</SelectItem>
                                                  <SelectItem value="visible" className="justify-center">Visible</SelectItem>
                                                  <SelectItem value="invisible" className="justify-center">Invisible</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          ) : (
                                            <span className="inline-block px-2 py-1 text-xs rounded bg-gray-200 text-gray-600">
                                              Unknown
                                            </span>
                                          )}
                                        </TableCell>
                                      )
                                    })}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/object-definitions/${objectDefinitionId}/groups`)}
                          className="cursor-pointer"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isSubmitting}
                          className="cursor-pointer"
                        >
                          {isSubmitting ? 'Saving...' : 'Save Permissions'}
                        </Button>
                      </div>
                    </>
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
