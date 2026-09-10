import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 bg-honey-100 rounded-2xl flex items-center justify-center mb-4 text-honey-600">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-warm-800 mb-2">{title}</h3>
      <p className="text-warm-600 text-sm max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}
