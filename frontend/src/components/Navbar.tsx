import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Plus, Calendar, List } from 'lucide-react';

export default function Navbar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-white border-b border-brand-gray/30 mb-8">
      <Link to="/" className="text-xl font-bold text-brand-dark">
        Event<span className="text-brand-indigo">Hub</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-brand-dark hover:text-brand-blue transition-colors">
          <List size={18} /> Events
        </Link>
        <Link to="/my-events" className="flex items-center gap-2 text-sm font-medium text-brand-dark hover:text-brand-blue transition-colors">
          <Calendar size={18} /> My Events
        </Link>
        <Link to="/create-event" className="bg-brand-indigo hover:bg-[#520dc2] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Create Event
        </Link>
        
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-brand-dark hover:text-red-500 ml-4 pl-4 border-l border-brand-gray transition-colors">
          <LogOut size={18} /> 
        </button>
      </div>
    </nav>
  );
}