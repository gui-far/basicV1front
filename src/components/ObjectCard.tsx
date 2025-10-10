import { Card, CardContent } from './ui/card'
import { GenericObject } from '@/services/genericObjectService'
import { ObjectDefinition } from '@/services/objectDefinitionService'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ObjectCardProps {
  object: GenericObject
  objectDefinition: ObjectDefinition
  onClick: () => void
}

export function ObjectCard({ object, objectDefinition, onClick }: ObjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: object.id,
  })

  const style = {
    transform: CSS
      .Transform
      .toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getDisplayValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') return value.toString()
    return String(value)
  }

  const propertiesWithSummaryOrder = objectDefinition
    .definition
    .properties
    .filter((prop) => prop.summaryOrder !== undefined && prop.summaryOrder !== null)
    .sort((a, b) => (a.summaryOrder || 0) - (b.summaryOrder || 0))

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="mb-2 hover:shadow-md transition-shadow relative">
        <div
          className="absolute top-2 right-2 p-1 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded"
          {...listeners}
          title="Drag to move"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-gray-400"
          >
            <path
              d="M6 3h1v1H6V3zm3 0h1v1H9V3zM6 6h1v1H6V6zm3 0h1v1H9V6zM6 9h1v1H6V9zm3 0h1v1H9V9zm-3 3h1v1H6v-1zm3 0h1v1H9v-1z"
              fill="currentColor"
            />
          </svg>
        </div>
        <CardContent className="p-3 cursor-pointer" onClick={onClick}>
          <div className="space-y-1 pr-6">
            {propertiesWithSummaryOrder
              .map((prop) => {
                const value = object.properties[prop.name]
                const isBold = prop.summaryOrder === 1
                return (
                  <div key={prop.name} className="text-sm">
                    <span className={isBold ? 'font-bold' : 'font-medium'}>
                      {prop.label}:
                    </span>
                    <span className="ml-1">
                      {getDisplayValue(prop.name, value) || '-'}
                    </span>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
