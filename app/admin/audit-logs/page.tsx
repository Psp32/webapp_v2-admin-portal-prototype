'use client';

import { useEffect, useState } from 'react';
import { Search, SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { getAuditLogs } from '@/services/admin/adminApi';
import { useAdminPermissions } from '@/hooks/api/useAdminPermissions';
import type { AuditLogEntry } from '@/services/admin/admin.types';

export default function AdminAuditLogsPage() {
  const { canDo } = useAdminPermissions();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const response = await getAuditLogs({ pageSize: 50 });
      setLogs(response.items);
      setLoading(false);
    }

    load();
  }, []);

  const filteredLogs = logs.filter((item) =>
    [item.actor, item.action, item.target_type, item.target_id]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Audit visibility
          </p>
          <h1 className="mt-2 text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Inspect recent administrative actions and track changes across the platform.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/10 px-4 py-2 text-sm text-muted-foreground">
          <span>{filteredLogs.length} entries</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_280px]">
          <div className="space-y-2">
            <Label htmlFor="audit-search">Search logs</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="audit-search"
                className="pl-10"
                placeholder="Filter by actor, action, or resource"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end justify-end">
            <Button variant="secondary" disabled={!canDo('view_audit')}>
              Export logs
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <AuditLogViewer logs={filteredLogs} loading={loading} />
      </div>
    </div>
  );
}
