import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ObjectDefinition } from '@/services/objectDefinitionService'

interface CreateObjectDialogProps {
  isOpen: boolean
  onClose: () => void
  objectDefinition: ObjectDefinition
  stageId: string
  onCreate: (properties: Record<string, any>, stageId: string) => Promise<void>
}

export function CreateObjectDialog({
  isOpen,
  onClose,
  objectDefinition,
  stageId,
  onCreate,
}: CreateObjectDialogProps) {
  const [properties, setProperties] = useState<Record<string, any>>({})
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setError('')
    setCreating(true)

    try {
      await onCreate(properties, stageId)
      setProperties({})
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create object')
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    setProperties({})
    setError('')
    onClose()
  }

  const stage = objectDefinition
    .definition
    .kanban
    .stages
    .find((s) => s.id === stageId)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Create New {objectDefinition.label}
          </DialogTitle>
          {stage && (
            <div className="text-sm text-gray-500">
              Initial Stage: <span className="font-medium">{stage.label}</span>
            </div>
          )}
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {objectDefinition
              .definition
              .properties
              .map((property) => (
                <div key={property.name}>
                  <Label htmlFor={property.name}>
                    {property.label}
                    {property.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={property.name}
                    type={
                      property.component === 'EmailInput'
                        ? 'email'
                        : property.component === 'PhoneInput'
                          ? 'tel'
                          : property.component === 'CurrencyInput'
                            ? 'number'
                            : 'text'
                    }
                    value={properties[property.name] || ''}
                    onChange={(e) =>
                      setProperties({
                        ...properties,
                        [property.name]:
                          property.component === 'CurrencyInput'
                            ? parseFloat(e.target.value) || 0
                            : e.target.value,
                      })
                    }
                    required={property.required}
                  />
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={creating} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating} className="cursor-pointer">
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
