'use client';

import { Fragment, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { AuditLogEntry } from '@/services/admin/admin.types';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  loading?: boolean;
}

const ACTION_VARIANT: Record<AuditLogEntry['action'], string> = {
  CREATE: 'bg-emerald-500 text-white',
  UPDATE: 'bg-sky-500 text-white',
  DELETE: 'bg-destructive text-white',
  LOGIN: 'bg-slate-500 text-white',
};

export function AuditLogViewer({ logs, loading = false }: AuditLogViewerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-background p-6 text-muted-foreground">
        Loading audit logs...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Table className="min-w-full border-collapse text-left text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <Fragment key={entry.id}>
                <TableRow>
                  <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{entry.actor}</TableCell>
                  <TableCell>
                    <span
                      className={
                        ACTION_VARIANT[entry.action] +
                        ' inline-flex rounded-full px-2 py-1 text-xs font-semibold'
                      }
                    >
                      {entry.action}
                    </span>
                  </TableCell>
                  <TableCell>
                    {entry.target_type} • {entry.target_id}
                  </TableCell>
                  <TableCell>{entry.ip_address}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="inline-flex items-center gap-1 text-primary"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                      {isExpanded ? 'Hide' : 'Show'}
                    </button>
                  </TableCell>
                </TableRow>
                {isExpanded ? (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-muted/10 p-4">
                      <pre className="whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
