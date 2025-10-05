'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DataCard } from '@/components/DataCard'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { dashboardService, UserProfile, Analytics, Health } from '@/services/dashboardService'

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
