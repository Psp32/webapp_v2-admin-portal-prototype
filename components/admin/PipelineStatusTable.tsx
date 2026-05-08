'use client';

import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Pipeline } from '@/services/admin/admin.types';

interface PipelineStatusTableProps {
  pipelines: Pipeline[];
  onViewLogs?: (pipelineId: string) => void;
  onTogglePause?: (pipelineId: string) => void;
  onCancel?: (pipelineId: string) => void;
  canManage?: boolean;
}

const statusVariant: Record<Pipeline['status'], string> = {
  running: 'bg-sky-500 text-white',
  success: 'bg-emerald-500 text-white',
  failed: 'bg-destructive text-white',
  paused: 'bg-amber-500 text-slate-950',
};

export function PipelineStatusTable({
  pipelines,
  onViewLogs,
  onTogglePause,
  onCancel,
  canManage = false,
}: PipelineStatusTableProps) {
  const rows = useMemo(() => pipelines, [pipelines]);

  return (
    <Table className="min-w-full border-collapse text-left text-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Organization</TableHead>
          <TableHead>Last Run</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Success</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((pipeline) => (
          <TableRow key={pipeline.id}>
            <TableCell>{pipeline.name}</TableCell>
            <TableCell>{pipeline.organization}</TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(pipeline.last_run), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <span
                className={
                  statusVariant[pipeline.status] +
                  ' inline-flex rounded-full px-2 py-1 text-xs font-semibold'
                }
              >
                {pipeline.status}
              </span>
            </TableCell>
            <TableCell>{pipeline.success_rate}%</TableCell>
            <TableCell>{Math.ceil(pipeline.duration_seconds / 60)} min</TableCell>
            <TableCell className="space-x-2">
              {onViewLogs && (
                <Button variant="outline" size="sm" onClick={() => onViewLogs(pipeline.id)}>
                  Logs
                </Button>
              )}
              {onTogglePause && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTogglePause(pipeline.id)}
                  disabled={!canManage}
                >
                  {pipeline.status === 'paused' ? 'Resume' : 'Pause'}
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancel(pipeline.id)}
                  disabled={!canManage}
                >
                  Cancel
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
