import { type EmptyStateProps } from '../types'; 

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder p-8 md:p-12 rounded-2xl text-center shadow-sm transition-colors flex flex-col items-center justify-center">
      {icon && <div className="mb-4 text-brand-blue opacity-50">{icon}</div>}
      
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white transition-colors">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 dark:text-brand-darkText mt-2 mb-6 max-w-md text-sm md:text-base transition-colors">
          {description}
        </p>
      )}
      
      {action && <div>{action}</div>}
    </div>
  );
}