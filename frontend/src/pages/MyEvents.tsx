import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface Event {
  id: number;
  title: string;
  dateTime: string;
}

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
        const res = await axios.get('http://localhost:3000/users/me/events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const combinedEvents = [
          ...(res.data.organizedEvents || []), 
          ...(res.data.attendedEvents || [])
        ];
        setEvents(combinedEvents);
      } catch (error) {
        console.error('Помилка завантаження календаря:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
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

  if (loading) return <div className="min-h-screen bg-brand-white flex justify-center items-center">Loading calendar...</div>;

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-2">My Events</h1>
            <p className="text-gray-500">View and manage your event calendar</p>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => setView('month')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'month' ? 'bg-white text-brand-indigo shadow-sm' : 'text-gray-500 hover:text-brand-dark'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'week' ? 'bg-white text-brand-indigo shadow-sm' : 'text-gray-500 hover:text-brand-dark'}`}
            >
              Week
            </button>
          </div>
        </div>

        {events.length === 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-100 p-6 rounded-xl text-center">
            <CalendarIcon className="w-10 h-10 text-brand-blue mx-auto mb-3 opacity-50" />
            <p className="text-brand-dark font-medium text-lg">You are not part of any events yet. Explore public events and join.</p>
            <Link to="/" className="inline-block mt-4 bg-brand-indigo text-white px-6 py-2 rounded-lg font-medium hover:bg-[#520dc2] transition-colors">
              Explore Events
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <button onClick={prevPeriod} className="p-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-brand-dark" />
          </button>
          <h2 className="text-2xl font-bold text-brand-dark min-w-[220px] text-center">
            {periodName}
          </h2>
          <button onClick={nextPeriod} className="p-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-brand-dark" />
          </button>
        </div>

        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
            {weekDaysLabels.map((day, index) => (
              <div key={day} className={`py-4 text-center text-sm font-semibold text-gray-500 ${index !== 6 ? 'border-r border-gray-200' : ''}`}>
                {day}
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-7 ${view === 'week' ? 'auto-rows-[300px]' : 'auto-rows-[140px]'}`}>
            {displayDays.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} className="border-b border-r border-gray-200 bg-gray-50/40 last:border-r-0"></div>;

              const dayEvents = events.filter(event => {
                const eventDate = new Date(event.dateTime);
                return eventDate.getDate() === day.getDate() && eventDate.getMonth() === day.getMonth() && eventDate.getFullYear() === day.getFullYear();
              });

              const isToday = day.toDateString() === new Date().toDateString();
              const isLastColumn = (index + 1) % 7 === 0;

              return (
                <div key={day.toISOString()} className={`border-b border-gray-200 p-2.5 flex flex-col transition-colors hover:bg-gray-50/50 ${!isLastColumn ? 'border-r' : ''} ${isToday ? 'bg-blue-50/30' : ''}`}>
                  <div className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full mb-2 ${isToday ? 'bg-brand-indigo text-white shadow-md' : 'text-brand-dark'}`}>
                    {day.getDate()}
                  </div>
                  
                  <div className="flex-1 space-y-1.5 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        onClick={() => navigate(`/events/${event.id}`)} 
                        className="text-xs bg-brand-indigo/10 text-brand-indigo font-semibold rounded p-1.5 truncate border border-brand-indigo/20 cursor-pointer hover:bg-brand-indigo/20 transition-colors"
                        title={event.title}
                      >
                        {new Date(event.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - {event.title}
                      </div>
                    ))}
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