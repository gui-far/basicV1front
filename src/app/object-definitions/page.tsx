'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ObjectDefinition, objectDefinitionService, PropertyDefinition, KanbanStage } from '@/services/objectDefinitionService'
import { ObjectDefinitionForm } from '@/components/ObjectDefinitionForm'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import Link from 'next/link'

export default function ObjectDefinitionsPage() {
  const { accessToken, user } = useAuth()
  const router = useRouter()
  const [objectDefinitions, setObjectDefinitions] = useState<ObjectDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedDefinition, setSelectedDefinition] = useState<ObjectDefinition | null>(null)

  useEffect(() => {
    if (accessToken) {
      loadObjectDefinitions()
    }
  }, [accessToken])

  const loadObjectDefinitions = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await objectDefinitionService
        .listObjectDefinitions({}, accessToken!)
      setObjectDefinitions(response.definitions)
    } catch (err: any) {
      setError(err.message || 'Failed to load object definitions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setDialogMode('create')
    setSelectedDefinition(null)
    setIsDialogOpen(true)
  }

  const handleEditObject = (definition: ObjectDefinition) => {
    setDialogMode('edit')
    setSelectedDefinition(definition)
    setIsDialogOpen(true)
  }

  const handleViewKanban = (objectType: string) => {
    router
      .push(`/objects/${objectType}`)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedDefinition(null)
  }

  const handleSubmit = async (data: {
    objectType: string
    label: string
    properties: PropertyDefinition[]
    stages: KanbanStage[]
    propertyBehaviors: {
      [stageId: string]: { [propertyName: string]: 'editable' | 'visible' | 'invisible' }
    }
  }) => {
    try {
      if (dialogMode === 'create') {
        await objectDefinitionService
          .createObjectDefinition(
            {
              objectType: data.objectType,
              label: data.label,
              properties: data.properties,
              kanban: {
                stages: data.stages,
                propertyBehaviors: data.propertyBehaviors,
              },
              isActive: true,
            },
            accessToken!,
          )
      } else {
        await objectDefinitionService
          .updateObjectDefinition(
            selectedDefinition!.id,
            {
              label: data.label,
              properties: data.properties,
              kanban: {
                stages: data.stages,
                propertyBehaviors: data.propertyBehaviors,
              },
            },
            accessToken!,
          )
      }

      handleCloseDialog()
      await loadObjectDefinitions()
    } catch (err: any) {
      throw err
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Object Definitions</h1>
              <Breadcrumbs
                items={[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Object Definitions' },
                ]}
              />
            </div>
            <Link href="/dashboard" className="cursor-pointer">
              <Button variant="outline" className="cursor-pointer">Back to Dashboard</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Existing Object Definitions</CardTitle>
                  <CardDescription>
                    {loading
                      ? 'Loading...'
                      : error
                      ? 'Error loading data'
                      : objectDefinitions.length === 0
                      ? 'No object definitions found. Create one to get started.'
                      : 'Manage your object definitions below'}
                  </CardDescription>
                </div>
                {user?.isAdmin && (
                  <Button onClick={handleCreateNew} className="cursor-pointer">
                    Create Object
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : error ? (
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
                  <p className="text-xs text-yellow-700 mt-1">{error}</p>
                </div>
              </div>
            ) : objectDefinitions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No object definitions found. Create one to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Object Type</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Stages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {objectDefinitions
                    .map((definition) => (
                      <TableRow key={definition.id}>
                        <TableCell className="font-mono text-sm">
                          {definition.objectType}
                        </TableCell>
                        <TableCell className="font-medium">
                          {definition.label}
                        </TableCell>
                        <TableCell>
                          {definition
                            .definition
                            .properties
                            .length} properties
                        </TableCell>
                        <TableCell>
                          {definition
                            .definition
                            .kanban
                            .stages
                            .length} stages
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              definition.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {definition.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(definition.createdAt)
                            .toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditObject(definition)}
                              className="cursor-pointer"
                            >
                              Edit Object
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/object-definitions/${definition.id}/groups`)}
                              className="cursor-pointer"
                            >
                              Edit Groups
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewKanban(definition.objectType)}
                              className="cursor-pointer"
                            >
                              View Kanban
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {dialogMode === 'create' ? 'Create Object Definition' : 'Edit Object Definition'}
                </DialogTitle>
              </DialogHeader>
              <ObjectDefinitionForm
                mode={dialogMode}
                initialData={
                  selectedDefinition
                    ? {
                        objectType: selectedDefinition.objectType,
                        label: selectedDefinition.label,
                        properties: selectedDefinition
                          .definition
                          .properties,
                        stages: selectedDefinition
                          .definition
                          .kanban
                          .stages,
                        propertyBehaviors: selectedDefinition
                          .definition
                          .kanban
                          .propertyBehaviors,
                      }
                    : undefined
                }
                onSubmit={handleSubmit}
                onCancel={handleCloseDialog}
                submitLabel={dialogMode === 'create' ? 'Create Object Definition' : 'Save Changes'}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  )
}
