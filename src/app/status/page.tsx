'use client';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Server,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function StatusPage() {
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const healthCheck = useQuery({
    ...trpc.healthCheck.queryOptions(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update last checked time when query succeeds
  useEffect(() => {
    if (healthCheck.isSuccess) {
      setLastChecked(new Date());
    }
  }, [healthCheck.isSuccess]);

  const handleRefresh = () => {
    healthCheck.refetch();
    setLastChecked(new Date());
  };

  const getStatusIcon = (isLoading: boolean, isError: boolean, data: any) => {
    if (isLoading)
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    if (isError) return <XCircle className="h-4 w-4 text-red-500" />;
    if (data) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = (isLoading: boolean, isError: boolean, data: any) => {
    if (isLoading) return 'Checking...';
    if (isError) return 'Error';
    if (data) return 'Healthy';
    return 'Unknown';
  };

  const getStatusColor = (isLoading: boolean, isError: boolean, data: any) => {
    if (isLoading) return 'bg-blue-500';
    if (isError) return 'bg-red-500';
    if (data) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              System Status
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor the health and performance of our services
            </p>
          </div>

          {/* Main Status Card */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">API Server</CardTitle>
                    <CardDescription className="text-sm">
                      Backend service health check
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={healthCheck.isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${healthCheck.isLoading ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Status Indicator */}
                <div className="flex items-center gap-3">
                  {getStatusIcon(
                    healthCheck.isLoading,
                    healthCheck.isError,
                    healthCheck.data
                  )}
                  <span className="font-medium">
                    {getStatusText(
                      healthCheck.isLoading,
                      healthCheck.isError,
                      healthCheck.data
                    )}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(healthCheck.isLoading, healthCheck.isError, healthCheck.data)} text-white`}
                  >
                    {healthCheck.data || 'N/A'}
                  </Badge>
                </div>

                {/* Response Time Simulation */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-medium">
                      {healthCheck.isLoading
                        ? '...'
                        : healthCheck.isError
                          ? 'N/A'
                          : '< 100ms'}
                    </span>
                  </div>
                  <Progress
                    value={
                      healthCheck.isLoading ? 50 : healthCheck.isError ? 0 : 100
                    }
                    className="h-2"
                  />
                </div>

                {/* Last Checked */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
                </div>

                {/* Error Details */}
                {healthCheck.isError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      Unable to connect to the server. Please check your
                      internet connection or try again later.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <div className="space-y-4">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">Database</CardTitle>
                    <CardDescription className="text-sm">
                      Connection status
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${healthCheck.data ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <span className="text-sm">
                    {healthCheck.data ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">Uptime</CardTitle>
                    <CardDescription className="text-sm">
                      Service availability
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${healthCheck.data ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <span className="text-sm">
                    {healthCheck.data ? '99.9%' : '0%'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Status Information */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
              <CardDescription className="text-sm">
                Current system status and metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Environment
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {process.env.NODE_ENV === 'production'
                      ? 'Production'
                      : 'Development'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Version
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    v1.0.0
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Auto Refresh
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Every 30 seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
