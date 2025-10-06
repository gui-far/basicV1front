import { Input } from './ui/input'
import { Label } from './ui/label'
import { PropertyDefinition } from '@/services/objectDefinitionService'

interface DynamicFieldProps {
  property: PropertyDefinition
  value: any
  onChange: (value: any) => void
  behavior: 'editable' | 'visible' | 'invisible'
  error?: string
  mode: 'create' | 'edit'
}

export function DynamicField({ property, value, onChange, behavior, error, mode }: DynamicFieldProps) {
  if (behavior === 'invisible') {
    return null
  }

  // In create mode, visible fields become editable and required
  const isReadOnly = mode === 'edit' && behavior === 'visible'
  const isObligatory = mode === 'create' && behavior === 'visible'

  const renderField = () => {
    switch (property.component) {
      case 'TextInput':
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            required={property.required || isObligatory}
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
        )

      case 'EmailInput':
        return (
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            required={property.required || isObligatory}
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
        )

      case 'PhoneInput':
        return (
          <Input
            type="tel"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            required={property.required || isObligatory}
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
        )

      case 'CurrencyInput':
        return (
          <Input
            type="number"
            step="0.01"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            disabled={isReadOnly}
            required={property.required || isObligatory}
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
        )

      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            required={property.required || isObligatory}
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={property.name}>
        {property.label}
        {(property.required || isObligatory) && <span className="text-red-500 ml-1">*</span>}
        {isReadOnly && <span className="text-gray-500 text-xs ml-2">(read-only)</span>}
        {isObligatory && <span className="text-gray-500 text-xs ml-2">(obligatory)</span>}
      </Label>
      {renderField()}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
