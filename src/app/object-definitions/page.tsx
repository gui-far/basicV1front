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
      // Edit mode - update functionality not yet implemented in backend
      throw new Error('Update functionality not yet implemented in the backend')
    }

    handleCloseDialog()
    await loadObjectDefinitions()
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Object Definitions</CardTitle>
                <CardDescription>
                  Manage dynamic object types and their Kanban workflows
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard">
                  <Button variant="outline" className="cursor-pointer">
                    Back to Dashboard
                  </Button>
                </Link>
                {user?.isAdmin && (
                  <Button onClick={handleCreateNew} className="cursor-pointer">
                    Create Object
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : objectDefinitions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No object definitions found. Create one to get started.
              </div>
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
    </ProtectedRoute>
  )
}
