import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { ObjectCard } from './ObjectCard'
import { CreateObjectDialog } from './CreateObjectDialog'
import { GenericObject } from '@/services/genericObjectService'
import { ObjectDefinition, KanbanStage } from '@/services/objectDefinitionService'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

interface KanbanColumnProps {
  stage: KanbanStage
  objects: GenericObject[]
  objectDefinition: ObjectDefinition
  onObjectClick: (object: GenericObject) => void
  onCreateObject: (properties: Record<string, any>, stageId: string) => Promise<void>
  onMoveToNextStage?: (objectId: string) => void
  onMoveToPreviousStage?: (objectId: string) => void
  isOver: boolean
  nextStageId?: string
  previousStageId?: string
  isShadowed?: boolean
}

export function KanbanColumn({
  stage,
  objects,
  objectDefinition,
  onObjectClick,
  onCreateObject,
  onMoveToNextStage,
  onMoveToPreviousStage,
  isOver,
  nextStageId,
  previousStageId,
  isShadowed = false,
}: KanbanColumnProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { setNodeRef } = useDroppable({
    id: stage.id,
  })

  const objectIds = objects
    .map((obj) => obj.id)

  const calculateTotalizerStats = () => {
    if (!stage.totalizerField) return null

    const values = objects
      .map((obj) => obj.properties[stage.totalizerField!])
      .filter((val) => val !== null && val !== undefined && typeof val === 'number')
      .map((val) => Number(val))

    if (values.length === 0) return null

    const highest = Math.max(...values)
    const lowest = Math.min(...values)
    const total = values.reduce((sum, val) => sum + val, 0)
    const average = total / values.length

    return { highest, lowest, total, average }
  }

  const totalizerStats = calculateTotalizerStats()

  const formatCurrency = (value: number): string => {
    return new Intl
      .NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      })
      .format(value)
  }

  return (
    <div className="flex-shrink-0 w-80 relative">
      {isShadowed && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-10 z-10 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg">
            🔒 No Access
          </div>
        </div>
      )}
      <Card className={`h-full ${isOver ? 'ring-2 ring-blue-500' : ''} ${isShadowed ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{stage.label}</span>
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {objects.length}
            </span>
          </CardTitle>
          {totalizerStats && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Highest:</span>
                <span className="font-medium">{formatCurrency(totalizerStats.highest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lowest:</span>
                <span className="font-medium">{formatCurrency(totalizerStats.lowest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{formatCurrency(totalizerStats.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-medium">{formatCurrency(totalizerStats.average)}</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
            className="w-full mb-3 cursor-pointer"
            variant="outline"
            disabled={isShadowed}
          >
            + Create New
          </Button>

          <div ref={setNodeRef} className="space-y-2 min-h-[200px]">
            <SortableContext items={objectIds} strategy={verticalListSortingStrategy}>
              {objects
                .map((object) => (
                  <ObjectCard
                    key={object.id}
                    object={object}
                    objectDefinition={objectDefinition}
                    onClick={() => onObjectClick(object)}
                    onMoveToNextStage={onMoveToNextStage ? () => onMoveToNextStage(object.id) : undefined}
                    onMoveToPreviousStage={onMoveToPreviousStage ? () => onMoveToPreviousStage(object.id) : undefined}
                    hasNextStage={!!nextStageId}
                    hasPreviousStage={!!previousStageId}
                    allowRollback={stage.allowRollback !== false}
                  />
                ))}
            </SortableContext>
            {objects.length === 0 && (
              <div className="text-center text-gray-400 py-8 text-sm">
                No items in this stage
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateObjectDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        objectDefinition={objectDefinition}
        stageId={stage.id}
        onCreate={onCreateObject}
      />
    </div>
  )
}
