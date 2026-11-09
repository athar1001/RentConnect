'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, ShieldAlert, Fingerprint } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/control/audit-logs', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        toast.error('Failed to fetch audit logs');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    (log.action?.toLowerCase().includes(search.toLowerCase()) || 
     log.admin?.email.toLowerCase().includes(search.toLowerCase()) ||
     log.targetEntity?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Audit Log</h1>
          <p className="text-gray-500 text-sm">Read-only ledger of sensitive administrative actions.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search admin, action, or target..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm border-t-4 border-t-slate-800 bg-slate-50/50">
        <CardContent className="p-4 flex items-start gap-4">
          <Fingerprint className="w-5 h-5 text-slate-700 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-900">Immutability Notice</h3>
            <p className="text-sm text-slate-700">Audit logs are immutable. Every status change to a user or feedback ticket is permanently recorded here with the executing administrator's ID and timestamp to ensure accountability.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Admin Executing</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading audit trail...</td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-gray-300 mb-2" />
                        No audit logs recorded yet.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {format(new Date(log.timestamp), 'MMM d, yyyy h:mm:ss a')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{log.admin?.email}</div>
                        <div className="text-xs text-slate-400">ID: {log.adminId.substring(0,8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold text-slate-700 bg-slate-200 tracking-wider">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {log.targetEntity}
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
