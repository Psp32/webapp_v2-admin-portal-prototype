'use client';

import { useMemo, useState, useEffect } from 'react';
import { AlertCircle, Plus, Trash2, Edit3, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { OrganizationForm } from '@/components/admin/OrganizationForm';
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  bulkUpdateOrganizations,
} from '@/services/admin/adminApi';
import { useAdminPermissions } from '@/hooks/api/useAdminPermissions';
import type { Organization, OrganizationStatus } from '@/services/admin/admin.types';

const statusLabels: Record<OrganizationStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export default function AdminOrganizationsPage() {
  const { canDo } = useAdminPermissions();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrganizationStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const response = await getOrganizations({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
    });
    setOrganizations(response.items);
    setSelected([]);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [search, status]);

  const filteredOrganizations = useMemo(() => {
    return organizations.sort((a, b) => a.name.localeCompare(b.name));
  }, [organizations]);

  const hasSelected = selected.length > 0;

  const handleCreate = () => {
    setSelectedOrg(null);
    setDialogOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleSubmit = async (data: {
    name: string;
    allow_data_export: boolean;
    default_timezone: string;
  }) => {
    setIsSaving(true);
    if (selectedOrg) {
      await updateOrganization(selectedOrg.id, {
        name: data.name,
        settings: {
          allow_data_export: data.allow_data_export,
          default_timezone: data.default_timezone,
        },
      });
    } else {
      await createOrganization({
        name: data.name,
        settings: {
          allow_data_export: data.allow_data_export,
          default_timezone: data.default_timezone,
        },
      });
    }
    setDialogOpen(false);
    setIsSaving(false);
    refresh();
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await deleteOrganization(deletingId);
    setConfirmOpen(false);
    setDeletingId(null);
    refresh();
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate') => {
    if (!hasSelected) return;
    await bulkUpdateOrganizations(selected, action);
    setSelected([]);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Organization management
          </p>
          <h1 className="mt-2 text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Search, edit and manage organization settings from a single admin view.
          </p>
        </div>
        {canDo('create_org') && (
          <Button
            variant="ghost"
            className="text-white shadow-xs"
            style={{ backgroundColor: 'var(--primary)' }}
            onClick={handleCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create organization
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-search">Search</Label>
                <Input
                  id="org-search"
                  placeholder="Search organizations"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-status">Status</Label>
                <select
                  id="org-status"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as OrganizationStatus | 'all')}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleBulkAction('activate')}
                disabled={!canDo('update_org') || !hasSelected}
              >
                Activate selected
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('deactivate')}
                disabled={!canDo('update_org') || !hasSelected}
              >
                Deactivate selected
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((organization) => (
                <TableRow key={organization.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(organization.id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelected((prev) => [...prev, organization.id]);
                        } else {
                          setSelected((prev) => prev.filter((id) => id !== organization.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-input text-primary"
                    />
                  </TableCell>
                  <TableCell>{organization.name}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        organization.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {statusLabels[organization.status]}
                    </span>
                  </TableCell>
                  <TableCell>{organization.active_users}</TableCell>
                  <TableCell>{new Date(organization.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      {canDo('update_org') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(organization)}
                          aria-label={`Edit ${organization.name}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      {canDo('delete_org') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(organization.id)}
                          aria-label={`Delete ${organization.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrganizations.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
              <AlertCircle className="h-6 w-6" />
              <p>No organizations match the current filters.</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Quick tips</h2>
              <p className="text-sm text-muted-foreground">
                Use the organization table to manage account settings and filter by status for bulk
                workflows.
              </p>
            </div>
            <div className="space-y-3 rounded-xl border border-border bg-muted/5 p-4">
              <p className="text-sm font-semibold">Permission controls</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Admins can create, update and deactivate organizations.</li>
                <li>Selected rows can be bulk activated or deactivated.</li>
                <li>Audit tracking is available in the Audit Logs section.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOrg ? 'Edit organization' : 'Create organization'}</DialogTitle>
            <DialogDescription>
              {selectedOrg
                ? 'Update the organization settings and save changes.'
                : 'Add a new organization to the admin portal.'}
            </DialogDescription>
          </DialogHeader>
          <OrganizationForm
            organization={selectedOrg}
            isSaving={isSaving}
            onCancel={() => setDialogOpen(false)}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={confirmOpen}
        title="Confirm delete"
        description="This action will permanently remove the selected organization."
        confirmText="Delete organization"
        onConfirm={handleConfirmDelete}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
