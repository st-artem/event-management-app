import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { type EventCardProps } from '../types';
import { TagChip } from './TagChip';


export default function EventCard({ event, currentUserId, onJoin, onLeave, onClick }: EventCardProps) {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const isParticipant = event.participants?.some(p => p.id === currentUserId);
  const isOrganizer = event.organizer?.id === currentUserId;
  const isFull = event.capacity !== null && event.participants && event.participants.length >= event.capacity;

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm hover:shadow-md transition-all flex flex-col h-full cursor-pointer hover:-translate-y-1"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">{event.title}</h3>
      
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {event.tags.map(tag => (
            <TagChip key={tag.id} name={tag.name} />
          ))}
        </div>
      )}

      <p className="text-gray-500 dark:text-brand-darkText text-sm mb-6 line-clamp-2 transition-colors">
        {event.description}
      </p>
      
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

      <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
        {isOrganizer ? (
          <div className="text-center text-brand-blue font-medium py-3 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-lg transition-colors">
            You are Organizer
          </div>
        ) : isParticipant ? (
          <button 
            onClick={() => onLeave(event.id)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
          >
            Leave Event
          </button>
        ) : isFull ? (
          <button disabled className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold py-3 rounded-lg cursor-not-allowed transition-colors">
            Full
          </button>
        ) : (
          <button 
            onClick={() => onJoin(event.id)}
            className="w-full bg-brand-green hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
          >
            Join Event
          </button>
        )}
      </div>
    </div>
  );
}