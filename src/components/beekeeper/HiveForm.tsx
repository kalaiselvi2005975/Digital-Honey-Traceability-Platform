import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { hiveApi } from '../../services/hiveApi';
import { Hive } from '../../models/Hive';
import { todayDate } from '../../utils/dates';
import { useApp } from '../../context/AppContext';

const schema = z.object({
  hiveId: z.string().min(1, 'Hive ID is required').regex(/^[A-Z0-9-]+$/, 'Use uppercase letters, numbers, hyphens only'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  installationDate: z.string().min(1, 'Installation date is required'),
  queenStatus: z.enum(['active', 'weak', 'unknown']),
  healthStatus: z.enum(['healthy', 'warning', 'critical']),
  notes: z.string(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  hive: Hive | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function HiveFormModal({ open, hive, onClose, onSaved }: Props) {
  const { user } = useApp();
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      hiveId: '', name: '', location: '', installationDate: todayDate(),
      queenStatus: 'active', healthStatus: 'healthy', notes: '',
    },
  });

  useEffect(() => {
    if (hive) {
      reset({ hiveId: hive.hiveId, name: hive.name, location: hive.location,
        installationDate: hive.installationDate, queenStatus: hive.queenStatus,
        healthStatus: hive.healthStatus, notes: hive.notes });
    } else {
      reset({ hiveId: '', name: '', location: '', installationDate: todayDate(),
        queenStatus: 'active', healthStatus: 'healthy', notes: '' });
    }
  }, [hive, open, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (hive) {
        await hiveApi.update(hive.id, data);
      } else {
        await hiveApi.create({
          hiveId: data.hiveId,
          name: data.name,
          location: data.location,
          installationDate: data.installationDate,
          queenStatus: data.queenStatus,
          healthStatus: data.healthStatus,
          notes: data.notes,
        });
      }
      onSaved();
    } catch (e: unknown) {
      setError('hiveId', { message: e instanceof Error ? e.message : 'Error saving hive' });
    }
  };

  const Field = ({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-warm-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1" role="alert">{error}</p>}
    </div>
  );

  const inputClass = "w-full px-3 py-2 rounded-xl border border-warm-200 focus:border-honey-400 focus:ring-2 focus:ring-honey-100 outline-none text-sm transition";
  const selectClass = "w-full px-3 py-2 rounded-xl border border-warm-200 focus:border-honey-400 focus:ring-2 focus:ring-honey-100 outline-none text-sm bg-white transition";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={hive ? `Edit Hive — ${hive.hiveId}` : 'Add New Hive'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            {hive ? 'Save Changes' : 'Create Hive'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Hive ID *" id="hiveId" error={errors.hiveId?.message}>
            <input id="hiveId" {...register('hiveId')} disabled={!!hive}
              placeholder="H-001" className={inputClass + (hive ? ' opacity-60' : '')} />
          </Field>
          <Field label="Installation Date *" id="installationDate" error={errors.installationDate?.message}>
            <input id="installationDate" type="date" {...register('installationDate')} className={inputClass} />
          </Field>
        </div>
        <Field label="Hive Name *" id="name" error={errors.name?.message}>
          <input id="name" {...register('name')} placeholder="North Field Alpha" className={inputClass} />
        </Field>
        <Field label="Location *" id="location" error={errors.location?.message}>
          <input id="location" {...register('location')} placeholder="North Field, Madurai" className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Queen Status" id="queenStatus" error={errors.queenStatus?.message}>
            <select id="queenStatus" {...register('queenStatus')} className={selectClass}>
              <option value="active">Active</option>
              <option value="weak">Weak</option>
              <option value="unknown">Unknown</option>
            </select>
          </Field>
          <Field label="Health Status" id="healthStatus" error={errors.healthStatus?.message}>
            <select id="healthStatus" {...register('healthStatus')} className={selectClass}>
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
        </div>
        <Field label="Notes" id="notes" error={errors.notes?.message}>
          <textarea id="notes" {...register('notes')} rows={3}
            placeholder="Additional observations about this hive…"
            className={inputClass + ' resize-none'} />
        </Field>
      </form>
    </Modal>
  );
}
