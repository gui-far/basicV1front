import { DynamicField } from './DynamicField'
import { ObjectDefinition } from '@/services/objectDefinitionService'

interface DynamicFormProps {
  definition: ObjectDefinition
  currentStageId: string
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  errors?: Record<string, string>
  mode: 'create' | 'edit'
  propertyBehaviors?: Record<string, 'editable' | 'visible' | 'invisible'>
}

export function DynamicForm({
  definition,
  currentStageId,
  values,
  onChange,
  errors = {},
  mode,
  propertyBehaviors: customBehaviors,
}: DynamicFormProps) {
  const defaultBehaviors = definition
    .definition
    .kanban
    .propertyBehaviors[currentStageId] || {}

  const propertyBehaviors = customBehaviors || defaultBehaviors

  const handleFieldChange = (propertyName: string, value: any) => {
    onChange({
      ...values,
      [propertyName]: value,
    })
  }

  return (
    <div className="space-y-4">
      {definition
        .definition
        .properties
        .map((property) => {
          const behavior = propertyBehaviors[property.name] || 'visible'

          return (
            <DynamicField
              key={property.name}
              property={property}
              value={values[property.name]}
              onChange={(value) => handleFieldChange(property.name, value)}
              behavior={behavior as 'editable' | 'visible' | 'invisible'}
              error={errors[property.name]}
              mode={mode}
            />
          )
        })}
    </div>
  )
}
