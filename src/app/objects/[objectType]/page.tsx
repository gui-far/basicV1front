'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KanbanBoard } from '@/components/KanbanBoard'
import { ObjectDetailModal } from '@/components/ObjectDetailModal'
import { GenericObject, genericObjectService } from '@/services/genericObjectService'
import { ObjectDefinition, objectDefinitionService } from '@/services/objectDefinitionService'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function ObjectsKanbanPage() {
  const { accessToken } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const objectType = params
    .objectType as string

  const [objectDefinition, setObjectDefinition] = useState<ObjectDefinition | null>(null)
  const [objects, setObjects] = useState<GenericObject[]>([])
  const [selectedObject, setSelectedObject] = useState<GenericObject | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (accessToken && objectType) {
      loadData()
    }
  }, [accessToken, objectType])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const definition = await objectDefinitionService
        .getObjectDefinitionByType(objectType, accessToken!)
      setObjectDefinition(definition)

      const response = await genericObjectService
        .listObjects({ objectType }, accessToken!)
      setObjects(response.objects)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load data'
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleObjectClick = (object: GenericObject) => {
    setSelectedObject(object)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedObject(null)
  }

  const handleSaveObject = async (objectId: string, properties: Record<string, any>) => {
    try {
      await genericObjectService
        .updateObject(objectId, { properties }, accessToken!)
      await loadData()
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save object')
    }
  }

  const handleDeleteObject = async (objectId: string) => {
    try {
      await genericObjectService
        .deleteObject(objectId, accessToken!)
      await loadData()
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete object')
    }
  }

  const handleDragEnd = async (objectId: string, newStageId: string) => {
    try {
      await genericObjectService
        .updateObjectStage(objectId, { newStageId }, accessToken!)
      await loadData()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update object stage'
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    }
  }

  const handleCreateObject = async (properties: Record<string, any>, stageId: string) => {
    try {
      await genericObjectService
        .createObject(
          {
            objectType,
            properties,
            initialStageId: stageId,
          },
          accessToken!,
        )
      await loadData()
      toast({
        title: 'Success',
        description: 'Object created successfully',
      })
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create object'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
      throw new Error(errorMessage)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="text-center py-8 text-gray-500">Loading...</div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!objectDefinition) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-600">
                Object definition not found
              </div>
              <div className="text-center mt-4">
                <Link href="/object-definitions">
                  <Button variant="outline" className="cursor-pointer">
                    Back to Object Definitions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{objectDefinition.label}</CardTitle>
                <CardDescription>
                  Manage {objectDefinition.label} objects with Kanban workflow
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/object-definitions">
                  <Button variant="outline" className="cursor-pointer">
                    Back to Definitions
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            <KanbanBoard
              objectDefinition={objectDefinition}
              objects={objects}
              onObjectClick={handleObjectClick}
              onDragEnd={handleDragEnd}
              onCreateObject={handleCreateObject}
            />
          </CardContent>
        </Card>

        <ObjectDetailModal
          object={selectedObject}
          objectDefinition={objectDefinition}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveObject}
          onDelete={handleDeleteObject}
        />
      </div>
    </ProtectedRoute>
  )
}
