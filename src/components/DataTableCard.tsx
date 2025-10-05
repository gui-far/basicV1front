import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReactNode } from 'react'

interface DataTableCardProps<T> {
  title: string
  description: string
  loading: boolean
  error: string | null
  data: T[]
  renderTable: (data: T[]) => ReactNode
  emptyMessage?: string
  className?: string
}

export function DataTableCard<T>({
  title,
  description,
  loading,
  error,
  data,
  renderTable,
  emptyMessage = 'No data to display',
  className = '',
}: DataTableCardProps<T>) {
  const isPermissionError = error?.toLowerCase()
    .includes('forbidden') || error?.toLowerCase()
    .includes('permission') || error?.toLowerCase()
    .includes('access')

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {loading
            ? 'Loading...'
            : error
            ? 'Error loading data'
            : data.length === 0
            ? emptyMessage
            : description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-lg border-yellow-200 bg-yellow-50">
            {isPermissionError ? (
              <svg
                className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                {isPermissionError
                  ? "You don't have permission to view this data"
                  : 'Unable to load data'}
              </p>
              <p className="text-xs text-yellow-700 mt-1">{error}</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            {emptyMessage}
          </p>
        ) : (
          renderTable(data)
        )}
      </CardContent>
    </Card>
  )
}
