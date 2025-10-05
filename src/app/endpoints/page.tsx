'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DataTableCard } from '@/components/DataTableCard'
import { endpointService, Endpoint } from '@/services/endpointService'
import { useToast } from '@/hooks/use-toast'
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

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e
      .preventDefault()

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
            <h1 className="text-3xl font-bold">Endpoints Management</h1>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create New Endpoint</CardTitle>
              <CardDescription>Add a new endpoint to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEndpoint} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="Enter endpoint description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
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
                    pattern="^/api/.*"
                    title="Path must start with /api/"
                    required
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
                    required
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Endpoint'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <DataTableCard
            title="Existing Endpoints"
            description="Manage your endpoints below"
            loading={isLoading}
            error={fetchError}
            data={endpoints}
            emptyMessage="No endpoints created yet. Create one above to get started."
            renderTable={(endpointsData) => (
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
                  {endpointsData
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
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
