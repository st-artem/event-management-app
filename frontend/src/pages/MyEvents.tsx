import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  dateTime: string;
}

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const token = useAuthStore((state) => state.token);

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
      }
    };
    fetchMyEvents();
  }, [token]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brand-dark mb-2">My Events</h1>
          <p className="text-gray-500">View and manage your event calendar</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button onClick={prevMonth} className="p-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-brand-dark" />
          </button>
          <h2 className="text-2xl font-bold text-brand-dark min-w-[200px] text-center">
            {monthName}
          </h2>
          <button onClick={nextMonth} className="p-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-brand-dark" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
            {weekDays.map((day, index) => (
              <div 
                key={day} 
                className={`py-4 text-center text-sm font-semibold text-gray-500 ${index !== 6 ? 'border-r border-gray-200' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-[140px]">
            {days.map((day, index) => {
              if (!day) {
                return (
                  <div 
                    key={`empty-${index}`} 
                    className="border-b border-r border-gray-200 bg-gray-50/40 last:border-r-0"
                  ></div>
                );
              }

              const dayEvents = events.filter(event => {
                const eventDate = new Date(event.dateTime);
                return eventDate.getDate() === day.getDate() &&
                       eventDate.getMonth() === day.getMonth() &&
                       eventDate.getFullYear() === day.getFullYear();
              });

              const isToday = day.toDateString() === new Date().toDateString();
              
              const isLastColumn = (index + 1) % 7 === 0;

              return (
                <div 
                  key={day.toISOString()} 
                  className={`border-b border-gray-200 p-2.5 flex flex-col transition-colors hover:bg-gray-50/50 ${!isLastColumn ? 'border-r' : ''} ${isToday ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full mb-2 ${isToday ? 'bg-brand-indigo text-white shadow-md' : 'text-brand-dark'}`}>
                    {day.getDate()}
                  </div>
                  
                  <div className="flex-1 space-y-1.5 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
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