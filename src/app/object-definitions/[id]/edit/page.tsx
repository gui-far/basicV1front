'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { objectDefinitionService, PropertyDefinition, KanbanStage } from '@/services/objectDefinitionService'
import Link from 'next/link'

export default function EditObjectDefinitionPage() {
  const { accessToken } = useAuth()
  const router = useRouter()
  const params = useParams()
  const objectDefinitionId = params
    .id as string

  const [loading, setLoading] = useState(true)
  const [objectType, setObjectType] = useState('')
  const [label, setLabel] = useState('')
  const [properties, setProperties] = useState<PropertyDefinition[]>([])
  const [stages, setStages] = useState<KanbanStage[]>([])
  const [propertyBehaviors, setPropertyBehaviors] = useState<{
    [stageId: string]: { [propertyName: string]: 'editable' | 'visible' | 'invisible' }
  }>({})

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (accessToken && objectDefinitionId) {
      loadObjectDefinition()
    }
  }, [accessToken, objectDefinitionId])

  const loadObjectDefinition = async () => {
    try {
      setLoading(true)
      setError('')
      const definition = await objectDefinitionService
        .getObjectDefinition(objectDefinitionId, accessToken!)

      setObjectType(definition.objectType)
      setLabel(definition.label)
      setProperties(definition.definition.properties)
      setStages(definition.definition.kanban.stages)
      setPropertyBehaviors(definition.definition.kanban.propertyBehaviors)
    } catch (err: any) {
      setError(err.message || 'Failed to load object definition')
    } finally {
      setLoading(false)
    }
  }

  const addProperty = () => {
    setProperties([
      ...properties,
      { name: '', label: '', component: 'TextInput', required: false },
    ])
  }

  const removeProperty = (index: number) => {
    const newProperties = properties
      .filter((_, i) => i !== index)
    setProperties(newProperties)

    const newBehaviors = { ...propertyBehaviors }
    const propertyName = properties[index]
      .name
    stages
      .forEach((stage) => {
        if (newBehaviors[stage.id]) {
          delete newBehaviors[stage.id][propertyName]
        }
      })
    setPropertyBehaviors(newBehaviors)
  }

  const updateProperty = (index: number, field: keyof PropertyDefinition, value: any) => {
    const newProperties = [...properties]
    const oldName = newProperties[index]
      .name
    newProperties[index] = { ...newProperties[index], [field]: value }
    setProperties(newProperties)

    if (field === 'name' && oldName !== value) {
      const newBehaviors = { ...propertyBehaviors }
      stages
        .forEach((stage) => {
          if (newBehaviors[stage.id] && newBehaviors[stage.id][oldName]) {
            newBehaviors[stage.id][value] = newBehaviors[stage.id][oldName]
            delete newBehaviors[stage.id][oldName]
          }
        })
      setPropertyBehaviors(newBehaviors)
    }
  }

  const addStage = () => {
    const newStageId = `stage${stages.length + 1}`
    setStages([...stages, { id: newStageId, label: '' }])
    setPropertyBehaviors({ ...propertyBehaviors, [newStageId]: {} })
  }

  const removeStage = (index: number) => {
    const newStages = stages
      .filter((_, i) => i !== index)
    setStages(newStages)

    const stageId = stages[index]
      .id
    const newBehaviors = { ...propertyBehaviors }
    delete newBehaviors[stageId]
    setPropertyBehaviors(newBehaviors)
  }

  const updateStage = (index: number, field: keyof KanbanStage, value: string | undefined) => {
    const newStages = [...stages]
    const oldId = newStages[index]
      .id
    newStages[index] = { ...newStages[index], [field]: value }
    setStages(newStages)

    if (field === 'id' && oldId !== value) {
      const newBehaviors = { ...propertyBehaviors }
      newBehaviors[value as string] = newBehaviors[oldId] || {}
      delete newBehaviors[oldId]
      setPropertyBehaviors(newBehaviors)
    }
  }

  const updatePropertyBehavior = (
    stageId: string,
    propertyName: string,
    behavior: 'editable' | 'visible' | 'invisible',
  ) => {
    const newBehaviors = { ...propertyBehaviors }
    if (!newBehaviors[stageId]) {
      newBehaviors[stageId] = {}
    }
    newBehaviors[stageId][propertyName] = behavior
    setPropertyBehaviors(newBehaviors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e
      .preventDefault()

    setError('')

    if (!objectType || !label) {
      setError('Object type and label are required')
      return
    }

    if (properties.length === 0 || properties.some((p) => !p.name || !p.label)) {
      setError('All properties must have a name and label')
      return
    }

    const summaryOrders = properties
      .map((p) => p.summaryOrder)
      .filter((order) => order !== undefined && order !== null)
    const uniqueSummaryOrders = new Set(summaryOrders)
    if (summaryOrders.length !== uniqueSummaryOrders.size) {
      setError('Summary Order values must be unique')
      return
    }

    if (stages.length === 0 || stages.some((s) => !s.id || !s.label)) {
      setError('All stages must have an id and label')
      return
    }

    const filledBehaviors = { ...propertyBehaviors }
    stages
      .forEach((stage) => {
        properties
          .forEach((property) => {
            if (!filledBehaviors[stage.id]) {
              filledBehaviors[stage.id] = {}
            }
            if (!filledBehaviors[stage.id][property.name]) {
              filledBehaviors[stage.id][property.name] = 'editable'
            }
          })
      })

    setSaving(true)

    try {
      await objectDefinitionService
        .updateObjectDefinition(
          objectDefinitionId,
          {
            label,
            properties,
            kanban: {
              stages,
              propertyBehaviors: filledBehaviors,
            },
          },
          accessToken!,
        )

      router
        .push('/object-definitions')
    } catch (err: any) {
      setError(err.message || 'Failed to update object definition')
    } finally {
      setSaving(false)
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

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Edit Object Definition</CardTitle>
                <CardDescription>
                  Update the object type definition with properties and Kanban workflow
                </CardDescription>
              </div>
              <Link href="/object-definitions">
                <Button variant="outline" className="cursor-pointer">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div>
                  <Label htmlFor="objectType">
                    Object Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="objectType"
                    value={objectType}
                    onChange={(e) => setObjectType(e.target.value)}
                    placeholder="e.g., lead, opportunity, task"
                    required
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Object type cannot be changed after creation
                  </p>
                </div>

                <div>
                  <Label htmlFor="label">
                    Label <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Lead, Opportunity, Task"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Display name for this object type</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Properties</h3>
                  <Button type="button" onClick={addProperty} size="sm" className="cursor-pointer">
                    Add Property
                  </Button>
                </div>

                {properties.map((property, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`property-name-${index}`}>Property Name</Label>
                          <Input
                            id={`property-name-${index}`}
                            value={property.name}
                            onChange={(e) => updateProperty(index, 'name', e.target.value)}
                            placeholder="e.g., customerName"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`property-label-${index}`}>Label</Label>
                          <Input
                            id={`property-label-${index}`}
                            value={property.label}
                            onChange={(e) => updateProperty(index, 'label', e.target.value)}
                            placeholder="e.g., Customer Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`property-component-${index}`}>Component Type</Label>
                          <select
                            id={`property-component-${index}`}
                            value={property.component}
                            onChange={(e) => updateProperty(index, 'component', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="TextInput">Text Input</option>
                            <option value="EmailInput">Email Input</option>
                            <option value="PhoneInput">Phone Input</option>
                            <option value="CurrencyInput">Currency Input</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`property-summary-order-${index}`}>Summary Order</Label>
                          <Input
                            id={`property-summary-order-${index}`}
                            type="number"
                            value={property.summaryOrder ?? ''}
                            onChange={(e) => updateProperty(index, 'summaryOrder', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="e.g., 1, 2, 3..."
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={property.required}
                              onChange={(e) => updateProperty(index, 'required', e.target.checked)}
                            />
                            <span className="text-sm">Required</span>
                          </label>
                          {properties.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeProperty(index)}
                              className="cursor-pointer"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Kanban Stages</h3>
                  <Button type="button" onClick={addStage} size="sm" className="cursor-pointer">
                    Add Stage
                  </Button>
                </div>

                {stages.map((stage, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor={`stage-id-${index}`}>Stage ID</Label>
                          <Input
                            id={`stage-id-${index}`}
                            value={stage.id}
                            onChange={(e) => updateStage(index, 'id', e.target.value)}
                            placeholder="e.g., new, inProgress, done"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`stage-label-${index}`}>Label</Label>
                            <Input
                              id={`stage-label-${index}`}
                              value={stage.label}
                              onChange={(e) => updateStage(index, 'label', e.target.value)}
                              placeholder="e.g., New, In Progress, Done"
                            />
                          </div>
                          {stages.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeStage(index)}
                              className="cursor-pointer mt-6"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <Label htmlFor={`stage-totalizer-${index}`}>
                          Stage Totalizer (optional)
                        </Label>
                        <select
                          id={`stage-totalizer-${index}`}
                          value={stage.totalizerField || ''}
                          onChange={(e) => updateStage(index, 'totalizerField', e.target.value || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">None</option>
                          {properties
                            .filter((p) => p.name && (p.component === 'CurrencyInput'))
                            .map((property) => (
                              <option key={property.name} value={property.name}>
                                {property.label} ({property.name})
                              </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Select a Currency field to calculate Highest, Lowest, Total, and Average
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Property Behaviors in this Stage
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {properties
                            .filter((p) => p.name)
                            .map((property) => (
                              <div key={property.name} className="text-sm">
                                <span className="font-medium">{property.label}:</span>
                                <select
                                  value={propertyBehaviors[stage.id]?.[property.name] || 'editable'}
                                  onChange={(e) =>
                                    updatePropertyBehavior(
                                      stage.id,
                                      property.name,
                                      e.target.value as 'editable' | 'visible' | 'invisible',
                                    )
                                  }
                                  className="ml-2 px-2 py-1 border border-gray-300 rounded text-xs"
                                >
                                  <option value="editable">Editable</option>
                                  <option value="visible">Visible</option>
                                  <option value="invisible">Invisible</option>
                                </select>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Link href="/object-definitions">
                  <Button type="button" variant="outline" className="cursor-pointer">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving} className="cursor-pointer">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
