import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Plus, Calendar as CalendarIcon, List, Sun, Moon } from 'lucide-react'; 

export default function Navbar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md transition-all duration-200 ${
      isActive
        ? 'text-brand-blue bg-brand-blue/10 shadow-sm'
        : 'text-gray-600 dark:text-brand-darkText hover:text-brand-blue dark:hover:text-white hover:bg-gray-50 dark:hover:bg-brand-darkBg'
    }`;

  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-brand-white dark:bg-brand-darkCard border-b border-brand-gray dark:border-brand-darkBorder mb-8 shadow-sm transition-colors z-50 relative">
      <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white transition-colors hover:opacity-80">
        Event<span className="text-brand-blue">Hub</span>
      </Link>

      <div className="flex items-center gap-2">
        <NavLink to="/" end className={navLinkStyles}>
          <List size={18} /> Events
        </NavLink>
        
        <NavLink to="/my-events" className={navLinkStyles}>
          <CalendarIcon size={18} /> My Events
        </NavLink>

        <Link 
          to="/create-event" 
          className="ml-4 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={18} /> Create Event
        </Link>

        <div className="relative ml-2">
          <button 
            onClick={() => setThemeOpen(!themeOpen)}
            className="p-2 text-gray-600 dark:text-brand-darkText hover:text-brand-blue dark:hover:text-brand-blue transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-brand-darkBg flex items-center gap-2"
          >
            <span className="dark:hidden"><Sun size={20} /></span>
            <span className="hidden dark:block"><Moon size={20} /></span>
          </button>

          {themeOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-xl shadow-lg py-2 z-50">
              <button 
                onClick={() => {
                  document.documentElement.classList.remove('dark');
                  localStorage.theme = 'light';
                  setThemeOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-brand-darkBg transition-colors"
              >
                Light
              </button>
              <button 
                onClick={() => {
                  document.documentElement.classList.add('dark');
                  localStorage.theme = 'dark';
                  setThemeOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-brand-darkBg transition-colors"
              >
                Dark
              </button>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-brand-darkText hover:text-brand-orange dark:hover:text-brand-orange ml-2 pl-4 border-l border-brand-gray dark:border-brand-darkBorder transition-colors"
        >
          <LogOut size={18} /> 
        </button>
      </div>
    </nav>
  );
}