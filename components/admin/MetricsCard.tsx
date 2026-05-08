import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  label: string;
  value: string | number;
  description?: string;
  className?: string;
  loading?: boolean;
}

export function MetricsCard({
  label,
  value,
  description,
  className,
  loading = false,
}: MetricsCardProps) {
  return (
    <Card className={cn('border border-border bg-background', className)}>
      <CardHeader className="px-4 pb-0 pt-4">
        <CardTitle className="text-base text-foreground">{label}</CardTitle>
        {description ? <CardDescription className="text-sm">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <div className="text-3xl font-semibold text-foreground">
          {loading ? (
            <span className="inline-block h-10 w-24 animate-pulse rounded-lg bg-slate-200/70" />
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  );
}
