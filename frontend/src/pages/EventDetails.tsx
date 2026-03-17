import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { type Event, type TagOption } from '../types';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { Calendar, Clock, MapPin, Users, Trash2, Edit, ArrowLeft, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { TagChip } from '../components/TagChip';
import { TagSelect } from '../components/TagSelect';


export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);

  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).sub : null;

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get(`${import.meta.env.VITE_API_URL}/tags`);
        if (Array.isArray(res.data)) {
          const formattedTags = res.data.map((t: any) => ({ label: t.name, value: t.name }));
          setAvailableTags(formattedTags);
        } else {
          setAvailableTags([]);
        }
      } catch (error) {
        console.error('Помилка завантаження тегів:', error);
      }
    };
    fetchTags();
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`${import.meta.env.VITE_API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(res.data);
      setEditData({ title: res.data.title, description: res.data.description });
      
      if (res.data.tags) {
        setSelectedTags(res.data.tags.map((t: any) => ({ label: t.name, value: t.name })));
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`${import.meta.env.VITE_API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Event successfully deleted!');
      navigate('/'); 
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || 'Unknown error occurred';
      toast.error(`Error: ${serverMessage}`);
    } finally {
      setShowDeleteModal(false); 
    }
  }

  const handleUpdate = async () => {
    try {
      const payload = {
        ...editData,
        tags: selectedTags.map(t => t.value)
      };

      await api.patch(`${import.meta.env.VITE_API_URL}/events/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchEvent(); 
      toast.success('Event successfully updated!');
    } catch (error) {
      toast.error('Error updating event');
    }
  };

  const handleLeave = async () => {
    try {
      await api.post(`${import.meta.env.VITE_API_URL}/events/${id}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvent();
      toast.success('Successfully left the event!');
    } catch (error) {
      toast.error('Error leaving event');
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`${import.meta.env.VITE_API_URL}/events/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvent();
      toast.success('Successfully joined the event!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error joining event');
    }
  };

  if (loading) return <Loader text="Loading event details..." />;
  if (!event) return <div className="min-h-screen bg-brand-white dark:bg-brand-darkBg flex justify-center items-center text-gray-500 dark:text-brand-darkText">Event not found</div>;

  const isOrganizer = currentUserId === event.organizer.id;
  const isParticipant = event.participants.some(p => p.id === currentUserId);
  const isFull = event.capacity && event.participants.length >= event.capacity;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const editInputStyles = "w-full p-2 bg-white dark:bg-brand-darkBg border border-brand-blue/50 dark:border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all text-gray-900 dark:text-white";

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-darkBg transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-8 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center text-brand-blue hover:text-brand-blue/80 hover:underline mb-6 transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to events
        </button>

        <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-200 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              {isEditing ? (
                <div className="flex-1 mr-4">
                  <input 
                    type="text" 
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className={`${editInputStyles} text-3xl font-bold mb-4`}
                  />
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Tags (Max 5)</label>
                    <TagSelect 
                      value={selectedTags} 
                      onChange={setSelectedTags} 
                      options={availableTags}
                    />
                  </div>

                  <textarea 
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={4}
                    className={`${editInputStyles} text-gray-600 dark:text-gray-300 resize-none`}
                  />
                  <div className="mt-4 flex gap-2">
                    <button onClick={handleUpdate} className="bg-brand-green hover:opacity-90 transition-opacity text-white px-4 py-2 rounded-lg flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
                    <button onClick={() => {
                      setIsEditing(false);
                      if (event.tags) setSelectedTags(event.tags.map((t: any) => ({ label: t.name, value: t.name })));
                    }} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2"><X className="w-4 h-4"/> Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 pr-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 transition-colors">{event.title}</h1>
                  
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.map(tag => (
                        <TagChip key={tag.id} name={tag.name} />
                      ))}
                    </div>
                  )}

                  <p className="text-gray-600 dark:text-brand-darkText leading-relaxed transition-colors">{event.description}</p>
                </div>
              )}

              {isOrganizer && !isEditing && (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(true)} className="p-2 text-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20 rounded-lg hover:bg-brand-blue/20 dark:hover:bg-brand-blue/30 transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={handleDeleteClick} className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-brand-darkBg rounded-xl p-6 border border-gray-100 dark:border-brand-darkBorder transition-colors">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <Calendar className="w-5 h-5 text-brand-blue" />
                <span className="font-medium">{formatDate(event.dateTime)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <Clock className="w-5 h-5 text-brand-blue" />
                <span className="font-medium">{formatTime(event.dateTime)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <MapPin className="w-5 h-5 text-brand-blue" />
                <span className="font-medium">{event.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <Users className="w-5 h-5 text-brand-blue" />
                <span className="font-medium">
                  {event.participants.length} / {event.capacity || 'Unlimited'} participants
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              {!isOrganizer && isParticipant && (
                <button onClick={handleLeave} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm">
                  Leave Event
                </button>
              )}

              {!isOrganizer && !isParticipant && !isFull && (
                <button onClick={handleJoin} className="bg-brand-green hover:opacity-90 text-white font-semibold py-2 px-6 rounded-lg transition-opacity shadow-sm">
                  Join Event
                </button>
              )}
            </div>

            {!isOrganizer && !isParticipant && isFull && (
              <div className="mt-6 p-4 bg-brand-orange/10 text-brand-orange rounded-lg text-center font-medium border border-brand-orange/20">
                This event is fully booked. No more spots available.
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-brand-darkBorder p-8 bg-gray-50/50 dark:bg-brand-darkBg/50 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Participants ({event.participants.length})</h3>
            {event.participants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.participants.map(user => (
                  <div key={user.id} className="flex items-center gap-3 bg-white dark:bg-brand-darkCard p-3 rounded-lg border border-gray-200 dark:border-brand-darkBorder shadow-sm transition-colors">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-brand-darkText truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-brand-darkText italic">No participants yet. Be the first to join!</p>
            )}
          </div>
          
        </div>
      </main>
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-brand-darkCard rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in border dark:border-brand-darkBorder">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Event</h3>
            <p className="text-gray-600 dark:text-brand-darkText mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}