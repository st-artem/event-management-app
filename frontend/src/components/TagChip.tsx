import React from 'react';


export const getTagColorClasses = (name: string): string => {
  const variants = [
    "bg-brand-green/10 dark:bg-brand-green/20 text-brand-green border-brand-green/20 dark:border-brand-green/30",
    "bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange border-brand-orange/20 dark:border-brand-orange/30",
    "bg-brand-indigo/10 dark:bg-brand-indigo/20 text-brand-indigo border-brand-indigo/20 dark:border-brand-indigo/30",
    "bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue border-brand-blue/20 dark:border-brand-blue/30",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return variants[Math.abs(hash) % variants.length];
};

interface TagChipProps {
  name: string;
  className?: string;
}

export const TagChip: React.FC<TagChipProps> = ({ name, className = '' }) => {
  const colorClasses = getTagColorClasses(name);

  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-all ${colorClasses} ${className}`}
    >
      #{name.toLowerCase()}
    </span>
  );
};