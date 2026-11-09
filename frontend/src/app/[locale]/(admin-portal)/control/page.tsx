'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Home, Activity, FileText, Bell, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { useRouter } from '@/i18n/routing';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3000/control/stats', {
          credentials: 'include',
        });
        
        if (res.status === 403 || res.status === 401) {
          router.push('/control/sign-in');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          toast.error('Failed to load admin stats');
        }
      } catch (err) {
        toast.error('Network error connecting to backend');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }



  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Administration</h1>
        <p className="text-gray-500">Overview of the WohnBoard system metrics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Row 1 */}
        <Card className="border-0 shadow-sm border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Total Users <Users className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            <p className="text-xs text-green-600 mt-1">+{stats.newUsersThisWeek} this week</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Active Users <Activity className="w-4 h-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Apartments <Home className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalApartments}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-t-4 border-t-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Documents <FileText className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalDocuments}</div>
          </CardContent>
        </Card>

        {/* Row 2 */}
        <Card className="border-0 shadow-sm border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Scrape Jobs <Activity className="w-4 h-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalImports}</div>
            <p className="text-xs text-red-500 mt-1">{stats.failedImports} failed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-t-4 border-t-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Reminders <Bell className="w-4 h-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.upcomingReminders}</div>
            <p className="text-xs text-gray-500 mt-1">Pending actions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-t-4 border-t-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Feedback <MessageSquare className="w-4 h-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.feedbackMessages}</div>
            <p className="text-xs text-gray-500 mt-1">Open tickets</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Browser Extension Imports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm border-t-4 border-t-indigo-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
                Total Extension Imports <Users className="w-4 h-4 text-indigo-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.extensionImportsCount}</div>
              <p className="text-xs text-red-500 mt-1">+{stats.extensionFailedImports} failed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm border-t-4 border-t-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
                Extension Success Rate <Activity className="w-4 h-4 text-emerald-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.extensionSuccessRate}%</div>
              <p className="text-xs text-green-600 mt-1">Conversion rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm border-t-4 border-t-pink-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
                Platforms Used <Home className="w-4 h-4 text-pink-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.extensionPlatformStats?.length === 0 ? (
                <p className="text-xs text-gray-500">No extension imports recorded.</p>
              ) : (
                <div className="space-y-1">
                  {stats.extensionPlatformStats?.map((platformStat: any) => (
                    <div key={platformStat.platform} className="flex justify-between text-xs items-center">
                      <span className="font-semibold text-gray-700 capitalize">{platformStat.platform}</span>
                      <span className="text-gray-500">{platformStat.total} ({platformStat.successRate}%)</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Import Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentImports?.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent import jobs found.</p>
          ) : (
            <div className="divide-y">
              {stats.recentImports?.map((log: any) => (
                <div key={log.id} className="py-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[400px]" title={log.url}>
                      {log.url}
                    </span>
                    <span className="text-xs text-gray-500">{format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {log.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
