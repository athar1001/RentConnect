'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Puzzle, CheckCircle, XCircle, Clock, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface ImportLog {
  id: string;
  url: string;
  status: string;
  error: string | null;
  platform: string | null;
  createdAt: string;
}

export function ExtensionSettingsSection({ user, onUpdate }: { user: any; onUpdate: () => void }) {
  const t = useTranslations('Settings');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [fetchingLogs, setFetchingLogs] = useState(true);

  const isConnected = user?.extensionConnected ?? false;

  useEffect(() => {
    async function fetchLogs() {
      try {
        setFetchingLogs(true);
        const res = await fetch('http://localhost:3000/users/import-logs', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error('Failed to fetch extension import logs', err);
      } finally {
        setFetchingLogs(false);
      }
    }
    fetchLogs();
  }, [user]);

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/auth/extension/disconnect', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(t('extension.disconnectSuccess'));
        onUpdate();
      } else {
        toast.error(t('toast.saveFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const lastImportLog = logs.find(log => log.status === 'SUCCESS');
  const lastImportDate = lastImportLog
    ? new Date(lastImportLog.createdAt).toLocaleString()
    : t('extension.neverImported');

  const getLocalizedError = (errStr: string | null) => {
    if (!errStr) return '';
    if (errStr === 'This apartment already exists in your account.') {
      return t('extension.errorDuplicate') || errStr;
    }
    return errStr;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('extension.title')}</h2>
        <p className="text-gray-500">{t('extension.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden md:col-span-2">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                  <Puzzle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('extension.connectionStatus')}</h3>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></span>
                    <span className="text-sm font-medium text-gray-600">
                      {isConnected ? t('extension.connected') : t('extension.disconnected')}
                    </span>
                  </div>
                </div>
              </div>

              {isConnected && (
                <Button
                  onClick={handleDisconnect}
                  disabled={loading}
                  variant="outline"
                  className="border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500 rounded-xl"
                >
                  {loading ? t('extension.disconnecting') : t('extension.disconnectButton')}
                </Button>
              )}
            </div>

            <hr className="border-gray-100" />

            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {t('extension.lastImport')}: <strong className="text-gray-700">{lastImportDate}</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-2">{t('extension.howToConnect')}</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                {t('extension.connectStep1')}<br />
                {t('extension.connectStep2')}<br />
                {t('extension.connectStep3')}<br />
                {t('extension.connectStep4')}
              </p>
            </div>
            <div className="pt-2">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); toast.info(t('extension.toastDownloadInfo')); }}
                className="inline-flex items-center text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl transition duration-200"
              >
                {t('extension.downloadExtension')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{t('extension.logsTitle')}</h3>
            <p className="text-sm text-gray-500">{t('extension.logsSubtitle')}</p>
          </div>

          {fetchingLogs ? (
            <div className="py-8 flex justify-center items-center text-sm text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
              {t('extension.loadingLogs')}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              {t('extension.noLogs')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-medium">
                    <th className="py-3 px-4">{t('extension.table.platform')}</th>
                    <th className="py-3 px-4">{t('extension.table.url')}</th>
                    <th className="py-3 px-4">{t('extension.table.status')}</th>
                    <th className="py-3 px-4">{t('extension.table.timestamp')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4 font-semibold text-gray-700 capitalize">
                        {log.platform || t('extension.unknown')}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <a
                          href={log.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          {log.url}
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        {log.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t('extension.success')}
                          </span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 w-fit">
                              <XCircle className="w-3.5 h-3.5" />
                              {t('extension.failed')}
                            </span>
                            {log.error && (
                              <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {getLocalizedError(log.error)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
