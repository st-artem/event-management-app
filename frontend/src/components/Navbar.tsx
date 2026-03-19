import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Plus, Calendar as CalendarIcon, List, Sun, Moon, Menu, X } from 'lucide-react';
import { UserAvatar } from './UserAvatar'; 

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const navigate = useNavigate();
  const [themeOpen, setThemeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 

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

  const mobileNavLinkStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 text-base font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? 'text-brand-blue bg-brand-blue/10'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-brand-darkBg'
    }`;

  return (
    <nav className="bg-brand-white dark:bg-brand-darkCard border-b border-brand-gray dark:border-brand-darkBorder shadow-sm transition-colors z-50 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center py-4">
          
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white transition-colors hover:opacity-80">
            Event<span className="text-brand-blue">Hub</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
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
                  <button onClick={() => { document.documentElement.classList.remove('dark'); localStorage.theme = 'light'; setThemeOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-brand-darkBg">Light</button>
                  <button onClick={() => { document.documentElement.classList.add('dark'); localStorage.theme = 'dark'; setThemeOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-brand-darkBg">Dark</button>
                </div>
              )}
            </div>
            
            {user && (
              <div className="flex items-center ml-2 pl-4 border-l border-brand-gray dark:border-brand-darkBorder">
                <Link 
                  to={`/profile/${user.id}`} 
                  className="hover:opacity-80 transition-opacity mr-3"
                  title="My Profile"
                >
                  <UserAvatar name={user.name || user.email || 'user'} size={36} />
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-brand-darkText hover:text-brand-orange dark:hover:text-brand-orange transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} /> 
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={() => {
                const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                if (newTheme === 'dark') { document.documentElement.classList.add('dark'); localStorage.theme = 'dark'; }
                else { document.documentElement.classList.remove('dark'); localStorage.theme = 'light'; }
              }}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              <span className="dark:hidden"><Sun size={24} /></span>
              <span className="hidden dark:block"><Moon size={24} /></span>
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-900 dark:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard absolute w-full left-0 shadow-lg">
          <div className="flex flex-col px-4 py-4 space-y-2">
            <NavLink to="/" end className={mobileNavLinkStyles} onClick={() => setMobileMenuOpen(false)}>
              <List size={20} /> Events
            </NavLink>
            
            <NavLink to="/my-events" className={mobileNavLinkStyles} onClick={() => setMobileMenuOpen(false)}>
              <CalendarIcon size={20} /> My Events
            </NavLink>

            <Link 
              to="/create-event" 
              onClick={() => setMobileMenuOpen(false)}
              className="bg-brand-blue text-white px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 mt-2 mb-2"
            >
              <Plus size={20} /> Create Event
            </Link>

            {user && (
              <Link 
                to={`/profile/${user.id}`} 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-base font-medium px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-brand-darkBg text-gray-900 dark:text-white border-t border-gray-100 dark:border-brand-darkBorder mt-2 pt-4"
              >
                <UserAvatar name={user.name || user.email || 'user'} size={28} />
                My Profile
              </Link>
            )}

            <button 
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
              className="flex items-center gap-3 text-base font-medium text-red-500 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}