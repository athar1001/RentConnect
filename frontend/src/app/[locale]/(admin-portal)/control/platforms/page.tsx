'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Stethoscope, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminScraperHealthPage() {
  const [healthData, setHealthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('http://localhost:3000/control/scraper-health', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setHealthData(data);
        } else {
          toast.error('Failed to fetch scraper health');
        }
      } catch (err) {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scraper Health</h1>
        <p className="text-gray-500 text-sm">Monitor parsing success rates across different real estate platforms to quickly identify structural website changes.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-500">Loading metrics...</div>
      ) : healthData.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-500">No scraper data available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthData.map((data, idx) => {
            const isHealthy = data.successRate >= 80;
            const isWarning = data.successRate >= 50 && data.successRate < 80;
            
            let color = 'text-red-500';
            let bg = 'bg-red-50';
            let border = 'border-t-red-500';
            let Icon = AlertTriangle;

            if (isHealthy) {
              color = 'text-green-600';
              bg = 'bg-green-50';
              border = 'border-t-green-500';
              Icon = CheckCircle;
            } else if (isWarning) {
              color = 'text-amber-500';
              bg = 'bg-amber-50';
              border = 'border-t-amber-500';
            }

            return (
              <Card key={idx} className={`border-0 shadow-sm border-t-4 ${border}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center justify-between">
                    {data.platform}
                    <div className={`p-1.5 rounded-full ${bg} ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Success Rate</div>
                      <div className={`text-4xl font-black ${color}`}>
                        {data.successRate}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Total Attempts</div>
                      <div className="text-xl font-bold text-gray-700">{data.total}</div>
                    </div>
                  </div>
                  
                  {/* Progress bar visual */}
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden flex">
                    <div className={`h-full ${isHealthy ? 'bg-green-500' : isWarning ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${data.successRate}%` }}></div>
                    <div className="h-full bg-gray-200" style={{ width: `${100 - data.successRate}%` }}></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
