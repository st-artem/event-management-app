import { create } from 'zustand';
import api from '../api/axios';
import { type Event, type TagOption } from '../types';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';


interface EventState {
  events: Event[];
  availableTags: TagOption[];
  selectedTags: TagOption[];
  isLoading: boolean;
  
  setSelectedTags: (tags: TagOption[]) => void;
  fetchGlobalTags: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  joinEvent: (eventId: number) => Promise<void>;
  leaveEvent: (eventId: number) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  availableTags: [],
  selectedTags: [],
  isLoading: false,

  setSelectedTags: (tags) => {
    set({ selectedTags: tags });
    get().fetchEvents(); 
  },

  fetchGlobalTags: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    try {
      const res = await api.get(`${import.meta.env.VITE_API_URL}/tags`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(res.data) && res.data.length > 0) {
        set({ availableTags: res.data.map((t: any) => ({ label: t.name, value: t.name })) });
      } else {
        set({ availableTags: [
          { label: 'Tech', value: 'Tech' }, { label: 'Music', value: 'Music' },
          { label: 'Art', value: 'Art' }, { label: 'Business', value: 'Business' }
        ]});
      }
    } catch (error) {
      console.error('Error fetching global tags:', error);
    }
  },

  fetchEvents: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    const { selectedTags } = get();
    set({ isLoading: true });
    
    try {
      let url = `${import.meta.env.VITE_API_URL}/events`;
      if (selectedTags.length > 0) {
        const tagNames = selectedTags.map(t => t.value).join(',');
        url += `?tags=${tagNames}`;
      }

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ events: res.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ isLoading: false });
    }
  },

  joinEvent: async (eventId) => {
    const token = useAuthStore.getState().token;
    try {
      await api.post(`${import.meta.env.VITE_API_URL}/events/${eventId}/join`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      get().fetchEvents(); 
      toast.success('Successfully joined the event!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error joining event');
    }
  },

  leaveEvent: async (eventId) => {
    const token = useAuthStore.getState().token;
    try {
      await api.post(`${import.meta.env.VITE_API_URL}/events/${eventId}/leave`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      get().fetchEvents(); 
      toast.success('Successfully left the event!');
    } catch (error: any) {
      toast.error('Error leaving event');
    }
  }
}));