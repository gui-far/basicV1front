import { DynamicField } from './DynamicField'
import { ObjectDefinition } from '@/services/objectDefinitionService'

interface DynamicFormProps {
  definition: ObjectDefinition
  currentStageId: string
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  errors?: Record<string, string>
}

export function DynamicForm({
  definition,
  currentStageId,
  values,
  onChange,
  errors = {},
}: DynamicFormProps) {
  const propertyBehaviors = definition
    .definition
    .kanban
    .propertyBehaviors[currentStageId] || {}

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
            />
          )
        })}
    </div>
  )
}
