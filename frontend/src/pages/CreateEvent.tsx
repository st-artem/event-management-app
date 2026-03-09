import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedDate = new Date(dateTime).toISOString();

      await axios.post(
        'http://localhost:3000/events',
        {
          title,
          description,
          dateTime: formattedDate,
          location,
          capacity: capacity === '' ? null : Number(capacity),
          isPublic: true, 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка при створенні події');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-8 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Create New Event</h1>
          <p className="text-gray-500">Fill in the details to host your event.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-brand-gray/30 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-brand-dark mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-brand-gray rounded-lg focus:ring-2 focus:ring-brand-indigo outline-none"
                placeholder="e.g. React Developers Meetup"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-4 py-2 border border-brand-gray rounded-lg focus:ring-2 focus:ring-brand-indigo outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-brand-gray rounded-lg focus:ring-2 focus:ring-brand-indigo outline-none"
                placeholder="City, Venue, or Online link"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-brand-dark mb-1">Capacity (optional)</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2 border border-brand-gray rounded-lg focus:ring-2 focus:ring-brand-indigo outline-none"
                placeholder="Maximum number of participants"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-brand-dark mb-1">Description *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-brand-gray rounded-lg focus:ring-2 focus:ring-brand-indigo outline-none resize-none"
                placeholder="What is this event about?"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mr-4 px-6 py-2 text-brand-dark hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-indigo hover:bg-[#520dc2] text-white px-8 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}