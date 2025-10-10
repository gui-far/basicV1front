import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { DynamicForm } from './DynamicForm'
import { ObjectHistorySheet } from './ObjectHistorySheet'
import { GenericObject } from '@/services/genericObjectService'
import { ObjectDefinition } from '@/services/objectDefinitionService'

interface ObjectDetailModalProps {
  object: GenericObject | null
  objectDefinition: ObjectDefinition
  isOpen: boolean
  onClose: () => void
  onSave: (objectId: string, properties: Record<string, any>) => Promise<void>
  onDelete: (objectId: string) => Promise<void>
}

export function ObjectDetailModal({
  object,
  objectDefinition,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: ObjectDetailModalProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
    if (object) {
      setFormValues(object.properties)
      setErrors({})
    }
  }, [object])

  const handleSave = async () => {
    if (!object) return

    setErrors({})
    setIsSaving(true)

    try {
      const propertyBehaviors = objectDefinition
        .definition
        .kanban
        .propertyBehaviors[object.currentStageId] || {}

      const editableProperties: Record<string, any> = {}
      Object
        .keys(formValues)
        .forEach((key) => {
          if (propertyBehaviors[key] === 'editable' || !propertyBehaviors[key]) {
            editableProperties[key] = formValues[key]
          }
        })

      await onSave(object.id, editableProperties)
      onClose()
    } catch (error: any) {
      const errorMessage = error
        .message || 'Failed to save object'
      setErrors({ _general: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!object) return

    if (!confirm('Are you sure you want to delete this object? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)

    try {
      await onDelete(object.id)
      onClose()
    } catch (error: any) {
      const errorMessage = error
        .message || 'Failed to delete object'
      setErrors({ _general: errorMessage })
    } finally {
      setIsDeleting(false)
    }
  }

  const hasChanges = () => {
    if (!object) return false
    return JSON
      .stringify(formValues) !== JSON
      .stringify(object.properties)
  }

  if (!object) return null

  const currentStage = objectDefinition
    .definition
    .kanban
    .stages
    .find((stage) => stage.id === object.currentStageId)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {objectDefinition.label} Details
          </DialogTitle>
          {currentStage && (
            <div className="text-sm text-gray-500">
              Current Stage: <span className="font-medium">{currentStage.label}</span>
            </div>
          )}
        </DialogHeader>

        <div className="py-4">
          {errors._general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {errors._general}
            </div>
          )}

          <DynamicForm
            definition={objectDefinition}
            currentStageId={object.currentStageId}
            values={formValues}
            onChange={setFormValues}
            errors={errors}
            mode="edit"
          />
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsHistoryOpen(true)}
              disabled={isSaving || isDeleting}
              className="cursor-pointer"
            >
              View History
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving || isDeleting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges() || isSaving || isDeleting}
              className="cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>

        <ObjectHistorySheet
          objectId={object.id}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
