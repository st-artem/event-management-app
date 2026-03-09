import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import { Calendar, Clock, MapPin, Users, Trash2, Edit, ArrowLeft, Save, X } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  capacity: number | null;
  organizer: User;
  participants: User[];
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });

  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).sub : null;

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(res.data);
      setEditData({ title: res.data.title, description: res.data.description });
    } catch (error) {
      console.error('Помилка завантаження події:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/'); 
    } catch (error) {
      alert('Помилка при видаленні');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/events/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchEvent(); // Оновлюємо дані
    } catch (error) {
      alert('Помилка при оновленні');
    }
  };

  const handleLeave = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/events/${id}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvent();
    } catch (error) {
      alert('Помилка при виході з події');
    }
  };

  const handleJoin = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/events/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvent();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Помилка приєднання');
    }
  };

  if (loading) return <div className="min-h-screen bg-brand-white flex justify-center items-center">Завантаження...</div>;
  if (!event) return <div className="min-h-screen bg-brand-white flex justify-center items-center">Подію не знайдено</div>;

  const isOrganizer = currentUserId === event.organizer.id;
  const isParticipant = event.participants.some(p => p.id === currentUserId);
  const isFull = event.capacity && event.participants.length >= event.capacity;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen bg-brand-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-8 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center text-brand-blue hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to events
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              {isEditing ? (
                <div className="flex-1 mr-4">
                  <input 
                    type="text" 
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="w-full text-3xl font-bold text-brand-dark mb-4 p-2 border border-gray-300 rounded"
                  />
                  <textarea 
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={4}
                    className="w-full text-gray-600 p-2 border border-gray-300 rounded resize-none"
                  />
                  <div className="mt-4 flex gap-2">
                    <button onClick={handleUpdate} className="bg-brand-green text-white px-4 py-2 rounded flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-brand-dark px-4 py-2 rounded flex items-center gap-2"><X className="w-4 h-4"/> Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 pr-4">
                  <h1 className="text-3xl font-bold text-brand-dark mb-4">{event.title}</h1>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              )}

              {isOrganizer && !isEditing && (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(true)} className="p-2 text-brand-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={handleDelete} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 text-brand-dark">
                <Calendar className="w-5 h-5 text-brand-indigo" />
                <span className="font-medium">{formatDate(event.dateTime)}</span>
              </div>
              <div className="flex items-center gap-3 text-brand-dark">
                <Clock className="w-5 h-5 text-brand-indigo" />
                <span className="font-medium">{formatTime(event.dateTime)}</span>
              </div>
              <div className="flex items-center gap-3 text-brand-dark">
                <MapPin className="w-5 h-5 text-brand-indigo" />
                <span className="font-medium">{event.location}</span>
              </div>
              <div className="flex items-center gap-3 text-brand-dark">
                <Users className="w-5 h-5 text-brand-indigo" />
                <span className="font-medium">
                  {event.participants.length} / {event.capacity || 'Unlimited'} participants
                </span>
              </div>
            </div>

            {!isOrganizer && isParticipant && (
               <div className="mt-6 flex justify-end">
                  <button onClick={handleLeave} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                    Leave Event
                  </button>
               </div>
            )}

            {!isOrganizer && !isParticipant && !isFull && (
               <div className="mt-6 flex justify-end">
                  <button onClick={handleJoin} className="bg-brand-green hover:bg-[#1db388] text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                    Join Event
                  </button>
               </div>
            )}

            {!isOrganizer && !isParticipant && isFull && (
              <div className="mt-6 p-4 bg-orange-50 text-orange-600 rounded-lg text-center font-medium border border-orange-200">
                This event is fully booked. No more spots available.
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-8">
            <h3 className="text-xl font-bold text-brand-dark mb-4">Participants ({event.participants.length})</h3>
            {event.participants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.participants.map(user => (
                  <div key={user.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigo font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-brand-dark text-sm truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Поки що немає учасників. Будь першим!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}