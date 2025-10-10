import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { GenericObject } from '@/services/genericObjectService'
import { ObjectDefinition, KanbanStage } from '@/services/objectDefinitionService'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent, closestCorners } from '@dnd-kit/core'
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
  const [overId, setOverId] = useState<string | null>(null)

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

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over?.id as string | null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveObject(null)
    setOverId(null)

    if (!over) return

    const objectId = active.id as string
    let newStageId = over.id as string

    // If dropped over another card, find which stage that card belongs to
    const targetObject = objects
      .find((obj) => obj.id === newStageId)
    if (targetObject) {
      newStageId = targetObject.currentStageId
    }

    const object = objects
      .find((obj) => obj.id === objectId)

    if (!object) return

    if (object.currentStageId === newStageId) return

    // Validate rollback permission
    const currentStageIndex = stages
      .findIndex((stage) => stage.id === object.currentStageId)
    const newStageIndex = stages
      .findIndex((stage) => stage.id === newStageId)

    if (currentStageIndex !== -1 && newStageIndex !== -1) {
      const isRollback = newStageIndex < currentStageIndex
      const currentStage = stages[currentStageIndex]

      if (isRollback && currentStage.allowRollback === false) {
        return
      }
    }

    await onDragEnd(objectId, newStageId)
  }

  const getOverStageId = (): string | null => {
    if (!overId) return null

    // Check if overId is a stage
    if (stages.some((stage) => stage.id === overId)) {
      return overId
    }

    // Check if overId is a card, return its stage
    const targetObject = objects.find((obj) => obj.id === overId)
    return targetObject?.currentStageId || null
  }

  const handleMoveToNextStage = async (objectId: string) => {
    const object = objects.find((obj) => obj.id === objectId)
    if (!object) return

    const currentStageIndex = stages.findIndex((stage) => stage.id === object.currentStageId)
    if (currentStageIndex === -1 || currentStageIndex === stages.length - 1) return

    const nextStage = stages[currentStageIndex + 1]
    await onDragEnd(objectId, nextStage.id)
  }

  const handleMoveToPreviousStage = async (objectId: string) => {
    const object = objects.find((obj) => obj.id === objectId)
    if (!object) return

    const currentStageIndex = stages.findIndex((stage) => stage.id === object.currentStageId)
    if (currentStageIndex === -1 || currentStageIndex === 0) return

    const previousStage = stages[currentStageIndex - 1]
    await onDragEnd(objectId, previousStage.id)
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages
          .map((stage, index) => {
            const nextStageId = index < stages.length - 1 ? stages[index + 1].id : undefined
            const previousStageId = index > 0 ? stages[index - 1].id : undefined
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                objects={getObjectsByStage(stage.id)}
                objectDefinition={objectDefinition}
                onObjectClick={onObjectClick}
                onCreateObject={onCreateObject}
                onMoveToNextStage={handleMoveToNextStage}
                onMoveToPreviousStage={handleMoveToPreviousStage}
                isOver={getOverStageId() === stage.id}
                nextStageId={nextStageId}
                previousStageId={previousStageId}
              />
            )
          })}
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
