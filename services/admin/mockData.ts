import type {
  AuditLogEntry,
  HealthStatus,
  Organization,
  Pipeline,
  Role,
  PlatformHealthResponse,
} from './admin.types';

const organizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Dalgo Labs',
    created_at: '2024-10-01T08:45:00Z',
    active_users: 18,
    status: 'active',
    feature_flags: ['pipeline_monitor', 'audit_logging'],
  },
  {
    id: 'org-2',
    name: 'AgriData Intl',
    created_at: '2024-11-14T14:15:00Z',
    active_users: 9,
    status: 'inactive',
    feature_flags: ['warehouse_health'],
  },
  {
    id: 'org-3',
    name: 'FinGrowth',
    created_at: '2025-02-02T12:30:00Z',
    active_users: 27,
    status: 'active',
    feature_flags: ['pipeline_monitor', 'audit_logging', 'warehouse_health'],
  },
];

const roles: Role[] = [
  {
    id: 'role-1',
    name: 'Super Admin',
    description: 'Full platform access',
    permissions: [
      'admin_access',
      'manage_organizations',
      'manage_roles',
      'view_audit_logs',
      'view_health',
    ],
  },
  {
    id: 'role-2',
    name: 'Org Admin',
    description: 'Manage a single organization',
    permissions: ['admin_access', 'manage_organizations', 'view_health'],
  },
  {
    id: 'role-3',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: ['admin_access', 'view_audit_logs', 'view_health'],
  },
];

const pipelines: Pipeline[] = [
  {
    id: 'pipeline-1',
    name: 'Customer ETL',
    organization: 'Dalgo Labs',
    last_run: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    status: 'running',
    success_rate: 97,
    duration_seconds: 1420,
  },
  {
    id: 'pipeline-2',
    name: 'Payments Sync',
    organization: 'FinGrowth',
    last_run: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
    success_rate: 84,
    duration_seconds: 1130,
  },
  {
    id: 'pipeline-3',
    name: 'Warehouse Delta',
    organization: 'AgriData Intl',
    last_run: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: 'success',
    success_rate: 100,
    duration_seconds: 920,
  },
  {
    id: 'pipeline-4',
    name: 'User Activity Sync',
    organization: 'Dalgo Labs',
    last_run: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    status: 'paused',
    success_rate: 91,
    duration_seconds: 780,
  },
];

const auditLogs: AuditLogEntry[] = [
  {
    id: 'audit-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actor: 'admin@dalgo.io',
    action: 'CREATE',
    target_type: 'Organization',
    target_id: 'org-4',
    ip_address: '192.168.10.5',
    metadata: { name: 'HealthCo', status: 'active' },
  },
  {
    id: 'audit-2',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    actor: 'viewer@dalgo.io',
    action: 'LOGIN',
    target_type: 'User',
    target_id: 'user-22',
    ip_address: '52.36.140.210',
    metadata: { success: true },
  },
  {
    id: 'audit-3',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    actor: 'orgadmin@finGrowth.com',
    action: 'UPDATE',
    target_type: 'Pipeline',
    target_id: 'pipeline-2',
    ip_address: '203.0.113.22',
    metadata: { status: 'failed', retry: 1 },
  },
];

const healthResponse: PlatformHealthResponse = {
  apiServer: {
    name: 'API Server',
    status: 'healthy',
    last_checked: new Date(Date.now() - 90 * 1000).toISOString(),
    latency_ms: 42,
  },
  database: {
    name: 'Database',
    status: 'healthy',
    last_checked: new Date(Date.now() - 120 * 1000).toISOString(),
    latency_ms: 58,
  },
  warehouses: [
    {
      organization: 'Dalgo Labs',
      status: 'healthy',
      latency_ms: 110,
      last_checked: new Date(Date.now() - 160 * 1000).toISOString(),
    },
    {
      organization: 'FinGrowth',
      status: 'degraded',
      latency_ms: 215,
      last_checked: new Date(Date.now() - 180 * 1000).toISOString(),
    },
    {
      organization: 'AgriData Intl',
      status: 'unreachable',
      latency_ms: 0,
      last_checked: new Date(Date.now() - 300 * 1000).toISOString(),
    },
  ],
  last_updated: new Date().toISOString(),
};

export function getMockOrganizations() {
  return organizations;
}

export function getMockRoles() {
  return roles;
}

export function getMockPipelines() {
  return pipelines;
}

export function getMockAuditLogs() {
  return auditLogs;
}

export function getMockPlatformHealth() {
  return healthResponse;
}

export function addMockOrganization(data: Omit<Organization, 'id'>) {
  const newOrg: Organization = { id: `org-${Date.now()}`, ...data };
  organizations.unshift(newOrg);
  return newOrg;
}

export function updateMockOrganization(id: string, data: Partial<Organization>) {
  const index = organizations.findIndex((org) => org.id === id);
  if (index >= 0) {
    organizations[index] = { ...organizations[index], ...data };
    return organizations[index];
  }
  return null;
}

export function deleteMockOrganization(id: string) {
  const index = organizations.findIndex((org) => org.id === id);
  if (index >= 0) {
    organizations.splice(index, 1);
    return true;
  }
  return false;
}

export function bulkUpdateMockOrganizations(ids: string[], action: 'activate' | 'deactivate') {
  organizations.forEach((org) => {
    if (ids.includes(org.id)) {
      org.status = action === 'activate' ? 'active' : 'inactive';
    }
  });
  return organizations.filter((org) => ids.includes(org.id));
}

export function addMockRole(data: Omit<Role, 'id'>) {
  const newRole: Role = { id: `role-${Date.now()}`, ...data };
  roles.unshift(newRole);
  return newRole;
}

export function getMockDashboardMetrics() {
  const activeOrgs = organizations.filter((org) => org.status === 'active').length;
  const failed24h = pipelines.filter((pipeline) => pipeline.status === 'failed').length;
  const activeUsers = organizations.reduce((sum, org) => sum + org.active_users, 0);
  const healthyWarehouses = healthResponse.warehouses.filter(
    (warehouse) => warehouse.status === 'healthy'
  ).length;
  return {
    totalOrganizations: organizations.length,
    activePipelines: pipelines.filter((pipeline) => pipeline.status !== 'failed').length,
    failedPipelines24h: failed24h,
    activeUsers,
    warehouseHealth: `${healthyWarehouses}/${healthResponse.warehouses.length} healthy`,
  };
}

export function updateMockHealthTimestamps() {
  const now = new Date().toISOString();
  healthResponse.last_updated = now;
  healthResponse.apiServer.last_checked = now;
  healthResponse.database.last_checked = now;
  healthResponse.warehouses.forEach((warehouse) => {
    warehouse.last_checked = now;
    if (warehouse.status === 'healthy') {
      warehouse.latency_ms = Math.max(30, warehouse.latency_ms - 10);
    }
  });
  return healthResponse;
}
