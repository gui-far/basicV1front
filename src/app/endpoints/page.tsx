'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { endpointService, Endpoint } from '@/services/endpointService'
import { useToast } from '@/hooks/use-toast'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import Link from 'next/link'

export default function EndpointsPage() {
  const [description, setDescription] = useState('')
  const [path, setPath] = useState('')
  const [method, setMethod] = useState('GET')
  const [isPublic, setIsPublic] = useState(false)
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { accessToken } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchEndpoints = async () => {
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        setFetchError(null)
        const fetchedEndpoints = await endpointService
          .listEndpoints(accessToken)

        setEndpoints(fetchedEndpoints)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load endpoints'
        setFetchError(errorMessage)
        console
          .error('Failed to fetch endpoints:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEndpoints()
  }, [accessToken])

  const handleCreateEndpoint = async () => {
    setIsSubmitting(true)

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      const newEndpoint = await endpointService
        .createEndpoint(
          { description, path, method, isPublic },
          accessToken
        )

      setEndpoints([...endpoints, newEndpoint])
      setDescription('')
      setPath('')
      setMethod('GET')
      setIsPublic(false)
      setShowCreateForm(false)
      toast({
        title: 'Success',
        description: 'Endpoint created successfully',
      })
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while creating endpoint'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEndpoint = async (endpointId: string) => {
    const confirmed = confirm('Are you sure you want to delete this endpoint?')

    if (!confirmed) {
      return
    }

    try {
      if (!accessToken) {
        throw new Error('No access token available')
      }

      await endpointService
        .deleteEndpoint(endpointId, accessToken)

      setEndpoints(endpoints
        .filter(e => e.id !== endpointId))

      toast({
        title: 'Success',
        description: 'Endpoint deleted successfully',
      })
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
          .message
        : 'An error occurred while deleting endpoint'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Endpoints Management</h1>
              <Breadcrumbs
                items={[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Endpoints' },
                ]}
              />
            </div>
            <Link href="/dashboard" className="cursor-pointer">
              <Button variant="outline" className="cursor-pointer">Back to Dashboard</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Existing Endpoints</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? 'Loading...'
                      : fetchError
                      ? 'Error loading data'
                      : endpoints.length === 0
                      ? 'No endpoints created yet. Create one to get started.'
                      : 'Manage your endpoints below'}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCreateForm(true)} className="cursor-pointer">
                  Create Endpoint
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : fetchError ? (
                <div className="flex items-start gap-3 p-4 rounded-lg border-yellow-200 bg-yellow-50">
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
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">Unable to load data</p>
                    <p className="text-xs text-yellow-700 mt-1">{fetchError}</p>
                  </div>
                </div>
              ) : endpoints.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No endpoints created yet. Create one to get started.
                </p>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Public</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints
                    .map((endpoint) => (
                      <TableRow key={endpoint.id}>
                        <TableCell className="font-medium">{endpoint.description}</TableCell>
                        <TableCell>{endpoint.path}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                            {endpoint.method}
                          </span>
                        </TableCell>
                        <TableCell>{endpoint.isPublic ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEndpoint(endpoint.id)}
                            className="cursor-pointer"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>

          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Endpoint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="Enter endpoint description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="path">Path</Label>
                  <Input
                    id="path"
                    type="text"
                    placeholder="/api/example or /api/users/:id"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Must start with /api/. Use :param for dynamic segments (e.g., /api/users/:id)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">HTTP Method</Label>
                  <select
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="isPublic"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isPublic">Public Endpoint</Label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setDescription('')
                      setPath('')
                      setMethod('GET')
                      setIsPublic(false)
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateEndpoint}
                    disabled={isSubmitting || !description || !path}
                    className="cursor-pointer"
                  >
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  )
}
