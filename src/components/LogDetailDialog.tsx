'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LogEntity } from '@/services/logService'

interface LogDetailDialogProps {
  log: LogEntity | null
  open: boolean
  onClose: () => void
}

export function LogDetailDialog({ log, open, onClose }: LogDetailDialogProps) {
  if (!log) return null

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString)
      .toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
          <DialogDescription>
            Complete error log information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">ID</p>
            <p className="text-sm font-mono bg-gray-50 p-2 rounded border">
              {log.id}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Timestamp</p>
            <p className="text-sm">{formatDateTime(log.createdAt)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Status Code</p>
              <p className="text-sm">
                <span className={`px-2 py-1 rounded font-medium ${
                  log.statusCode === 403
                    ? 'bg-yellow-100 text-yellow-800'
                    : log.statusCode && log.statusCode >= 500
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {log.statusCode || 'N/A'}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Method</p>
              <p className="text-sm font-mono">{log.method || 'N/A'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Path</p>
            <p className="text-sm font-mono bg-gray-50 p-2 rounded border break-all">
              {log.path || 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">User</p>
            <p className="text-sm">{log.user?.email || 'Unknown'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Message</p>
            <p className="text-sm bg-gray-50 p-3 rounded border whitespace-pre-wrap">
              {log.message}
            </p>
          </div>

          {log.payload && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Request Payload</p>
              <pre className="text-xs font-mono bg-blue-50 text-blue-900 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </div>
          )}

          {log.stack && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Stack Trace</p>
              <pre className="text-xs font-mono bg-gray-900 text-gray-100 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                {log.stack}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
