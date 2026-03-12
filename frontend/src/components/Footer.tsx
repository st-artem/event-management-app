import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-brand-darkCard border-t border-gray-200 dark:border-brand-darkBorder transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Events
            </Link>
            <Link to="/my-events" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              My Events
            </Link>
            <Link to="/create-event" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Create Event
            </Link>
          </nav>

          <div className="text-sm text-gray-500 dark:text-gray-500">
            © {currentYear} EventHub. All rights reserved.
          </div>
          
        </div>
      </div>
    </footer>
  );
}