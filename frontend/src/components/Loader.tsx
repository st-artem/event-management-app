import { Loader2 } from 'lucide-react';
import { type LoaderProps } from '../types';


export default function Loader({ text = 'Loading...', fullScreen = true }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-12'} bg-brand-white dark:bg-brand-darkBg transition-colors`}>
      <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
      <p className="text-gray-500 dark:text-brand-darkText font-medium animate-pulse">
        {text}
      </p>
    </div>
  );
}