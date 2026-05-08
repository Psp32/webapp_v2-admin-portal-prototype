'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAdminPermissions } from '@/hooks/api/useAdminPermissions';
import { LayoutDashboard, Users, ShieldCheck, Activity, HeartPulse, Database } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, permission: 'view_admin' },
  { label: 'Organizations', href: '/admin/organizations', icon: Users, permission: 'create_org' },
  { label: 'Roles', href: '/admin/roles', icon: ShieldCheck, permission: 'view_roles' },
  {
    label: 'Pipeline Monitor',
    href: '/admin/pipelines',
    icon: Activity,
    permission: 'view_pipelines',
  },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: Database, permission: 'view_audit' },
  { label: 'Health', href: '/admin/health', icon: HeartPulse, permission: 'view_health' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminPerms = useAdminPermissions() as any;
  const { isAdminPortalUser, role, isLoading, canDo, isDevMode } = adminPerms;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAdminPortalUser && !isDevMode) {
      router.replace('/login');
    }
  }, [isAdminPortalUser, isLoading, router, isDevMode]);

  if (isLoading || (!isAdminPortalUser && !isDevMode)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-base font-medium">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  const availableItems = navItems.filter((item) => canDo(item.permission));

  return (
    <div className="h-full min-h-[calc(100vh-4rem)] bg-gray-50 text-foreground">
      {isDevMode && <div></div>}
      <div className="border-b bg-background">
        <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Admin Portal</p>
            <h1 className="mt-2 text-3xl font-bold">Platform administration</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Manage organizations, roles, pipelines, audit logs and system health in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-sm ${
                isDevMode
                  ? 'border-amber-400 bg-amber-100 text-amber-900'
                  : 'border-border bg-background text-muted-foreground'
              }`}
            >
              Role: {role.replace('_', ' ').toUpperCase()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white shadow-xs"
              style={{ backgroundColor: 'var(--primary)' }}
              onClick={() => router.push('/admin/dashboard')}
            >
              Open dashboard
            </Button>
          </div>
        </div>
        <div className="border-t bg-background/95 px-6 py-3">
          <div className="flex flex-wrap gap-2">
            {availableItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'border-border bg-background text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <main className="min-h-[calc(100vh-4rem)] overflow-y-auto p-6">{children}</main>
    </div>
  );
}
