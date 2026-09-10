interface BadgeProps {
  label: string;
  variant: 'healthy' | 'warning' | 'critical' | 'pending' | 'verified' | 'info';
}

const variantClasses = {
  healthy:  'bg-green-100 text-green-800',
  warning:  'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
  pending:  'bg-slate-100 text-slate-600',
  verified: 'bg-green-100 text-green-800',
  info:     'bg-blue-100 text-blue-800',
};

const dots = {
  healthy:  'bg-green-500',
  warning:  'bg-yellow-500',
  critical: 'bg-red-500',
  pending:  'bg-slate-400',
  verified: 'bg-green-500',
  info:     'bg-blue-500',
};

export function Badge({ label, variant }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />
      {label}
    </span>
  );
}
