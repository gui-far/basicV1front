import { Card, CardContent } from './ui/card'
import { GenericObject } from '@/services/genericObjectService'
import { ObjectDefinition } from '@/services/objectDefinitionService'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import React from 'react'

interface ObjectCardProps {
  object: GenericObject
  objectDefinition: ObjectDefinition
  onClick: () => void
  onMoveToNextStage?: () => void
  onMoveToPreviousStage?: () => void
  hasNextStage?: boolean
  hasPreviousStage?: boolean
  allowRollback?: boolean
}

export function ObjectCard({ object, objectDefinition, onClick, onMoveToNextStage, onMoveToPreviousStage, hasNextStage, hasPreviousStage, allowRollback = true }: ObjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const isDraggingRef = React.useRef(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: object.id,
  })

  React.useEffect(() => {
    isDraggingRef.current = isDragging
  }, [isDragging])

  const handleContentMouseDown = (e: React.MouseEvent) => {
    // Set a timeout - if not cleared (by drag), it's a click
    clickTimeoutRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        onClick()
      }
      clickTimeoutRef.current = null
    }, 150)
  }

  const handleContentMouseMove = () => {
    // If mouse moves, clear the click timeout (it's a drag)
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
  }

  const handleContentMouseUp = () => {
    // Clear timeout on mouse up
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
  }

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

  const propertyBehaviors = (object as any).propertyBehaviors || {}

  const propertiesWithSummaryOrder = objectDefinition
    .definition
    .properties
    .filter((prop) => {
      if (prop.summaryOrder === undefined || prop.summaryOrder === null) {
        return false
      }

      const behavior = propertyBehaviors[prop.name]
      return behavior !== 'invisible'
    })
    .sort((a, b) => (a.summaryOrder || 0) - (b.summaryOrder || 0))

  const visibility = (object as any).visibility || 'private'

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public':
        return { icon: '🌐', label: 'Public' }
      case 'shared':
        return { icon: '👥', label: 'Shared' }
      default:
        return { icon: '🔒', label: 'Private' }
    }
  }

  const visibilityInfo = getVisibilityIcon()

  const handleRightSideClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMoveToNextStage && hasNextStage) {
      onMoveToNextStage()
    }
  }

  const handleLeftSideClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMoveToPreviousStage && hasPreviousStage && allowRollback) {
      onMoveToPreviousStage()
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className="mb-2 hover:shadow-md transition-shadow relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="absolute top-2 left-2 text-xs bg-gray-100 px-2 py-1 rounded z-10"
          title={visibilityInfo.label}
        >
          {visibilityInfo.icon}
        </div>

        {/* Left side click area with arrow */}
        {hasPreviousStage && allowRollback && isHovered && (
          <div
            className="absolute left-0 top-0 h-full w-16 flex items-center justify-center cursor-pointer bg-green-500/10 hover:bg-green-500/20 transition-colors border-r border-green-400/20 z-20 rounded-l-lg"
            onClick={handleLeftSideClick}
            title="Move to previous stage"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-green-600"
            >
              <path
                d="M15 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Right side click area with arrow */}
        {hasNextStage && isHovered && (
          <div
            className="absolute right-0 top-0 h-full w-16 flex items-center justify-center cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 transition-colors border-l border-blue-400/20 z-20 rounded-r-lg"
            onClick={handleRightSideClick}
            title="Move to next stage"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-blue-600"
            >
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        <CardContent
          className="p-3 pt-8 cursor-pointer"
          {...attributes}
          {...listeners}
        >
          <div
            className="space-y-1 pr-6"
            onMouseDown={handleContentMouseDown}
            onMouseMove={handleContentMouseMove}
            onMouseUp={handleContentMouseUp}
          >
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
