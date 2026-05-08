import { Badge } from '@/components/ui/badge';

export type HealthStatus = 'healthy' | 'degraded' | 'unreachable';

interface HealthIndicatorProps {
  service: string;
  status: HealthStatus;
  lastChecked: string;
}

const STATUS_STYLE: Record<HealthStatus, { color: string; label: string }> = {
  healthy: { color: 'bg-emerald-500', label: 'Healthy' },
  degraded: { color: 'bg-amber-500', label: 'Degraded' },
  unreachable: { color: 'bg-destructive', label: 'Unreachable' },
};

export function HealthIndicator({ service, status, lastChecked }: HealthIndicatorProps) {
  const style = STATUS_STYLE[status];

  return (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">{service}</p>
          <p className="text-sm text-muted-foreground">
            Last checked {new Date(lastChecked).toLocaleString()}
          </p>
        </div>
        <Badge className="rounded-full px-3 py-1 text-xs font-semibold" variant="outline">
          <span className={`h-2.5 w-2.5 rounded-full ${style.color} inline-block mr-2`}></span>
          {style.label}
        </Badge>
      </div>
    </div>
  );
}
