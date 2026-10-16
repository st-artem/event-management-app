import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Trash2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/Loader';
import { UserAvatar } from '../components/UserAvatar';
import { useAuthStore } from '../store/authStore';
import { type Event, type User } from '../types';

interface AdminUser extends User {
  organizedCount: number;
  attendedCount: number;
}

type Tab = 'users' | 'events';

export default function AdminPanel() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([
        api.get<AdminUser[]>('/admin/users'),
        api.get<Event[]>('/admin/events'),
      ]);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (user: AdminUser, role: 'user' | 'admin') => {
    try {
      await api.patch(`/admin/users/${user.id}/role`, { role });
      toast.success(`${user.name || user.email} is now ${role}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error changing role');
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Delete ${user.email}? All events organized by this user will be deleted too.`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      toast.success('User deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };

  const handleDeleteEvent = async (event: Event) => {
    if (!window.confirm(`Delete event "${event.title}"?`)) return;
    try {
      await api.delete(`/events/${event.id}`);
      toast.success('Event deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting event');
    }
  };

  if (loading) return <Loader text="Loading admin panel..." />;

  const tabStyles = (active: boolean) =>
    `flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'bg-white dark:bg-brand-darkBorder text-brand-blue shadow-sm'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }`;

  const cellStyles = 'px-4 py-3 text-sm text-gray-700 dark:text-gray-300';
  const headStyles = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-brand-darkText';

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-darkBg transition-colors">
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
            <p className="text-gray-500 dark:text-brand-darkText">
              {users.length} users · {events.length} events
            </p>
          </div>

          <div className="flex bg-gray-100 dark:bg-brand-darkCard p-1 rounded-lg border border-gray-200 dark:border-brand-darkBorder w-full md:w-auto">
            <button onClick={() => setTab('users')} className={tabStyles(tab === 'users')}>
              <Users size={16} /> Users
            </button>
            <button onClick={() => setTab('events')} className={tabStyles(tab === 'events')}>
              <Calendar size={16} /> Events
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-200 dark:border-brand-darkBorder shadow-sm overflow-x-auto">
          {tab === 'users' ? (
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-gray-100 dark:border-brand-darkBorder">
                <tr>
                  <th className={headStyles}>User</th>
                  <th className={headStyles}>Organized</th>
                  <th className={headStyles}>Attending</th>
                  <th className={headStyles}>Role</th>
                  <th className={headStyles}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-brand-darkBorder">
                {users.map(user => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr key={user.id}>
                      <td className={cellStyles}>
                        <Link to={`/profile/${user.id}`} className="flex items-center gap-3 hover:text-brand-blue">
                          <UserAvatar name={user.email || user.name || 'user'} size={32} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p>
                            <p className="text-xs text-gray-500 dark:text-brand-darkText">{user.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className={cellStyles}>{user.organizedCount}</td>
                      <td className={cellStyles}>{user.attendedCount}</td>
                      <td className={cellStyles}>
                        <select
                          value={user.role}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(user, e.target.value as 'user' | 'admin')}
                          className="bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-lg px-2 py-1 text-sm disabled:opacity-50"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className={`${cellStyles} text-right`}>
                        {!isSelf && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-gray-100 dark:border-brand-darkBorder">
                <tr>
                  <th className={headStyles}>Event</th>
                  <th className={headStyles}>Date</th>
                  <th className={headStyles}>Organizer</th>
                  <th className={headStyles}>Participants</th>
                  <th className={headStyles}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-brand-darkBorder">
                {events.map(event => (
                  <tr key={event.id}>
                    <td className={cellStyles}>
                      <Link to={`/events/${event.id}`} className="flex items-center gap-2 font-medium text-gray-900 dark:text-white hover:text-brand-blue">
                        {event.isPublic === false && <Lock size={14} className="text-gray-400" />}
                        {event.title}
                      </Link>
                    </td>
                    <td className={cellStyles}>{new Date(event.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className={cellStyles}>{event.organizer?.name || event.organizer?.email}</td>
                    <td className={cellStyles}>{event.participants.length} / {event.capacity || '∞'}</td>
                    <td className={`${cellStyles} text-right`}>
                      <button
                        onClick={() => handleDeleteEvent(event)}
                        className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
