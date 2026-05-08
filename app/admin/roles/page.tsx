'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getRoles, createRole } from '@/services/admin/adminApi';
import type { Role } from '@/services/admin/admin.types';
import { useAdminPermissions } from '@/hooks/api/useAdminPermissions';

export default function AdminRolesPage() {
  const { canDo } = useAdminPermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getRoles().then(setRoles);
  }, []);

  const handleCreate = async () => {
    setIsSaving(true);
    await createRole({
      name: newRoleName,
      description: newRoleDescription,
      permissions: ['view_admin', 'view_audit', 'view_pipelines', 'view_health'],
    });
    setNewRoleName('');
    setNewRoleDescription('');
    setDialogOpen(false);
    setIsSaving(false);
    setRoles(await getRoles());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Access controls
          </p>
          <h1 className="mt-2 text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Review role definitions and add new permission groups for your platform users.
          </p>
        </div>
        {canDo('create_role') && (
          <Button
            variant="ghost"
            className="text-white shadow-xs"
            style={{ backgroundColor: 'var(--primary)' }}
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create role
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>{role.permissions.join(', ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new role</DialogTitle>
            <DialogDescription>
              Define a new role and default permissions for users in the admin portal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                value={newRoleName}
                onChange={(event) => setNewRoleName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Role description</Label>
              <Textarea
                id="role-description"
                value={newRoleDescription}
                onChange={(event) => setNewRoleDescription(event.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSaving || !newRoleName.trim()}>
              {isSaving ? 'Saving...' : 'Create role'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
