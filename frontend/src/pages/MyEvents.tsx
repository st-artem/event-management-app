import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/Loader';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { type Event } from '../types';


const getCalendarEventColorClasses = (tagName?: string) => {
  const defaultClasses = "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50";
  
  if (!tagName) return defaultClasses;

  const colorVariants = [
    "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
    "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/50",
    "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/50 hover:bg-violet-100 dark:hover:bg-violet-900/50",
    "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/50",
  ];
  
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colorVariants[Math.abs(hash) % colorVariants.length];
};

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [loading, setLoading] = useState(true);

  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const res = await api.get(`${import.meta.env.VITE_API_URL}/users/me/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data;
        let combinedEvents: Event[] = [];

        if (Array.isArray(data)) {
          combinedEvents = data; 
        } else {
          combinedEvents = [
            ...(data?.organizedEvents || []), 
            ...(data?.attendedEvents || [])
          ];
        }

        setEvents(combinedEvents);
      } catch (error) {
        console.warn('Endpoint /users/me/events is not responding, using fallback...');
        
        try {
          const fallbackRes = await api.get(`${import.meta.env.VITE_API_URL}/events`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).sub : null;
          
          const myFilteredEvents = fallbackRes.data.filter((e: any) => 
            e.organizer?.id === currentUserId || 
            e.participants?.some((p: any) => p.id === currentUserId)
          );
          setEvents(myFilteredEvents);
        } catch (err) {
          console.error('Fallback loading error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyEvents();
    }
  }, [token]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) monthDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) monthDays.push(new Date(year, month, i));

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const weekDaysArr = [];
  for (let i = 0; i < 7; i++) {
    weekDaysArr.push(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));
  }

  const nextPeriod = () => {
    if (view === 'month') setCurrentDate(new Date(year, month + 1, 1));
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
  };
  const prevPeriod = () => {
    if (view === 'month') setCurrentDate(new Date(year, month - 1, 1));
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
  };

  const periodName = view === 'month' 
    ? currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    : `Week of ${startOfWeek.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;

  const weekDaysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const displayDays = view === 'month' ? monthDays : weekDaysArr;

  if (loading) return <Loader text="Loading event details..." />;

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-darkBg transition-colors">
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">My Events</h1>
            <p className="text-gray-500 dark:text-brand-darkText transition-colors">View and manage your event calendar</p>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-brand-darkCard p-1 rounded-lg border border-gray-200 dark:border-brand-darkBorder transition-colors w-full md:w-auto">
            <button 
              onClick={() => setView('month')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'month' ? 'bg-white dark:bg-brand-darkBorder text-brand-blue shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setView('week')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'week' ? 'bg-white dark:bg-brand-darkBorder text-brand-blue shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Week
            </button>
          </div>
        </div>

        {events.length === 0 && (
          <div className="mb-8 bg-blue-50/50 dark:bg-brand-darkCard border border-blue-100 dark:border-brand-darkBorder p-6 md:p-8 rounded-2xl text-center shadow-sm transition-colors">
            <CalendarIcon className="w-12 h-12 text-brand-blue mx-auto mb-4 opacity-50" />
            <p className="text-gray-900 dark:text-white font-medium text-lg transition-colors">You are not part of any events yet.</p>
            <p className="text-gray-500 dark:text-brand-darkText mt-1 mb-6 transition-colors">Explore public events and join the community.</p>
            <Link to="/" className="inline-block bg-brand-blue text-white px-8 py-2.5 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors shadow-sm">
              Explore Events
            </Link>
          </div>
        )}

        <div className="flex justify-between md:justify-start items-center gap-4 mb-6">
          <button onClick={prevPeriod} className="p-2 border border-gray-200 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white min-w-[150px] md:min-w-[220px] text-center transition-colors">
            {periodName}
          </h2>
          <button onClick={nextPeriod} className="p-2 border border-gray-200 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
        </div>

        <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-200 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-brand-darkBorder bg-gray-50/80 dark:bg-brand-darkBg/30">
            {weekDaysLabels.map((day, index) => (
              <div key={day} className={`py-2 md:py-4 text-center text-xs md:text-sm font-semibold text-gray-500 dark:text-brand-darkText ${index !== 6 ? 'border-r border-gray-200 dark:border-brand-darkBorder' : ''}`}>
                <span className="md:hidden">{day.charAt(0)}</span>
                <span className="hidden md:inline">{day}</span>
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-7 ${view === 'week' ? 'auto-rows-[150px] md:auto-rows-[300px]' : 'auto-rows-[80px] md:auto-rows-[140px]'}`}>
            {displayDays.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} className="border-b border-r border-gray-200 dark:border-brand-darkBorder bg-gray-50/40 dark:bg-transparent last:border-r-0"></div>;

              const dayEvents = events.filter(event => {
                const eventDate = new Date(event.dateTime);
                return eventDate.getDate() === day.getDate() && eventDate.getMonth() === day.getMonth() && eventDate.getFullYear() === day.getFullYear();
              });

              const isToday = day.toDateString() === new Date().toDateString();
              const isLastColumn = (index + 1) % 7 === 0;

              return (
                <div key={day.toISOString()} className={`border-b border-gray-200 dark:border-brand-darkBorder p-1 md:p-2.5 flex flex-col transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/30 ${!isLastColumn ? 'border-r dark:border-r-brand-darkBorder' : ''} ${isToday ? 'bg-blue-50/30 dark:bg-transparent' : ''}`}>
                  <div className={`text-[10px] md:text-sm font-medium w-5 h-5 md:w-8 md:h-8 mx-auto md:mx-0 flex items-center justify-center rounded-full mb-1 md:mb-2 ${isToday ? 'bg-brand-blue text-white shadow-md' : 'text-gray-900 dark:text-gray-300'}`}>
                    {day.getDate()}
                  </div>
                  
                  <div className="flex-1 space-y-1 md:space-y-1.5 overflow-y-auto pr-0.5 md:pr-1" style={{ scrollbarWidth: 'none' }}>
                    {dayEvents.map(event => {
                      const colorClasses = getCalendarEventColorClasses(event.tags?.[0]?.name);
                      return (
                        <div 
                          key={event.id} 
                          onClick={() => navigate(`/events/${event.id}`)} 
                          className={`flex flex-col text-[8px] md:text-xs font-semibold rounded p-0.5 md:p-1.5 border cursor-pointer transition-colors overflow-hidden ${colorClasses}`}
                          title={event.title}
                        >
                          <span className="hidden md:block opacity-80 leading-tight">
                            {new Date(event.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                          <span className="truncate leading-tight text-center md:text-left">
                            {event.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}