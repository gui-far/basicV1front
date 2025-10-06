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
  isOver: boolean
}

export function KanbanColumn({
  stage,
  objects,
  objectDefinition,
  onObjectClick,
  onCreateObject,
  isOver,
}: KanbanColumnProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { setNodeRef } = useDroppable({
    id: stage.id,
  })

  const objectIds = objects
    .map((obj) => obj.id)

  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`h-full ${isOver ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{stage.label}</span>
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {objects.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
            className="w-full mb-3 cursor-pointer"
            variant="outline"
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
