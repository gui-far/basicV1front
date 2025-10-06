import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { GenericObject } from '@/services/genericObjectService'
import { ObjectDefinition, KanbanStage } from '@/services/objectDefinitionService'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { ObjectCard } from './ObjectCard'

interface KanbanBoardProps {
  objectDefinition: ObjectDefinition
  objects: GenericObject[]
  onObjectClick: (object: GenericObject) => void
  onDragEnd: (objectId: string, newStageId: string) => Promise<void>
  onCreateObject: (properties: Record<string, any>, stageId: string) => Promise<void>
}

export function KanbanBoard({
  objectDefinition,
  objects,
  onObjectClick,
  onDragEnd,
  onCreateObject,
}: KanbanBoardProps) {
  const [activeObject, setActiveObject] = useState<GenericObject | null>(null)

  const stages: KanbanStage[] = objectDefinition
    .definition
    .kanban
    .stages

  const getObjectsByStage = (stageId: string): GenericObject[] => {
    return objects
      .filter((obj) => obj.currentStageId === stageId)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const objectId = event
      .active
      .id as string
    const object = objects
      .find((obj) => obj.id === objectId)
    setActiveObject(object || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveObject(null)

    if (!over) return

    const objectId = active.id as string
    const newStageId = over.id as string

    const object = objects
      .find((obj) => obj.id === objectId)

    if (!object) return

    if (object.currentStageId === newStageId) return

    await onDragEnd(objectId, newStageId)
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages
          .map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              objects={getObjectsByStage(stage.id)}
              objectDefinition={objectDefinition}
              onObjectClick={onObjectClick}
              onCreateObject={onCreateObject}
            />
          ))}
      </div>

      <DragOverlay>
        {activeObject ? (
          <ObjectCard
            object={activeObject}
            objectDefinition={objectDefinition}
            onClick={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
