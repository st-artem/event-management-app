import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { type Event, type TagOption } from '../types'; 
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import EmptyState from '../components/EmptyState';
import { Search, CalendarX2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { TagSelect } from '../components/TagSelect'; 


export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).sub : null;

  useEffect(() => {
  const fetchGlobalTags = async () => {
    try {
      const res = await api.get(`${import.meta.env.VITE_API_URL}/tags`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(res.data) && res.data.length > 0) {
        setAvailableTags(res.data.map((t: any) => ({ label: t.name, value: t.name })));
      } else {
        const defaultTags = [
          { label: 'Tech', value: 'Tech' },
          { label: 'Music', value: 'Music' },
          { label: 'Art', value: 'Art' },
          { label: 'Business', value: 'Business' }
        ];
        setAvailableTags(defaultTags);
      }
    } catch (error) {
      console.error('Error fetching global tags:', error);
    }
  };
  if (token) fetchGlobalTags();
}, [token]);

  const fetchEvents = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/events`;
      
      if (selectedTags.length > 0) {
        const tagNames = selectedTags.map(t => t.value).join(',');
        url += `?tags=${tagNames}`;
      }

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token, selectedTags]);

  const handleJoin = async (eventId: number) => {
    try {
      await api.post(`${import.meta.env.VITE_API_URL}/events/${eventId}/join`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchEvents(); 
      toast.success('Successfully joined the event!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error joining event');
    }
  };

  const handleLeave = async (eventId: number) => {
    try {
      await api.post(`${import.meta.env.VITE_API_URL}/events/${eventId}/leave`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Discover Events</h1>
          <p className="text-gray-500 dark:text-brand-darkText mb-6 transition-colors">Find and join exciting events happening around you</p>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl items-start">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-brand-darkCard text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-brand-darkText rounded-xl border border-gray-200 dark:border-brand-darkBorder focus:outline-none focus:ring-2 focus:ring-brand-blue/50 shadow-sm transition-colors"
              />
            </div>
            
            <div className="flex-1 w-full">
              <TagSelect 
                value={selectedTags}
                onChange={setSelectedTags}
                placeholder="Filter by tags..."
                options={availableTags} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event.id}
              event={event}
              currentUserId={currentUserId}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onClick={() => navigate(`/events/${event.id}`)}
            />
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full mt-8">
              <EmptyState 
                icon={<CalendarX2 className="w-12 h-12" />}
                title={selectedTags.length > 0 ? "No events match the selected tags" : "No events found"}
                description={
                  selectedTags.length > 0 
                    ? "Try removing some tags to see more results." 
                    : "Try adjusting your search query to find what you're looking for."
                }
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}