import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Calendar, Clock, MapPin, Users, Search } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  capacity: number | null;
  participants: any[];
  organizer: { id: number };
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).sub : null;

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:3000/events', {
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
      await axios.post(`http://localhost:3000/events/${eventId}/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchEvents(); 
    } catch (error: any) {
      alert(error.response?.data?.message || 'Помилка приєднання');
    }
  };

  const handleLeave = async (eventId: number) => {
    try {
      await axios.post(`http://localhost:3000/events/${eventId}/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchEvents(); 
    } catch (error: any) {
      alert('Помилка при виході');
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pb-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-brand-dark mb-2">Discover Events</h1>
          <p className="text-brand-gray-dark mb-6 text-gray-500">Find and join exciting events happening around you</p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 shadow-sm"
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
                className="bg-white p-6 rounded-2xl border border-brand-gray/30 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer"
              >
                <h3 className="text-xl font-bold text-brand-dark mb-2">{event.title}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">{event.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 gap-3">
                    <Calendar className="w-4 h-4 text-brand-indigo" />
                    <span>{formatDate(event.dateTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-3">
                    <Clock className="w-4 h-4 text-brand-indigo" />
                    <span>{formatTime(event.dateTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-3">
                    <MapPin className="w-4 h-4 text-brand-indigo" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-3">
                    <Users className="w-4 h-4 text-brand-indigo" />
                    <span>{event.participants?.length || 0} / {event.capacity || '∞'} participants</span>
                  </div>
                </div>

                {isOrganizer ? (
                  <div className="text-center text-brand-indigo font-medium py-3 bg-brand-indigo/10 rounded-lg mt-auto">You are Organizer</div>
                ) : isParticipant ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleLeave(event.id); }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors mt-auto"
                  >
                    Leave Event
                  </button>
                ) : isFull ? (
                  <button disabled className="w-full bg-gray-300 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed mt-auto">
                    Full
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleJoin(event.id); }}
                    className="w-full bg-brand-green hover:bg-[#1db388] text-white font-semibold py-3 rounded-lg transition-colors mt-auto"
                  >
                    Join Event
                  </button>
                )}
              </div>
            );
          })}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              Немає подій 😢
            </div>
          )}
        </div>
      </main>
    </div>
  );
}