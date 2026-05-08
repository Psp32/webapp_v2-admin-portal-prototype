'use client';

import { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HealthIndicator } from '@/components/admin/HealthIndicator';
import { getPlatformHealth, refreshHealthCheck } from '@/services/admin/adminApi';
import type { PlatformHealthResponse } from '@/services/admin/admin.types';

export default function AdminHealthPage() {
  const [health, setHealth] = useState<PlatformHealthResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    getPlatformHealth().then(setHealth);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const updated = await refreshHealthCheck();
    setHealth(updated);
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
              Service monitoring
            </p>
            <h1 className="mt-2 text-3xl font-bold">Platform Health</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Check the current status of the API, database and warehouse connections.
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isRefreshing ? 'Refreshing...' : 'Refresh health'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Core services</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your backend infrastructure and API availability.
          </p>
          <div className="mt-6 space-y-3">
            {health ? (
              [health.apiServer, health.database].map((service) => (
                <HealthIndicator
                  key={service.name}
                  service={service.name}
                  status={service.status}
                  lastChecked={service.last_checked}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Loading service health...</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Warehouses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Status of configured warehouse connections across organizations.
          </p>
          <div className="mt-6 space-y-3">
            {health ? (
              health.warehouses.map((warehouse) => (
                <HealthIndicator
                  key={warehouse.organization}
                  service={warehouse.organization}
                  status={warehouse.status}
                  lastChecked={warehouse.last_checked}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Loading warehouse health...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
