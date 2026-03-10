import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { type Event } from '../types';
import Navbar from '../components/Navbar';
import { Calendar, Clock, MapPin, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';



export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).sub : null;

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (error) {
      console.error('Помилка завантаження подій:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const handleJoin = async (eventId: number) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/events/${eventId}/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchEvents(); 
      toast.success('Successfully joined the event!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error joining event');
    }
  };

  const handleLeave = async (eventId: number) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/events/${eventId}/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchEvents(); 
      toast.success('Successfully left the event!');
    } catch (error: any) {
      toast.error('Error leaving event');
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-darkBg transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pb-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Discover Events</h1>
          <p className="text-gray-500 dark:text-brand-darkText mb-6 transition-colors">Find and join exciting events happening around you</p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-brand-darkCard text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-brand-darkText rounded-xl border border-gray-200 dark:border-brand-darkBorder focus:outline-none focus:ring-2 focus:ring-brand-blue/50 shadow-sm transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isParticipant = event.participants?.some(p => p.id === currentUserId);
            const isOrganizer = event.organizer?.id === currentUserId;
            const isFull = event.capacity && event.participants?.length >= event.capacity;

            return (
              <div 
                key={event.id} 
                onClick={() => navigate(`/events/${event.id}`)}
                className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm hover:shadow-md transition-all flex flex-col h-full cursor-pointer hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">{event.title}</h3>
                <p className="text-gray-500 dark:text-brand-darkText text-sm mb-6 line-clamp-2 flex-grow transition-colors">{event.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 gap-3 transition-colors">
                    <Calendar className="w-4 h-4 text-brand-blue" />
                    <span>{formatDate(event.dateTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 gap-3 transition-colors">
                    <Clock className="w-4 h-4 text-brand-blue" />
                    <span>{formatTime(event.dateTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 gap-3 transition-colors">
                    <MapPin className="w-4 h-4 text-brand-blue" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 gap-3 transition-colors">
                    <Users className="w-4 h-4 text-brand-blue" />
                    <span>{event.participants?.length || 0} / {event.capacity || '∞'} participants</span>
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  {isOrganizer ? (
                    <div className="text-center text-brand-blue font-medium py-3 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-lg mt-auto transition-colors">
                      You are Organizer
                    </div>
                  ) : isParticipant ? (
                    <button 
                      onClick={() => handleLeave(event.id)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors mt-auto shadow-sm"
                    >
                      Leave Event
                    </button>
                  ) : isFull ? (
                    <button disabled className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold py-3 rounded-lg cursor-not-allowed mt-auto transition-colors">
                      Full
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleJoin(event.id)}
                      className="w-full bg-brand-green hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-colors mt-auto shadow-sm"
                    >
                      Join Event
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-brand-darkText">
              No events found 
            </div>
          )}
        </div>
      </main>
    </div>
  );
}