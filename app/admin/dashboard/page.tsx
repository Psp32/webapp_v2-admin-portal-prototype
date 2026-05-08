'use client';

import { useEffect, useMemo, useState } from 'react';
import { getOrganizations, getPipelines, getPlatformHealth } from '@/services/admin/adminApi';
import { MetricsCard } from '@/components/admin/MetricsCard';
import { EChart } from '@/components/admin/EChart';
import { HealthIndicator } from '@/components/admin/HealthIndicator';
import { PipelineStatusTable } from '@/components/admin/PipelineStatusTable';
import { Button } from '@/components/ui/button';
import type { PlatformHealthResponse } from '@/services/admin/admin.types';

export default function AdminDashboardPage() {
  const [orgCount, setOrgCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [pipelines, setPipelines] = useState([]);
  const [health, setHealth] = useState<PlatformHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [orgResponse, pipelineResponse, healthResponse] = await Promise.all([
        getOrganizations({ pageSize: 100 }),
        getPipelines({ pageSize: 20 }),
        getPlatformHealth(),
      ]);

      setOrgCount(orgResponse.total);
      setActiveUsers(orgResponse.items.reduce((sum, org) => sum + org.active_users, 0));
      setPipelines(pipelineResponse.items);
      setHealth(healthResponse);
      setLoading(false);
    }

    load();
  }, []);

  const pipelineStatusStats = useMemo(() => {
    const counts = pipelines.reduce(
      (acc, pipeline) => {
        acc[pipeline.status] = (acc[pipeline.status] ?? 0) + 1;
        return acc;
      },
      {
        running: 0,
        success: 0,
        failed: 0,
        paused: 0,
      } as Record<string, number>
    );

    const series = [
      { name: 'Running', value: counts.running },
      { name: 'Success', value: counts.success },
      { name: 'Failed', value: counts.failed },
      { name: 'Paused', value: counts.paused },
    ];

    return series;
  }, [pipelines]);

  const weeklyActivityData = useMemo(
    () => ({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [12, 18, 22, 16, 25, 14, 19],
    }),
    []
  );

  const organizationGrowthData = useMemo(
    () => ({
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      values: [2, 4, 6, orgCount],
    }),
    [orgCount]
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-4">
        <MetricsCard
          title="Organizations"
          value={orgCount}
          subtitle="Total active organizations"
          loading={loading}
        />
        <MetricsCard
          title="Active users"
          value={activeUsers}
          subtitle="Combined organization users"
          loading={loading}
        />
        <MetricsCard
          title="Pipeline health"
          value={pipelines.length}
          subtitle="Total monitored pipelines"
          loading={loading}
        />
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Platform health
              </p>
              <h2 className="mt-2 text-xl font-semibold">Service readiness</h2>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                setLoading(true);
                const updated = await getPlatformHealth();
                setHealth(updated);
                setLoading(false);
              }}
            >
              Refresh
            </Button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {health ? (
              [health.apiServer, health.database, ...health.warehouses].map((service) => (
                <HealthIndicator
                  key={service.name ?? service.organization}
                  service={service.name ?? service.organization}
                  status={service.status}
                  lastChecked={service.last_checked}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Loading health information...</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Pipeline traffic
              </p>
              <h2 className="text-xl font-semibold">Pipeline success rate</h2>
            </div>
          </div>
          <EChart
            option={{
              tooltip: {
                trigger: 'item',
              },
              legend: {
                bottom: 0,
                left: 'center',
              },
              series: [
                {
                  name: 'Status',
                  type: 'pie',
                  radius: ['45%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                    show: true,
                    position: 'inside',
                    formatter: '{b}: {c}',
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: '16',
                      fontWeight: 'bold',
                    },
                  },
                  data: pipelineStatusStats,
                },
              ],
            }}
            height={320}
          />
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
              Weekly activity
            </p>
            <h2 className="text-xl font-semibold">Pipeline executions</h2>
          </div>
          <EChart
            option={{
              xAxis: {
                type: 'category',
                data: weeklyActivityData.labels,
                boundaryGap: false,
              },
              yAxis: {
                type: 'value',
              },
              tooltip: {
                trigger: 'axis',
              },
              series: [
                {
                  data: weeklyActivityData.values,
                  type: 'line',
                  smooth: true,
                  areaStyle: {},
                },
              ],
            }}
            height={260}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Overview</p>
            <h2 className="text-xl font-semibold">Recent pipeline status</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing the most recent pipeline executions from the monitored set.
          </p>
        </div>
        <PipelineStatusTable pipelines={pipelines.slice(0, 6)} />
      </div>
    </div>
  );
}
