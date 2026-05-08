export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type SortOrder = 'asc' | 'desc';

export type OrganizationStatus = 'active' | 'inactive';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  active_users: number;
  status: OrganizationStatus;
  feature_flags: string[];
}

export interface CreateOrgInput {
  name: string;
  settings?: {
    allow_data_export?: boolean;
    default_timezone?: string;
  };
}

export interface UpdateOrgInput {
  name?: string;
  status?: OrganizationStatus;
  settings?: {
    allow_data_export?: boolean;
    default_timezone?: string;
  };
}

export interface OrganizationListParams extends PaginationParams {
  search?: string;
  status?: OrganizationStatus;
  sortBy?: 'name' | 'created_at';
  sortOrder?: SortOrder;
}

export interface OrganizationListResponse {
  items: Organization[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface CreateRoleInput {
  name: string;
  description: string;
  permissions: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  target_type: string;
  target_id: string;
  ip_address: string;
  metadata: Record<string, unknown>;
}

export interface AuditLogParams extends PaginationParams {
  actor?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PipelineStatus = 'running' | 'success' | 'failed' | 'paused';

export interface Pipeline {
  id: string;
  name: string;
  organization: string;
  last_run: string;
  status: PipelineStatus;
  success_rate: number;
  duration_seconds: number;
}

export interface PipelineListParams extends PaginationParams {
  status?: PipelineStatus;
  organization?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PipelineListResponse {
  items: Pipeline[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unreachable';

export interface WarehouseHealth {
  organization: string;
  status: HealthStatus;
  latency_ms: number;
  last_checked: string;
}

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  last_checked: string;
  latency_ms?: number;
}

export interface PlatformHealthResponse {
  apiServer: ServiceHealth;
  database: ServiceHealth;
  warehouses: WarehouseHealth[];
  last_updated: string;
}

export interface DashboardMetrics {
  totalOrganizations: number;
  activePipelines: number;
  failedPipelines24h: number;
  activeUsers: number;
  warehouseHealth: string;
}

export interface HealthListParams {}
