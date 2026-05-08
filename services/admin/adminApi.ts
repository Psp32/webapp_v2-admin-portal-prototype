import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api';
import {
  addMockOrganization,
  addMockRole,
  bulkUpdateMockOrganizations,
  deleteMockOrganization,
  getMockAuditLogs,
  getMockDashboardMetrics,
  getMockOrganizations,
  getMockPlatformHealth,
  getMockPipelines,
  getMockRoles,
  updateMockHealthTimestamps,
  updateMockOrganization,
} from './mockData';
import type {
  AuditLogListResponse,
  AuditLogParams,
  CreateOrgInput,
  CreateRoleInput,
  OrganizationListParams,
  OrganizationListResponse,
  PipelineListParams,
  PipelineListResponse,
  PlatformHealthResponse,
  UpdateOrgInput,
  Role,
} from './admin.types';

const ADMIN_BASE = '/api/admin';

function safeApiFallback<T>(apiCall: () => Promise<T>, fallback: () => T): Promise<T> {
  return apiCall().catch(() => Promise.resolve(fallback()));
}

export async function getOrganizations(
  params: OrganizationListParams = {}
): Promise<OrganizationListResponse> {
  const fallback = () => {
    const items = getMockOrganizations()
      .filter((org) => {
        if (params.search) {
          return org.name.toLowerCase().includes(params.search.toLowerCase());
        }
        return true;
      })
      .filter((org) => {
        if (params.status) {
          return org.status === params.status;
        }
        return true;
      })
      .sort((a, b) => {
        const sortBy = params.sortBy || 'created_at';
        const direction = params.sortOrder === 'asc' ? 1 : -1;
        return a[sortBy].localeCompare(b[sortBy]) * direction;
      });

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paged,
      total,
      page,
      pageSize,
      totalPages,
    };
  };

  return safeApiFallback(async () => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    return apiGet(`${ADMIN_BASE}/organizations?${query.toString()}`);
  }, fallback);
}

export async function createOrganization(data: CreateOrgInput) {
  return safeApiFallback(
    async () => apiPost(`${ADMIN_BASE}/organizations`, data),
    () =>
      addMockOrganization({
        name: data.name,
        created_at: new Date().toISOString(),
        active_users: 0,
        status: 'active',
        feature_flags: [],
      })
  );
}

export async function updateOrganization(id: string, data: UpdateOrgInput) {
  return safeApiFallback(
    async () => apiPut(`${ADMIN_BASE}/organizations/${id}`, data),
    () =>
      updateMockOrganization(id, {
        name: data.name ?? undefined,
        status: data.status ?? undefined,
        feature_flags: data.settings?.allow_data_export ? ['warehouse_health'] : undefined,
      } as any)
  );
}

export async function deleteOrganization(id: string) {
  return safeApiFallback(
    async () => apiDelete(`${ADMIN_BASE}/organizations/${id}`),
    () => deleteMockOrganization(id)
  );
}

export async function bulkUpdateOrganizations(ids: string[], action: 'activate' | 'deactivate') {
  return safeApiFallback(
    async () => apiPost(`${ADMIN_BASE}/organizations/bulk-update`, { ids, action }),
    () => bulkUpdateMockOrganizations(ids, action)
  );
}

export async function getRoles(): Promise<Role[]> {
  return safeApiFallback(async () => apiGet(`${ADMIN_BASE}/roles`), getMockRoles);
}

export async function createRole(data: CreateRoleInput): Promise<Role> {
  return safeApiFallback(
    async () => apiPost(`${ADMIN_BASE}/roles`, data),
    () => addMockRole(data)
  );
}

export async function getAuditLogs(params: AuditLogParams = {}): Promise<AuditLogListResponse> {
  return safeApiFallback(
    async () => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page.toString());
      if (params.pageSize) query.set('pageSize', params.pageSize.toString());
      if (params.actor) query.set('actor', params.actor);
      if (params.action) query.set('action', params.action);
      if (params.startDate) query.set('startDate', params.startDate);
      if (params.endDate) query.set('endDate', params.endDate);
      return apiGet(`${ADMIN_BASE}/audit-logs?${query.toString()}`);
    },
    () => {
      const items = getMockAuditLogs();
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? 10;
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      return {
        items: items.slice((page - 1) * pageSize, page * pageSize),
        total,
        page,
        pageSize,
        totalPages,
      };
    }
  );
}

export async function getPlatformHealth(): Promise<PlatformHealthResponse> {
  return safeApiFallback(
    async () => apiGet(`${ADMIN_BASE}/platform-health`),
    getMockPlatformHealth
  );
}

export async function getPipelines(params: PipelineListParams = {}): Promise<PipelineListResponse> {
  return safeApiFallback(
    async () => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page.toString());
      if (params.pageSize) query.set('pageSize', params.pageSize.toString());
      if (params.status) query.set('status', params.status);
      if (params.organization) query.set('organization', params.organization);
      if (params.startDate) query.set('startDate', params.startDate);
      if (params.endDate) query.set('endDate', params.endDate);
      if (params.search) query.set('search', params.search);
      return apiGet(`${ADMIN_BASE}/pipelines?${query.toString()}`);
    },
    () => {
      const items = getMockPipelines();
      const filtered = items.filter((pipeline) => {
        if (params.status && pipeline.status !== params.status) return false;
        if (params.organization && pipeline.organization !== params.organization) return false;
        if (params.search && !pipeline.name.toLowerCase().includes(params.search.toLowerCase()))
          return false;
        return true;
      });
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? 10;
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      return {
        items: filtered.slice((page - 1) * pageSize, page * pageSize),
        total,
        page,
        pageSize,
        totalPages,
      };
    }
  );
}

export async function refreshHealthCheck(): Promise<PlatformHealthResponse> {
  return safeApiFallback(
    async () => apiPost(`${ADMIN_BASE}/platform-health/check`, {}),
    () => updateMockHealthTimestamps()
  );
}
