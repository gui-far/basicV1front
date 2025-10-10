'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DataCard } from '@/components/DataCard'
import { DataTableCard } from '@/components/DataTableCard'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { dashboardService, UserProfile, Analytics, Health } from '@/services/dashboardService'
import { logService, LogEntity, ListLogsResponse } from '@/services/logService'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function DashboardPage() {
  const { signOut, accessToken } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [healthLoading, setHealthLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)

  const [permissionLogs, setPermissionLogs] = useState<LogEntity[]>([])
  const [permissionLogsTotal, setPermissionLogsTotal] = useState(0)
  const [permissionLogsPage, setPermissionLogsPage] = useState(1)
  const [permissionLogsTotalPages, setPermissionLogsTotalPages] = useState(0)
  const [permissionLogsLoading, setPermissionLogsLoading] = useState(true)
  const [permissionLogsError, setPermissionLogsError] = useState<string | null>(null)

  const [generalLogs, setGeneralLogs] = useState<LogEntity[]>([])
  const [generalLogsTotal, setGeneralLogsTotal] = useState(0)
  const [generalLogsPage, setGeneralLogsPage] = useState(1)
  const [generalLogsTotalPages, setGeneralLogsTotalPages] = useState(0)
  const [generalLogsLoading, setGeneralLogsLoading] = useState(true)
  const [generalLogsError, setGeneralLogsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!accessToken) return

      setProfileLoading(true)
      setAnalyticsLoading(true)
      setHealthLoading(true)
      setProfileError(null)
      setAnalyticsError(null)
      setHealthError(null)

      const results = await Promise
        .allSettled([
          dashboardService
            .getUserProfile(accessToken),
          dashboardService
            .getAnalytics(accessToken),
          dashboardService
            .getHealth(accessToken),
        ])

      const [profileResult, analyticsResult, healthResult] = results

      if (profileResult.status === 'fulfilled') {
        setUserProfile(profileResult.value)
      } else {
        setProfileError(profileResult.reason?.message || 'Failed to load user profile')
      }
      setProfileLoading(false)

      if (analyticsResult.status === 'fulfilled') {
        setAnalytics(analyticsResult.value)
      } else {
        setAnalyticsError(analyticsResult.reason?.message || 'Failed to load analytics')
      }
      setAnalyticsLoading(false)

      if (healthResult.status === 'fulfilled') {
        setHealth(healthResult.value)
      } else {
        setHealthError(healthResult.reason?.message || 'Failed to load health status')
      }
      setHealthLoading(false)
    }

    fetchDashboardData()
  }, [accessToken])

  useEffect(() => {
    const fetchPermissionLogs = async () => {
      if (!accessToken) return

      setPermissionLogsLoading(true)
      setPermissionLogsError(null)

      try {
        const response = await logService
          .getPermissionErrorLogs(accessToken, permissionLogsPage, 10)

        setPermissionLogs(response.logs)
        setPermissionLogsTotal(response.total)
        setPermissionLogsTotalPages(response.totalPages)
      } catch (error: any) {
        setPermissionLogsError(error.message || 'Failed to load permission error logs')
      } finally {
        setPermissionLogsLoading(false)
      }
    }

    fetchPermissionLogs()
  }, [accessToken, permissionLogsPage])

  useEffect(() => {
    const fetchGeneralLogs = async () => {
      if (!accessToken) return

      setGeneralLogsLoading(true)
      setGeneralLogsError(null)

      try {
        const response = await logService
          .getGeneralErrorLogs(accessToken, generalLogsPage, 10)

        setGeneralLogs(response.logs)
        setGeneralLogsTotal(response.total)
        setGeneralLogsTotalPages(response.totalPages)
      } catch (error: any) {
        setGeneralLogsError(error.message || 'Failed to load general error logs')
      } finally {
        setGeneralLogsLoading(false)
      }
    }

    fetchGeneralLogs()
  }, [accessToken, generalLogsPage])

  const handleSignOut = async () => {
    await signOut()
  }

  const formatUptime = (seconds: number): string => {
    const days = Math
      .floor(seconds / 86400)
    const hours = Math
      .floor((seconds % 86400) / 3600)
    const minutes = Math
      .floor((seconds % 3600) / 60)

    return `${days}d ${hours}h ${minutes}m`
  }

  const formatCurrency = (amount: number): string => {
    return new Intl
      .NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      })
      .format(amount)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString)
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
  }

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString)
      .toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
  }

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const renderLogTable = (logs: LogEntity[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Time</TableHead>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead className="w-[100px]">Method</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="w-[150px]">User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs
            .map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-xs">{formatDateTime(log.createdAt)}</TableCell>
              <TableCell>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  log.statusCode === 403
                    ? 'bg-yellow-100 text-yellow-800'
                    : log.statusCode && log.statusCode >= 500
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {log.statusCode || 'N/A'}
                </span>
              </TableCell>
              <TableCell className="text-xs font-mono">{log.method || 'N/A'}</TableCell>
              <TableCell className="text-xs font-mono">{truncateText(log.path || 'N/A', 30)}</TableCell>
              <TableCell className="text-xs">{truncateText(log.message, 40)}</TableCell>
              <TableCell className="text-xs">{log.user?.email || 'Unknown'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Welcome to your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                You are successfully signed in!
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DataCard
              title="User Profile"
              description="Your account information"
              loading={profileLoading}
              error={profileError}
              data={userProfile}
              renderContent={(profile) => (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium">
                      {profile.isAdmin ? 'Administrator' : 'User'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium">
                      {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>
              )}
            />

            <DataCard
              title="Analytics"
              description="System metrics and statistics"
              loading={analyticsLoading}
              error={analyticsError}
              data={analytics}
              renderContent={(analyticsData) => (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Active Users</p>
                    <p className="text-xl font-semibold">{analyticsData.activeUsers.toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-sm font-medium">{formatCurrency(analyticsData.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Conversion</p>
                      <p className="text-sm font-medium">{analyticsData.conversionRate}%</p>
                    </div>
                  </div>
                </div>
              )}
            />

            <DataCard
              title="System Health"
              description="Server status and metrics"
              loading={healthLoading}
              error={healthError}
              data={health}
              renderContent={(healthData) => (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-medium capitalize flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {healthData.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Uptime</p>
                    <p className="text-sm font-medium">{formatUptime(healthData.uptime)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Version</p>
                    <p className="text-sm font-medium">{healthData.version}</p>
                  </div>
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Endpoints</CardTitle>
                <CardDescription>Manage API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Create and delete API endpoints.
                </p>
                <Link href="/endpoints" className="cursor-pointer">
                  <Button className="w-full cursor-pointer">Go to Endpoints</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Groups</CardTitle>
                <CardDescription>Manage user groups and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Create and manage groups, assign users to groups, and configure endpoint access.
                </p>
                <Link href="/groups" className="cursor-pointer">
                  <Button className="w-full cursor-pointer">Go to Groups</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Object Definitions</CardTitle>
                <CardDescription>Dynamic objects with Kanban workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Create and manage dynamic object types with custom properties and Kanban stages.
                </p>
                <Link href="/object-definitions" className="cursor-pointer">
                  <Button className="w-full cursor-pointer">Go to Object Definitions</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <DataTableCard
                title="Permission Log Errors"
                description={`Showing ${permissionLogs.length} of ${permissionLogsTotal} permission errors`}
                loading={permissionLogsLoading}
                error={permissionLogsError}
                data={permissionLogs}
                renderTable={renderLogTable}
                emptyMessage="No permission errors found"
              />
              {permissionLogsTotalPages > 1 && (
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => setPermissionLogsPage((prev) => Math.max(1, prev - 1))}
                    disabled={permissionLogsPage === 1}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {permissionLogsPage} of {permissionLogsTotalPages}
                  </span>
                  <Button
                    onClick={() => setPermissionLogsPage((prev) => Math.min(permissionLogsTotalPages, prev + 1))}
                    disabled={permissionLogsPage === permissionLogsTotalPages}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <DataTableCard
                title="General Log Errors"
                description={`Showing ${generalLogs.length} of ${generalLogsTotal} general errors`}
                loading={generalLogsLoading}
                error={generalLogsError}
                data={generalLogs}
                renderTable={renderLogTable}
                emptyMessage="No general errors found"
              />
              {generalLogsTotalPages > 1 && (
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => setGeneralLogsPage((prev) => Math.max(1, prev - 1))}
                    disabled={generalLogsPage === 1}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {generalLogsPage} of {generalLogsTotalPages}
                  </span>
                  <Button
                    onClick={() => setGeneralLogsPage((prev) => Math.min(generalLogsTotalPages, prev + 1))}
                    disabled={generalLogsPage === generalLogsTotalPages}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleSignOut} className="w-full cursor-pointer" variant="destructive">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
