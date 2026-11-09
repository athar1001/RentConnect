'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminImportsPage() {
  const [imports, setImports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchImports = async () => {
      try {
        const res = await fetch('http://localhost:3000/control/imports', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setImports(data);
        } else {
          toast.error('Failed to fetch import logs');
        }
      } catch (err) {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchImports();
  }, []);

  const filteredImports = imports.filter(log => 
    (log.url?.toLowerCase().includes(search.toLowerCase()) || 
     log.user?.email.toLowerCase().includes(search.toLowerCase()) ||
     log.platform?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Logs</h1>
          <p className="text-gray-500 text-sm">Monitor all scraping and manual import activities.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search URL, user email, platform..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Status & Platform</th>
                  <th className="px-6 py-4">URL</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Error Message</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading logs...</td>
                  </tr>
                ) : filteredImports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No import logs found.</td>
                  </tr>
                ) : (
                  filteredImports.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status === 'SUCCESS' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {log.status}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {log.platform || 'MANUAL'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a href={log.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline max-w-[300px] truncate" title={log.url}>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{log.url}</span>
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {log.user?.email || <span className="text-gray-400 italic">Anonymous / System</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-6 py-4">
                        {log.error ? (
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded max-w-xs overflow-auto max-h-20" title={log.error}>
                            {log.error}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
