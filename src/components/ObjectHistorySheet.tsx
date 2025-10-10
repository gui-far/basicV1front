'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet'
import { genericObjectService, ObjectHistoryEntry } from '@/services/genericObjectService'

interface ObjectHistorySheetProps {
  objectId: string
  isOpen: boolean
  onClose: () => void
}

interface GroupedHistory {
  date: string
  entries: ObjectHistoryEntry[]
}

export function ObjectHistorySheet({ objectId, isOpen, onClose }: ObjectHistorySheetProps) {
  const { accessToken } = useAuth()
  const [history, setHistory] = useState<ObjectHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && objectId && accessToken) {
      loadHistory()
    }
  }, [isOpen, objectId, accessToken])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await genericObjectService
        .getObjectHistory(objectId, accessToken!)
      setHistory(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const groupHistoryByDate = (entries: ObjectHistoryEntry[]): GroupedHistory[] => {
    const groups: { [key: string]: ObjectHistoryEntry[] } = {}

    entries
      .forEach((entry) => {
        const date = new Date(entry.createdAt)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday
          .setDate(yesterday.getDate() - 1)

        let dateKey: string
        if (date.toDateString() === today.toDateString()) {
          dateKey = 'Today'
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateKey = 'Yesterday'
        } else {
          dateKey = date
            .toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
        }

        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey]
          .push(entry)
      })

    return Object
      .entries(groups)
      .map(([date, entries]) => ({ date, entries }))
  }

  const formatTime = (dateString: string): string => {
    return new Date(dateString)
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
  }

  const formatChangeType = (changeType: string): string => {
    const types: { [key: string]: string } = {
      created: 'Created',
      updated: 'Updated',
      stage_changed: 'Stage Changed',
      deleted: 'Deleted',
    }
    return types[changeType] || changeType
  }

  const renderChangeDetails = (entry: ObjectHistoryEntry): JSX.Element | string => {
    if (entry.changeType === 'created') {
      return 'Object created'
    }

    if (entry.changeType === 'stage_changed') {
      return `Moved from stage to new stage`
    }

    if (entry.changes && entry.changeType === 'property_update') {
      return (
        <div className="mt-2 space-y-2">
          {Object
            .entries(entry.changes)
            .map(([propertyName, changeData]: [string, any]) => (
              <div key={propertyName} className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
                <div className="font-semibold text-gray-700 mb-1">{propertyName}</div>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-gray-500 mb-0.5">Old:</div>
                    <div className="text-gray-800 font-mono">
                      {changeData.oldValue !== null && changeData.oldValue !== undefined
                        ? JSON.stringify(changeData.oldValue)
                        : '(empty)'}
                    </div>
                  </div>
                  <div className="text-gray-400 mt-4">→</div>
                  <div className="flex-1">
                    <div className="text-gray-500 mb-0.5">New:</div>
                    <div className="text-gray-800 font-mono">
                      {changeData.newValue !== null && changeData.newValue !== undefined
                        ? JSON.stringify(changeData.newValue)
                        : '(empty)'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )
    }

    if (entry.changes) {
      const changesArray = Object
        .entries(entry.changes)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      return changesArray
        .join(', ')
    }

    return 'No details'
  }

  const groupedHistory = groupHistoryByDate(history)

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Object History</SheetTitle>
          <SheetDescription>
            Timeline of all changes made to this object
          </SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex justify-center items-center py-8 text-gray-500">
            Loading history...
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="flex justify-center items-center py-8 text-gray-400">
            No history found
          </div>
        )}

        {!loading && !error && groupedHistory.length > 0 && (
          <div className="mt-6 space-y-6">
            {groupedHistory
              .map((group) => (
                <div key={group.date}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                      📅 {group.date}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                    {group
                      .entries
                      .map((entry) => (
                        <div key={entry.id} className="pb-3">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-900">
                                  {formatTime(entry.createdAt)}
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-700">
                                  {entry.changedBy?.email || 'System'}
                                </span>
                              </div>
                              <div className="mt-1 text-sm">
                                <span className="font-medium text-gray-800">
                                  {formatChangeType(entry.changeType)}
                                </span>
                                <span className="text-gray-600">
                                  {' - '}
                                  {renderChangeDetails(entry)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
