import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { TagSelect } from '../components/TagSelect'; 
import { type TagOption } from '../types';


export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(true); 
  
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]); 
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const todayDateStr = new Date().toISOString().slice(0, 16); 

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get(`${import.meta.env.VITE_API_URL}/tags`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (Array.isArray(res.data)) {
          setAvailableTags(res.data.map((t: any) => ({ label: t.name, value: t.name })));
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    if (token) fetchTags();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedDate = new Date(dateTime).toISOString();
      const tags = selectedTags.map(tag => tag.value);

      const res = await api.post(
        `${import.meta.env.VITE_API_URL}/events`,
        {
          title,
          description,
          dateTime: formattedDate,
          location,
          capacity: capacity === '' ? null : Number(capacity),
          isPublic,
          tags: tags, 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/events/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating event');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full px-4 py-2 bg-white dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-brand-darkText";

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-darkBg transition-colors">
      <main className="max-w-3xl mx-auto px-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Create New Event</h1>
          <p className="text-gray-500 dark:text-brand-darkText transition-colors">Fill in the details to host your event.</p>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-100 dark:border-red-800/50">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-brand-darkCard p-8 rounded-2xl border border-gray-200 dark:border-brand-darkBorder shadow-sm space-y-6 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Event Title *</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className={inputStyles} placeholder="e.g. React Meetup" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Date & Time *</label>
              <input required min={todayDateStr} value={dateTime} onChange={(e) => setDateTime(e.target.value)} type="datetime-local" className={inputStyles} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Location *</label>
              <input required value={location} onChange={(e) => setLocation(e.target.value)} type="text" className={inputStyles} placeholder="City, Venue" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Capacity (optional)</label>
              <input min="1" value={capacity} onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))} type="number" className={inputStyles} placeholder="Unlimited if empty" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">Visibility *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="visibility" checked={isPublic === true} onChange={() => setIsPublic(true)} className="text-brand-blue bg-white dark:bg-brand-darkBg border-gray-300 dark:border-brand-darkBorder focus:ring-brand-blue w-4 h-4 cursor-pointer" />
                  <span className="text-gray-900 dark:text-gray-200 text-sm">Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="visibility" checked={isPublic === false} onChange={() => setIsPublic(false)} className="text-brand-blue bg-white dark:bg-brand-darkBg border-gray-300 dark:border-brand-darkBorder focus:ring-brand-blue w-4 h-4 cursor-pointer" />
                  <span className="text-gray-900 dark:text-gray-200 text-sm">Private</span>
                </label>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                Tags (Max 5)
              </label>
              <TagSelect 
                value={selectedTags} 
                onChange={setSelectedTags} 
                options={availableTags}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Description *</label>
              <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputStyles} resize-none`} />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="button" onClick={() => navigate('/')} className="mr-4 px-6 py-2 text-gray-600 dark:text-brand-darkText hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-brand-darkBg rounded-lg transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}