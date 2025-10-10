import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { DynamicForm } from './DynamicForm'
import { ObjectHistorySheet } from './ObjectHistorySheet'
import { VisibilitySettings } from './VisibilitySettings'
import { GenericObject } from '@/services/genericObjectService'
import { ObjectDefinition } from '@/services/objectDefinitionService'

interface ObjectDetailModalProps {
  object: GenericObject | null
  objectDefinition: ObjectDefinition
  isOpen: boolean
  onClose: () => void
  onSave: (objectId: string, properties: Record<string, any>) => Promise<void>
  onDelete: (objectId: string) => Promise<void>
  onUpdateSharing: (objectId: string, visibility: string, sharedWithGroupIds?: string[], sharedWithUserIds?: string[]) => Promise<void>
}

export function ObjectDetailModal({
  object,
  objectDefinition,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onUpdateSharing,
}: ObjectDetailModalProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false)
  const [newVisibility, setNewVisibility] = useState<'private' | 'public' | 'shared'>('private')
  const [newSelectedGroupIds, setNewSelectedGroupIds] = useState<string[]>([])
  const [newSelectedUserIds, setNewSelectedUserIds] = useState<string[]>([])
  const [isSavingVisibility, setIsSavingVisibility] = useState(false)

  useEffect(() => {
    if (object) {
      setFormValues(object.properties)
      setErrors({})
      setNewVisibility((object.visibility as 'private' | 'public' | 'shared') || 'private')
      setNewSelectedGroupIds([])
      setNewSelectedUserIds([])
    }
  }, [object])

  const handleSave = async () => {
    if (!object) return

    setErrors({})
    setIsSaving(true)

    try {
      const propertyBehaviors = (object as any).propertyBehaviors || objectDefinition
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

  const handleChangeVisibility = () => {
    setIsVisibilityDialogOpen(true)
  }

  const handleSaveVisibility = async () => {
    if (!object) return

    if (newVisibility === 'shared' && newSelectedGroupIds.length === 0 && newSelectedUserIds.length === 0) {
      setErrors({ _general: 'Please select at least one group or user to share with' })
      return
    }

    setErrors({})
    setIsSavingVisibility(true)

    try {
      await onUpdateSharing(
        object.id,
        newVisibility,
        newVisibility === 'shared' ? newSelectedGroupIds : undefined,
        newVisibility === 'shared' ? newSelectedUserIds : undefined,
      )
      setIsVisibilityDialogOpen(false)
      onClose()
    } catch (error: any) {
      const errorMessage = error
        .message || 'Failed to update visibility'
      setErrors({ _general: errorMessage })
    } finally {
      setIsSavingVisibility(false)
    }
  }

  const getVisibilityIcon = () => {
    if (!object) return '🔒'
    switch (object.visibility) {
      case 'public':
        return '🌐'
      case 'shared':
        return '👥'
      default:
        return '🔒'
    }
  }

  const getVisibilityLabel = () => {
    if (!object) return 'Private'
    switch (object.visibility) {
      case 'public':
        return 'Public'
      case 'shared':
        return 'Shared'
      default:
        return 'Private'
    }
  }

  if (!object) return null

  const currentStage = objectDefinition
    .definition
    .kanban
    .stages
    .find((stage) => stage.id === object.currentStageId)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">
                {objectDefinition.label} Details
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{getVisibilityIcon()}</span>
                <span>{getVisibilityLabel()}</span>
              </div>
            </div>
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
            propertyBehaviors={(object as any).propertyBehaviors}
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
              onClick={handleChangeVisibility}
              disabled={isSaving || isDeleting}
              className="cursor-pointer"
            >
              Change Visibility
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

    <Dialog open={isVisibilityDialogOpen} onOpenChange={(open) => !open && setIsVisibilityDialogOpen(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Visibility Settings</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {errors._general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {errors._general}
            </div>
          )}

          <VisibilitySettings
            visibility={newVisibility}
            selectedGroupIds={newSelectedGroupIds}
            selectedUserIds={newSelectedUserIds}
            onVisibilityChange={setNewVisibility}
            onGroupsChange={setNewSelectedGroupIds}
            onUsersChange={setNewSelectedUserIds}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsVisibilityDialogOpen(false)}
            disabled={isSavingVisibility}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveVisibility}
            disabled={isSavingVisibility}
            className="cursor-pointer"
          >
            {isSavingVisibility ? 'Saving...' : 'Save Visibility'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
