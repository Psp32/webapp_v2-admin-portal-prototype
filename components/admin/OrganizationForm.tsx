'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateOrgInput, Organization, UpdateOrgInput } from '@/services/admin/admin.types';

interface OrganizationFormProps {
  organization?: Organization | null;
  onSubmit: (data: CreateOrgInput | UpdateOrgInput) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

type FormValues = {
  name: string;
  allow_data_export: boolean;
  default_timezone: string;
};

export function OrganizationForm({
  organization,
  onSubmit,
  onCancel,
  isSaving = false,
}: OrganizationFormProps) {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: {
      name: '',
      allow_data_export: true,
      default_timezone: 'UTC',
    },
  });

  useEffect(() => {
    reset({
      name: organization?.name ?? '',
      allow_data_export: organization
        ? organization.feature_flags.includes('warehouse_health')
        : true,
      default_timezone: 'UTC',
    });
  }, [organization, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border border-border bg-background">
        <CardHeader className="px-6 pb-0 pt-6">
          <CardTitle>{organization ? 'Edit Organization' : 'Create Organization'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              {...register('name', { required: 'Organization name is required' })}
              data-testid="organization-name-input"
              disabled={isSaving}
            />
            {formState.errors.name ? (
              <p className="text-sm text-destructive">{formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="allow-data-export">Allow Data Export</Label>
              <input
                id="allow-data-export"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                {...register('allow_data_export')}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-timezone">Default Timezone</Label>
              <Input id="default-timezone" {...register('default_timezone')} disabled={isSaving} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : organization ? 'Save Changes' : 'Create Organization'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
