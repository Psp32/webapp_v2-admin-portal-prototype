import { useAuthStore } from '@/stores/authStore';

export type AdminRole = 'super_admin' | 'org_admin' | 'viewer' | 'unknown' | 'dev_admin';

const ROLE_ACTIONS: Record<AdminRole, string[]> = {
  super_admin: [
    'view_admin',
    'create_org',
    'edit_org',
    'delete_org',
    'bulk_manage_orgs',
    'view_roles',
    'create_role',
    'view_audit',
    'view_pipelines',
    'manage_pipelines',
    'view_health',
  ],
  org_admin: [
    'view_admin',
    'create_org',
    'edit_org',
    'view_roles',
    'view_audit',
    'view_pipelines',
    'manage_pipelines',
    'view_health',
  ],
  viewer: ['view_admin', 'view_audit', 'view_pipelines', 'view_health'],
  dev_admin: [
    'view_admin',
    'create_org',
    'edit_org',
    'delete_org',
    'bulk_manage_orgs',
    'view_roles',
    'create_role',
    'view_audit',
    'view_pipelines',
    'manage_pipelines',
    'view_health',
  ],
  unknown: [],
};

export function useAdminPermissions() {
  const { getCurrentOrgUser } = useAuthStore();
  const currentOrgUser = getCurrentOrgUser();

  // Development mode bypass for admin portal testing
  const isDevMode = process.env.NEXT_PUBLIC_ADMIN_DEV_MODE === 'true';

  if (isDevMode) {
    const canDo = (action: string): boolean => {
      return ROLE_ACTIONS.dev_admin?.includes(action) ?? false;
    };

    return {
      role: 'dev_admin' as AdminRole,
      canDo,
      isAdminPortalUser: true,
      isLoading: false,
      isDevMode: true,
    };
  }

  const roleString = currentOrgUser?.new_role_slug || 'unknown';
  const role: AdminRole =
    roleString === 'super_admin' || roleString === 'org_admin' || roleString === 'viewer'
      ? roleString
      : 'unknown';

  const canDo = (action: string): boolean => {
    return ROLE_ACTIONS[role]?.includes(action) ?? false;
  };

  return {
    role,
    canDo,
    isAdminPortalUser: role !== 'unknown',
    isLoading: !currentOrgUser,
    isDevMode: false,
  };
}

export default useAdminPermissions;
