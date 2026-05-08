'use client';

import { useEffect, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PipelineStatusTable } from '@/components/admin/PipelineStatusTable';
import { getPipelines, getOrganizations } from '@/services/admin/adminApi';
import { useAdminPermissions } from '@/hooks/api/useAdminPermissions';
import type { Pipeline, Organization } from '@/services/admin/admin.types';

export default function AdminPipelinesPage() {
  const { canDo } = useAdminPermissions();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [search, setSearch] = useState('');
  const [organization, setOrganization] = useState('all');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [pipelineResponse, orgResponse] = await Promise.all([
        getPipelines({
          search: search || undefined,
          organization: organization === 'all' ? undefined : organization,
        }),
        getOrganizations({ pageSize: 100 }),
      ]);
      setPipelines(pipelineResponse.items);
      setOrganizations(orgResponse.items);
      setLoading(false);
    }

    load();
  }, [search, organization]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Pipeline monitoring
          </p>
          <h1 className="mt-2 text-3xl font-bold">Pipeline Monitor</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Filter and inspect pipeline status across organizations in real time.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/10 px-4 py-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          {pipelines.length} pipelines monitored
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="space-y-2">
            <Label htmlFor="pipeline-search">Filter by pipeline name</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pipeline-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search pipelines"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-filter">Organization</Label>
            <select
              id="org-filter"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
            >
              <option value="all">All organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <PipelineStatusTable pipelines={pipelines} />
      </div>

      {!canDo('manage_pipelines') && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Only users with pipeline management permissions can modify execution settings from the
          platform backend.
        </div>
      )}
    </div>
  );
}
